// Privacy Policy Analyzer
// For MVP: Uses predefined rules and known site data
// Future: Will integrate with LLM API for actual policy analysis

class PrivacyAnalyzer {
  constructor() {
    this.trackerDb = null;
    this.loadTrackerDatabase();
  }

  async loadTrackerDatabase() {
    try {
      const response = await fetch(
        chrome.runtime.getURL("data/tracker-list.json")
      );
      this.trackerDb = await response.json();
    } catch (error) {
      console.error("Failed to load tracker database:", error);
    }
  }

  async analyzePrivacy(domain) {
    // Check if we have predefined data for popular sites
    const knownSites = await this.getKnownSiteData(domain);
    if (knownSites) {
      return knownSites;
    }

    // Default template for unknown sites
    return this.getDefaultTemplate(domain);
  }

  getDefaultTemplate(domain) {
    // Try multiple common privacy policy URL patterns
    const commonPatterns = [
      `https://${domain}/privacy`,
      `https://${domain}/privacy-policy`,
      `https://${domain}/legal/privacy`,
      `https://www.${domain}/privacy`,
      `https://www.${domain}/privacy-policy`,
    ];

    return {
      domain: domain,
      grade: null, // Will be set based on confidence
      riskLevel: "UNKNOWN",
      riskScore: null,
      lastAnalyzed: new Date().toISOString(),
      dataCollected: {
        personalInfo: null,
        location: null,
        browsing: null,
        financial: null,
        health: null,
        biometric: null,
      },
      dataUsage: {
        advertising: null,
        personalization: null,
        analytics: null,
        sharedWithPartners: null,
        sold: null,
      },
      userRights: {
        accessData: null,
        deleteData: null,
        optOutTracking: null,
        optOutSale: null,
      },
      trackers: {
        total: 0,
        advertising: 0,
        analytics: 0,
        social: 0,
      },
      policyUrl: commonPatterns[0], // Use first pattern as default
      policyUrlAlternatives: commonPatterns, // Provide alternatives for future use
      analysisConfidence: "NONE", // No actual policy analysis done
    };
  }

  async getKnownSiteData(domain) {
    // Predefined privacy data for popular sites (for MVP testing)
    const knownSites = {
      "facebook.com": {
        domain: "facebook.com",
        grade: "D",
        riskLevel: "HIGH",
        riskScore: 72,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: true,
          browsing: true,
          financial: false,
          health: false,
          biometric: true,
        },
        dataUsage: {
          advertising: true,
          personalization: true,
          analytics: true,
          sharedWithPartners: true,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: false,
          optOutSale: false,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://www.facebook.com/privacy/policy",
        analysisConfidence: "HIGH",
      },
      "google.com": {
        domain: "google.com",
        grade: "C",
        riskLevel: "MEDIUM",
        riskScore: 55,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: true,
          browsing: true,
          financial: false,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: true,
          personalization: true,
          analytics: true,
          sharedWithPartners: true,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true,
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://policies.google.com/privacy",
        analysisConfidence: "HIGH",
      },
      "duckduckgo.com": {
        domain: "duckduckgo.com",
        grade: "A",
        riskLevel: "LOW",
        riskScore: 8,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: false,
          location: false,
          browsing: false,
          financial: false,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: false,
          personalization: false,
          analytics: false,
          sharedWithPartners: false,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true,
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://duckduckgo.com/privacy",
        analysisConfidence: "HIGH",
      },
      "amazon.com": {
        domain: "amazon.com",
        grade: "C",
        riskLevel: "MEDIUM",
        riskScore: 48,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: true,
          browsing: true,
          financial: true,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: true,
          personalization: true,
          analytics: true,
          sharedWithPartners: true,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true,
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://www.amazon.com/gp/help/customer/display.html?nodeId=468496",
        analysisConfidence: "HIGH",
      },
      "twitter.com": {
        domain: "twitter.com",
        grade: "D",
        riskLevel: "HIGH",
        riskScore: 65,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: true,
          browsing: true,
          financial: false,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: true,
          personalization: true,
          analytics: true,
          sharedWithPartners: true,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: false,
          optOutSale: false,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://twitter.com/en/privacy",
        analysisConfidence: "HIGH",
      },
      "github.com": {
        domain: "github.com",
        grade: "B",
        riskLevel: "LOW",
        riskScore: 22,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: false,
          browsing: true,
          financial: false,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: false,
          personalization: true,
          analytics: true,
          sharedWithPartners: false,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true,
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://docs.github.com/en/site-policy/privacy-policies",
        analysisConfidence: "HIGH",
      },
      "openai.com": {
        domain: "openai.com",
        grade: "C",
        riskLevel: "MEDIUM",
        riskScore: 45,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true, // Name, email, phone, account info, payment info
          location: true, // IP-based location + optional GPS
          browsing: true, // Usage data, interaction history, log data
          financial: true, // Payment information, transaction history
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: false, // No targeted advertising
          personalization: true, // Service improvement
          analytics: true, // Usage analytics
          sharedWithPartners: true, // Vendors and service providers
          sold: false, // Explicitly stated they don't sell
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true, // Can opt out of training
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://openai.com/policies/privacy-policy/",
        analysisConfidence: "HIGH",
      },
      "chatgpt.com": {
        domain: "chatgpt.com",
        grade: "C",
        riskLevel: "MEDIUM",
        riskScore: 45,
        lastAnalyzed: new Date().toISOString(),
        dataCollected: {
          personalInfo: true,
          location: true,
          browsing: true,
          financial: true,
          health: false,
          biometric: false,
        },
        dataUsage: {
          advertising: false,
          personalization: true,
          analytics: true,
          sharedWithPartners: true,
          sold: false,
        },
        userRights: {
          accessData: true,
          deleteData: true,
          optOutTracking: true,
          optOutSale: true,
        },
        trackers: {
          total: 0,
          advertising: 0,
          analytics: 0,
          social: 0,
        },
        policyUrl: "https://openai.com/policies/privacy-policy/",
        analysisConfidence: "HIGH",
      },
    };

    // Check for exact match or subdomain match
    for (const [knownDomain, data] of Object.entries(knownSites)) {
      if (domain === knownDomain || domain.endsWith(`.${knownDomain}`)) {
        return data;
      }
    }

    return null;
  }

  isKnownTracker(domain) {
    if (!this.trackerDb) return false;
    return this.trackerDb.trackers.includes(domain);
  }

  categorizeTracker(domain) {
    // Simplified categorization
    if (domain.includes("google-analytics") || domain.includes("analytics")) {
      return "analytics";
    }
    if (domain.includes("facebook") || domain.includes("twitter")) {
      return "social";
    }
    return "advertising";
  }
}

// Create a singleton instance
const analyzer = new PrivacyAnalyzer();

// Export functions
async function analyzePrivacy(domain) {
  return await analyzer.analyzePrivacy(domain);
}

function isKnownTracker(domain) {
  return analyzer.isKnownTracker(domain);
}

function categorizeTracker(domain) {
  return analyzer.categorizeTracker(domain);
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PrivacyAnalyzer, analyzer, analyzePrivacy, isKnownTracker, categorizeTracker };
}
