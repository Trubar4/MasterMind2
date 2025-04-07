/**
 * @fileoverview Game board UI renderer for the Mastermind application
 */

import { GAME_CONSTANTS, GAME_MODES } from '../config.js';
import { createElement, clearChildren } from '../utils/dom-utils.js';
import gameState from '../game/game-state.js';
import { i18nService } from '../i18n.js';

/**
 * Class responsible for rendering the game board UI
 */
class BoardRenderer {
  /**
   * Create a new BoardRenderer
   * @param {Object} elements - DOM elements for the renderer
   */
  constructor(elements) {
    this.boardElement = elements.boardElement;
    this.guessAreaElement = elements.guessAreaElement;
    this.codemakerLabel = elements.codemakerLabel;
    this.codebreakerLabel = elements.codebreakerLabel;
    this.submitBtn = elements.submitBtn;
    
    this.checkButton = null;
    this.messageContainer = null;
    
    this.onCircleClicked = null;
    this.onCheckButtonClicked = null;
    
    // Set up event handler for game state changes
    gameState.onStateChange((state, changeType) => {
      this.handleStateChange(state, changeType);
    });
  }

  /**
   * Initialize the board UI
   */
  initBoard() {
    console.log('Initializing game board...');
    this.clearBoard();
    this.buildGameRows();
    this.buildGuessArea();
    this.updateRoleLabels();
    this.updateControlButtons();
    
    // Initialize message based on game mode
    if (gameState.currentMode === GAME_MODES.CODEBREAKER) {
      this.showFindCodeMessage();
    } else {
      this.removeFindCodeMessage();
    }
    console.log('Game board initialized successfully');
  }

  /**
   * Clear the board and guess area
   */
  clearBoard() {
    clearChildren(this.boardElement);
    clearChildren(this.guessAreaElement);
  }

  /**
   * Build all game rows
   */
  buildGameRows() {
    console.log(`Building ${GAME_CONSTANTS.MAX_ROWS} game rows...`);
    // Create rows in reverse order (highest number at top)
    for (let row = GAME_CONSTANTS.MAX_ROWS; row >= 1; row -= 1) {
      this.createGameRow(row);
    }
  }

  /**
   * Create a single game row
   * @param {number} rowNum - Row number
   * @returns {HTMLElement} The created row element
   */
  createGameRow(rowNum) {
    // Create row container
    const rowDiv = createElement('div', { className: 'row' });
    
    // Row number (column 1)
    const rowNumber = createElement('span', { 
      className: 'row-number',
    }, rowNum.toString());
    rowDiv.appendChild(rowNumber);
    
    // Colors feedback (column 2)
    const colorsFeedback = createElement('span', { 
      className: 'colors-feedback',
    });
    rowDiv.appendChild(colorsFeedback);
    
    // Circles container (column 3)
    const circlesContainer = createElement('div', { 
      className: 'circles-container',
      dataset: { row: rowNum },
    });
    
    // Create the 4 circles
    for (let col = 0; col < GAME_CONSTANTS.CODE_LENGTH; col += 1) {
      const circle = createElement('div', { 
        className: 'circle',
        dataset: { row: rowNum, col },
        onClick: () => this.handleCircleClick(rowNum, col),
      });
      circlesContainer.appendChild(circle);
    }
    rowDiv.appendChild(circlesContainer);
    
    // Position feedback (column 4)
    const positionFeedback = createElement('span', { 
      className: 'position-feedback',
    });
    rowDiv.appendChild(positionFeedback);
    
    this.boardElement.appendChild(rowDiv);
    return rowDiv;
  }

  /**
   * Build the guess area (for creating secret code)
   */
  buildGuessArea() {
    for (let col = 0; col < GAME_CONSTANTS.CODE_LENGTH; col += 1) {
      const circle = createElement('div', { 
        className: 'circle',
        dataset: { col },
        onClick: () => this.handleGuessCircleClick(col),
      });
      this.guessAreaElement.appendChild(circle);
    }
  }

  /**
   * Update the role labels based on current game state
   */
  updateRoleLabels() {
    if (!this.codemakerLabel || !this.codebreakerLabel) {
      console.error('Role labels not found');
      return;
    }
    
    this.codemakerLabel.classList.toggle('active', gameState.isCodemakersTurn());
    this.codebreakerLabel.classList.toggle('active', !gameState.isCodemakersTurn());
  }

