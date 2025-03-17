// src/popup.js
/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const sitesTextarea = document.getElementById('restrictedSites');
    const blockingToggle = document.getElementById('blockingEnabled');
    const notificationToggle = document.getElementById('notificationEnabled');
    const phoneNumberInput = document.getElementById('guardianPhoneNumber');
    const saveButton = document.getElementById('saveSettings');
    const isAuthenticatedInput = document.getElementById('isAuthenticated');
  
    // WebAuthn registration and authentication
    const webauthnStatus = document.getElementById('webauthnStatus');
    const registerButton = document.getElementById('registerWebAuthn');
    const authenticateButton = document.getElementById('authenticateWebAuthn');
  
    // Load current settings
    const settings = await chrome.storage.sync.get([
      'restrictedSites',
      'blockingEnabled',
      'notificationEnabled',
      'guardianPhoneNumber'
    ]);
  
    // Populate UI with current settings
    sitesTextarea.value = settings.restrictedSites.join('\n');
    blockingToggle.checked = settings.blockingEnabled;
    notificationToggle.checked = settings.notificationEnabled;
    phoneNumberInput.value = settings.guardianPhoneNumber || '';
  
    // Handle save button click
    saveButton.addEventListener('click', async () => {
      if (isAuthenticatedInput.value !== 'true') {
        alert('You must authenticate with WebAuthn before saving settings.');
        return;
      }
      // Get values from UI
      const newSites = sitesTextarea.value
        .split('\n')
        .map(site => site.trim())
        .filter(site => site.length > 0);
  
      // Save to storage
      await chrome.storage.sync.set({
        restrictedSites: newSites,
        blockingEnabled: blockingToggle.checked,
        notificationEnabled: notificationToggle.checked,
        guardianPhoneNumber: phoneNumberInput.value.trim()
      });
  
      // Show success message
      const status = document.getElementById('status');
      status.textContent = 'Settings saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
      console.log('NoGoNet II Settings saved!');
    });
  
    // Handle WebAuthn registration
    registerButton.addEventListener('click', async () => {
      try {
        // Mock response for registration options
        const options = {
          challenge: new Uint8Array([1, 2, 3, 4]).buffer,
          rp: { name: "NoGoNet-II" },
          user: {
            id: new Uint8Array([5, 6, 7, 8]),
            name: "user@example.com",
            displayName: "Example User"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }]
        };
  
        const credential = await navigator.credentials.create({ publicKey: options });
  
        // Mock server verification
        console.log('Mock registration credential:', credential);
        webauthnStatus.textContent = 'WebAuthn registration successful (mocked)!';
      } catch (error) {
        console.error('WebAuthn registration failed:', error);
        webauthnStatus.textContent = 'WebAuthn registration failed.';
      }
    });
  
    // Handle WebAuthn authentication
    authenticateButton.addEventListener('click', async () => {
      try {
        // Mock response for authentication options
        const options = {
          challenge: new Uint8Array([9, 10, 11, 12]).buffer,
          allowCredentials: [
            {
              id: new Uint8Array([13, 14, 15, 16]),
              type: "public-key",
              transports: ["usb", "nfc", "ble", "internal"]
            }
          ]
        };
  
        const assertion = await navigator.credentials.get({ publicKey: options });
  
        // Mock server verification
        console.log('Mock authentication assertion:', assertion);
        webauthnStatus.textContent = 'WebAuthn authentication successful (mocked)!';
        isAuthenticatedInput.value = 'true';
        saveButton.disabled = false;
      } catch (error) {
        console.error('WebAuthn authentication failed:', error);
        webauthnStatus.textContent = 'WebAuthn authentication failed.';
      }
    });
  });