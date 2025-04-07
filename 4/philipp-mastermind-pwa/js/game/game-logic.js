/**
 * @fileoverview Core game logic for the Mastermind application
 */

import { normalizeColor } from '../utils/color-utils.js';
import gameState from './game-state.js';
import { GAME_CONSTANTS } from '../config.js';

/**
 * Evaluates a guess against the secret code
 * 
 * @param {Array} secretCode - The secret code to check against
 * @param {Array} guess - The guess to evaluate
 * @returns {Object} Object containing correctPositions and correctColors counts
 */
const evaluateGuess = (secretCode, guess) => {
  // Validate inputs
  if (!secretCode || !guess || secretCode.length !== GAME_CONSTANTS.CODE_LENGTH || 
      guess.length !== GAME_CONSTANTS.CODE_LENGTH) {
    console.error('Invalid secret or guess:', { secretCode, guess });
    return { correctPositions: 0, correctColors: 0 };
  }
  
  let correctPositions = 0;
  let correctColors = 0;
  
  // Create normalized copies of the arrays to avoid modifying the originals
  const normalizedSecret = secretCode.map(normalizeColor);
  const normalizedGuess = guess.map(normalizeColor);
  
  // Create working copies for our algorithm
  const secretCopy = [...normalizedSecret];
  const guessCopy = [...normalizedGuess];
  
  // First pass: check for correct positions
  for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
    if (guessCopy[i] === secretCopy[i]) {
      correctPositions += 1;
      // Mark as counted by setting to special value
      secretCopy[i] = null;
      guessCopy[i] = null;
    }
  }
  
  // Second pass: check for correct colors in wrong positions
  for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
    if (guessCopy[i] !== null) {
      for (let j = 0; j < GAME_CONSTANTS.CODE_LENGTH; j += 1) {
        if (secretCopy[j] !== null && guessCopy[i] === secretCopy[j]) {
          correctColors += 1;
          // Mark as counted
          secretCopy[j] = null;
          guessCopy[i] = null;
          break;
        }
      }
    }
  }
  
  return { correctPositions, correctColors };
};

/**
 * Check if a guess completely matches the secret code
 * 
 * @param {Array} secretCode - The secret code
 * @param {Array} guess - The guess to check
 * @returns {boolean} True if guess matches secret code
 */
const isGuessCorrect = (secretCode, guess) => {
  const { correctPositions } = evaluateGuess(secretCode, guess);
  return correctPositions === GAME_CONSTANTS.CODE_LENGTH;
};

/**
 * Process a submitted guess
 * 
 * @param {Array} guess - The submitted guess
 * @returns {Object} Result of the guess evaluation
 */
const processGuess = (guess) => {
  const result = evaluateGuess(gameState.secretCode, guess);
  
  // Check if the game is won
  if (result.correctPositions === GAME_CONSTANTS.CODE_LENGTH) {
    gameState.endGame(true);
  } else if (gameState.currentRow === GAME_CONSTANTS.MAX_ROWS) {
    // Check if max attempts reached
    gameState.endGame(false);
  } else {
    // Move to next row
    gameState.advanceToNextRow();
  }
  
  return result;
};

/**
 * Submit the secret code created by the codemaker
 * @returns {boolean} Success status
 */
const submitSecretCode = () => {
  if (!gameState.isCodemakersTurn() || !gameState.isCurrentGuessFilled()) {
    return false;
  }
  
  gameState.setSecretCode(gameState.currentGuess);
  gameState.resetCurrentGuess();
  
  return true;
};

/**
 * Reveal the secret code (used when giving up)
 */
const revealSecretCode = () => {
  gameState.endGame(false);
  return gameState.secretCode;
};

export {
  evaluateGuess,
  isGuessCorrect,
  processGuess,
  submitSecretCode,
  revealSecretCode,
};