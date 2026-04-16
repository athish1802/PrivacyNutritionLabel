// Popup JavaScript
// Handles UI logic for the privacy nutrition label popup

// Get current tab and display privacy label
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url) {
      showError("Unable to access this page");
      return;
    }

    const domain = extractDomain(tab.url);

    if (
      !domain ||
      domain === "chrome" ||
      domain.startsWith("chrome-extension")
    ) {
      showError("Privacy labels not available for browser pages");
      return;
    }

    // Get privacy label from background script
    const label = await getPrivacyLabel(domain);

    if (!label) {
      showError("Failed to load privacy information");
      return;
    }

    // Display the label
    displayLabel(label);

    // Set up event listeners
    setupEventListeners(label);
  } catch (error) {
    console.error("Error loading privacy label:", error);
    showError("Failed to load privacy information");
  }
});

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

async function getPrivacyLabel(domain) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "getPrivacyLabel", domain: domain },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting privacy label:", chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response?.label || null);
        }
      }
    );
  });
}

function displayLabel(label) {
  // Hide loading, show content
  document.getElementById("loading").style.display = "none";
  document.getElementById("content").style.display = "block";

  // Site name
  document.getElementById("siteName").textContent = label.domain;

  // Check if we can provide a rating
  if (!label.canRate) {
    // Show "Unable to rate" message
    const gradeBadge = document.getElementById("gradeBadge");
    gradeBadge.textContent = "?";
    gradeBadge.style.backgroundColor = "#6B7280";
    gradeBadge.title = "Insufficient data to provide accurate rating";

    // Update risk indicator
    const riskIndicator = document.getElementById("riskIndicator");
    riskIndicator.className = "risk-indicator unknown";
    document.getElementById("riskLevel").textContent = "UNABLE TO RATE";
    document.getElementById("riskDescription").textContent =
      "We don't have enough verified information about this site's privacy practices to provide an accurate rating.";

    // Show what we DO know (trackers)
    displayTrackerInfo(label);

    // Hide data collection/usage sections since we don't know
    const dataSection = document.querySelector('.data-collected');
    const usageSection = document.querySelector('.data-usage');
    const rightsSection = document.querySelector('.user-rights');
    if (dataSection) dataSection.style.display = 'none';
    if (usageSection) usageSection.style.display = 'none';
    if (rightsSection) rightsSection.style.display = 'none';

  } else {
    // Normal display with rating
    const gradeBadge = document.getElementById("gradeBadge");
    gradeBadge.textContent = label.displayGrade || label.grade;
    gradeBadge.style.backgroundColor = getRiskColor(label.displayGrade || label.grade);

    // Risk indicator
    const riskIndicator = document.getElementById("riskIndicator");
    riskIndicator.className = `risk-indicator ${label.riskLevel.toLowerCase()}`;
    document.getElementById("riskLevel").textContent = `${label.riskLevel} RISK`;
    document.getElementById("riskDescription").textContent = getRiskDescription(label);

    // Data collected
    updateCheckboxes("check", label.dataCollected);

    // Data usage
    updateUsageItems(label.dataUsage);

    // User rights
    updateCheckboxes("right", label.userRights);

    // Trackers
    displayTrackerInfo(label);
  }

  // Last analyzed
  const lastAnalyzed = new Date(label.lastAnalyzed);
  const timeAgo = getTimeAgo(lastAnalyzed);
  document.getElementById("lastAnalyzed").textContent = timeAgo;

  // Confidence - show combined confidence with disclaimer
  const confidenceText = {
    'HIGH': 'HIGH - Verified data',
    'MEDIUM': 'MEDIUM - Partial data',
    'LOW': 'LOW - Based on trackers',
    'NONE': 'NONE - No verified data'
  };

  const confidenceLevel = document.getElementById("confidenceLevel");
  confidenceLevel.textContent = confidenceText[label.overallConfidence] || label.overallConfidence;

  // Add visual indicator for low confidence ratings
  if (label.ratingDisclaimer) {
    confidenceLevel.title = label.ratingDisclaimer;
    confidenceLevel.style.color = '#F59E0B'; // Orange color for warning
  }
}

function displayTrackerInfo(label) {
  // Trackers (always show this, even if we can't rate other things)
  document.getElementById("trackerTotal").textContent = label.trackers.total;
  document.getElementById("trackerAdvertising").textContent =
    label.trackers.advertising;
  document.getElementById("trackerAnalytics").textContent =
    label.trackers.analytics;
  document.getElementById("trackerSocial").textContent = label.trackers.social;

  // Update tracker badge color
  const trackerBadge = document.getElementById("trackerTotal");
  if (label.trackers.total > 20) {
    trackerBadge.style.backgroundColor = "#ef4444";
  } else if (label.trackers.total > 10) {
    trackerBadge.style.backgroundColor = "#f59e0b";
  } else if (label.trackers.total > 0) {
    trackerBadge.style.backgroundColor = "#fbbf24";
  } else {
    trackerBadge.style.backgroundColor = "#10b981";
  }

  // Hide tracker breakdown if no trackers
  if (label.trackers.total === 0) {
    document.getElementById("trackerBreakdown").style.display = "none";
  }
}

function updateCheckboxes(prefix, data) {
  Object.entries(data).forEach(([key, value]) => {
    const checkbox = document.getElementById(`${prefix}-${key}`);
    if (checkbox) {
      checkbox.textContent = value ? "✓" : "✗";
      checkbox.className = value ? "checkbox checked" : "checkbox unchecked";
    }
  });
}

function updateUsageItems(usage) {
  Object.entries(usage).forEach(([key, value]) => {
    const item = document.getElementById(`usage-${key}`);
    if (item) {
      item.style.display = value ? "flex" : "none";
    }
  });
}

function getRiskColor(grade) {
  const colors = {
    A: "#10B981",
    B: "#34D399",
    C: "#FBBF24",
    D: "#F59E0B",
    F: "#EF4444",
  };
  return colors[grade] || "#9CA3AF";
}

function getRiskDescription(label) {
  if (label.riskLevel === "HIGH") {
    return "This site collects extensive personal data and shares with many partners";
  } else if (label.riskLevel === "MEDIUM") {
    return "This site collects personal data with standard privacy practices";
  } else {
    return "This site has good privacy practices with minimal data collection";
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

function setupEventListeners(label) {
  // View policy button
  const viewPolicyBtn = document.getElementById("viewPolicyBtn");
  if (viewPolicyBtn) {
    viewPolicyBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: label.policyUrl });
    });
  }

  // Show policy URL source info
  const policyUrlInfo = document.getElementById("policyUrlInfo");
  if (policyUrlInfo && label.policyUrlSource) {
    const sourceText = {
      'page_detection': '✓ Found on page',
      'privacyspy_api': '✓ Verified by PrivacySpy',
      'validated_pattern': '✓ URL validated',
      'fallback': '⚠ Estimated URL'
    };
    policyUrlInfo.textContent = sourceText[label.policyUrlSource] || '';
  }
}

function showError(message) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("content").style.display = "none";
  document.getElementById("error").style.display = "block";
  document.getElementById("errorMessage").textContent = message;
}
