# Privacy Nutrition Label

A browser extension that presents website privacy policies as standardized "nutrition label" style summaries — making privacy information readable at a glance instead of buried in legal text.

Built as a group project for HCI 6352-01 (Fall 2025).

---

## What It Does

Most people never read privacy policies. This extension solves that by surfacing the key facts — what data a site collects, how it's used, what rights you have, and how many trackers are running — in a compact, color-coded label inspired by food nutrition facts.

## Features

- **Privacy Grade (A–F)** — each site gets a letter grade calculated from its data practices
- **Risk Level Indicator** — LOW / MEDIUM / HIGH visual assessment
- **Data Collection Summary** — see which categories of data the site collects (location, health, financial, biometric, etc.)
- **Usage Transparency** — understand how your data is used (advertising, third-party sharing, sold to partners)
- **User Rights** — see whether the site allows you to delete data, opt out of tracking, or access your data
- **Tracker Detection** — real-time detection and categorization of third-party trackers (advertising, analytics, social)
- **Color-Coded Badge** — toolbar icon reflects the privacy grade at a glance
- **Local Caching** — all data is stored locally; nothing is sent externally

## Grading System

The extension calculates a privacy score (0–100) and converts it to a letter grade:

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 0–9 | Excellent privacy |
| B | 10–24 | Good privacy |
| C | 25–39 | Average privacy |
| D | 40–59 | Poor privacy |
| F | 60+ | Very poor privacy |

Score is derived from:
- **Data Collection (0–30 pts)** — biometric (10), health (8), financial (6), location (5), browsing history (4), personal info (2)
- **Data Usage (0–30 pts)** — sold to third parties (15), shared with partners (10), advertising (5)
- **User Rights (up to −16 pts)** — delete data (−5), opt out of tracking (−5), access data (−3), opt out of sale (−3)
- **Trackers (0–20 pts)** — every 2 trackers detected adds 1 point

## Repository Structure

```
PrivacyNutritionLabel/
├── Extension_Files/
│   ├── extension/
│   │   ├── manifest.json          # Extension configuration
│   │   ├── background/
│   │   │   └── background.js      # Service worker, network monitoring
│   │   ├── content/
│   │   │   └── content.js         # Content script
│   │   ├── popup/
│   │   │   ├── popup.html         # Popup UI
│   │   │   ├── popup.js           # Popup logic
│   │   │   └── popup.css          # Popup styling
│   │   ├── utils/
│   │   │   ├── storage.js         # Local storage management
│   │   │   ├── trackers.js        # Tracker detection logic
│   │   │   ├── grading.js         # Privacy score calculation
│   │   │   └── policy-analyzer.js # Privacy analysis
│   │   ├── data/
│   │   │   └── tracker-list.json  # Known tracker domains database
│   │   └── icons/
│   └── extension.zip              # Packaged extension
├── Final_Documents/               # HCI paper, report, and presentation
└── Reference_Materials/           # Research references
```

## Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `Extension_Files/extension` folder
6. The extension icon will appear in your toolbar

### Firefox

1. Download or clone this repository
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Navigate to `Extension_Files/extension` and select `manifest.json`

> Note: For permanent Firefox installation, the extension needs to be packaged and signed through Mozilla Add-ons.

## Setting Up Icons

The extension requires PNG icon files. You can generate them from the included `icons/icon.svg`:

**Using ImageMagick:**
```bash
cd Extension_Files/extension/icons
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

**Using an online converter:** Upload `icon.svg` to a tool like [cloudconvert.com](https://cloudconvert.com/svg-to-png) and export at 16×16, 48×48, and 128×128.

## Usage

1. Navigate to any website — the extension analyzes it automatically
2. Check the toolbar badge for the privacy grade
3. Click the extension icon to open the full privacy nutrition label
4. Review data collection, usage practices, user rights, and active trackers
5. Click **View Full Policy** to read the site's complete privacy policy

## Current Limitations (MVP)

Privacy data in this version comes from a predefined dataset covering popular websites (Google, Facebook, Amazon, etc.). Unknown sites fall back to a default template. Real-time privacy policy parsing is planned for a future version.

**Planned enhancements:**
- LLM API integration (Claude / GPT) for live privacy policy analysis
- Automated policy scraping and parsing
- Community-contributed privacy assessments

## Tech Stack

- JavaScript (81.8%)
- HTML (9.9%)
- CSS (8.3%)
- Chrome Extensions Manifest V3

## Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Service worker**: `chrome://extensions/` → "Inspect views: background page"
- **Console logs**: Available in both DevTools panels
