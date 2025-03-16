// src/background.js
/* global chrome */
import { blockRestrictedSite, sendSMSNotification } from './utils/restrictedSiteHandler';

// Load restricted site list from storage
let restrictedSites = [];

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
    console.log('NoGoNet II Restricted Site Detector installed');

    // Load default restricted sites
    const defaultSites = [
        'example-harmful-site.com',
        'malware-example.com',
        'phishing-example.com'
    ];

    // Save default sites to storage
    await chrome.storage.sync.set({
        restrictedSites: defaultSites,
        notificationEnabled: true,
        guardianPhoneNumber: '',
        blockingEnabled: true
    });

    // Update local variable
    restrictedSites = defaultSites;
});

// Listen for changes to storage
chrome.storage.onChanged.addListener((changes) => {
    if (changes.restrictedSites) {
        restrictedSites = changes.restrictedSites.newValue;
    }
    console.log('NoGoNet II Restricted Sites List Changed!');
});

// Listen for web navigation to check URLs
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Main frame navigation only (not iframes)
    if (details.frameId !== 0) return;

    const url = new URL(details.url);
    const hostname = url.hostname;

    // Check if site is restricted
    const isRestricted = restrictedSites.some(site =>
        hostname === site || hostname.endsWith('.' + site)
    );

    if (isRestricted) {
        console.log(`Restricted site detected: ${hostname}`);

        // Get settings
        const settings = await chrome.storage.sync.get([
            'blockingEnabled',
            'notificationEnabled',
            'guardianPhoneNumber'
        ]);

        // Block site if enabled
        if (settings.blockingEnabled) {
            blockRestrictedSite(details.tabId, hostname);
        }

        // Send SMS notification if enabled and phone number is set
        if (settings.notificationEnabled && settings.guardianPhoneNumber) {
            sendSMSNotification(
                settings.guardianPhoneNumber,
                `Attempted access to restricted site: ${hostname}`
            );
        }

        // Show notification in browser
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon128.png',
            title: 'Restricted Site Access Detected',
            message: `Access to ${hostname} has been restricted.`
        });
    }
});