/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const loginScreen = document.getElementById('loginScreen');
  const mainUI = document.getElementById('mainUI');
  const loginInput = document.getElementById('authPassword');
  const loginButton = document.getElementById('loginButton');
  const loginStatus = document.getElementById('loginStatus');
  const saveButton = document.getElementById('saveSettings');
  
  // Settings elements
  const sitesTextarea = document.getElementById('restrictedSites');
  const blockingToggle = document.getElementById('blockingEnabled');
  const notificationToggle = document.getElementById('notificationEnabled');
  const phoneNumberInput = document.getElementById('guardianPhoneNumber');
  const newSiteInput = document.getElementById('newSiteInput');
  const addSiteButton = document.getElementById('addSiteButton'); // Ensure this exists in HTML

  // Load stored settings
  const settings = await chrome.storage.sync.get([
    'restrictedSites',
    'blockingEnabled',
    'notificationEnabled',
    'guardianPhoneNumber',
    'authPin' // Security PIN stored in Chrome storage
  ]);

  // If no PIN is set, initialize it (First-time setup)
  if (!settings.authPin) {
    const defaultPin = '1234'; // Default PIN (changeable later)
    await chrome.storage.sync.set({ authPin: defaultPin });
    console.log("Default PIN set to 1234");
  }

  // Authentication check
  loginButton.addEventListener('click', async () => {
    const storedPin = settings.authPin || '1234'; // Default to 1234 if not found
    if (loginInput.value === storedPin) {
      loginScreen.classList.add('hidden'); // Hide login screen
      mainUI.classList.remove('hidden'); // Show main UI
    } else {
      loginStatus.textContent = 'Incorrect PIN!';
      loginStatus.classList.add('error');
    }
  });

  // Populate UI with current settings
  if (settings.restrictedSites) {
    sitesTextarea.value = settings.restrictedSites.join('\n');
  }
  blockingToggle.checked = settings.blockingEnabled || false;
  notificationToggle.checked = settings.notificationEnabled || false;
  phoneNumberInput.value = settings.guardianPhoneNumber || '';

  // Function to add a new restricted site
  function addSite() {
    let site = newSiteInput.value.trim();

    // Simple domain validation (no `http://` or `https://` required)
    const urlPattern = /^(?!http)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!urlPattern.test(site)) {
      alert("Please enter a valid site (e.g., example.com)");
      return;
    }

    if (site) {
      // Append to textarea and reset input field
      sitesTextarea.value += (sitesTextarea.value ? "\n" : "") + site;
      newSiteInput.value = "";
    }
  }

  // Attach addSite function to button click
  addSiteButton.addEventListener('click', addSite);

  // Handle save button click
  saveButton.addEventListener('click', async () => {
    const newSites = sitesTextarea.value
      .split('\n')
      .map(site => site.trim())
      .filter(site => site.length > 0);

    await chrome.storage.sync.set({
      restrictedSites: newSites,
      blockingEnabled: blockingToggle.checked,
      notificationEnabled: notificationToggle.checked,
      guardianPhoneNumber: phoneNumberInput.value.trim()
    });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
    console.log('NoGoNet II Settings saved!');
  });
});
