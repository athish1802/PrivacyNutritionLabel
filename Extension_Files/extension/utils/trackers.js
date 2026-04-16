// Tracker Detection System
// Tracks and categorizes third-party trackers on web pages

class TrackerDetector {
  constructor() {
    // Map of domain -> Set of tracker domains
    this.activeTrackers = new Map();
    this.trackerDb = null;
    this.loadTrackerDatabase();
  }

  async loadTrackerDatabase() {
    try {
      const response = await fetch(chrome.runtime.getURL("data/tracker-list.json"));
      this.trackerDb = await response.json();
    } catch (error) {
      console.error("Failed to load tracker database:", error);
      // Fallback to empty database
      this.trackerDb = { trackers: [], categories: { advertising: [], analytics: [], social: [] } };
    }
  }

  recordTracker(pageDomain, trackerDomain) {
    if (!pageDomain || !trackerDomain) return;

    if (!this.activeTrackers.has(pageDomain)) {
      this.activeTrackers.set(pageDomain, new Set());
    }
    this.activeTrackers.get(pageDomain).add(trackerDomain);
  }

  getTrackersForDomain(domain) {
    return Array.from(this.activeTrackers.get(domain) || []);
  }

  getTrackerCount(domain) {
    return this.activeTrackers.get(domain)?.size || 0;
  }

  categorizeTrackers(domain) {
    const trackers = this.getTrackersForDomain(domain);
    const categorized = {
      advertising: 0,
      analytics: 0,
      social: 0,
    };

    trackers.forEach((tracker) => {
      const category = this.categorizeTracker(tracker);
      categorized[category]++;
    });

    return {
      total: trackers.length,
      ...categorized
    };
  }

  isKnownTracker(domain) {
    if (!this.trackerDb || !this.trackerDb.trackers) return false;

    // Check if domain or any parent domain is in the tracker list
    return this.trackerDb.trackers.some(tracker =>
      domain.includes(tracker) || tracker.includes(domain)
    );
  }

  categorizeTracker(domain) {
    if (!this.trackerDb || !this.trackerDb.categories) return "advertising";

    // Check each category
    for (const [category, trackers] of Object.entries(this.trackerDb.categories)) {
      if (trackers.some(tracker => domain.includes(tracker) || tracker.includes(domain))) {
        return category;
      }
    }

    // Default categorization based on domain patterns
    if (domain.includes("google-analytics") || domain.includes("analytics")) {
      return "analytics";
    }
    if (domain.includes("facebook") || domain.includes("twitter") || domain.includes("social")) {
      return "social";
    }
    return "advertising";
  }

  clearTrackersForDomain(domain) {
    this.activeTrackers.delete(domain);
  }

  clearAllTrackers() {
    this.activeTrackers.clear();
  }
}

// Create a singleton instance
const trackerDetector = new TrackerDetector();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TrackerDetector, trackerDetector };
}
