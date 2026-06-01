# Contract: URL Hash Schema

**Type**: URL fragment format specification

This contract defines the structure of the URL hash used to transport encrypted messages between sender and recipient.

## URL Format

```
https://<host>/<path>/index.html#<encoded-payload>
```

## Hash Fragment

The hash fragment (everything after `#`) is a single Base64url-encoded string representing the concatenated binary encrypted package:

```
#<base64url(salt || iv || ciphertext)>
```

## Character Set

Base64url (RFC 4648 §5):

- Alphabet: `A-Z`, `a-z`, `0-9`, `-`, `_`
- No padding (`=` characters stripped)
- No `+` or `/` characters (replaced with `-` and `_`)

## Payload Size Constraints

| Component             | Size                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| Salt                  | 16 bytes (fixed)                                                                       |
| IV                    | 12 bytes (fixed)                                                                       |
| Auth tag              | 16 bytes (included in ciphertext by Web Crypto)                                        |
| Ciphertext body       | Variable (depends on plaintext length)                                                 |
| **Minimum total**     | **44 bytes** (empty message — though messages must be non-empty)                       |
| **Practical maximum** | ~14,000 bytes Base64url (~10,500 raw bytes for a 10,000-char UTF-8 message + overhead) |

## Validation Rules

1. Hash must be present and non-empty after stripping `#`
2. Hash must contain only valid Base64url characters (`A-Za-z0-9_-`)
3. Decoded payload must be ≥ 28 bytes (16 salt + 12 IV + at least 1 byte ciphertext)
4. If any validation fails, show the message creation form with no error (progressive enhancement)

## Backward Compatibility

The current app uses `#<base64(plaintext)>` (standard Base64, not encrypted). After this upgrade:

- Old links using Base64 plaintext will fail to parse as valid encrypted packages
- The app will show a graceful error or fall back to the creation form — NOT attempt to decode old-format links as plaintext
- No migration path for old links is provided (they contain plaintext, which is inherently insecure)
