// Background Service Worker
// Handles tab monitoring, tracker detection, and privacy label management

// Import utilities (Service Workers use importScripts)
importScripts(
  "../utils/storage.js",
  "../utils/trackers.js",
  "../utils/grading.js",
  "../utils/policy-analyzer.js",
  "../utils/policy-url-resolver.js"
);

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const domain = extractDomain(tab.url);

    // Skip chrome:// and extension pages
    if (!domain || domain === "chrome" || domain.startsWith("chrome-extension")) {
      return;
    }

    try {
      // Get or create privacy label
      const label = await getPrivacyLabel(domain);

      // Update badge with grade
      updateBadge(tabId, label.grade);

      // Clear old tracker data for this domain
      trackerDetector.clearTrackersForDomain(domain);

      // Save to history
      await storageManager.saveHistory(domain, {
        lastVisit: new Date().toISOString(),
        grade: label.grade,
        trackerCount: label.trackers.total
      });

      // Request content script to find privacy policy link
      // This provides an immediate search in addition to the automatic load event
      chrome.tabs.sendMessage(tabId, { action: "findPrivacyPolicy" }).catch(() => {
        // Content script might not be ready yet, that's OK
        // The load event listener will handle it
      });
    } catch (error) {
      console.error("Error processing tab update:", error);
    }
  }
});

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const domain = extractDomain(tab.url);

      if (!domain || domain === "chrome" || domain.startsWith("chrome-extension")) {
        chrome.action.setBadgeText({ tabId: activeInfo.tabId, text: "" });
        return;
      }

      const label = await getPrivacyLabel(domain);
      updateBadge(activeInfo.tabId, label.grade);
    }
  } catch (error) {
    console.error("Error handling tab activation:", error);
  }
});

// Listen for web requests to detect trackers
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    try {
      // Skip non-HTTP requests
      if (!details.url.startsWith("http")) return;

      const requestDomain = extractDomain(details.url);
      const pageDomain = extractDomain(details.initiator || details.documentUrl);

      // Check if this is a third-party request
      if (requestDomain && pageDomain && requestDomain !== pageDomain) {
        // Don't count subdomains of the same parent domain as third-party
        const requestParent = getParentDomain(requestDomain);
        const pageParent = getParentDomain(pageDomain);

        if (requestParent !== pageParent) {
          // Check if it's a known tracker
          if (trackerDetector.isKnownTracker(requestDomain)) {
            trackerDetector.recordTracker(pageDomain, requestDomain);

            // Update the label with new tracker count
            updateLabelTrackers(pageDomain);
          }
        }
      }
    } catch (error) {
      console.error("Error in webRequest listener:", error);
    }
  },
  { urls: ["<all_urls>"] }
);

// Store detected privacy policy URLs
const detectedPolicyUrls = new Map();

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPrivacyLabel") {
    getPrivacyLabel(request.domain).then((label) => {
      sendResponse({ label: label });
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === "refreshLabel") {
    refreshLabel(request.domain).then((label) => {
      sendResponse({ label: label });
    });
    return true;
  }

  if (request.action === "getTrackers") {
    const trackers = trackerDetector.categorizeTrackers(request.domain);
    sendResponse({ trackers: trackers });
    return true;
  }

  if (request.action === "privacyPolicyDetected") {
    // Store the detected privacy policy URL from content script
    const domain = extractDomain(request.url);
    if (domain && request.policyUrl) {
      detectedPolicyUrls.set(domain, request.policyUrl);
      console.log(`Privacy policy detected for ${domain}: ${request.policyUrl}`);

      // Update the cached label with the new policy URL
      updatePolicyUrl(domain, request.policyUrl);
    }
    sendResponse({ status: "stored" });
    return true;
  }
});

// Helper Functions

