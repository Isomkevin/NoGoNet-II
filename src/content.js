// src/content.js
  // This content script runs on all pages
  // It can be used to enhance or modify the blocking behavior
  
  // Check if the current page is restricted
  const checkCurrentPage = async () => {
    const hostname = window.location.hostname;
    
    // Get the restricted sites list
    const data = await chrome.storage.sync.get('restrictedSites');
    const restrictedSites = data.restrictedSites || [];
    
    // Check if current site is in the restricted list
    const isRestricted = restrictedSites.some(site => 
      hostname === site || hostname.endsWith('.' + site)
    );
    
    if (isRestricted) {
      // This is a backup in case navigation blocking fails
      // We'll hide the page content and show a warning
      document.body.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        ">
          <div style="
            max-width: 600px;
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
          ">
            <div style="font-size: 64px; color: #d32f2f; margin-bottom: 20px;">⚠️</div>
            <h1 style="color: #d32f2f; margin-bottom: 20px;">Access Restricted</h1>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              This web resource has been blocked by NoGoNet II;.
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Blocked site: ${hostname}
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              If you believe this is a mistake, please contact your administrator.
            </p>
            <button style="
              padding: 10px 20px;
              background-color: #4285f4;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            " onclick="history.back()">Go Back</button>
          </div>
        </div>
      `;
    }
  };
  
  // Run the check when the page loads
  checkCurrentPage();