# Orb Extension

This is a browser extension project named **Orb**.

## Overview

Orb is a browser extension that enhances your browsing experience by displaying badges and tags on web content. It includes custom styles and a mock API for development and testing.

## Project Structure

- `content.js` — Main content script injected into web pages.
- `content.css` — Styles for the extension's UI elements (badges, tags, etc.).
- `manifest.json` — Extension manifest file (metadata, permissions, scripts).
- `mock-api.js` — Mock API for simulating backend responses during development.
- `popup.html` — Popup UI for the extension (if applicable).

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd orb
   ```
2. **Load the extension in your browser:**
   - Go to your browser's extensions page (e.g., `chrome://extensions/` for Chrome).
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `orb` directory.

3. **Development:**
   - Edit the files as needed. Reload the extension in your browser to see changes.

## License

MIT License 