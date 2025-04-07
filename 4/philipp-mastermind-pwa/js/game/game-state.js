/**
 * @fileoverview Game state management for the Mastermind application
 */

import { GAME_MODES, GAME_CONSTANTS } from '../config.js';
import { i18nService } from '../i18n.js';

/**
 * Manages the game state
 */
class GameState {
  /**
   * Create a new GameState instance
   */
  constructor() {
    // Core game state
    this.secretCode = [];
    this.currentRow = 1;
    this.currentGuess = Array(GAME_CONSTANTS.CODE_LENGTH).fill(null);
    this.isCodemakerTurn = true;
    this.gameOver = false;
    
    // Game mode
    this.currentMode = GAME_MODES.BOTH;
    
    // Event listeners
    this.stateChangeListeners = [];
  }

  /**
   * Reset the game state for a new game
   */
  reset() {
    this.secretCode = [];
    this.currentRow = 1;
    this.currentGuess = Array(GAME_CONSTANTS.CODE_LENGTH).fill(null);
    this.isCodemakerTurn = true;
    this.gameOver = false;
    
    this.notifyStateChange('reset');
  }

  /**
   * Set the current game mode
   * @param {string} mode - Game mode (from GAME_MODES)
   */
  setMode(mode) {
    if (Object.values(GAME_MODES).includes(mode)) {
      this.currentMode = mode;
      
      // Special handling for codebreaker mode
      if (mode === GAME_MODES.CODEBREAKER) {
        this.isCodemakerTurn = false;
      }
      
      this.notifyStateChange('modeChange');
    } else {
      console.error(`Invalid game mode: ${mode}`);
    }
  }

  /**
   * Check if the current turn is for the codemaker
   * @returns {boolean} True if it's codemaker's turn
   */
  isCodemakersTurn() {
    return this.isCodemakerTurn;
  }

  /**
   * Set the secret code
   * @param {Array} code - The secret code colors
   */
  setSecretCode(code) {
    if (code && code.length === GAME_CONSTANTS.CODE_LENGTH) {
      this.secretCode = [...code];
      this.isCodemakerTurn = false;
      this.notifyStateChange('secretCodeSet');
    } else {
      console.error('Invalid secret code');
    }
  }

  /**
   * Update the current guess at a specific position
   * @param {number} position - Position to update
   * @param {string} color - Color to set
   */
  updateCurrentGuess(position, color) {
    if (position >= 0 && position < GAME_CONSTANTS.CODE_LENGTH) {
      this.currentGuess[position] = color;
      this.notifyStateChange('guessUpdated');
    }
  }

  /**
   * Check if all positions in the current guess are filled
   * @returns {boolean} True if all positions have a color
   */
  isCurrentGuessFilled() {
    return this.currentGuess.every((color) => color !== null && color !== '');
  }

  /**
   * Reset the current guess
   */
  resetCurrentGuess() {
    this.currentGuess = Array(GAME_CONSTANTS.CODE_LENGTH).fill(null);
    this.notifyStateChange('guessReset');
  }

  /**
   * Move to the next row
   */
  advanceToNextRow() {
    if (this.currentRow < GAME_CONSTANTS.MAX_ROWS) {
      this.currentRow += 1;
      this.resetCurrentGuess();
      this.notifyStateChange('rowAdvanced');
      return true;
    }
    return false;
  }

  /**
   * End the game
   * @param {boolean} won - Whether the player won
   */
  endGame(won) {
    this.gameOver = true;
    this.notifyStateChange(won ? 'gameWon' : 'gameLost');
  }

  /**
   * Check if the game is over
   * @returns {boolean} True if the game is over
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Get a message to display based on game state
   * @param {string} messageKey - Key for the message
   * @param {Object} [params={}] - Parameters to include in the message
   * @returns {string} Translated message
   */
  getMessage(messageKey, params = {}) {
    let message = i18nService.translate(messageKey);
    
    // Replace placeholders if any
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
    
    return message;
  }

  /**
   * Register a state change listener
   * @param {Function} listener - Callback function
   */
  onStateChange(listener) {
    if (typeof listener === 'function') {
      this.stateChangeListeners.push(listener);
    }
  }

  /**
   * Notify all listeners of a state change
   * @param {string} changeType - Type of state change
   */
  notifyStateChange(changeType) {
    this.stateChangeListeners.forEach((listener) => {
      listener(this, changeType);
    });
  }
}

// Create and export a singleton instance
const gameState = new GameState();

export default gameState;