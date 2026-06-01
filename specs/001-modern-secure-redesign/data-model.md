# Data Model: Modern Secure Redesign

**Feature**: `001-modern-secure-redesign`
**Date**: 2026-06-01

## Entities

### 1. MessagePayload

The structured data that gets encrypted and embedded in the URL hash.

| Field      | Type               | Required | Description                                                                     |
| ---------- | ------------------ | -------- | ------------------------------------------------------------------------------- |
| `v`        | integer            | yes      | Payload format version (currently `1`)                                          |
| `created`  | integer (ms epoch) | yes      | Timestamp when message was created                                              |
| `expires`  | integer (ms epoch) | no       | Timestamp after which message should not be displayed. `null` means no expiry   |
| `viewOnce` | boolean            | yes      | If `true`, recipient's browser should clear message after first successful view |
| `message`  | string             | yes      | The plaintext message content (max 10,000 characters)                           |

**Validation rules**:

- `v` must equal `1` (future versions may change payload structure)
- `message` must be 1–10,000 characters (non-empty, trimmed)
- `expires`, if set, must be a future timestamp at creation time
- `created` must be a valid epoch millisecond timestamp

**State transitions**:

- **Created** → payload JSON is constructed with all fields
- **Encrypted** → payload JSON is serialized, then encrypted via AES-GCM
- **Embedded** → encrypted bytes are Base64url-encoded and placed in URL hash
- **Decrypted** → URL hash is decoded, decrypted, parsed back to JSON
- **Expired** → if `Date.now() > expires`, message body is discarded
- **Viewed (once)** → if `viewOnce === true`, content is cleared after display

### 2. EncryptedPackage

The binary structure stored in the URL hash after Base64url encoding.

| Segment    | Size     | Description                                              |
| ---------- | -------- | -------------------------------------------------------- |
| Salt       | 16 bytes | Random PBKDF2 salt for key derivation                    |
| IV         | 12 bytes | Random AES-GCM initialization vector                     |
| Ciphertext | variable | AES-GCM encrypted MessagePayload JSON + 16-byte auth tag |

**Layout**: `salt (16B) || iv (12B) || ciphertext (variable)` — concatenated raw bytes, then Base64url-encoded as a single string.

**Relationships**: One EncryptedPackage contains exactly one MessagePayload.

### 3. ShareableLink

The complete URL shared with recipients.

| Component     | Description                                         |
| ------------- | --------------------------------------------------- |
| Base URL      | `window.location.origin + window.location.pathname` |
| Hash fragment | `#` + Base64url-encoded EncryptedPackage            |

**Validation rules**:

- Hash must be non-empty and start with a valid Base64url character
- Decoded hash must be at least 28 bytes (16 salt + 12 IV + minimum ciphertext)

### 4. PinGateConfig

Client-side PIN gate settings stored in localStorage.

| localStorage Key  | Type   | Description                                            |
| ----------------- | ------ | ------------------------------------------------------ |
| `msg_pin_hash`    | string | Base64url-encoded PBKDF2 hash of the user's PIN        |
| `msg_pin_salt`    | string | Base64url-encoded random salt used for PIN hashing     |
| `msg_pin_enabled` | string | `"true"` if PIN gate is active; key absent if disabled |

**Validation rules**:

- PIN must be at least 4 characters
- All three keys must be present for the gate to be active — if any is missing, gate is treated as disabled
- If localStorage is unavailable, PIN gate features are silently disabled

**State transitions**:

- **Disabled** (default) → no localStorage keys present → app loads directly to message creation
- **Enabled** → user sets PIN via settings → hash + salt + enabled flag stored → next visit shows PIN entry
- **Unlocked** → correct PIN entered → session proceeds to message creation (no persistent unlock state)
- **Disabled again** → user removes PIN → all three localStorage keys deleted

## Entity Relationships

```
ShareableLink (1) ──contains──▶ (1) EncryptedPackage
EncryptedPackage (1) ──encrypts──▶ (1) MessagePayload
PinGateConfig (0..1) ──gates access to──▶ Message Creation Form
```

- ShareableLink and EncryptedPackage have a 1:1 relationship — each link carries exactly one encrypted package
- PinGateConfig is independent of message encryption — it gates the UI, not the cryptographic operations
- MessagePayload is ephemeral — it exists only during creation (before encryption) and viewing (after decryption), never persisted in plaintext
