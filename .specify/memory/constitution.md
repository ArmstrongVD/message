<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
  Modified principles: N/A (initial creation)
  Added sections:
    - Core Principles (5 principles)
    - Technology Constraints
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ aligned (no updates needed)
    - .specify/templates/spec-template.md ✅ aligned (no updates needed)
    - .specify/templates/tasks-template.md ✅ aligned (no updates needed)
  Follow-up TODOs: None
-->

# Secret Message Constitution

## Core Principles

### I. Vanilla Only (NON-NEGOTIABLE)

All code MUST use plain HTML, CSS, and JavaScript. No frameworks,
libraries, build tools, or transpilers are permitted. This includes
but is not limited to: React, Vue, Angular, Tailwind, Sass, Less,
jQuery, webpack, Vite, TypeScript, and any npm runtime dependencies.

**Rationale**: The project prioritizes simplicity, zero build steps,
and direct browser execution. Any file MUST be servable as-is from
a static file host with no compilation or processing step.

### II. Separation of Concerns

Each concern MUST reside in its own file:

- **Structure**: HTML files (`.html`)
- **Presentation**: A dedicated CSS stylesheet (`.css`), linked via
  `<link>` — no inline `<style>` blocks or `style` attributes except
  for truly one-off dynamic values set by JavaScript
- **Behavior**: JavaScript files (`.js`), linked via `<script>` —
  no inline `onclick` or other event-handler attributes in HTML

**Rationale**: Maintainability and clear ownership of each layer.
New features MUST NOT regress separation that already exists.

### III. Security-Conscious Messaging

All message handling MUST avoid `innerHTML` for user-supplied content.
Use `textContent` or safe DOM APIs instead. Links containing
user-generated data MUST be constructed programmatically, never via
string interpolation into HTML.

Base64 encoding (`btoa`/`atob`) is NOT encryption. The project MUST
NOT claim messages are "encrypted" when using Base64 alone. If
stronger privacy is added in the future, it MUST use the Web Crypto
API — no third-party crypto libraries.

**Rationale**: The app handles user-supplied text that is embedded
in URLs and rendered in the DOM. XSS prevention is mandatory.

### IV. Simplicity First

Every feature addition MUST be the smallest change that delivers value.

- YAGNI: Do not add functionality until it is needed
- Prefer fewer files over deep folder hierarchies
- Avoid abstractions that serve only one call site
- A new file is justified only when it serves a distinct concern
  that does not belong in an existing file

**Rationale**: A static site for secret messages MUST stay lean.
Complexity is the primary threat to this project's maintainability.

### V. Progressive Enhancement

The core functionality — creating and viewing a secret message — MUST
work without CSS. Styling MUST enhance, never gate, functionality.
JavaScript MUST degrade gracefully when the URL hash is empty or
malformed (no uncaught exceptions on page load).

**Rationale**: Ensures the app is resilient and accessible in
constrained environments (slow connections, screen readers, etc.).

## Technology Constraints

- **Languages**: HTML5, CSS3, ES6+ JavaScript (browser-native only)
- **External CDN dependencies**: MUST be removed in favor of local
  CSS. The existing Materialize CDN link MUST be replaced with a
  project-owned stylesheet as part of the separation-of-concerns
  migration
- **Hosting**: Static file serving only — no server-side logic
- **Browser support**: Modern evergreen browsers (Chrome, Firefox,
  Safari, Edge — latest two major versions)
- **Storage**: Client-side only (URL hash, localStorage if needed) —
  no backend or database

## Development Workflow

- **File naming**: lowercase, hyphen-separated (e.g., `style.css`,
  `message-utils.js`)
- **Feature additions**: New features MUST be added incrementally —
  one logical change per commit
- **Testing**: Manual browser testing is acceptable for this project
  scope. Automated tests are optional but encouraged when logic
  grows beyond simple DOM manipulation
- **Code style**: Consistent indentation (2 or 4 spaces — pick one
  and keep it). No trailing whitespace. Semicolons required in JS

## Governance

This constitution supersedes all ad-hoc decisions. Any change to
these principles MUST be documented as an amendment with:

1. A description of what changed and why
2. An updated version number following semantic versioning:
   - MAJOR: Principle removed or fundamentally redefined
   - MINOR: New principle or section added
   - PATCH: Clarification or wording improvement
3. An updated "Last Amended" date

All code changes MUST be reviewable against these principles.
Violations MUST be justified in the Complexity Tracking table of the
implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
