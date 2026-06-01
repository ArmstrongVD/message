# Quickstart: Modern Secure Redesign

**Feature**: `001-modern-secure-redesign`

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge — latest 2 major versions)
- A local web server for development (any static file server)
- No build tools, package managers, or compilers required

## Running Locally

### Option A: Python (if installed)

```bash
cd /path/to/message
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### Option B: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Option C: Any static file server

```bash
# Using Node's npx (one-off, no install)
npx serve .

# Using PHP
php -S localhost:8000
```

## Verifying the Feature

### 1. Create an Encrypted Message

1. Open the app in your browser
2. Type a secret message in the text area
3. Enter a passphrase in the passphrase field
4. Click "Create"
5. **Expected**: A shareable link appears with an encrypted hash (not human-readable)
6. Click "Copy Link" — **Expected**: Link copied to clipboard with confirmation

### 2. Decrypt a Message

1. Open the generated link in a new browser tab (or incognito window)
2. **Expected**: A passphrase prompt appears
3. Enter the correct passphrase → **Expected**: Original message is displayed
4. Re-open the link, enter a wrong passphrase → **Expected**: Error message, no content revealed

### 3. Responsive Design

1. Open browser DevTools → toggle device toolbar
2. Test at 320px, 480px, 768px, 1024px, 1440px widths
3. **Expected**: Layout adapts, no horizontal scrolling, touch targets ≥ 44px

### 4. Accessibility

1. Navigate the entire app using only Tab, Shift+Tab, Enter, Space
2. **Expected**: All elements receive visible focus, all actions work
3. Open VoiceOver (Cmd+F5 on macOS) and navigate
4. **Expected**: Labels, errors, and status messages are announced

### 5. PIN Gate (Optional Feature)

1. Open settings and set a PIN (minimum 4 characters)
2. Close and re-open the app
3. **Expected**: PIN entry form appears before message creation
4. Enter correct PIN → **Expected**: Message creation form shown
5. Disable PIN in settings → **Expected**: App loads directly to creation form

### 6. Message Expiry

1. Create a message with a short expiry (e.g., 1 minute)
2. Wait for it to expire, then open the link
3. **Expected**: "This message has expired" notice, no content shown

## File Overview

| File          | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `index.html`  | Main HTML — structure for create, view, and PIN gate views     |
| `style.css`   | Responsive stylesheet — replaces Materialize CDN               |
| `index.js`    | App logic — view routing, form handling, DOM updates           |
| `crypto.js`   | Encryption module — AES-GCM encrypt/decrypt via Web Crypto API |
| `pin-gate.js` | PIN gate module — localStorage-based optional access control   |

## Troubleshooting

| Issue                             | Cause                                                   | Fix                                                                 |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| "Web Crypto API is not available" | Browser too old or using `file://` protocol             | Use a local HTTP server (not `file://`); update browser             |
| PIN gate not working              | localStorage blocked (private browsing)                 | PIN features require localStorage; use normal browsing mode         |
| Old links don't work              | Pre-upgrade links used Base64 plaintext, not encryption | Old links are incompatible; create new encrypted messages           |
| Styles missing                    | `style.css` not in same directory as `index.html`       | Ensure `style.css` is at the repository root alongside `index.html` |
