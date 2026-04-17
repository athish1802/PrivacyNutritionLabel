# Privacy Nutrition Labels: A Browser Extension for Transparent Privacy Communication

> **HCI 6352 — Research Methods in Human-Computer Interaction**
> Vanderbilt University | Fall 2025
> **Authors:** Athish Suresh, Aryan Kalluri, Yang (Alex) Tai

---

## Overview

Privacy policies are the primary legal mechanism for informing users about data practices — yet they consistently fail their purpose. The average policy takes 15–20 minutes to read, is written at a college reading level, and fewer than 1% of users read them end-to-end. This project designs, implements, and evaluates a **Chrome browser extension** that transforms dense privacy policies into standardized **visual nutrition labels**, directly analogous to FDA food packaging labels.

This study employs a **mixed-methods evaluation** — combining heuristic evaluation, large-scale online survey, and usability testing — to assess whether visual privacy communication can improve user awareness, understanding, and decision-making.

---

## Repository Structure

```
PrivacyNutritionLabel/
├── Final_Documents/
│   ├── FINAL_PAPER_COMPLETE.docx          # Full research paper (mixed-methods study)
│   ├── Group5_FINAL_Report_HCI (1).pdf    # Submitted course report
│   └── HCI_Presentation (1).pptx          # 19-slide project presentation
│
├── Extension_Files/
│   ├── extension.zip                      # Packaged extension (ready to install)
│   └── extension/
│       ├── manifest.json                  # Extension config (Manifest V3, v1.0.0)
│       ├── background/
│       │   └── background.js              # Service worker (11.2 KB)
│       ├── content/
│       │   └── content.js                 # Content script for webpage interaction
│       ├── popup/
│       │   ├── popup.html                 # Extension UI markup
│       │   ├── popup.js                   # Popup logic and interactions
│       │   └── popup.css                  # Styling
│       ├── utils/
│       │   ├── grading.js                 # Privacy grade calculation
│       │   ├── policy-analyzer.js         # Privacy policy analysis logic
│       │   ├── policy-url-resolver.js     # URL resolution utility
│       │   ├── storage.js                 # Local storage management
│       │   └── trackers.js                # Tracker detection
│       ├── data/
│       │   └── tracker-list.json          # Known tracker domain database
│       └── icons/
│           ├── icon.svg                   # SVG icon template
│           ├── icon16.png                 # 16×16 toolbar icon
│           ├── icon48.png                 # 48×48 extension icon
│           └── icon128.png                # 128×128 Chrome Web Store icon
│
├── Reference_Materials/
│   ├── Group 5 - Privacy Policies - Overview Reviews.docx
│   ├── Group Project Final Paper Format & Requirements_R1.docx
│   └── Research Methods in HCI - Lazar et al.pdf
│
├── Team Member Evaluation Form - HCI 6352-01 - Fall 2025_R.docx
├── .gitignore
└── README.md
```

---

## The Problem

Privacy policies are legally required but practically unreadable:

- **244 hours/year** — time the average American would need to read all privacy policies they encounter (McDonald & Cranor, 2008)
- **< 1%** of users read policies end-to-end
- Policies average **2,500 words** at a **college reading level**, while ~80% of U.S. adults read at an 8th-grade level
- This creates a fundamental **information asymmetry**: users cannot make informed privacy decisions because the required information is effectively inaccessible

---

## The Solution: Privacy Nutrition Labels

Modeled after FDA food nutrition labels, our browser extension provides an **at-a-glance privacy assessment** for any website visited.

### Extension Features

| Feature | Description |
|---------|-------------|
| **A–F Privacy Grade** | Color-coded badge in the browser toolbar (A = excellent, F = poor) |
| **Visual Nutrition Label** | Structured popup showing data collected, usage, sharing, and user rights |
| **Real-Time Tracker Detection** | Monitors network requests to detect advertising, analytics, and social trackers |
| **Confidence Transparency** | HIGH / MEDIUM / LOW / NONE indicator showing data quality and source |
| **Hybrid Data Architecture** | Manual expert database for popular sites + heuristic analysis for unknown sites |

### Privacy Grade Dimensions

Grades are calculated across four weighted dimensions:

1. **Data Collection** — sensitivity and breadth of data collected (location, biometrics, financial, browsing history, etc.)
2. **Data Usage** — advertising, personalization, and third-party sharing practices
3. **User Rights** — ability to access, delete, export, or opt out of data collection
4. **Tracker Behavior** — real-time count and categorization of third-party trackers on page load

---

## Extension Architecture

