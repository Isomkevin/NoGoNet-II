document.addEventListener('DOMContentLoaded', () => {
  // Get the site name from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const site = urlParams.get('site');
  
  // Display the site name
  if (site) {
    document.getElementById('site-name').textContent = `Blocked site: ${site}`;
  }
  
  // Handle go back button
  document.getElementById('goBack').addEventListener('click', () => {
    history.back();
  });
});
