/**
 * @fileoverview UI helper functions for the Mastermind application
 */

import { COLORS } from '../config.js';
import { createStyleElement } from './dom-utils.js';

/**
 * Colorize the heading text with game colors
 * 
 * @param {HTMLElement} headingElement - The heading element to colorize
 */
const colorizeHeading = (headingElement) => {
  if (!headingElement) {
    console.warn('Heading element not found');
    return;
  }
  
  const text = headingElement.textContent;
  const colors = [
    '#FF0000', // Red
    '#FFC000', // Orange/Gold
    '#F36DED', // Pink
    '#0070C0', // Blue
    '#00B050', // Green
    '#A6A6A6', // Gray
    '#000000', // Black
  ];
  
  // Create spans for each character with alternating colors
  let coloredText = '';
  for (let i = 0; i < text.length; i += 1) {
    const color = colors[i % colors.length];
    coloredText += `<span style="color: ${color}">${text[i]}</span>`;
  }
  
  headingElement.innerHTML = coloredText;
};

/**
 * Shows an alert message
 * 
 * @param {string} message - Message to display
 */
const showAlert = (message) => {
  // Use a more modern approach than the native alert
  // For now, just use the native alert, but could be enhanced
  // with a custom modal in the future
  alert(message); // eslint-disable-line no-alert
};

/**
 * Create CSS styles for game elements
 */
const createGameStyles = () => {
  // These styles are dynamic or need to be programmatically added
  const styleId = 'dynamic-game-styles';
  const cssText = `
    /* Color picker triangle positioning */
    .color-picker .triangle {
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid #DAE3F3;
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    /* Color option hover effects */
    .color-option:hover {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    }
    
    /* Active button state */
    button.active {
      background-color: #6200EE !important;
      color: white !important;
    }
    
    /* Active label state */
    #codemaker-label.active, #codebreaker-label.active {
      color: #212121 !important;
      font-weight: bold !important;
    }
  `;
  
  createStyleElement(styleId, cssText);
};

/**
 * Creates a visual grid representation of the secret code
 * Useful for debugging or displaying the solution
 * 
 * @param {Array} secretCode - The secret code
 * @returns {string} HTML string representing the code
 */
const visualizeCode = (secretCode) => {
  if (!secretCode || !secretCode.length) {
    return '<div>No code available</div>';
  }
  
  let html = '<div style="display: flex; gap: 5px;">';
  
  secretCode.forEach((color) => {
    html += `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        border: 1px solid #ccc;
      "></div>
    `;
  });
  
  html += '</div>';
  return html;
};

export {
  colorizeHeading,
  showAlert,
  createGameStyles,
  visualizeCode,
};