```
Browser Event (page load)
        │
        ▼
┌───────────────────────┐
│   content.js          │  ← Injected into every webpage
│   - DOM interaction   │
│   - Policy URL detect │
└──────────┬────────────┘
           │ message passing
           ▼
┌───────────────────────┐
│   background.js       │  ← Service worker (persistent)
│   - Network monitor   │
│   - Tracker detection │
│   - Grade calculation │
└──────────┬────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐  ┌──────────────────┐
│ storage │  │  policy-analyzer │
│ .js     │  │  .js             │
│ (cache) │  │  - Rule matching │
└─────────┘  │  - Grade scoring │
             └──────────────────┘
                      │
                      ▼
             ┌────────────────┐
             │   popup/       │  ← User-facing UI
             │   popup.html   │
             │   popup.js     │
             │   popup.css    │
             └────────────────┘
```

### Key Modules

**`policy-analyzer.js`** — Core analysis engine. Matches policy text against rule-based patterns for data types, usage practices, and user rights declarations. Combines a static expert-curated database with heuristic inference for unknown sites.

**`grading.js`** — Implements the A–F scoring algorithm. Weights data collection sensitivity, sharing practices, user rights availability, and tracker count into a composite grade.

**`trackers.js`** — Real-time network request monitoring against `tracker-list.json`, categorizing third-party domains as advertising, analytics, or social media trackers.

**`background.js`** — Persistent service worker coordinating all background operations, caching results, and managing confidence level assignment (HIGH = manually verified, MEDIUM = API-sourced, LOW = tracker-inferred, NONE = insufficient data).

---

## Research Study Design

This project includes a **full mixed-methods HCI evaluation** of the extension across three complementary methods. See [`Final_Documents/FINAL_PAPER_COMPLETE.docx`](Final_Documents/FINAL_PAPER_COMPLETE.docx) for the complete methodology.

### Method 1 — Heuristic Evaluation
- **N = 5 expert evaluators** (3 HCI professionals + 2 privacy domain experts)
- Systematic inspection against **Nielsen’s 10 Usability Heuristics**
- Test websites: Facebook (D), Amazon (C), DuckDuckGo (A), CNN (C), GitHub (B)
- Outputs: severity–frequency matrix, prioritized design recommendations
- Expected: 15–25 distinct usability problems identified

### Method 2 — Online Survey
- **N = 300 participants** (200 via Prolific Academic, 100 via Reddit/university)
- Validated **IUIPC scale** (Internet Users’ Information Privacy Concerns, Malhotra et al., 2004)
- Experimental vs. control group design (one-week extension use vs. static screenshots)
- Analysis: descriptive stats, multiple regression (predictors of adoption), thematic coding of open-ended responses

### Method 3 — Usability Testing
- **N = 9 participants** (3 novice / 3 intermediate / 3 expert users)
- Think-aloud protocol with 7 standardized real-world tasks
- **System Usability Scale (SUS)** post-task — target score ≥ 70
- Post-task interview on trust, confidence indicators, and grade interpretation

### Research Questions

| Method | Core Research Question |
|--------|------------------------|
| Heuristic Evaluation | What usability heuristics does the current interface violate, and what is their severity? |
| Online Survey | What user characteristics predict willingness to adopt privacy nutrition labels? |
| Usability Testing | Can users successfully interpret grades, find data collection info, and make privacy-based decisions? |

---

## Installing the Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle, top right)
4. Click **"Load unpacked"**
5. Select the `Extension_Files/extension/` directory
6. The privacy label icon will appear in your browser toolbar

Alternatively, drag `Extension_Files/extension.zip` directly into `chrome://extensions/`.

---

## Dependencies

| Component | Technology |
|-----------|------------|
| Extension runtime | Chrome Manifest V3 |
| Background processing | JavaScript Service Worker |
| Policy analysis | Rule-based NLP (vanilla JS) |
| Tracker detection | `webRequest` interception API |
| UI | HTML5 / CSS3 / Vanilla JS |
| Data storage | Chrome Storage API |

---

## Ethics & Human Subjects

All user studies require IRB approval prior to data collection. Key protections:
- Informed consent with right to withdraw at any time without penalty
- No personally identifiable information collected in surveys (anonymous responses)
- Usability sessions record screen activity only — no face or audio recording
- All data encrypted and deleted upon study completion
- Minor deception in usability testing (simulated privacy data for unfamiliar sites) — disclosed in post-session debrief

---

## References

- McDonald, A. M., & Cranor, L. F. (2008). The cost of reading privacy policies. *IS: A Journal of Law and Policy*, 4, 543–568.
- Kelley, P. G., Bresee, J., Cranor, L. F., & Reeder, R. W. (2009). A nutrition label for privacy. *SOUPS 2009*.
- Malhotra, N. K., Kim, S. S., & Agarwal, J. (2004). Internet users’ information privacy concerns (IUIPC). *Information Systems Research*, 15(4), 336–355.
- Schaub, F., Balebako, R., Durity, A. L., & Cranor, L. F. (2015). A design space for effective privacy notices. *SOUPS 2015*.
- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- Lazar, J., Feng, J. H., & Hochheiser, H. (2017). *Research Methods in Human-Computer Interaction* (2nd ed.). Morgan Kaufmann.
