# NoGoNet-II (Restricted Site Detector and Defender)

NoGoNet-II is a powerful Chrome extension designed to protect users by detecting and blocking access to harmful websites while providing real-time SMS notifications to guardians or administrators.

![NoGoNet-II Restricted Site Detector](https://via.placeholder.com/650x400?text=NoGoNet-II+Restricted+Site+Detector)

## Features

- **Site Blocking**: Automatically blocks access to predefined restricted websites
- **SMS Notifications**: Alerts guardians or administrators via SMS when a restricted site is accessed
- **Customizable Blocklist**: Easily add or remove websites from the restricted list
- **User-friendly Interface**: Simple settings panel for configuration
- **Detailed Block Page**: Informative page explaining why access was restricted

## Installation

### For Users

1. Download the extension from the Chrome Web Store (coming soon)
2. Click "Add to Chrome" to install
3. Configure settings by clicking on the extension icon

### For Developers

1. Clone this repository
   ```
   git clone https://github.com/Isomkevin/NoGoNet-II.git
   ```

2. Install dependencies
   ```
   cd NoGoNet-II
   npm install
   ```

3. Build the extension
   ```
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder from the project directory

## Usage

### Basic Configuration

1. Click on the extension icon in the Chrome toolbar
2. Enter restricted websites (one per line)
3. Toggle blocking and notification settings
4. Enter a phone number for SMS notifications
5. Click "Save Settings"

### Advanced Features

- **Blocking Mode**: Prevents access to all pages under a domain (e.g., blocking "example.com" will also block "subdomain.example.com")
- **Backup Content Filtering**: If navigation blocking fails, the content script will intervene to block the page
- **Customizable Block Page**: The block page can be customized in the source code

## SMS Integration

To use the SMS notification feature:

1. Sign up for an SMS API service (e.g., Twilio, MessageBird)
2. Replace the placeholder code in `restrictedSiteHandler.js` with your API credentials
3. Test the notification system by attempting to access a restricted site

## Development

### Project Structure

```
NoGoNet-II/
├── src/
│   ├── assets/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── utils/
│   │   └── restrictedSiteHandler.js
│   ├── manifest.json
│   ├── background.js
│   ├── popup.js
│   ├── popup.html
│   ├── blockPage.html
│   └── content.js
├── vite.config.js
├── package.json
└── README.md
```

### Building and Testing

- Run development server:
  ```
  npm run dev
  ```

- Build for production:
  ```
  npm run build
  ```

- Test in Chrome:
  1. Build the extension
  2. Load unpacked extension from the `dist` directory
  3. Make changes to the code
  4. Rebuild and reload the extension in Chrome

## Customization

### Adding Custom Restricted Sites

Edit the `defaultSites` array in `background.js` to include commonly restricted sites:

```javascript
const defaultSites = [
  'example-harmful-site.com',
  'malware-example.com',
  'phishing-example.com',
  // Add your custom sites here
];
```

### Modifying Block Page

The block page can be customized by editing `blockPage.html`. You can update the styles, text, and functionality to match your requirements.

## Privacy and Security

- The extension does not collect any personal data
- All settings are stored locally in Chrome's storage
- SMS notifications only include the domain name of the restricted site, not the full URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Vite and Chrome Extension Manifest V3
- Inspired by the need for better online safety tools for families, cyber kiosks and organizations

---
Made with ❤️ by [Isomkevin](https://github.com/Isomkevin)

Inspired by [NoGoNet](https://github.com/Fadhili5/NoGoNet) by [Fadhili5](https://github.com/Fadhili5)