/**
 * @fileoverview Main game controller for the Mastermind application
 */

import { GAME_MODES, GAME_CONSTANTS } from '../config.js';
import gameState from './game-state.js';
import { i18nService } from '../i18n.js';
import BoardRenderer from '../ui/board-renderer.js';
import ColorPicker from '../ui/color-picker.js';
import ModePicker from '../ui/mode-picker.js';
import { evaluateGuess, processGuess, submitSecretCode, revealSecretCode } from './game-logic.js';
import { colorizeHeading, showAlert } from '../ui/ui-helpers.js';
import computerPlayer from './computer-player.js';

/**
 * Game controller for the Mastermind application
 */
class GameController {
  /**
   * Create a new GameController
   */
  constructor() {
    // UI components
    this.boardRenderer = null;
    this.colorPicker = null;
    this.modePicker = null;

    // DOM elements
    this.boardElement = null;
    this.guessAreaElement = null;
    this.submitButton = null;
    this.newGameButton = null;
    this.codemakerLabelElement = null;
    this.codebreakerLabelElement = null;
    this.modePickerElement = null;
    this.colorPickerElement = null;
    this.headingElement = null;
    
    // Computer player timers
    this.computerMoveTimer = null;
  }

  /**
   * Initialize the game
   */
  initialize() {
    console.log('Initializing game controller...');
    
    // Get DOM elements
    this.boardElement = document.getElementById('board');
    this.guessAreaElement = document.getElementById('guess-area');
    this.submitButton = document.getElementById('submitbtn');
    this.newGameButton = document.getElementById('new-gamebtn');
    this.codemakerLabelElement = document.getElementById('codemaker-label');
    this.codebreakerLabelElement = document.getElementById('codebreaker-label');
    this.modePickerElement = document.getElementById('modepicker');
    this.colorPickerElement = document.getElementById('color-picker');
    this.headingElement = document.querySelector('h1');

    if (!this.boardElement || !this.guessAreaElement || !this.submitButton || 
        !this.newGameButton || !this.modePickerElement || !this.colorPickerElement) {
      console.error('Required DOM elements not found.', {
        board: !!this.boardElement,
        guessArea: !!this.guessAreaElement,
        submitButton: !!this.submitButton,
        newGameButton: !!this.newGameButton,
        modePicker: !!this.modePickerElement,
        colorPicker: !!this.colorPickerElement
      });
      return;
    }

    console.log('DOM elements found, initializing UI components...');

    // Initialize UI components
    this.boardRenderer = new BoardRenderer({
      boardElement: this.boardElement,
      guessAreaElement: this.guessAreaElement,
      codemakerLabel: this.codemakerLabelElement,
      codebreakerLabel: this.codebreakerLabelElement,
      submitBtn: this.submitButton,
    });

    this.colorPicker = new ColorPicker(this.colorPickerElement);
    this.modePicker = new ModePicker(this.modePickerElement);

    console.log('UI components created, setting up callbacks...');

    // Set up callbacks
    this.boardRenderer.setCallbacks({
      onCircleClicked: this.handleCircleClick.bind(this),
      onCheckButtonClicked: this.handleCheckButtonClick.bind(this),
    });

    this.colorPicker.onColorSelected((row, col, color, isGuess) => {
      console.log(`Color selected: ${color} for row ${row}, col ${col}, isGuess: ${isGuess}`);
      // Additional logic can be added here if needed
    });

    this.modePicker.onModeSelected((mode) => {
      console.log(`Game mode selected: ${mode}`);
      gameState.setMode(mode);
      this.initNewGame();
    });

    // Set up event listeners
    console.log('Setting up event listeners...');
    this.setupEventListeners();
    
    // Apply visual styling
    colorizeHeading(this.headingElement);
    
    console.log('Initializing new game...');
    // Initialize the game board
    this.initNewGame();
    
    console.log('Game controller initialized successfully');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // New game button
    this.newGameButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('New game button clicked');
      this.modePicker.show();
    });

    // Submit button
    this.submitButton.addEventListener('click', () => {
      console.log('Submit button clicked');
      if (gameState.isCodemakersTurn()) {
        this.handleCodeSubmission();
      } else {
        this.handleGiveUp();
      }
    });

    // Language switchers
    document.querySelectorAll('.lang-option').forEach((option) => {
      option.addEventListener('click', () => {
        console.log(`Language switched to: ${option.dataset.lang}`);
        i18nService.setLanguage(option.dataset.lang);
        colorizeHeading(this.headingElement);
      });
    });
  }

  /**
   * Initialize a new game
   */
  initNewGame() {
    console.log('Initializing new game...');
    
    // Reset game state
    gameState.reset();
    
    // Clear any pending computer moves
    if (this.computerMoveTimer) {
      clearTimeout(this.computerMoveTimer);
      this.computerMoveTimer = null;
    }
    
    // Set up the board
    this.boardRenderer.initBoard();
    
    // Set up the mode
    const currentMode = this.modePicker.getMode();
    gameState.setMode(currentMode);
    
    console.log(`Game initialized with mode: ${currentMode}`);
    
    // Handle computer code creation in CODEBREAKER mode
    if (currentMode === GAME_MODES.CODEBREAKER) {
      console.log('Computer creating secret code...');
      const secretCode = computerPlayer.generateSecretCode();
      gameState.secretCode = secretCode;
      
      // Add check button for first guess
      this.boardRenderer.addCheckButton();
    } else if (currentMode === GAME_MODES.CODEMAKER) {
      // Set up button for computer guess mode
      this.submitButton.addEventListener('click', this.startComputerGuessing.bind(this), { once: true });
    }
    
    // Check if the board has been rendered properly
    const circlesCount = document.querySelectorAll('.circle').length;
    console.log(`Board initialized with ${circlesCount} circles`);
  }

  /**
   * Handle circle click to show color picker
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {boolean} isGuess - Whether the circle is in the guess area
   */
  handleCircleClick(row, col, isGuess) {
    console.log(`Circle clicked: row ${row}, col ${col}, isGuess: ${isGuess}`);
    
    if (gameState.isGameOver()) {
      return;
    }
    
    // For codemaker, only allow clicking in guess area during codemaker turn
    if (isGuess && !gameState.isCodemakersTurn()) {
      return;
    }
    
    // For codebreaker, only allow clicking on current row
    if (!isGuess && (gameState.isCodemakersTurn() || 
        row !== gameState.currentRow)) {
      return;
    }
    
    this.colorPicker.show(row, col, isGuess);
  }

  /**
   * Handle secret code submission
   */
  handleCodeSubmission() {
    console.log('Handling code submission...');
    
    if (!gameState.isCurrentGuessFilled()) {
      console.log('Code not complete, submission ignored');
      return; // Do nothing if the code is not complete
    }
    
    if (submitSecretCode()) {
      console.log('Secret code submitted successfully');
      
      // Clear out the guess area
      for (let i = 0; i < GAME_CONSTANTS.CODE_LENGTH; i += 1) {
        const circle = this.guessAreaElement.children[i];
        if (circle) {
          circle.style.backgroundColor = '';
        }
      }
      
      // Start computer guessing if in CODEMAKER mode
      if (gameState.currentMode === GAME_MODES.CODEMAKER) {
        console.log('Starting computer guessing...');
        this.startComputerGuessing();
      }
    }
  }

  /**
   * Handle the give up button click
   */
  handleGiveUp() {
    console.log('Player giving up, revealing code...');
    
    const secretCode = revealSecretCode();
    
    // Display the secret code in the guess area
    const circles = this.guessAreaElement.querySelectorAll('.circle');
    secretCode.forEach((color, index) => {
      if (circles[index]) {
        circles[index].style.backgroundColor = color;
      }
    });
    
    // Show game over message
    showAlert(i18nService.translate('gameOver'));
    
    // Update UI for game over
    this.boardRenderer.disableInteraction();
  }

  /**
   * Handle check button click to evaluate the current guess
   */
  handleCheckButtonClick() {
    console.log('Check button clicked, evaluating guess...');
    
    // Get the current guess from the UI
    const currentRow = gameState.currentRow;
    const circles = document.querySelectorAll(`.circles-container[data-row="${currentRow}"] .circle`);
    const guess = Array.from(circles).map((circle) => circle.style.backgroundColor);
    
    // Check if all circles have colors
    if (guess.some((color) => !color || color === '')) {
      console.log('Not all circles have colors, ignoring check');
      return; // Not all circles have colors
    }
    
    // Process the guess
    const result = processGuess(guess);
    console.log('Guess evaluation result:', result);
    
    // Display feedback
    this.boardRenderer.displayFeedback(currentRow, result);
    
    // Update check button for next row or show game over message
    if (result.correctPositions === GAME_CONSTANTS.CODE_LENGTH) {
      console.log('Code cracked! Game won.');
      showAlert(i18nService.translate('congratulations'));
    } else if (gameState.currentRow > GAME_CONSTANTS.MAX_ROWS) {
      console.log('Maximum rows reached. Game over.');
      // Game over, show the secret code
      const secretCode = gameState.secretCode;
      const guessCircles = this.guessAreaElement.querySelectorAll('.circle');
      secretCode.forEach((color, index) => {
        if (guessCircles[index]) {
          guessCircles[index].style.backgroundColor = color;
        }
      });
      
      showAlert(i18nService.translate('gameOverFailed'));
    } else {
      console.log(`Advancing to row ${gameState.currentRow}`);
      // Add check button for next row
      this.boardRenderer.addCheckButton();
    }
  }

  /**
   * Start computer guessing mode
   */
  startComputerGuessing() {
    if (gameState.currentMode !== GAME_MODES.CODEMAKER) {
      return;
    }
    
    console.log('Starting computer guessing sequence...');
    
    // Initialize computer player
    computerPlayer.initialize(gameState.secretCode);
    
    // Start the computer guessing process
    this.makeNextComputerGuess();
  }

  /**
   * Make the next computer guess
   * @param {Object} [previousFeedback] - Feedback from the previous guess
   */
  makeNextComputerGuess(previousFeedback) {
    if (gameState.isGameOver()) {
      return;
    }
    
    // Clear any existing timer
    if (this.computerMoveTimer) {
      clearTimeout(this.computerMoveTimer);
    }
    
    console.log('Computer making next guess...');
    
    this.computerMoveTimer = setTimeout(() => {
      const currentRow = gameState.currentRow;
      const guess = computerPlayer.makeNextGuess(previousFeedback);
      
      // Display the computer's guess
      const circles = document.querySelectorAll(`.circles-container[data-row="${currentRow}"] .circle`);
      guess.forEach((color, index) => {
        if (circles[index]) {
          circles[index].style.backgroundColor = color;
        }
      });
      
      // Evaluate the guess
      const result = evaluateGuess(gameState.secretCode, guess);
      this.boardRenderer.displayFeedback(currentRow, result);
      
      console.log(`Computer guess result: ${result.correctPositions} correct positions, ${result.correctColors} correct colors`);
      
      // Check if game is over
      if (result.correctPositions === GAME_CONSTANTS.CODE_LENGTH) {
        console.log('Computer cracked the code! Game over.');
        gameState.endGame(true);
        showAlert(i18nService.translate('computerSuccess'));
        return;
      }
      
      // Move to next row or end game if max rows reached
      if (gameState.currentRow >= GAME_CONSTANTS.MAX_ROWS) {
        console.log('Maximum rows reached. Computer failed to crack the code.');
        gameState.endGame(false);
        showAlert(i18nService.translate('computerFailed'));
        return;
      }
      
      // Advance to next row and continue
      gameState.advanceToNextRow();
      console.log(`Computer advancing to row ${gameState.currentRow}`);
      this.makeNextComputerGuess(result);
    }, GAME_CONSTANTS.COMPUTER_GUESS_DELAY);
  }
}

// Create and export a singleton instance
const gameController = new GameController();

export default gameController;