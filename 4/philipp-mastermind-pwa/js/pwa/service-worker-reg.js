/**
 * @fileoverview Service worker registration for the Mastermind PWA
 */

import { APP_VERSION } from '../config.js';
import { showNotification } from '../utils/dom-utils.js';

/**
 * Register the service worker for PWA functionality
 */
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Checking for service worker support');
      
      // Register service worker with version parameter
      navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`)
        .then((reg) => {
          console.log('Service worker registered!', reg);
          
          // Force update check immediately
          reg.update();
          
          // Setup regular update checks
          setInterval(() => {
            console.log('Checking for service worker updates...');
            reg.update();
          }, 60 * 60 * 1000); // Check hourly
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            console.log('Service Worker update found!');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed and ready for use!');
                
                // Create a more visible update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch((err) => console.log('Service worker registration failed:', err));
    });
  }
};

/**
 * Show notification for application updates
 */
const showUpdateNotification = () => {
  showNotification(
    'New version available!',
    'Update Now',
    forceRefresh,
    '#4CAF50'
  );
};

/**
 * Force a refresh of the application
 * Unregisters service workers and clears caches
 */
const forceRefresh = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log('Unregistering service worker:', registration);
        registration.unregister();
      });
      
      // Clear caches
      if (window.caches) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      
      console.log('All service workers unregistered and caches cleared, reloading page');
      window.location.reload(true);
    });
  } else {
    // Fallback for browsers without service worker support
    window.location.reload(true);
  }
};

// Expose force refresh function globally
window.forceRefresh = forceRefresh;

export {
  registerServiceWorker,
  forceRefresh,
};