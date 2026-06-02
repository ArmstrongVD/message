(function () {
  "use strict";

  var STORAGE_KEY = "pinGate";
  var PBKDF2_ITERATIONS = 100000;

  function storageAvailable() {
    try {
      var test = "__pingate_test__";
      localStorage.setItem(test, "1");
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function hashPin(pin, salt) {
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"])
      .then(function (keyMaterial) {
        return crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
          },
          keyMaterial,
          256,
        );
      })
      .then(function (bits) {
        var bytes = new Uint8Array(bits);
        var hex = "";
        for (var i = 0; i < bytes.length; i++) {
          hex += bytes[i].toString(16).padStart(2, "0");
        }
        return hex;
      });
  }

  window.PinGate = {
    isAvailable: function isAvailable() {
      return storageAvailable() && !!(crypto && crypto.subtle);
    },

    isEnabled: function isEnabled() {
      var data = getStored();
      return data !== null && data.enabled === true;
    },

    setup: function setup(pin) {
      if (!storageAvailable()) {
        return Promise.reject(new Error("localStorage is not available"));
      }
      if (!pin || pin.length < 4) {
        return Promise.reject(new Error("PIN must be at least 4 characters"));
      }

      var salt = crypto.getRandomValues(new Uint8Array(16));
      var saltHex = "";
      for (var i = 0; i < salt.length; i++) {
        saltHex += salt[i].toString(16).padStart(2, "0");
      }

      return hashPin(pin, salt).then(function (hash) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            enabled: true,
            hash: hash,
            salt: saltHex,
          }),
        );
      });
    },

    verify: function verify(pin) {
      var data = getStored();
      if (!data || !data.enabled) {
        return Promise.resolve(false);
      }

      var saltBytes = new Uint8Array(data.salt.length / 2);
      for (var i = 0; i < saltBytes.length; i++) {
        saltBytes[i] = parseInt(data.salt.substr(i * 2, 2), 16);
      }

      return hashPin(pin, saltBytes).then(function (hash) {
        return hash === data.hash;
      });
    },

    disable: function disable() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Silently ignore
      }
    },
  };
})();
