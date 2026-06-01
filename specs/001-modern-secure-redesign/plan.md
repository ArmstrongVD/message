# Implementation Plan: Modern Secure Redesign

**Branch**: `001-modern-secure-redesign` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-modern-secure-redesign/spec.md`

**User directive**: Phases require user approval before implementation proceeds.

## Summary

Modernize the existing secret-message static site by replacing Base64 encoding with AES-GCM encryption via the Web Crypto API, removing the Materialize CDN in favor of a project-owned responsive stylesheet, achieving WCAG 2.1 AA compliance, and adding optional features (client-side PIN gate, message expiry, view-once). All work must remain vanilla HTML/CSS/JS with no build steps, per the constitution.

## Technical Context

**Language/Version**: HTML5, CSS3, ES6+ JavaScript (browser-native)

**Primary Dependencies**: None — vanilla only per constitution. Web Crypto API (browser built-in) for encryption

**Storage**: Client-side only — URL hash (encrypted payloads), localStorage (PIN gate settings)

**Testing**: Manual browser testing (keyboard nav, screen reader, responsive viewports). Automated tests optional per constitution

**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 major versions)

**Project Type**: Static site (single-page application served from static files)

**Performance Goals**: Message create/share flow < 60s; decrypt/view < 15s; no perceptible lag on encryption/decryption

**Constraints**: Zero external dependencies, no server-side logic, no build tools, < 10,000 char message limit (URL hash practical limit)

**Scale/Scope**: Single-page app with 3 views (create, view/decrypt, PIN gate), 1 stylesheet, 2-3 JS files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status  | Notes                                                                                                  |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| I. Vanilla Only                   | ✅ PASS | No frameworks or build tools used. Materialize CDN will be removed                                     |
| II. Separation of Concerns        | ✅ PASS | CSS moves to dedicated stylesheet; inline `<style>` block removed; JS in separate files                |
| III. Security-Conscious Messaging | ✅ PASS | innerHTML replaced with textContent; Web Crypto API (AES-GCM + PBKDF2) replaces Base64                 |
| IV. Simplicity First              | ✅ PASS | Flat file structure; no unnecessary abstractions; features added incrementally                         |
| V. Progressive Enhancement        | ✅ PASS | Core functionality works without CSS; graceful degradation on malformed hash or missing Web Crypto API |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-modern-secure-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
./
├── index.html           # Main app page (create + view message)
├── style.css            # Project-owned responsive stylesheet (replaces Materialize)
├── index.js             # Core app logic (encryption, form handling, routing)
├── crypto.js            # Web Crypto API wrapper (AES-GCM encrypt/decrypt, PBKDF2 key derivation)
└── pin-gate.js          # Optional PIN gate logic (localStorage read/write, gate UI)
```

**Structure Decision**: Flat single-directory structure at repository root. This is a static site with a single HTML page — no `src/` directory needed. Each JS file maps to a distinct concern: `index.js` handles app flow and DOM, `crypto.js` isolates encryption logic (independently testable), and `pin-gate.js` encapsulates the optional PIN feature. This satisfies Principle II (Separation of Concerns) and Principle IV (Simplicity First — no unnecessary directory nesting).

## Complexity Tracking

No constitution violations. Table intentionally left empty.
