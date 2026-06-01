# Feature Specification: Modern Secure Redesign

**Feature Branch**: `001-modern-secure-redesign`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Update existing web app to be more modern and not plain. Add authentication and security features including a login page. Update encryption to use Web Crypto API per constitution. Make responsive, 508 compliant, and mobile-friendly. Open to suggested features."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Encrypted Message Creation (Priority: P1)

A sender visits the site and types a secret message. The system encrypts the message using the Web Crypto API with a passphrase the sender chooses, then generates a shareable link. The sender copies the link and sends it to the intended recipient through any channel (text, email, chat).

**Why this priority**: This is the core value proposition — without secure message creation, the app has no purpose. Replacing the current Base64 encoding with real encryption (AES-GCM via Web Crypto API) addresses the constitution's security mandate and is the single most important upgrade.

**Independent Test**: Can be fully tested by creating a message, verifying the generated link contains encrypted (non-readable) data, and confirming the original text is not visible in the URL hash.

**Acceptance Scenarios**:

1. **Given** the sender is on the message creation page, **When** they enter a message and a passphrase and submit, **Then** the system generates a shareable link containing the encrypted message data
2. **Given** the sender has created a message, **When** they view the generated link's URL hash, **Then** the original message text is not human-readable in the URL
3. **Given** the sender has a generated link, **When** they click "Copy Link," **Then** the link is copied to the clipboard with confirmation feedback

---

### User Story 2 - Encrypted Message Viewing (Priority: P1)

A recipient opens a shared link in their browser. The system prompts them for the passphrase. Upon entering the correct passphrase, the decrypted message is displayed. If the passphrase is wrong, a clear error message is shown without revealing any information about the original message.

**Why this priority**: Co-equal with P1 Story 1 — message viewing completes the core send/receive loop. Without decryption, encrypted creation is useless.

**Independent Test**: Can be tested by opening a previously generated link, entering the correct passphrase, and verifying the original message appears. Then re-test with a wrong passphrase to confirm the error flow.

**Acceptance Scenarios**:

1. **Given** a recipient opens a valid message link, **When** they enter the correct passphrase, **Then** the decrypted message is displayed on screen
2. **Given** a recipient opens a valid message link, **When** they enter an incorrect passphrase, **Then** a user-friendly error is displayed and the message content is not revealed
3. **Given** a recipient opens a link with a malformed or empty hash, **When** the page loads, **Then** the system degrades gracefully with no uncaught exceptions and shows the message creation form instead

---

### User Story 3 - Modern Responsive Visual Redesign (Priority: P2)

The entire app is restyled with a modern, clean aesthetic using a dedicated CSS stylesheet (replacing the Materialize CDN dependency). The layout is fully responsive, adapting fluidly from mobile phones (320px) to tablets to large desktop screens. All interactive elements are appropriately sized for touch input on mobile.

**Why this priority**: The current app relies on an external CSS framework and looks dated. A custom responsive stylesheet directly addresses the user's request for a modern look and mobile support, and satisfies the constitution's mandate to remove the Materialize CDN.

**Independent Test**: Can be tested by loading the app at various viewport widths (320px, 768px, 1024px, 1440px) and verifying all content is readable, inputs are usable, and no horizontal scrolling occurs.

**Acceptance Scenarios**:

1. **Given** a user opens the app on a mobile device (viewport ≤ 480px), **When** the page loads, **Then** all content fits within the viewport without horizontal scrolling and touch targets are at least 44×44 pixels
2. **Given** a user opens the app on a tablet (viewport ~768px), **When** the page loads, **Then** the layout adjusts proportionally with comfortable spacing
3. **Given** a user opens the app on a desktop (viewport ≥ 1024px), **When** the page loads, **Then** the content is centered with a readable max-width and does not stretch edge-to-edge
4. **Given** the Materialize CDN link is removed, **When** the page loads, **Then** all styling comes from the project-owned stylesheet with no external dependencies

---

### User Story 4 - Section 508 / WCAG 2.1 AA Accessibility Compliance (Priority: P2)

The app meets WCAG 2.1 Level AA success criteria. All form inputs have visible labels, all interactive elements are keyboard-navigable, color contrast ratios meet 4.5:1 for normal text and 3:1 for large text, focus indicators are visible, and status messages (errors, confirmations) are announced to screen readers via ARIA live regions.

