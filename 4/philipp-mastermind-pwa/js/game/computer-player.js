/**
 * @fileoverview Computer player AI for the Mastermind application
 */

import { COLORS, GAME_CONSTANTS } from '../config.js';
import { evaluateGuess } from './game-logic.js';
import { colorsToIndices, indicesToColors } from '../utils/color-utils.js';

/**
 * Implementation of the computer player using Knuth's minimax algorithm
 */
class ComputerPlayer {
  /**
   * Create a new ComputerPlayer instance
   */
  constructor() {
    this.possibleCodes = [];
    this.secretCode = [];
    this.currentGuessIndices = [];
    this.currentGuess = [];
  }

  /**
   * Initialize the computer player with a new secret code
   * @param {Array} secretCode - Secret code to use (when computer is codebreaker)
   */
  initialize(secretCode) {
    this.secretCode = secretCode || [];
    this.generateAllPossibleCodes();
    
    // Start with Knuth's recommended first guess: 0011 (or the equivalent in our indices)
    this.currentGuessIndices = [0, 0, 1, 1];
    this.currentGuess = indicesToColors(this.currentGuessIndices, COLORS);
  }

  /**
   * Generate a random secret code (when computer is codemaker)
   * @returns {Array} Generated secret code
   */
  generateSecretCode() {
    const secretCode = [];
    
    for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
      const randomIndex = Math.floor(Math.random() * COLORS.length);
      secretCode.push(COLORS[randomIndex]);
    }
    
    this.secretCode = secretCode;
    return secretCode;
  }

  /**
   * Generate all possible codes (using indices for efficiency)
   */
  generateAllPossibleCodes() {
    this.possibleCodes = [];
    
    // This generates all combinations for a length-4 code with 8 colors
    // For larger codes or more colors, this would need optimization
    for (let i = 0; i < COLORS.length; i += 1) {
      for (let j = 0; j < COLORS.length; j += 1) {
        for (let k = 0; k < COLORS.length; k += 1) {
          for (let l = 0; l < COLORS.length; l += 1) {
            this.possibleCodes.push([i, j, k, l]);
          }
        }
      }
    }
  }

  /**
   * Make the next guess
   * @param {Object} lastFeedback - Feedback from previous guess
   * @returns {Array} Next guess
   */
  makeNextGuess(lastFeedback) {
    // For the first guess, use the initial guess
    if (!lastFeedback) {
      return this.currentGuess;
    }
    
    // Filter possible codes based on feedback
    const { correctPositions, correctColors } = lastFeedback;
    this.filterPossibleCodes(this.currentGuessIndices, correctPositions, correctColors);
    
    // If only one possibility remains, that's our guess
    if (this.possibleCodes.length === 1) {
      this.currentGuessIndices = this.possibleCodes[0];
    } else {
      // Otherwise, choose the next guess using minimax
      this.currentGuessIndices = this.chooseNextGuess();
    }
    
    this.currentGuess = indicesToColors(this.currentGuessIndices, COLORS);
    return this.currentGuess;
  }

  /**
   * Filter possible codes based on feedback
   * @param {Array} guessIndices - The indices of the last guess
   * @param {number} correctPositions - Number of correct positions
   * @param {number} correctColors - Number of correct colors
   */
  filterPossibleCodes(guessIndices, correctPositions, correctColors) {
    this.possibleCodes = this.possibleCodes.filter((codeIndices) => {
      const result = this.evaluateGuessIndices(codeIndices, guessIndices);
      return result.correctPositions === correctPositions && 
             result.correctColors === correctColors;
    });
  }

  /**
   * Evaluate a guess using indices instead of colors
   * @param {Array} secretIndices - Secret code indices
   * @param {Array} guessIndices - Guess indices
   * @returns {Object} Evaluation result
   */
  evaluateGuessIndices(secretIndices, guessIndices) {
    let correctPositions = 0;
    let correctColors = 0;
    
    const secretCopy = [...secretIndices];
    const guessCopy = [...guessIndices];
    
    // Check correct positions
    for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
      if (guessCopy[i] === secretCopy[i]) {
        correctPositions += 1;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }
    
    // Check correct colors in wrong positions
    for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
      if (guessCopy[i] >= 0) {
        for (let j = 0; j < GAME_CONSTANTS.CODE_LENGTH; j += 1) {
          if (secretCopy[j] >= 0 && guessCopy[i] === secretCopy[j]) {
            correctColors += 1;
            secretCopy[j] = -1;
            break;
          }
        }
      }
    }
    
    return { correctPositions, correctColors };
  }

  /**
   * Choose the next best guess using the minimax technique
   * @returns {Array} The next guess as color indices
   */
  chooseNextGuess() {
    // For small sets, just pick first option
    if (this.possibleCodes.length <= 1) {
      return this.possibleCodes[0];
    }
    
    let bestGuess = null;
    let minMaxScore = Infinity;
    
    // Sample candidate codes for efficiency when the set is large
    const candidateCodes = this.possibleCodes.length <= 50
      ? this.possibleCodes
      : this.sampleCodes(this.possibleCodes, 50);
    
    // For each candidate guess
    candidateCodes.forEach((candidate) => {
      const scoreDistribution = {};
      
      // Sample evaluation codes for efficiency
      const evaluationCodes = this.possibleCodes.length <= 80
        ? this.possibleCodes
        : this.sampleCodes(this.possibleCodes, 80);
      
      // Calculate how many codes would remain for each possible feedback
      evaluationCodes.forEach((code) => {
        const result = this.evaluateGuessIndices(code, candidate);
        const key = `${result.correctPositions},${result.correctColors}`;
        scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
      });
      
      // Find worst case (maximum remaining possibilities)
      const maxScore = Math.max(...Object.values(scoreDistribution));
      
      // Update best guess if this has a better worst case
      if (maxScore < minMaxScore) {
        minMaxScore = maxScore;
        bestGuess = candidate;
      } else if (maxScore === minMaxScore && this.possibleCodes.some((c) => 
        c[0] === candidate[0] && c[1] === candidate[1] && 
        c[2] === candidate[2] && c[3] === candidate[3])) {
        // Prefer a guess that could be the answer
        bestGuess = candidate;
      }
    });
    
    return bestGuess || this.possibleCodes[0];
  }

  /**
   * Sample codes randomly for efficiency
   * @param {Array} codes - Array of codes to sample from
   * @param {number} sampleSize - Number of samples to take
   * @returns {Array} Sampled codes
   */
  sampleCodes(codes, sampleSize) {
    if (codes.length <= sampleSize) return [...codes];
    
    const sample = [];
    const codesCopy = [...codes];
    
    for (let i = 0; i < sampleSize; i += 1) {
      const randomIndex = Math.floor(Math.random() * codesCopy.length);
      sample.push(codesCopy[randomIndex]);
      codesCopy.splice(randomIndex, 1);
    }
    
    return sample;
  }

  /**
   * Get the current number of remaining possibilities
   * @returns {number} Number of possible codes
   */
  getRemainingPossibilities() {
    return this.possibleCodes.length;
  }
}

// Create and export singleton instance
const computerPlayer = new ComputerPlayer();

export default computerPlayer;