function extractDomain(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

function getParentDomain(domain) {
  if (!domain) return null;
  const parts = domain.split(".");
  if (parts.length >= 2) {
    return parts.slice(-2).join(".");
  }
  return domain;
}

async function getPrivacyLabel(domain) {
  // Check cache first
  let label = await storageManager.getPrivacyLabel(domain);

  if (label) {
    // Update tracker counts from current session
    const currentTrackers = trackerDetector.categorizeTrackers(domain);
    label.trackers = currentTrackers;

    // Use hybrid URL resolution strategy
    const detectedUrl = detectedPolicyUrls.get(domain) || null;
    const policyResult = await policyUrlResolver.resolvePrivacyPolicyUrl(domain, detectedUrl);
    label.policyUrl = policyResult.url;
    label.policyUrlSource = policyResult.source;
    label.policyUrlConfidence = policyResult.confidence;

    // Calculate overall confidence
    label.overallConfidence = calculateOverallConfidence(
      label.analysisConfidence || 'NONE',
      policyResult.confidence
    );

    // Only show grade if we have sufficient confidence
    if (label.overallConfidence === 'NONE' || label.overallConfidence === 'LOW') {
      label.displayGrade = null; // Don't show grade
      label.canRate = false;
    } else {
      label.displayGrade = label.grade;
      label.canRate = true;
    }

    return label;
  }

  // Generate new label
  label = await analyzePrivacy(domain);

  // Use hybrid URL resolution strategy
  const detectedUrl = detectedPolicyUrls.get(domain) || null;
  const policyResult = await policyUrlResolver.resolvePrivacyPolicyUrl(domain, detectedUrl);
  label.policyUrl = policyResult.url;
  label.policyUrlSource = policyResult.source;
  label.policyUrlConfidence = policyResult.confidence;

  // If we got a PrivacySpy score, boost our analysis confidence
  if (policyResult.score !== undefined) {
    label.privacySpyScore = policyResult.score;
    // PrivacySpy provides verified data, boost confidence to HIGH
    label.analysisConfidence = 'HIGH';
  }

  // Get current tracker data
  const trackers = trackerDetector.categorizeTrackers(domain);
  label.trackers = trackers;

  // Calculate overall confidence before grading
  label.overallConfidence = calculateOverallConfidence(
    label.analysisConfidence || 'NONE',
    policyResult.confidence
  );

  // Decide if we can rate based on what data we have
  const hasTrackerData = trackers && trackers.total !== undefined;
  const hasPrivacySpyData = policyResult.score !== undefined;
  const hasKnownSiteData = label.analysisConfidence === 'HIGH';

  // We can provide SOME rating if we have trackers OR PrivacySpy data
  if (hasKnownSiteData || hasPrivacySpyData || hasTrackerData) {
    // We have enough data to provide at least a basic rating
    const gradeResult = calculatePrivacyGrade(label);
    label.grade = gradeResult.grade;
    label.displayGrade = gradeResult.grade;
    label.riskScore = gradeResult.score;
    label.riskLevel = getRiskLevel(gradeResult.score);
    label.canRate = true;

    // Add disclaimer for low confidence ratings
    if (label.overallConfidence === 'LOW') {
      label.ratingDisclaimer = 'Rating based primarily on tracker detection. Privacy policy not verified.';
    }
  } else {
    // Truly unable to rate - no data at all
    label.grade = null;
    label.displayGrade = null;
    label.riskScore = null;
    label.riskLevel = 'UNKNOWN';
    label.canRate = false;
  }

  // Cache it
  await storageManager.savePrivacyLabel(domain, label);

  return label;
}

/**
 * Calculate overall confidence by combining analysis confidence and URL confidence
 */
function calculateOverallConfidence(analysisConfidence, urlConfidence) {
  // Convert to numeric scores
  const analysisScore = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1,
    'NONE': 0
  }[analysisConfidence] || 0;

  const urlScore = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  }[urlConfidence] || 1; // Default to LOW if not specified

  // Calculate combined score
  // For unknown sites: if we have a valid URL, we can still provide basic rating based on trackers
  const combinedScore = (analysisScore * 0.6) + (urlScore * 0.4);

  // Map back to confidence levels
  if (combinedScore >= 2.5) return 'HIGH';
  if (combinedScore >= 1.2) return 'MEDIUM';
  if (combinedScore >= 0.4) return 'LOW';
  return 'NONE';
}

async function refreshLabel(domain) {
  // Delete cached label
  await storageManager.deletePrivacyLabel(domain);

  // Generate new one
  return await getPrivacyLabel(domain);
}

async function updateLabelTrackers(domain) {
  try {
    const label = await storageManager.getPrivacyLabel(domain);
    if (label) {
      // Update tracker counts
      const trackers = trackerDetector.categorizeTrackers(domain);
      label.trackers = trackers;

      // Recalculate grade
      const gradeResult = calculatePrivacyGrade(label);
      label.grade = gradeResult.grade;
      label.riskScore = gradeResult.score;
      label.riskLevel = getRiskLevel(gradeResult.score);

      // Save updated label
      await storageManager.savePrivacyLabel(domain, label);

      // Update badge for all tabs with this domain
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && extractDomain(tab.url) === domain) {
          updateBadge(tab.id, label.grade);
        }
      }
    }
  } catch (error) {
    console.error("Error updating label trackers:", error);
  }
}

async function updatePolicyUrl(domain, policyUrl) {
  try {
    const label = await storageManager.getPrivacyLabel(domain);
    if (label) {
      label.policyUrl = policyUrl;
      await storageManager.savePrivacyLabel(domain, label);
    }
  } catch (error) {
    console.error("Error updating policy URL:", error);
  }
}

function updateBadge(tabId, grade) {
  const colors = {
    A: "#10B981", // Green
    B: "#34D399",
    C: "#FBBF24", // Yellow
    D: "#F59E0B",
    F: "#EF4444", // Red
  };

  // If no grade (insufficient confidence), show "?" or nothing
  const badgeText = grade || "";

  chrome.action.setBadgeText({
    tabId: tabId,
    text: badgeText,
  });

  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: colors[grade] || "#9CA3AF",
  });
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Privacy Nutrition Labels extension installed!");
});

console.log("Background service worker loaded");
