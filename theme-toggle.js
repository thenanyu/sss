/**
 * Theme Toggle Module
 * Minimal JavaScript for manual light/dark mode control
 * Preserves system preference as fallback
 */
class ThemeToggle {
  constructor() {
    this.themes = ['auto', 'light', 'dark'];
    this.currentTheme = this.getStoredTheme() || 'auto';
    this.init();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme-preference');
    } catch (e) {
      return null; // Fallback for localStorage unavailable
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('theme-preference', theme);
    } catch (e) {
      // Graceful degradation if localStorage fails
    }
  }

  applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme !== 'auto') {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.currentTheme = this.themes[nextIndex];
    
    this.applyTheme(this.currentTheme);
    this.setStoredTheme(this.currentTheme);
    this.updateToggleUI();
  }

  updateToggleUI() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    
    const icons = { auto: '🌓', light: '☀️', dark: '🌙' };
    const labels = { 
      auto: 'Auto (follows system)', 
      light: 'Light mode', 
      dark: 'Dark mode' 
    };
    
    button.textContent = icons[this.currentTheme];
    button.setAttribute('aria-label', `Current: ${labels[this.currentTheme]}. Click to cycle themes.`);
    button.title = labels[this.currentTheme];
  }

  init() {
    this.applyTheme(this.currentTheme);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }
  }

  setupUI() {
    this.updateToggleUI();
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// Initialize theme toggle
new ThemeToggle();

