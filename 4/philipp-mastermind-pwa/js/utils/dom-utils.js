/**
 * @fileoverview DOM utility functions for the Mastermind application
 */

/**
 * Creates a DOM element with attributes and children
 * 
 * @param {string} tag - The HTML tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {Array|string|Node} [children=[]] - Child elements or text content
 * @returns {HTMLElement} Created DOM element
 */
const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        element.style[styleKey] = styleValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      // For event listeners (e.g., onClick, onMouseover)
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child) {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else {
            element.appendChild(child);
          }
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else {
      element.appendChild(children);
    }
  }
  
  return element;
};

/**
 * Creates a style element with the provided CSS text
 * 
 * @param {string} id - ID for the style element
 * @param {string} cssText - CSS rules
 * @returns {HTMLStyleElement} The created style element
 */
const createStyleElement = (id, cssText) => {
  // Check if style already exists and remove it to avoid duplication
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and append new style element
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.textContent = cssText;
  document.head.appendChild(styleElement);
  
  return styleElement;
};

/**
 * Safely removes an element from the DOM
 * 
 * @param {string|HTMLElement} element - Element or selector to remove
 * @returns {boolean} Success status
 */
const removeElement = (element) => {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
    
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
    return true;
  }
  
  return false;
};

/**
 * Clears all children from an element
 * 
 * @param {HTMLElement} element - Element to clear
 */
const clearChildren = (element) => {
  if (!element) {
    console.error('Cannot clear children: element is null or undefined');
    return;
  }
  
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

/**
 * Updates CSS resource links with version parameter for cache busting
 * 
 * @param {string} version - Version string to append
 */
const updateResourceLinks = (version) => {
  console.log(`Updating resource links with version: ${version}`);
  
  // Update CSS link
  const stylesLink = document.getElementById('styles-link');
  if (stylesLink) {
    stylesLink.href = `styles.css?v=${version}`;
    console.log('Updated styles link');
  } else {
    console.warn('Styles link not found');
  }
  
  // Update manifest link
  const manifestLink = document.getElementById('manifest-link');
  if (manifestLink) {
    manifestLink.href = `manifest.json?v=${version}`;
    console.log('Updated manifest link');
  } else {
    console.warn('Manifest link not found');
  }
};

/**
 * Shows a notification at the top of the page
 * 
 * @param {string} message - Message to display
 * @param {string} [actionText=''] - Text for the action button
 * @param {Function} [actionCallback=null] - Callback for the action button
 * @param {string} [bgColor='#4CAF50'] - Background color
 * @returns {HTMLElement} The notification element
 */
const showNotification = (message, actionText = '', actionCallback = null, bgColor = '#4CAF50') => {
  const notification = createElement('div', {
    style: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: bgColor,
      color: 'white',
      padding: '16px',
      textAlign: 'center',
      zIndex: '10000',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
  });
  
  const messageSpan = createElement('strong', {}, message);
  notification.appendChild(messageSpan);
  
  if (actionText && actionCallback) {
    const button = createElement('button', {
      style: {
        marginLeft: '15px',
        padding: '8px',
        backgroundColor: 'white',
        color: bgColor,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
      onClick: (e) => {
        e.preventDefault();
        if (typeof actionCallback === 'function') {
          actionCallback();
        }
      },
    }, actionText);
    
    notification.appendChild(button);
  }
  
  document.body.appendChild(notification);
  return notification;
};

export {
  createElement,
  createStyleElement,
  removeElement,
  clearChildren,
  updateResourceLinks,
  showNotification,
};