// src/utils/siteDetectionUtils.js
/* global chrome */

// Predefined categories with example sites
export const SITE_CATEGORIES = {
    SOCIAL_MEDIA: {
      name: 'Social Media',
      description: 'Social networking websites',
      sites: [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'tiktok.com',
        'reddit.com',
        'linkedin.com',
        'pinterest.com'
      ]
    },
    ADULT_CONTENT: {
      name: 'Adult Content',
      description: 'Age-restricted or inappropriate content',
      sites: [
        'adult-example.com',
        '*.xxx',
        'adult-content-*.com'
      ]
    },
    GAMBLING: {
      name: 'Gambling',
      description: 'Betting and gambling websites',
      sites: [
        'bet365.com',
        'poker*.com',
        'casino*.com',
        'gambling*.com',
        'bet*.com'
      ]
    },
    GAMING: {
      name: 'Gaming',
      description: 'Online gaming websites',
      sites: [
        'steam.com',
        'epicgames.com',
        'roblox.com',
        'game*.com'
      ]
    },
    STREAMING: {
      name: 'Streaming',
      description: 'Video streaming platforms',
      sites: [
        'youtube.com',
        'netflix.com',
        'hulu.com',
        'disney*.com',
        'twitch.tv'
      ]
    }
  };
  
  /**
   * Checks if a hostname matches a pattern that may include wildcards
   * @param {string} hostname - The hostname to check
   * @param {string} pattern - The pattern to match against (may include * wildcard)
   * @returns {boolean} - Whether the hostname matches the pattern
   */
  export function matchesPattern(hostname, pattern) {
    // Convert wildcard pattern to regex
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/\./g, '\\.')  // Escape dots
        .replace(/\*/g, '.*');  // Convert * to .*
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(hostname);
    }
    
    // Simple exact or subdomain match
    return hostname === pattern || hostname.endsWith('.' + pattern);
  }
  
  /**
   * Check if a site belongs to a specific category
   * @param {string} hostname - The hostname to check
   * @param {string} categoryId - The category ID to check against
   * @returns {boolean} - Whether the site belongs to the category
   */
  export function siteInCategory(hostname, categoryId) {
    const category = SITE_CATEGORIES[categoryId];
    if (!category) return false;
    
    return category.sites.some(pattern => matchesPattern(hostname, pattern));
  }
  
  /**
   * Determines if a site is restricted based on individual restrictions and category settings
   * @param {string} hostname - The hostname to check
   * @param {Array<string>} restrictedSites - List of restricted site patterns
   * @param {Object} categorySettings - Object with category IDs as keys and boolean values
   * @returns {object} - Result with isRestricted flag and matched category/pattern info
   */
  export function checkSiteRestriction(hostname, restrictedSites, categorySettings) {
    // First check individual site restrictions
    for (const pattern of restrictedSites) {
      if (matchesPattern(hostname, pattern)) {
        return {
          isRestricted: true,
          matchType: 'direct',
          matchedPattern: pattern,
          category: null
        };
      }
    }
    
    // Then check category-based restrictions
    for (const categoryId in categorySettings) {
      if (categorySettings[categoryId] && siteInCategory(hostname, categoryId)) {
        return {
          isRestricted: true,
          matchType: 'category',
          matchedPattern: null,
          category: SITE_CATEGORIES[categoryId].name
        };
      }
    }
    
    return {
      isRestricted: false,
      matchType: null,
      matchedPattern: null,
      category: null
    };
  }
  
  /**
   * Generates recommended sites to block based on browsing history
   * @returns {Promise<Object>} - Object containing recommended sites by category
   */
  export async function generateRecommendations() {
    // In a real implementation, you might analyze browsing history
    // For this example, we'll return a sample recommendation
    
    // Get browsing history (limited example)
    const oneWeekAgo = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    const history = await chrome.history.search({
      text: '',
      startTime: oneWeekAgo,
      maxResults: 1000
    });
    
    // Process history to find patterns
    const domainCounts = {};
    history.forEach(item => {
      try {
        const url = new URL(item.url);
        const domain = url.hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    // Sort domains by visit count
    const sortedDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([domain]) => domain);
    
    // Categorize the top domains
    const recommendations = {};
    for (const categoryId in SITE_CATEGORIES) {
      const category = SITE_CATEGORIES[categoryId];
      const matchingDomains = sortedDomains
        .filter(domain => category.sites.some(pattern => matchesPattern(domain, pattern)))
        .slice(0, 5); // Top 5 per category
      
      if (matchingDomains.length > 0) {
        recommendations[categoryId] = matchingDomains;
      }
    }
    
    return recommendations;
  }