// Content Script
// Injected into web pages to communicate with the background script
// Detects privacy policy links and other privacy indicators

console.log("Privacy Nutrition Labels content script loaded");

// Function to find privacy policy link on the page
function findPrivacyPolicyLink() {
  // Common patterns for privacy policy links
  const patterns = [
    /privacy[-\s]?policy/i,
    /privacy[-\s]?notice/i,
    /privacy[-\s]?statement/i,
    /data[-\s]?protection/i,
    /^privacy$/i,
    /cookie[-\s]?policy/i,
    /terms[-\s]?and[-\s]?privacy/i
  ];

  // Find all links on the page
  const allLinks = document.querySelectorAll('a[href]');
  const candidates = [];

  for (const link of allLinks) {
    const href = link.getAttribute('href');
    const text = link.textContent.trim();
    const ariaLabel = link.getAttribute('aria-label') || '';
    const title = link.getAttribute('title') || '';

    // Combine all text sources for matching
    const combinedText = `${text} ${ariaLabel} ${title} ${href}`.toLowerCase();

    // Check if any pattern matches
    for (const pattern of patterns) {
      if (pattern.test(combinedText)) {
        // Calculate confidence score based on match quality
        let confidence = 0;

        // Higher confidence if exact match in visible text
        if (pattern.test(text)) confidence += 3;

        // Medium confidence if in aria-label or title
        if (pattern.test(ariaLabel) || pattern.test(title)) confidence += 2;

        // Lower confidence if only in URL
        if (pattern.test(href)) confidence += 1;

        // Prefer absolute URLs over relative
        const isAbsolute = href.startsWith('http://') || href.startsWith('https://');
        if (isAbsolute) confidence += 1;

        // Avoid false positives (e.g., "Read our privacy policy" vs "Privacy Policy")
        if (text.toLowerCase() === 'privacy' || text.toLowerCase() === 'privacy policy') {
          confidence += 2;
        }

        candidates.push({
          url: href,
          text: text,
          confidence: confidence
        });
        break; // Don't count same link multiple times
      }
    }
  }

  // Sort by confidence and return the best match
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.confidence - a.confidence);
    const bestMatch = candidates[0];

    // Convert relative URLs to absolute
    let absoluteUrl = bestMatch.url;
    if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://')) {
      absoluteUrl = new URL(absoluteUrl, window.location.href).href;
    }

    return absoluteUrl;
  }

  return null;
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePageContent") {
    // Future: Analyze page content for privacy indicators
    sendResponse({ status: "complete" });
  }

  if (request.action === "findPrivacyPolicy") {
    const policyUrl = findPrivacyPolicyLink();
    sendResponse({ policyUrl: policyUrl });
  }
});

// Detect privacy policy link when page loads and send to background
window.addEventListener("load", () => {
  // Wait a bit for dynamic content to load
  setTimeout(() => {
    const policyUrl = findPrivacyPolicyLink();

    if (policyUrl) {
      // Send detected policy URL to background script
      chrome.runtime.sendMessage({
        action: "privacyPolicyDetected",
        url: window.location.href,
        policyUrl: policyUrl
      }).catch(() => {
        // Ignore errors if background script isn't ready
      });
    }
  }, 1000);
});
