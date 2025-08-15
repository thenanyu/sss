// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference or use system preference as default
  const savedTheme = localStorage.getItem('theme');
  
  // Apply saved theme if it exists
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  
  // Add theme toggle link to the page
  const body = document.querySelector('body');
  const toggleLink = document.createElement('a');
  toggleLink.href = '#';
  toggleLink.id = 'theme-toggle';
  toggleLink.className = 'theme-toggle';
  
  // Set the toggle text based on current theme
  updateToggleText(toggleLink);
  
  // Add the toggle link to the top of the page
  if (body.firstChild) {
    body.insertBefore(toggleLink, body.firstChild);
  } else {
    body.appendChild(toggleLink);
  }
  
  // Add click event listener to toggle theme
  toggleLink.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Toggle theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update toggle text
    updateToggleText(toggleLink);
  });
});

// Function to update the toggle text based on current theme
function updateToggleText(toggleLink) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  toggleLink.textContent = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

