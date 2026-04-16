// Storage Management System
// Handles Chrome storage operations for privacy labels and browsing history

class StorageManager {
  constructor() {
    this.HISTORY_KEY = "privacyHistory";
    this.STATS_KEY = "privacyStats";
  }

  // Privacy Label Operations
  async savePrivacyLabel(domain, label) {
    try {
      await chrome.storage.local.set({ [domain]: label });
      return true;
    } catch (error) {
      console.error("Error saving privacy label:", error);
      return false;
    }
  }

  async getPrivacyLabel(domain) {
    try {
      const result = await chrome.storage.local.get(domain);
      return result[domain] || null;
    } catch (error) {
      console.error("Error getting privacy label:", error);
      return null;
    }
  }

  async deletePrivacyLabel(domain) {
    try {
      await chrome.storage.local.remove(domain);
      return true;
    } catch (error) {
      console.error("Error deleting privacy label:", error);
      return false;
    }
  }

  // History Operations
  async saveHistory(domain, visit) {
    try {
      const history = await this.getHistory();
      const existingIndex = history.findIndex((h) => h.domain === domain);

      if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex].visitCount++;
        history[existingIndex].lastVisit = visit.lastVisit;
        history[existingIndex].grade = visit.grade;
      } else {
        // Add new entry
        history.push({
          domain: domain,
          visitCount: 1,
          lastVisit: visit.lastVisit,
          grade: visit.grade,
          trackerCount: visit.trackerCount || 0
        });
      }

      await chrome.storage.local.set({ [this.HISTORY_KEY]: history });

      // Update stats whenever history changes
      await this.updateStats();

      return true;
    } catch (error) {
      console.error("Error saving history:", error);
      return false;
    }
  }

  async getHistory() {
    try {
      const result = await chrome.storage.local.get(this.HISTORY_KEY);
      return result[this.HISTORY_KEY] || [];
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }

  async clearHistory() {
    try {
      await chrome.storage.local.remove(this.HISTORY_KEY);
      await chrome.storage.local.remove(this.STATS_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing history:", error);
      return false;
    }
  }

  // Statistics Operations
  async updateStats() {
    try {
      const history = await this.getHistory();

      const stats = {
        totalSitesVisited: history.length,
        averageGrade: this.calculateAverageGrade(history),
        totalTrackersEncountered: this.sumTrackers(history),
        highRiskSiteCount: history.filter(
          (h) => h.grade === "D" || h.grade === "F"
        ).length,
        lastUpdated: new Date().toISOString()
      };

      await chrome.storage.local.set({ [this.STATS_KEY]: stats });
      return stats;
    } catch (error) {
      console.error("Error updating stats:", error);
      return null;
    }
  }

  async getStats() {
    try {
      const result = await chrome.storage.local.get(this.STATS_KEY);
      return result[this.STATS_KEY] || {
        totalSitesVisited: 0,
        averageGrade: "N/A",
        totalTrackersEncountered: 0,
        highRiskSiteCount: 0
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return null;
    }
  }

  calculateAverageGrade(history) {
    if (history.length === 0) return "N/A";

    const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const sum = history.reduce(
      (acc, h) => acc + (gradeValues[h.grade] || 0),
      0
    );
    const avg = sum / history.length;

    if (avg >= 3.5) return "A";
    if (avg >= 2.5) return "B";
    if (avg >= 1.5) return "C";
    if (avg >= 0.5) return "D";
    return "F";
  }

  sumTrackers(history) {
    return history.reduce((acc, h) => acc + (h.trackerCount || 0), 0);
  }

  // Utility: Get all stored data
  async getAllData() {
    try {
      const data = await chrome.storage.local.get(null);
      return data;
    } catch (error) {
      console.error("Error getting all data:", error);
      return {};
    }
  }

  // Utility: Clear all data
  async clearAllData() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  }
}

// Create a singleton instance
const storageManager = new StorageManager();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { StorageManager, storageManager };
}