**Why this priority**: 508 compliance is a stated requirement and is co-prioritized with visual redesign since both involve the HTML structure and CSS. Doing them together avoids rework.

**Independent Test**: Can be tested using a keyboard-only navigation pass, a screen reader (VoiceOver on macOS), and a contrast-checking tool (browser DevTools or axe).

**Acceptance Scenarios**:

1. **Given** a user navigates the app using only the keyboard, **When** they tab through all interactive elements, **Then** every element receives a visible focus indicator and can be activated with Enter or Space
2. **Given** a screen reader is active, **When** the user submits a message and a link is generated, **Then** the screen reader announces the success status and the link content
3. **Given** the app's color scheme, **When** checked against WCAG contrast requirements, **Then** all text meets 4.5:1 contrast ratio (normal text) and 3:1 (large text)
4. **Given** a form field, **When** a screen reader focuses on it, **Then** the label and any instructions are announced

---

### User Story 5 - Client-Side Login Gate (Priority: P3)

Users can optionally set a PIN or passphrase to protect access to the message creation form. This is a client-side-only gate stored in localStorage — it is a convenience barrier, not a security boundary. When enabled, returning to the app prompts for the PIN before showing the creation form.

**Why this priority**: The user requested a "login page" but the constitution mandates no backend/server-side logic. A client-side PIN gate provides the requested authentication feel while staying within constraints. Lower priority because the core encryption already protects messages.

**Independent Test**: Can be tested by setting a PIN, closing the browser tab, returning to the app, entering the PIN to confirm access, then entering a wrong PIN to confirm rejection.

**Acceptance Scenarios**:

1. **Given** a user has not set a PIN, **When** they visit the app, **Then** the message creation form is shown directly (no gate)
2. **Given** a user has set a PIN via settings, **When** they return to the app, **Then** a PIN entry form is shown before the creation form
3. **Given** a user is at the PIN entry form, **When** they enter the correct PIN, **Then** the message creation form is revealed
4. **Given** a user is at the PIN entry form, **When** they enter an incorrect PIN, **Then** an error is shown and the creation form remains hidden
5. **Given** a user has set a PIN, **When** they choose to disable it in settings, **Then** the PIN gate is removed and the app loads directly to the creation form

---

### User Story 6 - Message Expiry and Self-Destruct (Priority: P3)

When creating a message, the sender can optionally set an expiration. The expiry timestamp is embedded in the encrypted payload. When a recipient opens an expired message, the app shows a "This message has expired" notice instead of the decrypted content. The sender can also choose a "view once" option that instructs the recipient's browser to clear the message from the page after first successful decryption.

**Why this priority**: Adds meaningful security value beyond encryption. However, since the app is purely client-side, enforcement is best-effort (recipient could intercept data before expiry logic runs). Nice-to-have that rounds out the "secret message" experience.

**Independent Test**: Can be tested by creating a message with a short expiry (e.g., 1 minute), waiting for it to expire, then opening the link and verifying the expiry notice appears.

**Acceptance Scenarios**:

1. **Given** a sender sets a 5-minute expiry on a message, **When** a recipient opens the link after 5 minutes, **Then** the app displays "This message has expired" and does not attempt decryption
2. **Given** a sender creates a message with no expiry, **When** a recipient opens the link at any time with the correct passphrase, **Then** the message is decrypted and shown normally
3. **Given** a sender selects "view once," **When** the recipient successfully decrypts and views the message, **Then** the message content is cleared from the page and a notice indicates the message has been viewed

---

### Edge Cases

