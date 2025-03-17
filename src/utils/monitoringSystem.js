// src/utils/monitoringSystem.js
/* global chrome */

/**
 * Records an attempt to access a restricted site
 * @param {string} url - The URL that was attempted
 * @param {string} hostname - The hostname of the site
 * @param {object} restrictionInfo - Information about why it was restricted
 * @returns {Promise<void>}
 */
export async function recordAccessAttempt(url, hostname, restrictionInfo) {
    // Get existing log
    const data = await chrome.storage.local.get('accessLog');
    const accessLog = data.accessLog || [];
    
    // Add new entry
    const newEntry = {
      timestamp: Date.now(),
      url,
      hostname,
      restrictionInfo,
      tabId: chrome.devtools ? chrome.devtools.inspectedWindow.tabId : null
    };
    
    // Limit log size to prevent excessive storage use
    if (accessLog.length >= 1000) {
      accessLog.pop(); // Remove oldest entry
    }
    
    // Add new entry at beginning (newest first)
    accessLog.unshift(newEntry);
    
    // Save updated log
    await chrome.storage.local.set({ accessLog });
    
    // Update counters
    await updateAccessCounters(hostname, restrictionInfo);
  }
  
  /**
   * Updates access counters for statistical purposes
   * @param {string} hostname - The hostname of the site
   * @param {object} restrictionInfo - Information about why it was restricted
   * @returns {Promise<void>}
   */
  async function updateAccessCounters(hostname, restrictionInfo) {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Get existing counters
    const data = await chrome.storage.local.get('accessCounters');
    const counters = data.accessCounters || {
      daily: {},
      monthly: {},
      bySite: {},
      byCategory: {}
    };
    
    // Get today's date string
    const today = now.toISOString().split('T')[0];
    
    // Update daily counter
    counters.daily[today] = (counters.daily[today] || 0) + 1;
    
    // Update monthly counter
    counters.monthly[dateKey] = (counters.monthly[dateKey] || 0) + 1;
    
    // Update site counter
    counters.bySite[hostname] = (counters.bySite[hostname] || 0) + 1;
    
    // Update category counter if applicable
    if (restrictionInfo.category) {
      counters.byCategory[restrictionInfo.category] = 
        (counters.byCategory[restrictionInfo.category] || 0) + 1;
    }
    
    // Save updated counters
    await chrome.storage.local.set({ accessCounters: counters });
  }
  
  /**
   * Retrieves the access log
   * @param {number} limit - Maximum number of entries to retrieve
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} - Array of log entries
   */
  export async function getAccessLog(limit = 100, offset = 0) {
    const data = await chrome.storage.local.get('accessLog');
    const accessLog = data.accessLog || [];
    
    return accessLog.slice(offset, offset + limit);
  }
  
  /**
   * Gets statistics for a specific time period
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @returns {Promise<Object>} - Statistics object
   */
  export async function getStatistics(period = 'week') {
    const data = await chrome.storage.local.get(['accessLog', 'accessCounters']);
    const accessLog = data.accessLog || [];
    const counters = data.accessCounters || { 
      daily: {}, monthly: {}, bySite: {}, byCategory: {} 
    };
    
    // Calculate date ranges
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Default to week
    }
    
    const startTime = startDate.getTime();
    
    // Filter log by date range
    const filteredLog = accessLog.filter(entry => entry.timestamp >= startTime);
    
    // Prepare statistics
    const topSites = Object.entries(counters.bySite)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([site, count]) => ({ site, count }));
    
    const topCategories = Object.entries(counters.byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
    
    // Daily trend data
    const dailyData = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize all days with zero
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      dailyData[dateKey] = { date: dateKey, day: dayName, count: 0 };
    }
    
    // Fill in actual counts
    Object.entries(counters.daily).forEach(([date, count]) => {
      if (dailyData[date]) {
        dailyData[date].count = count;
      }
    });
    
    return {
      period,
      totalAttempts: filteredLog.length,
      topSites,
      topCategories,
      dailyTrend: Object.values(dailyData).reverse(),
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  }
  
  /**
   * Generates a report for the specified time period
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @returns {Promise<Object>} - Report object
   */
  export async function generateReport(period = 'week') {
    const stats = await getStatistics(period);
    const log = await getAccessLog(100);
    
    return {
      generatedAt: new Date().toISOString(),
      period,
      statistics: stats,
      recentActivity: log.slice(0, 10),
      summary: {
        totalAttempts: stats.totalAttempts,
        averagePerDay: stats.dailyTrend.reduce((sum, day) => sum + day.count, 0) / stats.dailyTrend.length,
        mostBlockedSite: stats.topSites[0]?.site || 'None',
        mostBlockedCategory: stats.topCategories[0]?.category || 'None'
      }
    };
  }
  
  /**
   * Clears the access log and statistics
   * @returns {Promise<void>}
   */
  export async function clearMonitoringData() {
    await chrome.storage.local.remove(['accessLog', 'accessCounters']);
  }