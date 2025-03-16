// src/popup.js
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const sitesTextarea = document.getElementById('restrictedSites');
    const blockingToggle = document.getElementById('blockingEnabled');
    const notificationToggle = document.getElementById('notificationEnabled');
    const phoneNumberInput = document.getElementById('guardianPhoneNumber');
    const saveButton = document.getElementById('saveSettings');
    
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
  });