- What happens when the URL hash is empty or missing? → App shows the message creation form (progressive enhancement, no errors)
- What happens when the URL hash contains invalid/corrupted data? → App shows a user-friendly error ("Unable to read this message") with no uncaught exceptions
- What happens when a very long message is entered? → The system handles messages up to 10,000 characters; beyond that, a validation message informs the user of the limit
- What happens when the browser does not support Web Crypto API? → The app shows a notice that a modern browser is required and does not fall back to insecure Base64
- What happens when localStorage is unavailable (private browsing)? → PIN gate features degrade gracefully; message creation and viewing still work
- What happens when the user's passphrase is empty? → The form validates and requires a non-empty passphrase before submission

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST encrypt messages using the Web Crypto API (AES-GCM algorithm) with a user-provided passphrase, deriving an encryption key via PBKDF2
- **FR-002**: System MUST generate a shareable URL containing the encrypted message data in the URL hash fragment
- **FR-003**: System MUST decrypt and display messages when the recipient provides the correct passphrase
- **FR-004**: System MUST display a clear, non-revealing error when decryption fails due to an incorrect passphrase
- **FR-005**: System MUST provide a "Copy Link" action with visual and screen-reader-accessible confirmation feedback
- **FR-006**: System MUST replace all Materialize CDN dependencies with a project-owned CSS stylesheet
- **FR-007**: System MUST render correctly on viewports from 320px to 2560px without horizontal scrolling
- **FR-008**: System MUST meet WCAG 2.1 Level AA contrast ratios (4.5:1 normal text, 3:1 large text)
- **FR-009**: All form inputs MUST have programmatically associated visible labels
- **FR-010**: All interactive elements MUST be reachable and operable via keyboard alone
- **FR-011**: Status messages (success, error) MUST be announced to assistive technology via ARIA live regions
- **FR-012**: Touch targets MUST be at least 44×44 CSS pixels on mobile viewports
- **FR-013**: System MUST use `textContent` or safe DOM APIs — never `innerHTML` — for rendering user-supplied content
- **FR-014**: System MUST support an optional client-side PIN gate stored in localStorage
- **FR-015**: System MUST support optional message expiry timestamps embedded in the encrypted payload
- **FR-016**: System MUST support a "view once" mode that clears message content after first successful decryption
- **FR-017**: System MUST validate that the passphrase field is non-empty before allowing message creation or decryption
- **FR-018**: System MUST limit message input to 10,000 characters with a visible character count and validation message
- **FR-019**: System MUST degrade gracefully when the Web Crypto API is unavailable, showing a browser compatibility notice
- **FR-020**: System MUST function as a purely static site with no server-side processing or external API calls

### Key Entities

- **Secret Message**: The user's text content, a sender-chosen passphrase, optional expiry timestamp, optional view-once flag. The message is encrypted into a payload that includes a random salt, initialization vector, and the ciphertext
- **Shareable Link**: A URL composed of the app's base address and a hash fragment containing the encoded encrypted payload
- **PIN Gate**: An optional client-side passphrase stored in localStorage that controls access to the message creation form; includes an enabled/disabled state
- **Message Metadata**: Embedded within the encrypted payload — includes creation timestamp, expiry timestamp (optional), and view-once flag (optional)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create and share an encrypted message in under 60 seconds
- **SC-002**: Recipients can decrypt and read a message within 15 seconds of opening the link (excluding passphrase recall time)
- **SC-003**: The app renders without horizontal scrolling on all viewports from 320px to 2560px wide
- **SC-004**: 100% of text elements meet WCAG 2.1 AA contrast ratios (4.5:1 normal, 3:1 large)
- **SC-005**: All interactive elements are reachable and operable using keyboard-only navigation
- **SC-006**: Screen readers correctly announce all form labels, error messages, and status updates
- **SC-007**: The app loads and functions with zero external CDN dependencies (fully self-contained)
- **SC-008**: Encrypted message content in the URL hash is not human-readable and cannot be decoded without the passphrase
- **SC-009**: Expired messages display an expiry notice and never reveal the original content
- **SC-010**: 90% of first-time users can complete the create-message flow without instructions

## Assumptions

- Users have access to a modern evergreen browser (Chrome, Firefox, Safari, or Edge — latest two major versions) that supports the Web Crypto API
- The app will continue to be hosted as a static site with no backend; the "login" feature is a client-side convenience gate, not a cryptographic security boundary
- The existing Materialize CDN dependency will be fully removed and replaced, not supplemented
- Message size will remain practical for URL hash storage (up to ~10,000 characters before encryption); very large messages are out of scope
- The PIN gate uses localStorage, which means it is device-specific and cleared if the user clears browser data — this is acceptable for a convenience feature
- The "view once" feature is best-effort on the client side; a technically sophisticated user could intercept the decrypted content before the UI clears it
- No user accounts, databases, or server-side sessions are involved — all state is ephemeral (URL hash) or local (localStorage)
- Accessibility testing will be performed manually using keyboard navigation, browser DevTools contrast checkers, and VoiceOver (macOS) or NVDA (Windows)