  /**
   * Update the control buttons based on game state
   */
  updateControlButtons() {
    if (!this.submitBtn) {
      console.error('Submit button not found');
      return;
    }
    
    // Update submit button based on game state
    if (gameState.currentMode === GAME_MODES.CODEBREAKER) {
      // In codebreaker mode, the submit button is for "give up"
      this.submitBtn.textContent = i18nService.translate('giveUp');
      this.submitBtn.disabled = false;
      this.submitBtn.classList.add('active');
    } else if (gameState.isCodemakersTurn()) {
      // In codemaker turn, button starts disabled until code is complete
      this.submitBtn.textContent = i18nService.translate('submit');
      this.submitBtn.disabled = true;
      this.submitBtn.classList.remove('active');
    } else {
      // In codebreaker turn, the submit button is for "give up"
      this.submitBtn.textContent = i18nService.translate('giveUp');
      this.submitBtn.disabled = false;
      this.submitBtn.classList.add('active');
    }
  }

  /**
   * Add check button to current row
   */
  addCheckButton() {
    if (this.checkButton) {
      this.checkButton.remove();
    }
    
    this.checkButton = createElement('button', {
      className: 'check-btn translatable disabled',
      dataset: { 
        key: 'check',
        row: gameState.currentRow,
      },
      disabled: true,
    }, i18nService.translate('check'));
    
    // Find the current row's position feedback element
    const row = document.querySelector(
      `.circles-container[data-row="${gameState.currentRow}"]`
    )?.closest('.row');
    
    if (row) {
      const positionFeedback = row.querySelector('.position-feedback');
      if (positionFeedback) {
        // Store any existing content as a data attribute
        positionFeedback.dataset.original = positionFeedback.textContent;
        
        // Clear and append the button
        clearChildren(positionFeedback);
        positionFeedback.appendChild(this.checkButton);
        
        // Add click event
        this.checkButton.addEventListener('click', () => this.handleCheckButtonClick());
      }
    }
  }

  /**
   * Update check button state based on current guess
   */
  updateCheckButton() {
    if (this.checkButton && gameState.isCurrentGuessFilled()) {
      this.checkButton.disabled = false;
      this.checkButton.classList.remove('disabled');
      this.checkButton.classList.add('active');
    } else if (this.checkButton) {
      this.checkButton.disabled = true;
      this.checkButton.classList.add('disabled');
      this.checkButton.classList.remove('active');
    }
  }

  /**
   * Display feedback for a guess
   * @param {number} row - Row number
   * @param {Object} feedback - Evaluation feedback
   */
  displayFeedback(row, feedback) {
    const rowElement = document.querySelector(
      `.circles-container[data-row="${row}"]`
    )?.closest('.row');
    
    if (rowElement) {
      const { correctPositions, correctColors } = feedback;
      rowElement.querySelector('.colors-feedback').textContent = correctColors;
      rowElement.querySelector('.position-feedback').textContent = correctPositions;
    }
  }

  /**
   * Display a message above the board
   */
  showFindCodeMessage() {
    // Remove any existing message first
    this.removeFindCodeMessage();
    
    // Only show message in codebreaker mode
    if (gameState.currentMode !== GAME_MODES.CODEBREAKER) {
      return;
    }
    
    this.messageContainer = createElement('div', {
      className: 'message-container',
      id: 'find-code-message-container',
    });
    
    const messageElement = createElement('div', {
      id: 'find-code-message',
      className: 'find-code-message',
    }, i18nService.translate('findCode'));
    
    this.messageContainer.appendChild(messageElement);
    
    // Insert above the game board
    const headerElement = document.querySelector('.header');
    if (headerElement && headerElement.parentNode) {
      headerElement.parentNode.insertBefore(this.messageContainer, headerElement.nextSibling);
    }
    
    // Ensure the CSS exists for the message
    this.ensureFindCodeMessageCSS();
  }

  /**
   * Remove find code message if it exists
   */
  removeFindCodeMessage() {
    document.getElementById('find-code-message-container')?.remove();
    this.messageContainer = null;
  }

