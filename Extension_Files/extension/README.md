# Privacy Nutrition Labels - Browser Extension

A browser extension that displays "nutrition label" style privacy summaries for websites, making privacy policies understandable at a glance.

## Features

- **Privacy Grade (A-F)**: Each website gets a letter grade based on its privacy practices
- **Risk Level Indicator**: Visual LOW/MEDIUM/HIGH risk assessment
- **Data Collection Summary**: See what types of data the site collects
- **Usage Transparency**: Understand how your data is used
- **User Rights**: Know what privacy rights you have
- **Tracker Detection**: Real-time detection and categorization of third-party trackers
- **Color-Coded Badge**: Toolbar icon shows grade at a glance
- **Local Storage**: All data cached locally for privacy

## Installation

### Chrome/Edge/Brave

1. Download or clone this repository
2. Open your browser and go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked"
5. Select the `extension` folder from this repository
6. The extension icon should appear in your toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the `extension` folder and select `manifest.json`
5. The extension will be loaded temporarily

**Note**: For permanent installation in Firefox, you'll need to package and sign the extension through Mozilla Add-ons.

## Creating Extension Icons

The extension needs icon files to display properly. You have a few options:

### Option 1: Use an online converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload the `icons/icon.svg` file
3. Convert to PNG at these sizes:
   - 16x16 (save as `icon16.png`)
   - 48x48 (save as `icon48.png`)
   - 128x128 (save as `icon128.png`)
4. Place the PNG files in the `icons/` folder

### Option 2: Use ImageMagick (Command line)
```bash
cd extension/icons
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Option 3: Design your own
Create custom icons using Figma, Canva, or Photoshop at the required sizes and save them as PNG files.

## Usage

1. **Navigate to any website** - The extension automatically analyzes the site
2. **Check the badge** - The toolbar icon shows the privacy grade with a color-coded badge
3. **Click the extension icon** - View the full privacy nutrition label
4. **Review the details** - See data collection, usage, rights, and trackers
5. **View full policy** - Click "View Full Policy" to read the complete privacy policy

## How It Works

### Privacy Grading System

The extension calculates a privacy score (0-100) based on:

- **Data Collection (0-30 points)**: More sensitive data types increase the score
  - Biometric data: 10 points
  - Health data: 8 points
  - Financial data: 6 points
  - Location data: 5 points
  - Browsing history: 4 points
  - Personal info: 2 points

- **Data Usage (0-30 points)**: How your data is used
  - Sold to third parties: 15 points
  - Shared with partners: 10 points
  - Used for advertising: 5 points

- **User Rights (up to -16 points)**: Good privacy practices reduce the score
  - Can delete data: -5 points
  - Can opt-out of tracking: -5 points
  - Can access data: -3 points
  - Can opt-out of sale: -3 points

- **Trackers (0-20 points)**: Third-party trackers detected on the page
  - Each 2 trackers adds 1 point (capped at 20)

**Grade Conversion:**
- A: 0-9 points (Excellent privacy)
- B: 10-24 points (Good privacy)
- C: 25-39 points (Average privacy)
- D: 40-59 points (Poor privacy)
- F: 60+ points (Very poor privacy)

### Tracker Detection

The extension monitors network requests in real-time to detect:
- **Advertising trackers**: Ad networks and retargeting
- **Analytics trackers**: Usage analytics and data collection
- **Social trackers**: Social media widgets and tracking pixels

Known trackers are identified using a curated database of common tracking domains.

### Data Sources

**MVP Version (Current)**:
- Predefined privacy data for popular websites (Facebook, Google, Amazon, etc.)
- Default templates for unknown sites
- Real-time tracker detection

**Future Enhancement**:
- Integration with LLM APIs (Claude/GPT) for actual privacy policy analysis
- Automated policy scraping and parsing
- Community-contributed privacy assessments

## Project Structure

```
extension/
├── manifest.json              # Extension configuration
├── background/
│   └── background.js         # Service worker for monitoring
├── content/
│   └── content.js            # Content script (minimal in MVP)
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styling
├── utils/
│   ├── storage.js            # Storage management
│   ├── trackers.js           # Tracker detection
│   ├── grading.js            # Privacy grade calculation
│   └── policy-analyzer.js    # Privacy analysis logic
├── data/
│   └── tracker-list.json     # Known tracker domains
└── icons/
    ├── icon.svg              # SVG icon template
    └── README.md             # Icon creation instructions
```

## Development

### Debugging

**Chrome DevTools:**
1. Right-click extension icon → "Inspect popup" to debug the popup
2. Go to `chrome://extensions/` → Click "Inspect views: background page" to debug the service worker
3. Check the Console for errors and logs

**Reload Extension:**
After making changes, go to `chrome://extensions/` and click the reload icon for your extension.

### Testing

Test the extension on various websites:
- **High privacy sites**: DuckDuckGo (should get A grade)
- **Medium privacy sites**: GitHub, Google (should get B-C grade)
- **Low privacy sites**: Facebook, Twitter (should get D-F grade)

## Troubleshooting

### Extension not loading
- Make sure you selected the `extension` folder, not the parent folder
- Check that all files are in place
- Look for errors in `chrome://extensions/`

### Badge not showing
- The extension may be working; try clicking the icon
- Check if the site is a chrome:// page (not supported)
- Reload the page and the extension

### Popup not displaying data
- Open the popup inspector (right-click icon → "Inspect popup")
- Check Console for JavaScript errors
- Verify the background service worker is running

### Trackers showing 0
- Trackers are detected in real-time as the page loads
- Refresh the page to start fresh tracker detection
- Some sites may genuinely have no third-party trackers

## Privacy Policy

This extension:
- **Does NOT collect any user data**
- **Does NOT send data to external servers**
- **Stores all data locally** in your browser using Chrome's storage API
- **Does NOT track your browsing history** beyond what you've visited (stored locally)

## Future Enhancements

### Phase 1 (Current MVP)
- ✅ Basic privacy labels for popular sites
- ✅ Real-time tracker detection
- ✅ Privacy grading algorithm
- ✅ Local storage and caching

### Phase 2 (Planned)
- [ ] LLM API integration for actual policy analysis
- [ ] Privacy dashboard with statistics
- [ ] Export privacy reports
- [ ] Historical policy change tracking

### Phase 3 (Future)
- [ ] Site comparison tool
- [ ] Privacy-friendly alternatives recommender
- [ ] Automatic opt-out requests
- [ ] Community ratings and crowdsourced data

## Contributing

Contributions are welcome! Here are some ways you can help:

1. **Add known site data**: Add privacy information for popular websites to `policy-analyzer.js`
2. **Expand tracker database**: Add more tracker domains to `tracker-list.json`
3. **Improve UI**: Enhance the visual design and user experience
4. **Add features**: Implement new features from the roadmap
5. **Report bugs**: Open issues for any bugs you find

## License

MIT License - See LICENSE file for details

## Credits

Built as an HCI (Human-Computer Interaction) project to make privacy policies more accessible and understandable.

Inspired by nutrition labels on food products - simple, standardized, and easy to understand at a glance.

## Support

If you encounter issues or have questions:
1. Check the Troubleshooting section above
2. Review the browser console for errors
3. Open an issue on GitHub with details about your problem

---

**Note**: This is an MVP (Minimum Viable Product). The privacy assessments for unknown sites use default templates. For production use, integration with actual policy analysis would be required.
