/**
 * @fileoverview Mode picker UI component for the Mastermind application
 */

import { GAME_MODES } from '../config.js';
import { i18nService } from '../i18n.js';
import { createElement, createStyleElement } from '../utils/dom-utils.js';

/**
 * Mode picker UI component
 */
class ModePicker {
  /**
   * Create a new ModePicker
   * @param {HTMLElement} container - Container element for the mode picker
   */
  constructor(container) {
    this.pickerElement = container;
    this.currentMode = GAME_MODES.BOTH;
    this.modeSelectedCallback = null;
    
    // Initialize the component
    this.initialize();
  }

  /**
   * Initialize the mode picker
   */
  initialize() {
    // Add CSS styles for the mode picker
    this.addModePickerStyles();
    
    // Set up document click handler to close the picker when clicking outside
    document.addEventListener('click', (event) => {
      // Ignore if the picker is already hidden
      if (this.pickerElement.classList.contains('hidden')) {
        return;
      }
      
      // Close if click outside picker and not on new game button
      if (
        !this.pickerElement.contains(event.target) && 
        event.target.id !== 'new-gamebtn'
      ) {
        this.hide();
      }
    });
    
    // Update mode options
    this.updateModeOptions();
    
    // Listen for language changes
    i18nService.onLanguageChanged(() => {
      this.updateModeOptions();
    });
  }

  /**
   * Add CSS styles for the mode picker
   */
  addModePickerStyles() {
    const styleId = 'mode-option-styles';
    const cssText = `
      .mode-option {
        cursor: pointer;
        padding: 5px 10px;
        margin: 5px 0;
        border-radius: 4px;
        transition: background-color 0.2s;
        color: #888; /* Grey text for non-selected options */
        font-weight: normal;
        width: 100%;
        text-align: center;
      }
      
      .mode-option:hover {
        background-color: #e0e0e0;
      }
      
      .mode-option.selected {
        color: #000; /* Black text for selected option */
        font-weight: bold;
      }
      
      #modepicker {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #DAE3F3;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        width: 240px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      /* Remove triangle pseudo-elements */
      #modepicker:after, #modepicker:before {
        display: none;
      }
    `;
    
    createStyleElement(styleId, cssText);
  }

  /**
   * Update mode options based on current language
   */
  updateModeOptions() {
    // Clear existing options
    while (this.pickerElement.firstChild) {
      this.pickerElement.removeChild(this.pickerElement.firstChild);
    }
    
    // Create new options with correct translations
    const modeOptions = [
      { mode: GAME_MODES.BOTH, key: 'both' },
      { mode: GAME_MODES.CODEMAKER, key: 'codemakerMode' },
      { mode: GAME_MODES.CODEBREAKER, key: 'codebreakerMode' },
    ];
    
    modeOptions.forEach((option) => {
      const optionDiv = createElement('div', {
        className: `mode-option${option.mode === this.currentMode ? ' selected' : ''}`,
        dataset: { mode: option.mode },
        onClick: (event) => this.handleModeSelection(option.mode, event),
      }, i18nService.translate(option.key));
      
      this.pickerElement.appendChild(optionDiv);
    });
  }

  /**
   * Show the mode picker
   */
  show() {
    // Make sure options are updated before showing
    this.updateModeOptions();
    
    // Show the picker
    this.pickerElement.classList.remove('hidden');
    this.pickerElement.style.display = 'flex';
  }

  /**
   * Hide the mode picker
   */
  hide() {
    this.pickerElement.classList.add('hidden');
    this.pickerElement.style.display = 'none';
  }

  /**
   * Set the current mode
   * @param {string} mode - Game mode to set
   */
  setMode(mode) {
    if (Object.values(GAME_MODES).includes(mode)) {
      this.currentMode = mode;
      this.updateModeOptions();
    }
  }

  /**
   * Get the current mode
   * @returns {string} Current game mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Handle mode selection
   * @param {string} mode - Selected mode
   * @param {Event} event - Click event
   */
  handleModeSelection(mode, event) {
    // Update the selected mode
    this.currentMode = mode;
    
    // Update the visual state of options
    document.querySelectorAll('.mode-option').forEach((opt) => {
      opt.classList.toggle('selected', opt.dataset.mode === mode);
    });
    
    // Hide the mode picker
    this.hide();
    
    // Notify subscribers about mode selection
    if (this.modeSelectedCallback) {
      // Small delay to ensure UI updates first
      setTimeout(() => {
        this.modeSelectedCallback(mode);
      }, 50);
    }
    
    // Prevent event bubbling
    event.stopPropagation();
  }

  /**
   * Set callback for mode selection
   * @param {Function} callback - Callback function
   */
  onModeSelected(callback) {
    this.modeSelectedCallback = callback;
  }
}

export default ModePicker;