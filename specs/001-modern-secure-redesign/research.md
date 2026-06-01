# Research: Modern Secure Redesign

**Feature**: `001-modern-secure-redesign`
**Date**: 2026-06-01

## R1: Web Crypto API — AES-GCM Encryption for Client-Side Message Security

**Decision**: Use AES-GCM (256-bit) with PBKDF2 key derivation for all message encryption/decryption

**Rationale**:

- AES-GCM is the recommended authenticated encryption mode in the Web Crypto API — it provides both confidentiality and integrity in a single operation
- PBKDF2 with a high iteration count (100,000+) and a random salt derives a strong key from a user-chosen passphrase, defending against brute-force attacks
- A fresh random 12-byte initialization vector (IV) per message ensures identical plaintexts produce different ciphertexts
- All of this is built into `window.crypto.subtle` — no external libraries needed, satisfying Constitution Principle I (Vanilla Only)

**Alternatives considered**:

- **AES-CBC**: Requires separate HMAC for integrity checking; AES-GCM combines both, simpler and fewer moving parts
- **RSA encryption**: Asymmetric — would require key exchange, far more complex for a shared-passphrase model
- **libsodium.js / tweetnacl.js**: Third-party libraries, violates Constitution Principle I

**Implementation notes**:

- Payload format: `salt (16 bytes) || iv (12 bytes) || ciphertext (variable)` — all Base64url-encoded for URL-safe hash storage
- PBKDF2 parameters: SHA-256, 100,000 iterations, 16-byte random salt
- AES-GCM tag length: 128 bits (default)
- Use `crypto.getRandomValues()` for salt and IV generation
- Encode final payload with Base64url (no padding) for URL hash compatibility

## R2: URL Hash Payload Encoding

**Decision**: Use Base64url encoding (RFC 4648 §5) for the encrypted payload in the URL hash

**Rationale**:

- Standard Base64 uses `+`, `/`, and `=` which are problematic in URLs
- Base64url replaces `+` with `-`, `/` with `_`, and strips `=` padding
- The URL hash fragment is not sent to the server, maintaining client-side-only architecture
- Browser URL length limits vary (2,083 chars in older IE, ~64KB in modern browsers) — a 10,000-char plaintext message produces roughly 13,400 chars Base64url after encryption overhead, well within modern browser limits

**Alternatives considered**:

- **Hex encoding**: 2x size expansion vs Base64's ~1.33x — would hit URL length limits sooner
- **URL-encoded raw bytes**: More complex, larger, no real advantage
- **JSON in hash**: Adds overhead and quoting complexity

## R3: Responsive CSS Strategy — Replace Materialize

**Decision**: Build a custom lightweight stylesheet using CSS custom properties (variables), Flexbox, and CSS Grid with mobile-first media queries

**Rationale**:

- Materialize CSS is ~141KB minified — replacing it with a purpose-built stylesheet targeting only the needed components will be far smaller
- CSS custom properties enable theming and consistent spacing without a preprocessor
- Mobile-first approach (base styles for small screens, `min-width` breakpoints for larger) aligns with responsive best practices
- Flexbox for single-axis layouts (form elements, nav), Grid for page-level structure

**Breakpoints**:

- Base: 0–479px (mobile phones)
- `min-width: 480px`: Large phones / small tablets
- `min-width: 768px`: Tablets
- `min-width: 1024px`: Desktops
- `min-width: 1440px`: Large desktops (max-width container cap)

**Alternatives considered**:

- **Tailwind CSS**: Framework, violates Constitution Principle I
- **Bootstrap**: Framework, violates Constitution Principle I
- **Classless CSS (e.g., Water.css)**: External dependency; also too opinionated for the specific UI needed

## R4: WCAG 2.1 AA Compliance — Key Techniques

**Decision**: Follow WCAG 2.1 Level AA success criteria using semantic HTML, ARIA attributes, and CSS focus management

**Rationale**:

- Section 508 compliance maps to WCAG 2.1 AA as of the 2017 Section 508 Refresh
- Semantic HTML (`<main>`, `<form>`, `<label>`, `<button>`) provides the foundation
- ARIA live regions (`aria-live="polite"` for success, `aria-live="assertive"` for errors) announce dynamic status changes
- Visible focus indicators via `:focus-visible` pseudo-class (avoids showing focus rings on mouse clicks)
- Color contrast: minimum 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)

**Key implementation patterns**:

- Every `<input>` gets a `<label for="id">` — no placeholder-only labels
- Error messages linked to inputs via `aria-describedby`
- Skip-to-content link for keyboard users (optional given single-page simplicity)
- Touch targets: `min-height: 44px; min-width: 44px` on all interactive elements
- `prefers-reduced-motion` media query to disable animations for users who request it
- `prefers-color-scheme` media query for optional dark mode (future consideration, not in scope)

**Alternatives considered**:

- **WCAG 2.2 AAA**: Overly strict for this project scope (e.g., no timing limits already satisfied, but AAA contrast of 7:1 is unnecessarily restrictive for a modern design)
- **WAI-ARIA Authoring Practices**: Referenced for specific patterns (e.g., alert role) but full widget patterns not needed for this simple form-based app

## R5: Client-Side PIN Gate — localStorage Strategy

**Decision**: Store a hashed PIN in localStorage using PBKDF2 (same as message encryption) for the optional access gate

**Rationale**:

- Storing the PIN in cleartext would allow anyone with DevTools access to read it — hashing provides a minimal barrier
- Using PBKDF2 (already implemented for message encryption) avoids introducing a second key derivation scheme
- The PIN gate is explicitly documented as a convenience barrier, not a security boundary
- localStorage availability is checked before enabling PIN features; if unavailable (private browsing in some browsers), PIN gate is silently disabled

**Storage schema**:

```
localStorage key: "msg_pin_hash"    → Base64url-encoded PBKDF2 hash
localStorage key: "msg_pin_salt"    → Base64url-encoded random salt
localStorage key: "msg_pin_enabled" → "true" | absent
```

**Alternatives considered**:

- **sessionStorage**: Clears on tab close — defeats the purpose of persistent PIN
- **IndexedDB**: Overkill for 3 key-value pairs
- **Cookie**: Sent to server on requests (even though static site) — unnecessary exposure

## R6: Message Metadata Embedding — Expiry and View-Once

**Decision**: Embed metadata (creation timestamp, expiry timestamp, view-once flag) inside the encrypted payload as a JSON header before the message body

**Rationale**:

- Metadata inside the encrypted payload means it cannot be read or tampered with without the passphrase
- JSON header provides structured access to fields without custom binary parsing
- Expiry is checked client-side after decryption — if `Date.now() > expiry`, the message body is discarded and an expiry notice shown
- "View once" is best-effort: after successful decryption, the UI clears the message and could optionally set a localStorage flag keyed to a hash of the ciphertext to prevent re-display

**Payload structure (before encryption)**:

```json
{
  "v": 1,
  "created": 1717200000000,
  "expires": 1717203600000,
  "viewOnce": false,
  "message": "The actual secret message text"
}
```

**Alternatives considered**:

- **Metadata outside the ciphertext**: Would expose expiry/view-once to anyone with the link, enabling social engineering
- **Binary format**: More compact but harder to debug, not justified for this scale
- **Separate URL parameters**: Constitution says URL hash only; query params would be sent to server in some configurations
