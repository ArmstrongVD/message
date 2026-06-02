(function () {
  "use strict";

  var PBKDF2_ITERATIONS = 100000;
  var SALT_LENGTH = 16;
  var IV_LENGTH = 12;

  // --- Internal helpers (not exported) ---

  function base64urlEncode(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function base64urlDecode(str) {
    var base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    var pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function deriveKey(passphrase, salt) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"])
      .then(function (keyMaterial) {
        return crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"],
        );
      });
  }

  // --- Public API ---

  function encrypt(message, passphrase, options) {
    if (!crypto || !crypto.subtle) {
      return Promise.reject(new Error("Web Crypto API is not available"));
    }
    if (!message || !message.trim()) {
      return Promise.reject(new Error("Message is required"));
    }
    if (message.length > 10000) {
      return Promise.reject(new Error("Message exceeds 10000 characters"));
    }
    if (!passphrase) {
      return Promise.reject(new Error("Passphrase is required"));
    }

    var opts = options || {};
    var payload = JSON.stringify({
      v: 1,
      created: Date.now(),
      expires: opts.expires || null,
      viewOnce: opts.viewOnce || false,
      message: message,
    });

    var salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    var iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    var enc = new TextEncoder();

    return deriveKey(passphrase, salt).then(function (key) {
      return crypto.subtle
        .encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(payload))
        .then(function (ciphertext) {
          var cipherBytes = new Uint8Array(ciphertext);
          var combined = new Uint8Array(
            salt.length + iv.length + cipherBytes.length,
          );
          combined.set(salt, 0);
          combined.set(iv, salt.length);
          combined.set(cipherBytes, salt.length + iv.length);
          return base64urlEncode(combined.buffer);
        });
    });
  }

  function decrypt(encodedPayload, passphrase) {
    if (!crypto || !crypto.subtle) {
      return Promise.reject(new Error("Web Crypto API is not available"));
    }
    if (!passphrase) {
      return Promise.reject(new Error("Passphrase is required"));
    }

    var data;
    try {
      data = base64urlDecode(encodedPayload);
    } catch (e) {
      return Promise.reject(new Error("Invalid message data"));
    }

    if (data.length < SALT_LENGTH + IV_LENGTH + 1) {
      return Promise.reject(new Error("Invalid message data"));
    }

    var salt = data.slice(0, SALT_LENGTH);
    var iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    var ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

    return deriveKey(passphrase, salt).then(function (key) {
      return crypto.subtle
        .decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext)
        .then(function (plainBuffer) {
          var dec = new TextDecoder();
          var json = dec.decode(plainBuffer);
          try {
            return JSON.parse(json);
          } catch (e) {
            throw new Error("Invalid message data");
          }
        })
        .catch(function (err) {
          if (err.message === "Invalid message data") {
            throw err;
          }
          throw new Error("Incorrect passphrase");
        });
    });
  }

  window.SecretCrypto = {
    encrypt: encrypt,
    decrypt: decrypt,
  };
})();
