/**
 * @fileoverview Configuration constants for the Mastermind application
 */

/**
 * Application version - increment when making changes to force cache refresh
 * @type {string}
 */
const APP_VERSION = '2.0.0';

/**
 * Available game colors
 * @type {string[]}
 */
const COLORS = [
  '#FF0000', // Red
  '#FFFF00', // Yellow
  '#FFC000', // Orange/Gold
  '#F36DED', // Pink
  '#0070C0', // Blue
  '#00B050', // Green
  '#A6A6A6', // Gray
  '#000000', // Black
];

/**
 * Game modes
 * @enum {string}
 */
const GAME_MODES = {
  BOTH: 'both',                  // 2-player mode
  CODEMAKER: 'codemakerMode',    // Computer breaks code
  CODEBREAKER: 'codebreakerMode', // Computer creates code
};

/**
 * Game constants
 * @type {Object}
 */
const GAME_CONSTANTS = {
  MAX_ROWS: 10,         // Maximum number of guess rows
  CODE_LENGTH: 4,       // Length of the secret code
  COMPUTER_GUESS_DELAY: 1500, // Delay between computer guesses (ms)
};

export {
  APP_VERSION,
  COLORS,
  GAME_MODES,
  GAME_CONSTANTS,
};