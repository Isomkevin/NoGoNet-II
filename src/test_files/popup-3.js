// src/popup.js
/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const sitesTextarea = document.getElementById('restrictedSites');
  const blockingToggle = document.getElementById('blockingEnabled');
  const notificationToggle = document.getElementById('notificationEnabled');
  const phoneNumberInput = document.getElementById('guardianPhoneNumber');
  const saveButton = document.getElementById('saveSettings');

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
      const response = await fetch('https://example.com/webauthn/register', { method: 'POST' });
      const options = await response.json();
      const credential = await navigator.credentials.create({ publicKey: options });

      // Send the credential to the server
      await fetch('https://example.com/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential),
      });

      webauthnStatus.textContent = 'WebAuthn registration successful!';
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      webauthnStatus.textContent = 'WebAuthn registration failed.';
    }
  });

  // Handle WebAuthn authentication
  authenticateButton.addEventListener('click', async () => {
    try {
      const response = await fetch('https://example.com/webauthn/authenticate', { method: 'POST' });
      const options = await response.json();
      const assertion = await navigator.credentials.get({ publicKey: options });

      // Send the assertion to the server
      await fetch('https://example.com/webauthn/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      });

      webauthnStatus.textContent = 'WebAuthn authentication successful!';
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      webauthnStatus.textContent = 'WebAuthn authentication failed.';
    }
  });
});