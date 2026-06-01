# Contract: Crypto Module API

**File**: `crypto.js`
**Type**: ES6 module-style functions (global scope, no import/export since no build tools)

This contract defines the public interface of the encryption/decryption module. All functions are attached to a global `SecretCrypto` namespace object to avoid polluting the global scope.

## Namespace

```js
window.SecretCrypto = { encrypt, decrypt };
```

## Functions

### `SecretCrypto.encrypt(message, passphrase, options)`

Encrypts a message payload using AES-GCM with PBKDF2 key derivation.

**Parameters**:

| Name               | Type             | Required | Description                                |
| ------------------ | ---------------- | -------- | ------------------------------------------ |
| `message`          | `string`         | yes      | Plaintext message (1–10,000 chars)         |
| `passphrase`       | `string`         | yes      | User-chosen passphrase (non-empty)         |
| `options`          | `object`         | no       | Optional metadata                          |
| `options.expires`  | `number \| null` | no       | Epoch ms expiry timestamp. Default: `null` |
| `options.viewOnce` | `boolean`        | no       | View-once flag. Default: `false`           |

**Returns**: `Promise<string>` — Base64url-encoded encrypted package (salt + IV + ciphertext)

**Throws**:

- `Error("Message is required")` — if message is empty or whitespace-only
- `Error("Message exceeds 10000 characters")` — if message length > 10,000
- `Error("Passphrase is required")` — if passphrase is empty
- `Error("Web Crypto API is not available")` — if `crypto.subtle` is undefined

---

### `SecretCrypto.decrypt(encodedPayload, passphrase)`

Decrypts an encrypted package and returns the message payload.

**Parameters**:

| Name             | Type     | Required | Description                                       |
| ---------------- | -------- | -------- | ------------------------------------------------- |
| `encodedPayload` | `string` | yes      | Base64url-encoded encrypted package from URL hash |
| `passphrase`     | `string` | yes      | Passphrase to attempt decryption                  |

**Returns**: `Promise<object>` — Parsed MessagePayload object:

```js
{
  v: 1,
  created: 1717200000000,
  expires: null,
  viewOnce: false,
  message: "The secret message"
}
```

**Throws**:

- `Error("Invalid message data")` — if payload is too short or malformed
- `Error("Incorrect passphrase")` — if AES-GCM decryption fails (wrong key)
- `Error("Passphrase is required")` — if passphrase is empty
- `Error("Web Crypto API is not available")` — if `crypto.subtle` is undefined

---

## Internal Functions (not exported)

These are implementation details, not part of the public contract:

- `deriveKey(passphrase, salt)` → `Promise<CryptoKey>` — PBKDF2 key derivation
- `base64urlEncode(arrayBuffer)` → `string` — URL-safe Base64 encoding
- `base64urlDecode(string)` → `Uint8Array` — URL-safe Base64 decoding
