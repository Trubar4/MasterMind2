/**
 * @fileoverview Color picker UI component for the Mastermind application
 */

import { COLORS } from '../config.js';
import { createElement } from '../utils/dom-utils.js';
import gameState from '../game/game-state.js';

/**
 * Color picker UI component
 */
class ColorPicker {
  /**
   * Create a new ColorPicker
   * @param {HTMLElement} container - Container element for the color picker
   */
  constructor(container) {
    this.pickerElement = container;
    this.currentTargetInfo = null;
    this.colorSelectedCallback = null;
    
    // Initialize the component
    this.initialize();
  }

  /**
   * Initialize the color picker
   */
  initialize() {
    console.log('Initializing color picker...');
    
    // Set up document click handler to close the picker when clicking outside
    document.addEventListener('click', (event) => {
      // If click is outside the color picker and the picker is visible
      if (
        !this.pickerElement.contains(event.target) && 
        !event.target.classList.contains('circle') && 
        !this.pickerElement.classList.contains('hidden')
      ) {
        this.hide();
      }
    });
    
    // Create color options
    this.createColorOptions();
    console.log('Color picker initialized');
  }

  /**
   * Create color options in the picker
   */
  createColorOptions() {
    const colorsContainer = this.pickerElement.querySelector('.colors');
    
    if (!colorsContainer) {
      console.error('Colors container not found in color picker');
      return;
    }
    
    // Clear existing color options
    colorsContainer.innerHTML = '';
    
    // Create new color options
    COLORS.forEach((color) => {
      const colorOption = createElement('div', {
        className: 'color-option',
        style: { backgroundColor: color },
        onClick: () => this.handleColorSelection(color),
      });
      
      colorsContainer.appendChild(colorOption);
    });
    
    console.log(`Created ${COLORS.length} color options`);
  }

  /**
   * Show the color picker for a specified circle
   * @param {number} row - Row of the circle (0 for guess area)
   * @param {number} col - Column of the circle
   * @param {boolean} isGuess - Whether this is in the guess area
   */
  show(row, col, isGuess) {
    console.log(`Showing color picker for row: ${row}, col: ${col}, isGuess: ${isGuess}`);
    
    // Store target information for later use
    this.currentTargetInfo = { row, col, isGuess };
    
    // Show the picker
    this.pickerElement.classList.remove('hidden');
    
    // Find the target circle
    const circle = isGuess
      ? document.querySelector(`#guess-area .circle[data-col="${col}"]`)
      : document.querySelector(`.circles-container[data-row="${row}"] .circle[data-col="${col}"]`);
    
    if (!circle) {
      console.error('Target circle not found for color picker');
      this.hide();
      return;
    }
    
    // Get the position of the circle
    const rect = circle.getBoundingClientRect();
    
    // Force the color picker to be visible to get its dimensions
    this.pickerElement.style.visibility = 'hidden';
    this.pickerElement.style.display = 'flex';
    
    // Get the actual dimensions after making it visible
    const pickerRect = this.pickerElement.getBoundingClientRect();
    const pickerWidth = pickerRect.width || 240;
    const pickerHeight = pickerRect.height || 130;
    
    // Reset visibility
    this.pickerElement.style.visibility = '';
    
    // Calculate center position for the circle
    const circleCenter = rect.left + (rect.width / 2);
    
    // Position the picker so the triangle points to the circle's center
    this.pickerElement.style.left = `${circleCenter - (pickerWidth / 2) + window.scrollX}px`;
    
    // Position the picker above the circle with enough space
    const triangleHeight = 10; // Height of the triangle
    const spacing = 5; // Additional spacing
    this.pickerElement.style.top = `${rect.top - pickerHeight - triangleHeight - spacing + window.scrollY}px`;
    
    // Make sure the triangle is centered
    const triangle = this.pickerElement.querySelector('.triangle');
    if (triangle) {
      triangle.style.left = '50%';
      triangle.style.transform = 'translateX(-50%)';
    }
    
    this.pickerElement.style.zIndex = '1000';
    console.log('Color picker positioned and displayed');
  }

  /**
   * Hide the color picker
   */
  hide() {
    // Add the hidden class
    this.pickerElement.classList.add('hidden');
    
    // Reset any inline styles that might override the hidden class
    this.pickerElement.style.display = '';
    this.pickerElement.style.visibility = '';
    
    // Clear current target info
    this.currentTargetInfo = null;
    
    console.log('Color picker hidden');
  }

  /**
   * Handle color selection
   * @param {string} color - The selected color
   */
  handleColorSelection(color) {
    console.log(`Color selected: ${color}`);
    
    if (!this.currentTargetInfo) {
      console.error('No current target info for color selection');
      return;
    }
    
    const { row, col, isGuess } = this.currentTargetInfo;
    
    // Set the color in the target circle
    const circle = isGuess
      ? document.querySelector(`#guess-area .circle[data-col="${col}"]`)
      : document.querySelector(`.circles-container[data-row="${row}"] .circle[data-col="${col}"]`);
    
    if (circle) {
      circle.style.backgroundColor = color;
      console.log(`Set background color for ${isGuess ? 'guess' : 'board'} circle`);
    } else {
      console.error('Target circle not found for applying color');
    }
    
    // Update the game state
    if (isGuess) {
      gameState.updateCurrentGuess(col, color);
    } else {
      // In codebreaker mode, read colors from all circles in the current row
      const currentRowCircles = Array.from(
        document.querySelectorAll(`.circles-container[data-row="${row}"] .circle`)
      );
      
      const colors = currentRowCircles.map((c) => c.style.backgroundColor);
      
      // Update each position in the current guess
      colors.forEach((c, i) => {
        if (c && c !== '') {
          gameState.updateCurrentGuess(i, c);
        }
      });
    }
    
    // Notify subscriber about the selection
    if (this.colorSelectedCallback) {
      this.colorSelectedCallback(row, col, color, isGuess);
    }
    
    // Hide the picker
    this.hide();
  }

  /**
   * Set callback for color selection
   * @param {Function} callback - Callback function
   */
  onColorSelected(callback) {
    this.colorSelectedCallback = callback;
  }
}

export default ColorPicker;