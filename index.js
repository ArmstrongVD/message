(function () {
  "use strict";

  // --- DOM references ---
  var compatNotice = document.getElementById("compat-notice");
  var statusAnnouncer = document.getElementById("status-announcer");

  var pinGateView = document.getElementById("pin-gate-view");
  var pinGateForm = document.getElementById("pin-gate-form");
  var pinInput = document.getElementById("pin-input");
  var pinError = document.getElementById("pin-error");

  var createView = document.getElementById("create-view");
  var createForm = document.getElementById("create-form");
  var messageInput = document.getElementById("message-input");
  var charCount = document.getElementById("char-count");
  var messageError = document.getElementById("message-error");
  var createPassphrase = document.getElementById("create-passphrase");
  var passphraseError = document.getElementById("passphrase-error");
  var expirySelect = document.getElementById("expiry-select");
  var viewOnceCheck = document.getElementById("view-once-check");

  var linkView = document.getElementById("link-view");
  var linkOutput = document.getElementById("link-output");
  var copyLinkBtn = document.getElementById("copy-link-btn");
  var copyFeedback = document.getElementById("copy-feedback");

  var decryptView = document.getElementById("decrypt-view");
  var decryptForm = document.getElementById("decrypt-form");
  var decryptPassphrase = document.getElementById("decrypt-passphrase");
  var decryptError = document.getElementById("decrypt-error");

  var messageDisplay = document.getElementById("message-display");
  var decryptedContent = document.getElementById("decrypted-content");
  var messageMeta = document.getElementById("message-meta");

  var noticeView = document.getElementById("notice-view");
  var noticeTitle = document.getElementById("notice-title");
  var noticeText = document.getElementById("notice-text");

  var pinSetupSection = document.getElementById("pin-setup-section");
  var pinNotSet = document.getElementById("pin-not-set");
  var pinIsSet = document.getElementById("pin-is-set");
  var pinSetupForm = document.getElementById("pin-setup-form");
  var newPinInput = document.getElementById("new-pin-input");
  var pinSetupError = document.getElementById("pin-setup-error");
  var disablePinBtn = document.getElementById("disable-pin-btn");

  // --- Helpers ---

  function show(el) {
    el.classList.remove("hidden");
  }

  function hide(el) {
    el.classList.add("hidden");
  }

  function showError(el, msg) {
    el.textContent = msg;
    show(el);
  }

  function hideError(el) {
    el.textContent = "";
    hide(el);
  }

  function announce(msg) {
    statusAnnouncer.textContent = msg;
  }

  function updateCharCount() {
    var len = messageInput.value.length;
    charCount.textContent = len.toLocaleString() + " / 10,000";
    if (len > 10000) {
      charCount.classList.add("char-count--over");
    } else {
      charCount.classList.remove("char-count--over");
    }
  }

  function updatePinSettingsUI() {
    if (!PinGate.isAvailable()) {
      hide(pinSetupSection);
      return;
    }
    show(pinSetupSection);
    if (PinGate.isEnabled()) {
      hide(pinNotSet);
      show(pinIsSet);
    } else {
      show(pinNotSet);
      hide(pinIsSet);
    }
  }

  // --- Web Crypto API check (T023) ---

  if (!window.crypto || !window.crypto.subtle) {
    show(compatNotice);
    announce("A modern browser is required to use this app.");
    return; // Stop all initialization
  }

  // --- Dark mode toggle ---

  var themeToggle = document.getElementById("theme-toggle");
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  // Restore saved preference, or follow OS
  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch (e) {
    /* ignore */
  }
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  themeToggle.addEventListener("click", function () {
    var isDark =
      root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    var newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {
      /* ignore */
    }
    announce("Switched to " + newTheme + " mode.");
  });

  // --- Routing: determine which view to show ---

  var hash = window.location.hash.substring(1);

  if (hash) {
    // Recipient mode — show decrypt form
    show(decryptView);
  } else {
    // Sender mode — check PIN gate first
    if (PinGate.isAvailable() && PinGate.isEnabled()) {
      show(pinGateView);
    } else {
      show(createView);
      updatePinSettingsUI();
    }
  }

  // --- Character count (T021) ---

  messageInput.addEventListener("input", updateCharCount);

  // --- Create form submission (T017, T020, T022) ---

  createForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError(messageError);
    hideError(passphraseError);

    var msg = messageInput.value;
    var pass = createPassphrase.value;

    // Validation (T020)
    if (!msg || !msg.trim()) {
      showError(messageError, "Please enter a message.");
      announce("Error: Please enter a message.");
      messageInput.focus();
      return;
    }
    if (msg.length > 10000) {
      showError(messageError, "Message exceeds 10,000 characters.");
      announce("Error: Message exceeds 10,000 characters.");
      messageInput.focus();
      return;
    }
    if (!pass) {
      showError(passphraseError, "Please enter a passphrase.");
      announce("Error: Please enter a passphrase.");
      createPassphrase.focus();
      return;
    }

    // Build options (T058 — expiry + view-once)
    var options = {};
    var expiryMs = expirySelect.value;
    if (expiryMs) {
      options.expires = Date.now() + parseInt(expiryMs, 10);
    }
    if (viewOnceCheck.checked) {
      options.viewOnce = true;
    }

    SecretCrypto.encrypt(msg, pass, options)
      .then(function (encoded) {
        var baseUrl = window.location.origin + window.location.pathname;
        linkOutput.value = baseUrl + "#" + encoded;

        hide(createView);
        show(linkView);
        linkOutput.select();
        announce("Encrypted link created successfully.");
      })
      .catch(function (err) {
        showError(messageError, err.message);
        announce("Error: " + err.message);
      });
  });

  // --- Copy link (T019) ---

  copyLinkBtn.addEventListener("click", function () {
    var link = linkOutput.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(function () {
          copyFeedback.textContent = "Link copied to clipboard!";
          show(copyFeedback);
          announce("Link copied to clipboard.");
          setTimeout(function () {
            hide(copyFeedback);
          }, 3000);
        })
        .catch(function () {
          linkOutput.select();
          announce(
            "Could not copy automatically. Please copy the link manually.",
          );
        });
    } else {
      linkOutput.select();
      try {
        document.execCommand("copy");
        copyFeedback.textContent = "Link copied to clipboard!";
        show(copyFeedback);
        announce("Link copied to clipboard.");
      } catch (err) {
        announce("Please copy the link manually.");
      }
    }
  });

  // --- Decrypt form submission (T024, T025, T026, T027) ---

  decryptForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError(decryptError);

    var pass = decryptPassphrase.value;
    if (!pass) {
      showError(decryptError, "Please enter the passphrase.");
      announce("Error: Please enter the passphrase.");
      decryptPassphrase.focus();
      return;
    }

    SecretCrypto.decrypt(hash, pass)
      .then(function (payload) {
        // Check expiry (T059)
        if (payload.expires && Date.now() > payload.expires) {
          hide(decryptView);
          noticeTitle.textContent = "Message Expired";
          noticeText.textContent =
            "This message has expired and can no longer be viewed.";
          show(noticeView);
          announce("This message has expired.");
          return;
        }

        // Show decrypted message (T018 — textContent, not innerHTML)
        hide(decryptView);
        decryptedContent.textContent = payload.message;

        // Show creation metadata if available
        if (payload.created) {
          var created = new Date(payload.created);
          messageMeta.textContent = "Sent: " + created.toLocaleString();
          show(messageMeta);
        }

        show(messageDisplay);
        announce("Message decrypted successfully.");

        // View-once behavior (T060)
        if (payload.viewOnce) {
          setTimeout(function () {
            decryptedContent.textContent = "";
            hide(messageDisplay);
            noticeTitle.textContent = "Message Viewed";
            noticeText.textContent =
              "This was a view-once message. The content has been cleared.";
            show(noticeView);
            announce(
              "This was a view-once message. The content has been cleared.",
            );
          }, 10000);
        }
      })
      .catch(function (err) {
        if (err.message === "Invalid message data") {
          // Malformed hash — graceful degradation (T027)
          hide(decryptView);
          show(createView);
          updatePinSettingsUI();
          return;
        }
        showError(decryptError, "Incorrect passphrase. Please try again.");
        announce("Error: Incorrect passphrase.");
        decryptPassphrase.focus();
      });
  });

  // --- PIN Gate form (T053, T054) ---

  pinGateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError(pinError);

    var pin = pinInput.value;
    if (!pin) {
      showError(pinError, "Please enter your PIN.");
      announce("Error: Please enter your PIN.");
      pinInput.focus();
      return;
    }

    PinGate.verify(pin)
      .then(function (valid) {
        if (valid) {
          hide(pinGateView);
          show(createView);
          updatePinSettingsUI();
          announce("PIN accepted.");
        } else {
          showError(pinError, "Incorrect PIN. Please try again.");
          announce("Error: Incorrect PIN.");
          pinInput.value = "";
          pinInput.focus();
        }
      })
      .catch(function () {
        showError(pinError, "Error verifying PIN.");
        announce("Error verifying PIN.");
      });
  });

  // --- PIN setup (T055) ---

  pinSetupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError(pinSetupError);

    var pin = newPinInput.value;
    if (!pin || pin.length < 4) {
      showError(pinSetupError, "PIN must be at least 4 characters.");
      announce("Error: PIN must be at least 4 characters.");
      newPinInput.focus();
      return;
    }

    PinGate.setup(pin)
      .then(function () {
        newPinInput.value = "";
        updatePinSettingsUI();
        announce("PIN gate enabled.");
      })
      .catch(function (err) {
        showError(pinSetupError, err.message);
        announce("Error: " + err.message);
      });
  });

  disablePinBtn.addEventListener("click", function () {
    PinGate.disable();
    updatePinSettingsUI();
    announce("PIN gate disabled.");
  });
})();
