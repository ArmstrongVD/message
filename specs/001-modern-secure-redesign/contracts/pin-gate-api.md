# Contract: PIN Gate API

**File**: `pin-gate.js`
**Type**: ES6 module-style functions (global scope via namespace)

This contract defines the public interface for the optional client-side PIN gate.

## Namespace

```js
window.PinGate = { isEnabled, setup, verify, disable, isAvailable };
```

## Functions

### `PinGate.isAvailable()`

Checks whether localStorage is available (may be blocked in private browsing).

**Parameters**: None

**Returns**: `boolean` — `true` if localStorage read/write succeeds

---

### `PinGate.isEnabled()`

Checks whether a PIN gate is currently configured.

**Parameters**: None

**Returns**: `boolean` — `true` if all three localStorage keys (`msg_pin_hash`, `msg_pin_salt`, `msg_pin_enabled`) are present and `msg_pin_enabled === "true"`

---

### `PinGate.setup(pin)`

Configures a new PIN gate, replacing any existing one.

**Parameters**:

| Name  | Type     | Required | Description                           |
| ----- | -------- | -------- | ------------------------------------- |
| `pin` | `string` | yes      | The PIN to set (minimum 4 characters) |

**Returns**: `Promise<void>`

**Throws**:

- `Error("PIN must be at least 4 characters")` — if PIN is too short
- `Error("localStorage is not available")` — if storage is blocked

**Side effects**: Sets `msg_pin_hash`, `msg_pin_salt`, and `msg_pin_enabled` in localStorage

---

### `PinGate.verify(pin)`

Verifies a PIN attempt against the stored hash.

**Parameters**:

| Name  | Type     | Required | Description       |
| ----- | -------- | -------- | ----------------- |
| `pin` | `string` | yes      | The PIN to verify |

**Returns**: `Promise<boolean>` — `true` if PIN matches, `false` otherwise

**Throws**:

- `Error("No PIN is configured")` — if `isEnabled()` returns false

---

### `PinGate.disable()`

Removes the PIN gate entirely.

**Parameters**: None

**Returns**: `void`

**Side effects**: Removes `msg_pin_hash`, `msg_pin_salt`, and `msg_pin_enabled` from localStorage
