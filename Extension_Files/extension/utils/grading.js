// Privacy Grading Algorithm
// Calculates privacy score and grade based on data collection, usage, and user rights

function calculatePrivacyGrade(label) {
  let score = 0;
  let hasVerifiedData = false;

  // Data Collection (0-30 points)
  // More sensitive data types get higher weights
  const dataWeights = {
    biometric: 10,
    health: 8,
    financial: 6,
    location: 5,
    browsing: 4,
    personalInfo: 2,
  };

  if (label.dataCollected) {
    Object.entries(label.dataCollected).forEach(([key, value]) => {
      if (value === true && dataWeights[key]) {
        score += dataWeights[key];
        hasVerifiedData = true;
      }
    });
  }

  // Data Usage (0-30 points)
  // Selling data is most concerning
  if (label.dataUsage) {
    if (label.dataUsage.sold === true) {
      score += 15;
      hasVerifiedData = true;
    }
    if (label.dataUsage.sharedWithPartners === true) {
      score += 10;
      hasVerifiedData = true;
    }
    if (label.dataUsage.advertising === true) {
      score += 5;
      hasVerifiedData = true;
    }
  }

  // User Rights (negative points - good things reduce score)
  if (label.userRights) {
    if (label.userRights.deleteData === true) score -= 5;
    if (label.userRights.optOutTracking === true) score -= 5;
    if (label.userRights.accessData === true) score -= 3;
    if (label.userRights.optOutSale === true) score -= 3;
  }

  // Trackers (0-30 points for unknown sites, 0-20 for verified sites)
  // For sites without verified data, give trackers more weight
  if (label.trackers && label.trackers.total !== undefined) {
    const trackerWeight = hasVerifiedData ? 2 : 3;
    const trackerCap = hasVerifiedData ? 20 : 30;
    score += Math.min(label.trackers.total / trackerWeight, trackerCap);
  }

  // If we ONLY have tracker data and no other info, start from a baseline
  if (!hasVerifiedData && label.trackers && label.trackers.total !== undefined) {
    // Base score of 20 for unknown sites (starts at C)
    // Trackers will push it up or down from there
    score += 20;
  }

  // Ensure score is non-negative
  score = Math.max(0, score);

  // Convert score to letter grade
  if (score < 10) return { grade: "A", score };
  if (score < 25) return { grade: "B", score };
  if (score < 40) return { grade: "C", score };
  if (score < 60) return { grade: "D", score };
  return { grade: "F", score };
}

function getRiskLevel(score) {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  return "HIGH";
}

function getRiskColor(grade) {
  const colors = {
    A: "#10B981", // Green
    B: "#34D399", // Light green
    C: "#FBBF24", // Yellow
    D: "#F59E0B", // Orange
    F: "#EF4444", // Red
  };
  return colors[grade] || "#9CA3AF"; // Gray default
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculatePrivacyGrade, getRiskLevel, getRiskColor };
}
