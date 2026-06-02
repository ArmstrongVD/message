# Tasks: Modern Secure Redesign

**Input**: Design documents from `specs/001-modern-secure-redesign/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted per template rules.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single static site**: All files at repository root (`./`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, file creation, and removal of legacy dependencies

- [x] T001 Create empty `style.css` stylesheet at `./style.css`
- [x] T002 [P] Create empty `crypto.js` module at `./crypto.js` with `window.SecretCrypto` namespace stub
- [x] T003 [P] Create empty `pin-gate.js` module at `./pin-gate.js` with `window.PinGate` namespace stub
- [x] T004 Update `index.html` to remove Materialize CDN `<link>` tag and inline `<style>` block, replace with `<link rel="stylesheet" href="style.css">`
- [x] T005 Update `index.html` to add `<script src="crypto.js"></script>` and `<script src="pin-gate.js"></script>` before the existing `index.js` script tag

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core crypto infrastructure and HTML restructuring that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement `base64urlEncode(arrayBuffer)` and `base64urlDecode(string)` helper functions in `./crypto.js`
- [x] T007 Implement `deriveKey(passphrase, salt)` function using PBKDF2 (SHA-256, 100,000 iterations) in `./crypto.js`
- [x] T008 Implement `SecretCrypto.encrypt(message, passphrase, options)` per contract in `./crypto.js` — constructs MessagePayload JSON, encrypts with AES-GCM, returns Base64url-encoded `salt || iv || ciphertext`
- [x] T009 Implement `SecretCrypto.decrypt(encodedPayload, passphrase)` per contract in `./crypto.js` — decodes Base64url, extracts salt/iv/ciphertext, derives key, decrypts, returns parsed MessagePayload
- [x] T010 Add input validation to `SecretCrypto.encrypt`: empty message, message > 10,000 chars, empty passphrase, missing Web Crypto API in `./crypto.js`
- [x] T011 Add input validation to `SecretCrypto.decrypt`: malformed payload (< 28 bytes), empty passphrase, missing Web Crypto API, catch DOMException for wrong passphrase in `./crypto.js`
- [x] T012 Restructure `index.html` with semantic HTML: add `<main>`, proper `<form>` elements, `<label for="">` on all inputs, `<button type="submit">` and `<button type="button">` for actions
- [x] T013 Add ARIA live region container (`<div role="status" aria-live="polite">`) for status/error announcements in `index.html`
- [x] T014 Add passphrase `<input type="password">` field with visible `<label>` to the message creation form in `index.html`
- [x] T015 Add passphrase `<input type="password">` field with visible `<label>` to the message viewing/decrypt section in `index.html`
- [x] T016 Add character count display element (e.g., `<span id="char-count">`) next to the message input in `index.html`

**Checkpoint**: Crypto module is fully functional; HTML has proper semantic structure with all needed inputs. User story implementation can begin.

---

## Phase 3: User Story 1 — Encrypted Message Creation (Priority: P1) 🎯 MVP

**Goal**: Sender creates a message, enters a passphrase, and gets a shareable link with AES-GCM encrypted content

**Independent Test**: Create a message, verify the URL hash is not human-readable, copy the link successfully

### Implementation for User Story 1

- [x] T017 [US1] Rewrite the form submit handler in `./index.js` to collect message + passphrase, call `SecretCrypto.encrypt()`, and generate the shareable link using the encrypted payload in the URL hash
- [x] T018 [US1] Replace `innerHTML` usage with `textContent` for all user-supplied content rendering in `./index.js`
- [x] T019 [US1] Implement "Copy Link" button with `navigator.clipboard.writeText()` and visual confirmation feedback in `./index.js`
- [x] T020 [US1] Implement client-side validation: non-empty passphrase, non-empty message, message ≤ 10,000 chars with error display in `./index.js`
- [x] T021 [US1] Implement live character count update on message input (keyup/input event) displaying `X / 10,000` in `./index.js`
- [x] T022 [US1] Announce success status ("Link created") and errors to screen readers via the ARIA live region in `./index.js`
- [x] T023 [US1] Add Web Crypto API availability check on page load — show browser compatibility notice if `crypto.subtle` is undefined in `./index.js`

**Checkpoint**: Message creation with real encryption is fully functional. Sender can create and copy an encrypted link.

---

## Phase 4: User Story 2 — Encrypted Message Viewing (Priority: P1) 🎯 MVP

**Goal**: Recipient opens a shared link, enters the passphrase, and sees the decrypted message — or gets a clear error

**Independent Test**: Open a generated link, enter correct passphrase to see message; enter wrong passphrase to see error; open malformed link to see creation form

### Implementation for User Story 2

- [x] T024 [US2] Implement URL hash detection on page load — if hash is present, show the decrypt/passphrase form instead of the creation form in `./index.js`
- [x] T025 [US2] Implement decrypt form submit handler: extract hash, call `SecretCrypto.decrypt()` with entered passphrase, display decrypted message via `textContent` in `./index.js`
- [x] T026 [US2] Implement error handling for incorrect passphrase — display user-friendly error without revealing message content, announce via ARIA live region in `./index.js`
- [x] T027 [US2] Implement graceful degradation for malformed/empty hash — show creation form with no error (progressive enhancement) in `./index.js`
- [x] T028 [US2] Add "Create your own secret message" link on the decrypted message view, pointing back to the base URL (no hash) in `./index.js`

**Checkpoint**: Full encrypt/decrypt loop works. US1 + US2 together form a complete MVP.

---

## Phase 5: User Story 3 — Modern Responsive Visual Redesign (Priority: P2)

**Goal**: Replace Materialize with a custom responsive stylesheet; modern, clean look from 320px to 2560px

**Independent Test**: Load app at 320px, 480px, 768px, 1024px, 1440px viewports — no horizontal scroll, readable content, usable inputs

### Implementation for User Story 3

- [x] T029 [P] [US3] Define CSS custom properties (design tokens) for colors, spacing, typography, border-radius, and shadows in `./style.css`
- [x] T030 [P] [US3] Implement CSS reset/normalize rules and base typography (body, headings, paragraphs, links) in `./style.css`
- [x] T031 [US3] Implement responsive page layout using CSS Grid — centered content card with max-width, fluid padding in `./style.css`
- [x] T032 [US3] Style form elements (inputs, textareas, buttons) with consistent sizing, spacing, and modern appearance in `./style.css`
- [x] T033 [US3] Style the message display card (decrypted message view) with visual distinction from creation form in `./style.css`
- [x] T034 [US3] Style the link output section (shareable link display + copy button) in `./style.css`
- [x] T035 [US3] Style status and error messages with appropriate colors and iconography (CSS-only) in `./style.css`
- [x] T036 [US3] Add mobile-first responsive breakpoints: 480px, 768px, 1024px, 1440px with layout adjustments in `./style.css`
- [x] T037 [US3] Ensure touch targets are at least 44×44 CSS pixels on all interactive elements in `./style.css`
- [x] T038 [US3] Add subtle CSS transitions for form state changes (show/hide views) and button hover/active states in `./style.css`
- [x] T039 [US3] Update `index.html` to remove any remaining Materialize CSS class names (e.g., `row`, `col`, `s8`, `offset-s2`, `card-panel`, `btn`) and replace with project-owned class names

**Checkpoint**: App looks modern and responsive across all viewports with zero external CSS dependencies.

---

## Phase 6: User Story 4 — Section 508 / WCAG 2.1 AA Compliance (Priority: P2)

**Goal**: Full WCAG 2.1 AA compliance — keyboard navigation, screen reader support, contrast ratios

**Independent Test**: Keyboard-only navigation pass; VoiceOver/NVDA screen reader pass; contrast ratio check via DevTools

### Implementation for User Story 4

- [x] T040 [P] [US4] Implement visible `:focus-visible` styles for all interactive elements (inputs, buttons, links) in `./style.css`
- [x] T041 [P] [US4] Verify and adjust all color combinations to meet 4.5:1 contrast ratio (normal text) and 3:1 (large text) in `./style.css`
- [x] T042 [US4] Add `aria-describedby` linking error messages to their associated form inputs in `./index.html`
- [x] T043 [US4] Ensure all dynamic status updates (link created, copy success, decrypt error, expired message) use the ARIA live region in `./index.js`
- [x] T044 [US4] Add `prefers-reduced-motion` media query to disable CSS transitions for users who request it in `./style.css`
- [x] T045 [US4] Verify tab order follows logical reading order — passphrase → message → submit → output in `./index.html`
- [x] T046 [US4] Add `<meta name="description">` and `<html lang="en">` verification (already present but confirm) in `./index.html`

**Checkpoint**: App passes keyboard-only navigation, screen reader announces all labels/errors/statuses, all text meets contrast ratios.

---

## Phase 7: User Story 5 — Client-Side Login Gate (Priority: P3)

**Goal**: Optional PIN gate stored in localStorage that blocks access to the message creation form until correct PIN is entered

**Independent Test**: Set PIN, close/reopen app, enter correct PIN to access creation form; enter wrong PIN to see error; disable PIN and verify direct access

### Implementation for User Story 5

- [x] T047 [US5] Implement `PinGate.isAvailable()` — localStorage feature detection with try/catch in `./pin-gate.js`
- [x] T048 [US5] Implement `PinGate.setup(pin)` — validate PIN length ≥ 4, generate salt, hash with PBKDF2, store hash + salt + enabled flag in localStorage in `./pin-gate.js`
- [x] T049 [US5] Implement `PinGate.verify(pin)` — read stored salt, derive hash from input PIN, compare with stored hash in `./pin-gate.js`
- [x] T050 [US5] Implement `PinGate.isEnabled()` and `PinGate.disable()` per contract in `./pin-gate.js`
- [x] T051 [US5] Add PIN gate HTML section to `index.html` — PIN entry form with `<label>`, `<input type="password">`, submit button, and error display area
- [x] T052 [US5] Add settings UI section to `index.html` — set PIN form, disable PIN button, visible only when on creation view
- [x] T053 [US5] Integrate PIN gate into app flow in `./index.js` — on page load (no hash), check `PinGate.isEnabled()`, show PIN form or creation form accordingly
- [x] T054 [US5] Handle PIN form submission in `./index.js` — call `PinGate.verify()`, reveal creation form on success, show error on failure with ARIA announcement
- [x] T055 [US5] Handle settings PIN setup/disable in `./index.js` — call `PinGate.setup()` or `PinGate.disable()`, update UI and announce status via ARIA live region
- [x] T056 [P] [US5] Style PIN gate form and settings UI in `./style.css` — consistent with existing form styles, responsive

**Checkpoint**: PIN gate works end-to-end. Users can set, use, and disable the optional PIN. Creation and decryption flows are unaffected when PIN is disabled.

---

## Phase 8: User Story 6 — Message Expiry and Self-Destruct (Priority: P3)

**Goal**: Sender can set optional message expiry and view-once; recipient sees expiry notice or self-destructing message

**Independent Test**: Create message with short expiry, wait, open link — see expiry notice. Create view-once message, open link, verify content clears after display.

### Implementation for User Story 6

- [x] T057 [US6] Add expiry controls to the message creation form in `index.html` — dropdown/select for expiry duration (None, 5 min, 1 hour, 24 hours, 7 days) and a "View once" checkbox
- [x] T058 [US6] Update the creation form submit handler in `./index.js` to pass `options.expires` (calculated epoch timestamp) and `options.viewOnce` to `SecretCrypto.encrypt()`
- [x] T059 [US6] Implement expiry check after successful decryption in `./index.js` — if `payload.expires` exists and `Date.now() > payload.expires`, show "This message has expired" notice instead of message content
- [x] T060 [US6] Implement view-once behavior in `./index.js` — after displaying decrypted message, if `payload.viewOnce === true`, clear message from DOM after a brief display period and show "This message has been viewed" notice
- [x] T061 [US6] Announce expiry and view-once status messages via ARIA live region in `./index.js`
- [x] T062 [P] [US6] Style expiry controls (select, checkbox), expiry notice, and view-once notice in `./style.css`

**Checkpoint**: Expiry and view-once features work. Expired messages never show content. View-once messages self-clear.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements that affect multiple user stories

- [x] T063 [P] Remove all legacy code from `./index.js` — delete old `atob`/`btoa` logic, old classList toggles, and any unused variables
- [x] T064 Verify no `innerHTML` usage remains anywhere for user-supplied content in `./index.js`
- [x] T065 [P] Add `<noscript>` fallback message in `./index.html` for users with JavaScript disabled
- [x] T066 Perform full keyboard navigation walkthrough and fix any tab order or focus management issues across all views
- [x] T067 Run quickstart.md validation — verify all 6 test scenarios pass manually in a browser
- [x] T068 Final code cleanup — consistent 2-space indentation, trailing whitespace removal, semicolons in all JS files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2); benefits from US1 being done first for end-to-end testing
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2); can proceed in parallel with US1/US2 but best after HTML structure is stable
- **User Story 4 (Phase 6)**: Depends on US3 (visual styles must exist before verifying contrast/focus styles)
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2); independent of US3/US4 but benefits from stable styles
- **User Story 6 (Phase 8)**: Depends on US1 (encrypt options) and US2 (decrypt flow); independent of US3–US5
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — pairs with US1 for full loop testing
- **US3 (P2)**: Can start after Phase 2 — works on `style.css` (separate file from US1/US2)
- **US4 (P2)**: Should follow US3 — contrast and focus styles need the visual design in place
- **US5 (P3)**: Can start after Phase 2 — works on `pin-gate.js` (separate file)
- **US6 (P3)**: Depends on US1 + US2 — extends the encrypt/decrypt flow with metadata

### Within Each User Story

- Models/data structures before service logic
- Core implementation before integration
- ARIA/accessibility hooks alongside each interactive feature
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel (separate files)
- **Phase 2**: T006–T011 (crypto) can proceed in parallel with T012–T016 (HTML restructure) since they touch different files
- **Phase 3–5**: US1, US2 (both `index.js`), and US3 (`style.css`) can partially overlap — US3 only touches `style.css`
- **Phase 5**: T029 and T030 can run in parallel (independent CSS sections)
- **Phase 6**: T040 and T041 can run in parallel (independent CSS concerns)
- **Phase 7**: T056 can run in parallel with T047–T050 (CSS vs JS)
- **Phase 8**: T062 can run in parallel with T057–T061 (CSS vs JS/HTML)
- **Phase 9**: T063, T065 can run in parallel (different files)

---

## Parallel Example: User Story 1

```
                    Phase 2 Complete
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        T017 (form      T018       T023 (Web
        handler)     (innerHTML    Crypto check)
              │        → textContent)    │
              ▼           │              │
        T019 (Copy        │              │
        Link button)      │              │
              │           ▼              │
              ▼     ┌─────┘              │
        T020 (form  │                    │
        validation) │                    │
              │     │                    │
              ▼     ▼                    ▼
        T021 (char count)          T022 (ARIA
              │                  announcements)
              ▼                        │
         US1 Checkpoint ◄──────────────┘
```