  /**
   * Ensure CSS styles exist for the find code message
   */
  ensureFindCodeMessageCSS() {
    // Check if the styles already exist
    if (document.getElementById('find-code-message-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'find-code-message-styles';
    style.textContent = `
      .message-container {
        display: grid;
        grid-template-columns: 40px 40px 240px 80px; /* Match the main grid layout */
        margin-bottom: 10px;
        width: 100%;
      }
      
      @media (max-width: 500px) {
        .message-container {
          grid-template-columns: 30px 30px 200px 70px;
        }
      }
      
      @media (max-width: 400px) {
        .message-container {
          grid-template-columns: 25px 25px 160px 60px;
        }
      }
      
      @media (max-width: 320px) {
        .message-container {
          grid-template-columns: 20px 20px 140px 50px;
        }
      }
      
      .find-code-message {
        grid-column: 1 / span 4;
        text-align: center;
        padding: 8px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.9rem;
        font-style: italic;
        width: 100%;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Update UI when game state changes
   * @param {GameState} state - Game state
   * @param {string} changeType - Type of state change
   */
  handleStateChange(state, changeType) {
    switch (changeType) {
      case 'reset':
        this.initBoard();
        break;
      case 'modeChange':
        this.updateRoleLabels();
        this.updateControlButtons();
        break;
      case 'secretCodeSet':
        this.updateRoleLabels();
        this.updateControlButtons();
        // If switching to codebreaker, add check button
        if (!state.isCodemakersTurn()) {
          this.addCheckButton();
        }
        break;
      case 'guessUpdated':
        this.updateCheckButton();
        // Enable submit button if all codemaker circles are filled
        if (state.isCodemakersTurn() && state.isCurrentGuessFilled()) {
          this.submitBtn.disabled = false;
          this.submitBtn.classList.add('active');
        }
        break;
      case 'rowAdvanced':
        this.addCheckButton();
        break;
      case 'gameWon':
      case 'gameLost':
        // Disable interactive elements when game ends
        this.disableInteraction();
        break;
      default:
        break;
    }
  }

  /**
   * Disable interaction with the board
   */
  disableInteraction() {
    // Disable all buttons
    if (this.checkButton) {
      this.checkButton.disabled = true;
      this.checkButton.classList.add('disabled');
    }
    
    this.submitBtn.disabled = true;
    this.submitBtn.classList.remove('active');
    
    // Remove click handlers from all circles in current and future rows
    for (let row = gameState.currentRow; row <= GAME_CONSTANTS.MAX_ROWS; row += 1) {
      const circles = document.querySelectorAll(
        `.circles-container[data-row="${row}"] .circle`
      );
      
      circles.forEach((circle) => {
        // Clone and replace to remove event listeners
        const newCircle = circle.cloneNode(true);
        circle.parentNode.replaceChild(newCircle, circle);
      });
    }
  }

  /**
   * Reveal the secret code in the guess area
   * @param {Array} secretCode - Secret code to reveal
   */
  revealSecretCode(secretCode) {
    const guessCircles = this.guessAreaElement.querySelectorAll('.circle');
    
    secretCode.forEach((color, index) => {
      if (index < guessCircles.length) {
        guessCircles[index].style.backgroundColor = color;
      }
    });
  }

  /**
   * Event handler for board circle clicks
   * @param {number} row - Row number
   * @param {number} col - Column number
   */
  handleCircleClick(row, col) {
    // Ignore clicks if game is over
    if (gameState.isGameOver()) {
      return;
    }
    
    // Only allow clicks on the current row when it's codebreaker's turn
    const isValidClick = (
      (gameState.currentMode === GAME_MODES.BOTH && !gameState.isCodemakersTurn() && row === gameState.currentRow) ||
      (gameState.currentMode === GAME_MODES.CODEBREAKER && row === gameState.currentRow)
    );
    
    if (isValidClick && this.onCircleClicked) {
      // Let the color picker module handle it
      this.onCircleClicked(row, col, false);
    }
  }

  /**
   * Event handler for guess area circle clicks
   * @param {number} col - Column number
   */
  handleGuessCircleClick(col) {
    // Only allow clicks when it's codemaker's turn
    const isValidClick = (
      (gameState.currentMode === GAME_MODES.BOTH && gameState.isCodemakersTurn()) ||
      gameState.currentMode === GAME_MODES.CODEMAKER
    );
    
    if (isValidClick && this.onCircleClicked) {
      this.onCircleClicked(0, col, true);
    }
  }

  /**
   * Handle check button click
   */
  handleCheckButtonClick() {
    // Callback to the external handler
    if (this.onCheckButtonClicked) {
      this.onCheckButtonClicked();
    }
  }

  /**
   * Set callbacks for UI interactions
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    this.onCircleClicked = callbacks.onCircleClicked;
    this.onCheckButtonClicked = callbacks.onCheckButtonClicked;
  }
}

export default BoardRenderer;