# XCH ACH Limit Orders Browser Extension

Automated limit orders for XCH purchases on vault.chia.net. Set target prices and let the extension automatically execute purchases when prices drop to your targets.

## Features

- **Limit Orders**: Set target prices and amounts for automatic execution
- **Observer-Based**: Uses MutationObserver for reliable step detection (no fixed delays)
- **Auto-Refresh**: Configurable page refresh interval to check prices
- **Cross-Browser**: Works on Chrome, Brave, Edge, and Firefox
- **Persistent State**: Orders and settings survive browser restarts
- **Badge Indicator**: Shows pending order count on extension icon

## Installation

### Chrome / Brave / Edge

1. Open `chrome://extensions` (or `brave://extensions` / `edge://extensions`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `xch-limit-order-extension` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the extension folder

**Or use web-ext for development:**
```bash
npm install
npm run dev:firefox
```

## Usage

1. Navigate to https://vault.chia.net/buy-xch
2. The extension toolbar will appear at the bottom of the page
3. Configure your settings:
   - **Max Budget**: Maximum total amount to spend
   - **Refresh Interval**: How often to refresh and check prices (in minutes)
4. Add limit orders:
   - **Target Price**: The price at which to buy (must be <= current price)
   - **Amount**: Dollar amount to purchase (minimum $25)
5. Click **Start** to begin monitoring
6. The extension will automatically:
   - Refresh the page at your configured interval
   - Check if current price meets any order targets
   - Execute the 3-step purchase flow automatically

## How It Works

### Step Detection

The extension uses MutationObserver to detect:
1. **Step 1 (Details)**: Waits for Next button to become enabled after entering amount
2. **Step 2 (Payment)**: Waits for Buy XCH button to become enabled
3. **Step 3 (Confirmation)**: Waits for dialog, clicks checkboxes, waits for Next to enable

### Button State Detection

Buttons are detected as enabled when:
- `aria-disabled` is not `"true"`
- Parent wrapper class is not `t_gray_Button`
- `disabled` attribute is not set

### Refresh Scheduling

Uses `chrome.alarms` API for reliable refresh scheduling that works even when:
- Service worker is sleeping (Chrome MV3)
- Page is in background tab
- Browser is minimized

## Files

```
xch-limit-order-extension/
├── manifest.json           # Extension configuration
├── src/
│   ├── content.js          # Main script (injected into vault.chia.net)
│   ├── background.js       # Service worker (alarms, messaging)
│   ├── lib/
│   │   └── storage.js      # Cross-browser storage abstraction
│   └── popup/
│       ├── popup.html      # Popup interface
│       ├── popup.js        # Popup logic
│       └── popup.css       # Popup styles
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── package.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Run in Firefox with auto-reload
npm run dev:firefox

# Lint the extension
npm run lint

# Build for distribution
npm run build
```

## Browser Compatibility

| Browser | Manifest Version | Status |
|---------|-----------------|--------|
| Chrome 102+ | V3 | ✅ Supported |
| Brave | V3 | ✅ Supported |
| Edge | V3 | ✅ Supported |
| Firefox 109+ | V3 | ✅ Supported |

## Permissions

- `storage`: Save settings and orders
- `alarms`: Schedule page refreshes
- `tabs`: Reload vault tab, detect tab state
- `activeTab`: Interact with current tab
- `host_permissions` for `vault.chia.net`: Inject content script

## Disclaimer

This extension automates purchases on vault.chia.net. Use at your own risk. Always verify orders are configured correctly before starting automation. The author is not responsible for any financial losses.

## License

MIT
