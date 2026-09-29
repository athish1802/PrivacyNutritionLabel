# Privacy Nutrition Label

A browser extension that presents website privacy policies as standardized "nutrition label" style summaries — making privacy information readable at a glance instead of buried in legal text.

Originally developed as a class project for HCI 6352-01 (Fall 2025).

---

## 🎯 What It Does

Most people never read privacy policies. This extension solves that by surfacing the key facts — what data a site collects, how it's used, what rights you have, and how many trackers are running—all in an easy-to-understand format inspired by food nutrition labels.

## ✨ Key Features

- **Privacy Grade (A–F)** — each site gets a letter grade calculated from its data practices
- **Risk Level Indicator** — LOW / MEDIUM / HIGH visual assessment
- **Data Collection Summary** — see which categories of data the site collects (location, health, financial, biometric, etc.)
- **Usage Transparency** — understand how your data is used (advertising, third-party sharing, sold to partners)
- **User Rights** — see whether the site allows you to delete data, opt out of tracking, or access your data
- **Tracker Detection** — real-time detection and categorization of third-party trackers (advertising, analytics, social)
- **Color-Coded Badge** — toolbar icon reflects the privacy grade at a glance
- **Local Caching** — all data is stored locally; nothing is sent externally

---

## 🚀 Quick Start

### Installation

#### Chrome / Edge / Brave

1. Clone or download this repository
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `Extension_Files/extension` folder
6. The extension icon will appear in your toolbar

#### Firefox

1. Clone or download this repository
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Navigate to `Extension_Files/extension` and select `manifest.json`

> Note: For permanent Firefox installation, the extension needs to be packaged and signed through Mozilla Add-ons.

### Creating Extension Icons

The extension requires PNG icon files. Generate them from the included `icons/icon.svg`:

**Using ImageMagick:**
```bash
cd Extension_Files/extension/icons
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

**Using an online converter:** Upload `icon.svg` to [cloudconvert.com](https://cloudconvert.com/svg-to-png) and export at 16×16, 48×48, and 128×128.

### Using the Extension

1. Navigate to any website — the extension analyzes it automatically
2. Check the toolbar badge for the privacy grade
3. Click the extension icon to open the full privacy nutrition label
4. Review data collection, usage practices, user rights, and active trackers
5. Click **View Full Policy** to read the site's complete privacy policy

---

## 📊 How the Grading System Works

The extension calculates a privacy score (0–100) and converts it to a letter grade:

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 0–9 | Excellent privacy |
| B | 10–24 | Good privacy |
| C | 25–39 | Average privacy |
| D | 40–59 | Poor privacy |
| F | 60+ | Very poor privacy |

### Scoring Breakdown

- **Data Collection (0–30 pts)** — biometric (10), health (8), financial (6), location (5), browsing history (4), personal info (2)
- **Data Usage (0–30 pts)** — sold to third parties (15), shared with partners (10), advertising (5)
- **User Rights (up to −16 pts)** — delete data (−5), opt out of tracking (−5), access data (−3), opt out of sale (−3)
- **Trackers (0–20 pts)** — every 2 trackers detected adds 1 point

---

## 📁 Project Structure

```
PrivacyNutritionLabel/
├── Extension_Files/
│   └── extension/
│       ├── manifest.json                # Extension configuration
│       ├── background/
│       │   └── background.js            # Service worker, network monitoring
│       ├── content/
│       │   └── content.js               # Content script
│       ├── popup/
│       │   ├── popup.html               # Popup UI
│       │   ├── popup.js                 # Popup logic
│       │   └── popup.css                # Popup styling
│       ├── utils/
│       │   ├── storage.js               # Local storage management
│       │   ├── trackers.js              # Tracker detection logic
│       │   ├── grading.js               # Privacy score calculation
│       │   └── policy-analyzer.js       # Privacy analysis
│       ├── data/
│       │   └── tracker-list.json        # Known tracker domains database
│       └── icons/
│           └── icon.svg                 # SVG icon template
├── Final_Documents/                     # HCI paper, report, and presentation
├── Reference_Materials/                 # Research references
└── README.md                            # This file
```

---

## 💻 Tech Stack

- **JavaScript** (81.8%) — Core logic and extension functionality
- **HTML** (9.9%) — UI structure
- **CSS** (8.3%) — Styling
- **Chrome Extensions Manifest V3**

---

## 🚧 Current Limitations (MVP)

This is a Minimum Viable Product. Privacy data comes from a predefined dataset covering popular websites (Google, Facebook, Amazon, etc.). Unknown sites fall back to a default template.

**Planned enhancements:**
- LLM API integration (Claude / GPT) for live privacy policy analysis
- Automated policy scraping and parsing
- Community-contributed privacy assessments

---

## 🛠️ Debugging

- **Popup**: Right-click the extension icon → "Inspect popup"
- **Service worker**: `chrome://extensions/` → "Inspect views: background page"
- **Console logs**: Available in both DevTools panels

---

## 📋 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Add known site data** — Add privacy information for popular websites
2. **Expand tracker database** — Add more tracker domains
3. **Improve UI** — Enhance visual design and UX
4. **Add features** — Implement planned enhancements
5. **Report bugs** — Open issues for any bugs found

---

## 📜 Privacy

This extension:
- **Does NOT collect any user data**
- **Does NOT send data to external servers**
- **Stores all data locally** in your browser using Chrome's storage API
- **Does NOT track your browsing history** beyond what you've visited (stored locally)

---

## 📝 License

MIT License — See LICENSE file for details

---

## 🙏 Credits

Inspired by nutrition labels on food products — simple, standardized, and easy to understand at a glance.

Built to make privacy policies more accessible and understandable for everyone.

---

## ❓ Support

If you encounter issues or have questions:

1. Check the [Extension README](Extension_Files/extension/README.md) for detailed documentation
2. Review the browser console for errors
3. Open an issue on GitHub with details about your problem
