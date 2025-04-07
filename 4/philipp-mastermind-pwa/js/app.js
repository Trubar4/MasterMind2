/**
 * @fileoverview Main application entry point for the Mastermind PWA
 */

import { APP_VERSION } from './config.js';
import { i18nService } from './i18n.js';
import { updateResourceLinks } from './utils/dom-utils.js';
import { registerServiceWorker } from './pwa/service-worker-reg.js';
import gameController from './game/game-controller.js';
import { createGameStyles, colorizeHeading } from './ui/ui-helpers.js';

/**
 * Initialize the application
 */
const initApp = () => {
  console.log('Initializing Mastermind application...');
  
  // Update resource links with version parameter
  updateResourceLinks(APP_VERSION);
  
  // Initialize game styles
  createGameStyles();
  
  // Set default language
  i18nService.setLanguage('de');
  
  // Colorize heading
  const heading = document.querySelector('h1');
  if (heading) {
    colorizeHeading(heading);
  }
  
  // Wait a short time to ensure all DOM elements are ready
  setTimeout(() => {
    // Initialize game controller
    gameController.initialize();
    
    // Register service worker for PWA functionality
    registerServiceWorker();
    
    console.log('Application initialized successfully');
  }, 100);
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add a global error handler to help with debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});