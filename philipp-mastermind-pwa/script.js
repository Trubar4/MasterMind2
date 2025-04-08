// App version - increment this when making changes
const APP_VERSION = '2.0.2';

// Utility function for debugging
function debug(message) {
  console.log(`[DEBUG] ${message}`);
}

debug('Script starting');

// Game constants
const COLORS = [
  "#FF0000", // Red
  "#FFFF00", // Yellow
  "#FFC000", // Orange/Gold
  "#F36DED", // Pink
  "#0070C0", // Blue
  "#00B050", // Green
  "#A6A6A6", // Gray
  "#000000", // Black
];

const GAME_MODES = {
  BOTH: 'both',
  CODEMAKER: 'codemakerMode',
  CODEBREAKER: 'codebreakerMode',
};

const MAX_ROWS = 10;
let CODE_LENGTH = 4;

// Translations
const translations = {
  en: {
    congratulations: "Code cracked",
    newGame: "New Game",
    submit: "Submit",
    giveUp: "Give Up", // Standard English text
    giveUpShort: "Show", // Shorter version for small screens
    check: "Check",
    colours: "Color",
    positions: "Position",
    codemaker: "Maker",
    codebreaker: "Breaker",
    mode: "Mode",
    both: "2 Player",
    codemakerMode: "Computer breaks Code",
    codebreakerMode: "Computer creates Code",
    findCode: "  Find the code.",
	circles: "Circles"
  },
  de: {
    congratulations: "Code geknackt",
    newGame: "Neues Spiel",
    submit: "Senden",
    giveUp: "Zeigen", // Standard German text
    giveUpShort: "Zeige", // Same text for German (can be shortened if needed)
    check: "Prüfen",
    colours: "Farbe",
    positions: "Position",
    codemaker: "Ersteller",
    codebreaker: "Löser",
    mode: "Modus",
    both: "2-Spieler",
    codemakerMode: "Computer knackt Code",
    codebreakerMode: "Computer erstellt Code",
    findCode: "  Finde den Code.",
	circles: "Kreise"
  }
};

// Game state
let currentLang = 'de';
let currentMode = GAME_MODES.BOTH;
let gameOver = false;
let secretCode = [];
let currentRow = 1;
let currentGuess = Array(CODE_LENGTH).fill(null);
let isCodemakerTurn = true;

// DOM Elements - will be initialized when DOM is loaded
let board;
let guessArea;
let colorPicker;
let modePicker;
let codemakerLabel;
let codebreakerLabel;
let newGameBtn;
let submitBtn;
let checkButton = null;

/**
 * Initialize DOM references
 */
function initDomReferences() {
  debug('Initializing DOM references');
  
  board = document.getElementById("board");
  guessArea = document.getElementById("guess-area");
  colorPicker = document.getElementById("color-picker");
  modePicker = document.getElementById("modepicker");
  codemakerLabel = document.getElementById("codemaker-label");
  codebreakerLabel = document.getElementById("codebreaker-label");
  newGameBtn = document.getElementById("new-gamebtn");
  submitBtn = document.getElementById("submitbtn");
  
  // Check if we found all elements
  const allFound = board && guessArea && colorPicker && modePicker && 
                   codemakerLabel && codebreakerLabel && newGameBtn && submitBtn;
  
  debug(`All DOM elements found: ${allFound}`);
  
  if (!allFound) {
    console.error('Missing DOM elements:', {
      board: !!board,
      guessArea: !!guessArea,
      colorPicker: !!colorPicker,
      modePicker: !!modePicker,
      codemakerLabel: !!codemakerLabel,
      codebreakerLabel: !!codebreakerLabel,
      newGameBtn: !!newGameBtn,
      submitBtn: !!submitBtn
    });
  }
  
  return allFound;
}

/**
 * Adjust game scaling based on screen dimensions
 */
function adjustGameScaling() {
  debug('Adjusting game scaling');
  
  const gameWrapper = document.querySelector('.game-wrapper');
  const container = document.querySelector('.container');
  
  if (!gameWrapper || !container) {
    console.error('Game wrapper or container not found');
    return;
  }
  
  // Get viewport dimensions
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Calculate appropriate scaling
  const isLandscape = viewportWidth > viewportHeight;
  
  if (isLandscape && viewportHeight < 600) {
    // Landscape mode on small screens
    const scale = Math.min(0.9, viewportHeight / 650);
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'center top';
    gameWrapper.style.alignItems = 'flex-start';
    gameWrapper.style.paddingTop = '10px';
  } else if (viewportWidth < 400) {
    // Very small screens
    const scale = Math.min(0.9, viewportWidth / 400);
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'center center';
    gameWrapper.style.alignItems = 'center';
    gameWrapper.style.paddingTop = '0';
  } else {
    // Normal scaling
    container.style.transform = '';
    gameWrapper.style.alignItems = 'center';
    gameWrapper.style.paddingTop = '0';
  }
}

/**
 * Position a picker element properly for the current screen size
 */
function positionPicker(pickerElement, targetElement, isModePicker = false) {
  if (!pickerElement || !targetElement) return;
  
  const targetRect = targetElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Make picker visible but hidden to measure dimensions
  pickerElement.style.visibility = 'hidden';
  pickerElement.style.display = isModePicker ? 'flex' : 'block';
  
  // Get picker dimensions
  const pickerRect = pickerElement.getBoundingClientRect();
  
  // Reset visibility
  pickerElement.style.visibility = '';
  
  if (isModePicker) {
    // Center the mode picker
    pickerElement.style.top = '50%';
    pickerElement.style.left = '50%';
    pickerElement.style.transform = 'translate(-50%, -50%)';
  } else {
    // Position color picker above the target
    const targetCenter = targetRect.left + (targetRect.width / 2);
    
    // Calculate positions
    const triangleHeight = 10;
    const spacing = 5;
    
    // Check if there's enough space above
    const spaceAbove = targetRect.top;
    const pickerHeight = pickerRect.height;
    
    if (spaceAbove < pickerHeight + triangleHeight + spacing) {
      // Not enough space above, position below
      pickerElement.style.top = `${targetRect.bottom + triangleHeight + spacing}px`;
      
      // Adjust triangle to point upward
      const triangle = pickerElement.querySelector('.triangle');
      if (triangle) {
        triangle.style.top = '-10px';
        triangle.style.bottom = 'auto';
        triangle.style.borderTop = 'none';
        triangle.style.borderBottom = '10px solid #DAE3F3';
      }
    } else {
      // Position above
      pickerElement.style.top = `${targetRect.top - pickerHeight - triangleHeight - spacing}px`;
      
      // Reset triangle to point downward
      const triangle = pickerElement.querySelector('.triangle');
      if (triangle) {
        triangle.style.top = 'auto';
        triangle.style.bottom = '-10px';
        triangle.style.borderTop = '10px solid #DAE3F3';
        triangle.style.borderBottom = 'none';
      }
    }
    
    // Center horizontally
    pickerElement.style.left = `${targetCenter - (pickerRect.width / 2)}px`;
    
    // Ensure picker stays within viewport horizontally
    const rightEdge = parseFloat(pickerElement.style.left) + pickerRect.width;
    const leftEdge = parseFloat(pickerElement.style.left);
    
    if (rightEdge > viewportWidth) {
      pickerElement.style.left = `${viewportWidth - pickerRect.width - 10}px`;
    }
    
    if (leftEdge < 0) {
      pickerElement.style.left = '10px';
    }
  }
}

/**
 * Set up language switcher
 */
function setupLanguageSwitcher() {
  debug('Setting up language switcher');
  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      setLanguage(lang);
    });
  });
}

/**
 * Set the current language
 */
function setLanguage(lang) {
  debug(`Setting language to: ${lang}`);
  currentLang = lang;
  
  document.querySelectorAll('.translatable').forEach(element => {
    const key = element.dataset.key;
    if (key && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('.lang-option').forEach(option => {
    option.classList.toggle('active', option.dataset.lang === lang);
  });
  
  updateModePicker();
  colorizeHeading();
}

/**
 * Update mode picker with current options and language
 */
function updateModePicker() {
  debug('Updating mode picker');
  
  // Clear existing options
  modePicker.innerHTML = '';
  
  // Create new options with correct translations
  const modeOptions = [
    { mode: GAME_MODES.BOTH, key: 'both' },
    { mode: GAME_MODES.CODEMAKER, key: 'codemakerMode' },
    { mode: GAME_MODES.CODEBREAKER, key: 'codebreakerMode' }
  ];
  
  // Add mode options
  modeOptions.forEach(option => {
    const div = document.createElement('div');
    div.className = 'mode-option';
    div.dataset.mode = option.mode;
    div.textContent = translations[currentLang][option.key];
    
    // Add selected class if this is the current mode
    if (option.mode === currentMode) {
      div.classList.add('selected');
    }
    
    div.addEventListener('click', function(event) {
      // Get the selected mode from the clicked option
      const selectedMode = this.dataset.mode;
      
      // Update the mode
      currentMode = selectedMode;
      
      // Update selection visual
      document.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.mode === currentMode);
      });
      
      // Hide the mode picker
      modePicker.classList.add("hidden");
      modePicker.style.display = 'none';
      
      // Start new game
      initGame();
      
      // Prevent event bubbling
      event.stopPropagation();
    });
    
    modePicker.appendChild(div);
  });
  
  // Add separator line
  const separator = document.createElement('hr');
  separator.className = 'mode-separator';
  modePicker.appendChild(separator);
  
  // Add circle length selector
  const circlesContainer = document.createElement('div');
  circlesContainer.className = 'circles-selector';
  
  // Add label
  const circlesLabel = document.createElement('span');
  circlesLabel.className = 'circles-label';
  circlesLabel.textContent = translations[currentLang].circles + ':';
  circlesContainer.appendChild(circlesLabel);
  
  // Add space
  circlesContainer.appendChild(document.createTextNode(' '));
  
  // Add circle length options
  const circleLengths = [4, 5];
  circleLengths.forEach((length, index) => {
    const option = document.createElement('span');
    option.className = 'circle-length-option';
    option.dataset.length = length;
    option.textContent = length;
    
    // Add selected class if this is the current length
    if (length === CODE_LENGTH) {
      option.classList.add('selected');
    }
    
    option.addEventListener('click', function(event) {
      // Get the selected length
      const selectedLength = parseInt(this.dataset.length);
      
      // Update CODE_LENGTH
      CODE_LENGTH = selectedLength;
      
      // Update selection visual
      document.querySelectorAll('.circle-length-option').forEach(opt => {
        opt.classList.toggle('selected', parseInt(opt.dataset.length) === CODE_LENGTH);
      });
      
      // Prevent event bubbling
      event.stopPropagation();
    });
    
    circlesContainer.appendChild(option);
    
    // Add separator between options (but not after the last one)
    if (index < circleLengths.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'circle-length-separator';
      separator.textContent = ' | ';
      circlesContainer.appendChild(separator);
    }
  });
  
  modePicker.appendChild(circlesContainer);
}

/**
 * Colorize the heading text
 */
function colorizeHeading() {
  debug('Colorizing heading');
  const heading = document.querySelector('h1');
  if (!heading) return;
  
  const text = heading.textContent;
  const colors = [
    "#FF0000", // Red
    "#FFC000", // Orange/Gold
    "#F36DED", // Pink
    "#0070C0", // Blue
    "#00B050", // Green
    "#A6A6A6", // Gray
    "#000000"  // Black
  ];
  
  // Create spans for each character with alternating colors
  let coloredText = '';
  for (let i = 0; i < text.length; i++) {
    const color = colors[i % colors.length];
    coloredText += `<span style="color: ${color}">${text[i]}</span>`;
  }
  
  heading.innerHTML = coloredText;
}

/**
 * Add CSS for mode options
 */
function addModeCss() {
  debug('Adding mode CSS');
  const existingStyle = document.getElementById('mode-option-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'mode-option-styles';
  styleElement.textContent = `
    .mode-option {
      cursor: pointer;
      padding: 5px 10px;
      margin: 5px 0;
      border-radius: 4px;
      transition: background-color 0.2s;
      color: #888; /* Grey text for non-selected options */
      font-weight: normal;
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
  document.head.appendChild(styleElement);
}

/**
 * Show the find code message
 */
function showFindCodeMessage() {
  debug('Showing find code message');
  // Always remove any existing message first
  removeFindCodeMessage();
  
  // Only proceed to create the message if we're explicitly in codebreakerMode
  if (currentMode !== GAME_MODES.CODEBREAKER) {
    return;
  }
  
  // Create message container and element
  const messageContainer = document.createElement('div');
  messageContainer.className = 'message-container';
  messageContainer.id = 'find-code-message-container';
  
  const messageElement = document.createElement('div');
  messageElement.id = 'find-code-message';
  messageElement.className = 'find-code-message';
  messageElement.textContent = translations[currentLang].findCode;
  
  messageContainer.appendChild(messageElement);
  
  // Insert directly above the game board
  const labels = document.querySelectorAll('.translatable');
  let colorLabel = null;
  
  // Find the color label element
  for (const label of labels) {
    if (label.dataset.key === 'colours') {
      colorLabel = label;
      break;
    }
  }
  
  if (colorLabel) {
    // Find the parent container that holds the labels
    const labelContainer = colorLabel.closest('div') || colorLabel.parentNode;
    
    // Insert the message above this container
    if (labelContainer && labelContainer.parentNode) {
      labelContainer.parentNode.insertBefore(messageContainer, labelContainer);
    } else {
      // Fallback to original implementation
      const boardParent = board.parentNode;
      boardParent.insertBefore(messageContainer, board);
    }
  } else {
    // Fallback to original implementation
    const boardParent = board.parentNode;
    boardParent.insertBefore(messageContainer, board);
  }
  
  // Ensure CSS exists for the message
  ensureFindCodeMessageCSS();
}

/**
 * Remove the find code message
 */
function removeFindCodeMessage() {
  debug('Removing find code message');
  const messageContainer = document.getElementById('find-code-message-container');
  if (messageContainer) {
    messageContainer.remove();
  }
}

/**
 * Ensure the find code message CSS exists
 */
function ensureFindCodeMessageCSS() {
  if (document.getElementById('find-code-message-styles')) {
    return; // CSS already exists
  }
  
  const style = document.createElement('style');
  style.id = 'find-code-message-styles';
  style.textContent = `
    .message-container {
      display: grid;
      grid-template-columns: 40px 40px 240px 80px; /* Match the main grid layout */
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
 * Initialize the game
 */
function initGame() {
  debug('Initializing game');
  
  // Make sure the mode picker is hidden
  modePicker.classList.add("hidden");
  
  // Clear the board and game state
  board.innerHTML = "";
  guessArea.innerHTML = "";
  secretCode = [];
  currentRow = 1;
  currentGuess = Array(CODE_LENGTH).fill(null);
  isCodemakerTurn = true;
  gameOver = false;
  
  // Always remove any existing message first
  removeFindCodeMessage();
  
  // Set up UI for the different modes
  if (currentMode === GAME_MODES.CODEBREAKER) {
    debug('Setting up codebreaker mode');
    isCodemakerTurn = false; // Computer creates the code
    codemakerLabel.classList.remove("active");
    codebreakerLabel.classList.add("active");
    
    // Show findCode message only in codebreakerMode
    showFindCodeMessage();
  } else {
    // Default behavior for 'both' and 'codemakerMode'
    codemakerLabel.classList.add("active");
    codebreakerLabel.classList.remove("active");
  }
  
  // Reset submit button
  submitBtn.setAttribute("disabled", "true");
  submitBtn.classList.remove("active");
  
  debug('Building game board');
  // Create rows (10-1)
  for (let row = MAX_ROWS; row >= 1; row--) {
    createGameRow(row);
  }
  
  debug('Creating guess area');
  // Create the guess area circles with current CODE_LENGTH
  for (let col = 0; col < CODE_LENGTH; col++) {
    const circle = document.createElement("div");
    circle.className = "circle";
    circle.dataset.col = col;
    circle.addEventListener("click", () => onGuessCircleClick(col));
    guessArea.appendChild(circle);
  }
  
  // Apply five-circles class if CODE_LENGTH is 5
  if (CODE_LENGTH === 5) {
    document.querySelectorAll('.circles-container').forEach(container => {
      container.classList.add('five-circles');
    });
    guessArea.classList.add('five-circles');
  } else {
    document.querySelectorAll('.circles-container').forEach(container => {
      container.classList.remove('five-circles');
    });
    guessArea.classList.remove('five-circles');
  }
  
  // Initialize the buttons
  initializeButtons();
  
  // Handle computer code creation in codebreakerMode
  if (currentMode === GAME_MODES.CODEBREAKER) {
    generateComputerCode();
  }
  
  debug('Game initialized');
}

/**
 * Create a game row
 */
function createGameRow(row) {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";
  
  // Row number (column 1)
  const rowNumber = document.createElement("span");
  rowNumber.className = "row-number";
  rowNumber.textContent = row;
  rowDiv.appendChild(rowNumber);
  
  // Colors feedback (column 2)
  const colorsFeedback = document.createElement("span");
  colorsFeedback.className = "colors-feedback";
  rowDiv.appendChild(colorsFeedback);
  
  // Circles container (column 3)
  const circlesContainer = document.createElement("div");
  circlesContainer.className = "circles-container";
  circlesContainer.dataset.row = row;
  
  // Create circles based on CODE_LENGTH
  for (let col = 0; col < CODE_LENGTH; col++) {
    const circle = document.createElement("div");
    circle.className = "circle";
    circle.dataset.row = row;
    circle.dataset.col = col;
    circle.addEventListener("click", () => onCircleClick(row, col));
    circlesContainer.appendChild(circle);
  }
  rowDiv.appendChild(circlesContainer);
  
  // Position feedback (column 4)
  const positionFeedback = document.createElement("span");
  positionFeedback.className = "position-feedback";
  rowDiv.appendChild(positionFeedback);
  
  board.appendChild(rowDiv);
}

/**
 * Initialize buttons
 */
function initializeButtons() {
  debug('Initializing buttons');
  
  // Make sure the new game button is always active
  newGameBtn.classList.add("active");
  
  // Set the submit button to its initial state
  submitBtn.textContent = translations[currentLang].submit;
  
  if (currentMode === GAME_MODES.CODEBREAKER) {
    // In codebreaker mode, the submit button is for "give up"
    submitBtn.textContent = translations[currentLang].giveUp;
    submitBtn.disabled = false;
    submitBtn.removeAttribute("disabled");
    submitBtn.classList.add("active");
    submitBtn.onclick = function() {
      revealCode();
    };
  } else if (isCodemakerTurn) {
    // In codemaker turn, button starts disabled until code is complete
    submitBtn.disabled = true;
    submitBtn.setAttribute("disabled", "true");
    submitBtn.classList.remove("active");
    
    // Reset the onclick handler to submitCode
    submitBtn.onclick = submitCode;
  } else {
    // In codebreaker turn, the submit button is for "give up"
    submitBtn.textContent = translations[currentLang].giveUp;
    submitBtn.disabled = false;
    submitBtn.removeAttribute("disabled");
    submitBtn.classList.add("active");
    submitBtn.onclick = function() {
      revealCode();
    };
  }
}

/**
 * Generate a random code for the computer
 */
function generateComputerCode() {
  debug('Generating computer code');
  
  // Clear existing code and generate new one with correct length
  secretCode = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    secretCode[i] = COLORS[randomIndex];
  }
  
  // Update game state to codebreaker turn
  isCodemakerTurn = false;
  
  // Add check button for the first row
  addCheckButton();
}

/**
 * Handle circle click
 */
function onCircleClick(row, col) {
  debug(`Circle clicked: row ${row}, col ${col}`);
  
  // Ignore clicks if game is over
  if (gameOver) {
    return;
  }
  
  // Show color picker for codebreaker turn in 'both' mode or in 'codebreakerMode'
  if ((currentMode === GAME_MODES.BOTH && !isCodemakerTurn && row === currentRow) ||
    (currentMode === GAME_MODES.CODEBREAKER && row === currentRow)) {
    
    showColorPicker(row, col, false);
    
    // Add check button when clicking on a codebreaker row
    // Only add if it doesn't exist yet for this row
    if (!checkButton || parseInt(checkButton.dataset.row) !== row) {
      addCheckButton();
    }
  }
}

/**
 * Handle guess circle click
 */
function onGuessCircleClick(col) {
  debug(`Guess circle clicked: col ${col}`);
  
  // Show color picker for codemaker turn in 'both' mode or in 'codemakerMode'
  if ((currentMode === GAME_MODES.BOTH && isCodemakerTurn) || currentMode === GAME_MODES.CODEMAKER) {
    showColorPicker(0, col, true);
  }
}

/**
 * Show the color picker
 */
function showColorPicker(row, col, isGuess) {
  debug(`Showing color picker: row ${row}, col ${col}, isGuess ${isGuess}`);
  
  // First make sure the color picker has all color options
  ensureColorPickerOptions();
  
  // Show the picker
  colorPicker.classList.remove("hidden");
  
  // Find the target circle
  const circle = isGuess
    ? guessArea.children[col]
    : document.querySelector(`.circles-container[data-row="${row}"] .circle[data-col="${col}"]`);
    
  if (!circle) {
    console.error('Target circle not found');
    return;
  }
  
  // Position the picker
  positionPicker(colorPicker, circle);
  
  colorPicker.style.zIndex = "1000";
  
  // Store the current target info in the picker element
  colorPicker.dataset.row = row;
  colorPicker.dataset.col = col;
  colorPicker.dataset.isGuess = isGuess;
}

/**
 * Ensure the color picker has all color options
 */
function ensureColorPickerOptions() {
  const colorsContainer = colorPicker.querySelector('.colors');
  
  // Clear existing colors
  colorsContainer.innerHTML = '';
  
  // Add all color options
  COLORS.forEach(color => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.style.backgroundColor = color;
    option.addEventListener('click', () => selectColor(color));
    colorsContainer.appendChild(option);
  });
}

/**
 * Select a color from the color picker
 */
function selectColor(color) {
  debug(`Color selected: ${color}`);
  
  // Get target info from the picker element
  const row = parseInt(colorPicker.dataset.row);
  const col = parseInt(colorPicker.dataset.col);
  const isGuess = colorPicker.dataset.isGuess === 'true';
  
  if (isGuess) {
    // This is for the codemaker (guessArea)
    guessArea.children[col].style.backgroundColor = color;
    currentGuess[col] = color;
    
    // Enable submit button if all codemaker circles are filled
    if (currentGuess.every(c => c !== null)) {
      submitBtn.removeAttribute("disabled");
      submitBtn.classList.add("active");
    }
  } else {
    // This is for the codebreaker (board rows)
    const circle = document.querySelector(`.circles-container[data-row="${row}"] .circle[data-col="${col}"]`);
    if (circle) {
      circle.style.backgroundColor = color;
    }
    
    // In codebreaker mode, make sure currentGuess is updated correctly
    // Find all circles in the current row and get their colors
    const currentRowCircles = Array.from(document.querySelectorAll(`.circles-container[data-row="${row}"] .circle`));
    currentGuess = currentRowCircles.map(circle => circle.style.backgroundColor);
    
    // Enable check button if all circles in this row are filled
    const allFilled = currentGuess.every(c => c && c !== '');
    if (allFilled && checkButton) {
      checkButton.disabled = false;
      checkButton.removeAttribute("disabled");
      checkButton.classList.remove("disabled");
      checkButton.classList.add("active");
    }
  }
  
  // Hide the color picker
  hideColorPicker();
}

/**
 * Hide the color picker
 */
function hideColorPicker() {
  debug('Hiding color picker');
  
  // Add the hidden class
  colorPicker.classList.add("hidden");
  
  // Reset any inline styles
  colorPicker.style.display = '';
  colorPicker.style.visibility = '';
}

/**
 * Add document click handler to close picker when clicking outside
 */
function setupDocumentClickHandler() {
  debug('Setting up document click handler');
  
  document.addEventListener('click', function(event) {
    // Color picker handling
    if (
      !colorPicker.contains(event.target) && 
      !event.target.classList.contains('circle') && 
      !colorPicker.classList.contains('hidden')
    ) {
      hideColorPicker();
    }
    
    // Mode picker handling
    if (
      modePicker && 
      !modePicker.contains(event.target) && 
      event.target.id !== 'new-gamebtn' && 
      !modePicker.classList.contains('hidden')
    ) {
      modePicker.classList.add("hidden");
      modePicker.style.display = 'none';
    }
  });
}

/**
 * Submit the secret code
 */
function submitCode() {
  debug('Submitting code');
  
  if ((currentMode === GAME_MODES.BOTH || currentMode === GAME_MODES.CODEMAKER) && isCodemakerTurn) {
    // Set the secret code
    secretCode = [...currentGuess];
    
    currentGuess = Array(CODE_LENGTH).fill(null); // Reset the current guess
    isCodemakerTurn = false;
    codemakerLabel.classList.remove("active");
    codebreakerLabel.classList.add("active");
    
    submitBtn.disabled = false;
    submitBtn.removeAttribute("disabled");
    submitBtn.classList.add("active");
    
    // Clear guess area circles
    for (let col = 0; col < CODE_LENGTH; col++) {
      const circle = guessArea.children[col];
      if (circle) {
        circle.style.backgroundColor = "";
      }
    }
    
    if (currentMode === GAME_MODES.BOTH) {
      // Update button for "GIVE UP" functionality
      submitBtn.textContent = translations[currentLang].giveUp;
      submitBtn.onclick = revealCode;

      // Add check button for the first row
      addCheckButton();
    } 
    else if (currentMode === GAME_MODES.CODEMAKER) {
      // Handle computer guess logic
      computerGuess();
    }
  }
}

/**
 * Add check button to the current row
 */
function addCheckButton() {
  debug(`Adding check button for row ${currentRow}`);
  
  if (checkButton) {
    checkButton.remove();
  }
  
  checkButton = document.createElement("button");
  checkButton.className = "check-btn translatable disabled";
  checkButton.dataset.key = "check";
  checkButton.dataset.row = currentRow; // Track which row this button belongs to
  checkButton.textContent = translations[currentLang].check;
  checkButton.disabled = true;
  checkButton.classList.add("disabled"); // Add disabled class
  checkButton.onclick = checkGuess;
  
  // Find the current row
  const row = document.querySelector(`.circles-container[data-row="${currentRow}"]`).closest('.row');
  if (row) {
    const positionFeedback = row.querySelector(".position-feedback");
    if (positionFeedback) {
      // Store existing content as data attribute
      positionFeedback.dataset.original = positionFeedback.textContent;
      
      // Clear the position feedback and add the button inside it
      positionFeedback.textContent = "";
      positionFeedback.appendChild(checkButton);
    }
  }
}

/**
 * Reveal the secret code (give up)
 */
function revealCode() {
  debug('Revealing code');
  
  // Reveal the secret code
  for (let i = 0; i < CODE_LENGTH; i++) {
    guessArea.children[i].style.backgroundColor = secretCode[i];
  }
  
  // Disable the submit button
  submitBtn.disabled = true;
  submitBtn.setAttribute("disabled", "true");
  submitBtn.classList.remove("active");
  
  // Remove the check button if it exists
  if (checkButton) {
    checkButton.remove();
    checkButton = null;
  }
  
  // Set game over state
  gameOver = true;
  
  // Display game over message
  alert(`${translations[currentLang].gameOver}`);
  
  // Remove click handlers from all circles in the current and future rows
  for (let row = currentRow; row <= MAX_ROWS; row++) {
    const circles = document.querySelectorAll(`.circles-container[data-row="${row}"] .circle`);
    circles.forEach(circle => {
      // Clone and replace to remove event listeners
      const newCircle = circle.cloneNode(true);
      circle.parentNode.replaceChild(newCircle, circle);
    });
  }
}

/**
 * Check the current guess against the secret code
 */
function checkGuess() {
  debug('Checking guess');
  
  // Get the current row's circles to ensure we have the correct colors
  const currentRowCircles = Array.from(document.querySelectorAll(`.circles-container[data-row="${currentRow}"] .circle`));
  
  // Make sure currentGuess is updated with the actual circle colors
  // Use getComputedStyle for more reliable color extraction
  currentGuess = currentRowCircles.map(circle => {
    const backgroundColor = window.getComputedStyle(circle).backgroundColor;
    return backgroundColor || null;
  });
  
  // Check if all colors are set
  if (currentGuess.some(color => !color)) {
    debug('Not all colors are selected, ignoring check');
    return; // Don't proceed if some colors are missing
  }
  
  const result = checkGuessLogic(secretCode, currentGuess);
  
  const row = document.querySelector(`.circles-container[data-row="${currentRow}"]`).closest('.row');
  
  // Remove check button from the position-feedback element
  if (checkButton) {
    checkButton.remove();
    checkButton = null;
  }
  
  // Set the feedback values
  row.querySelector(".colors-feedback").textContent = result.correctColors;
  row.querySelector(".position-feedback").textContent = result.correctPositions;
  
  // Reset current guess for next row
  currentGuess = Array(CODE_LENGTH).fill(null);
  
  // Check if game is won
  if (result.correctPositions === CODE_LENGTH) {
    // Game won
    alert(translations[currentLang].congratulations);
    submitBtn.setAttribute("disabled", "true");
    if (checkButton) checkButton.disabled = true;
    gameOver = true;
    return;
  }
  
  // Move to next row
  currentRow++;
  
  // Check if max rows reached
  if (currentRow > MAX_ROWS) {
    // Game over - max rows reached
    for (let i = 0; i < CODE_LENGTH; i++) {
      guessArea.children[i].style.backgroundColor = secretCode[i];
    }
    alert(`${translations[currentLang].gameOverFailed}`);
    submitBtn.setAttribute("disabled", "true");
    if (checkButton) checkButton.disabled = true;
    gameOver = true;
    return;
  }
  
  // Add check button for next row
  addCheckButton();
}

/**
 * Logic to check a guess against the secret code
 */
function checkGuessLogic(secret, guess) {
  debug('Running guess logic check');
  
  let correctPositions = 0;
  let correctColors = 0;
  
  if (!secret || !guess || secret.length !== CODE_LENGTH || guess.length !== CODE_LENGTH) {
    console.error('Invalid secret or guess:', { secret, guess });
    return { correctPositions: 0, correctColors: 0 };
  }
  
  // Create copies of the arrays to avoid modifying the originals
  const secretTemp = [...secret];
  const guessTemp = [...guess];
  
  // Normalize colors for comparison
  function normalizeColor(color) {
    if (!color) return null;
    if (color === '') return null;
    
    // If already in hex format (#RRGGBB)
    if (color.startsWith('#')) {
      // Convert hex to RGB for consistent comparison
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgb(${r},${g},${b})`;
    }
    
    // If in rgb format, standardize it
    if (color.startsWith('rgb')) {
      // Extract RGB values to be more robust
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return `rgb(${rgbValues[0]},${rgbValues[1]},${rgbValues[2]})`;
      }
    }
    
    return color.toLowerCase().trim();
  }
  
  // Normalize all colors for comparison
  const normalizedSecret = secretTemp.map(normalizeColor);
  const normalizedGuess = guessTemp.map(normalizeColor);
  
  // Create working copies for our algorithm
  const secretCopy = [...normalizedSecret];
  const guessCopy = [...normalizedGuess];
  
  // First pass: check for correct positions
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      correctPositions++;
      // Mark as counted by setting to special value
      secretCopy[i] = null;
      guessCopy[i] = null;
    }
  }
  
  // Second pass: check for correct colors in wrong positions
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] !== null) {
      for (let j = 0; j < CODE_LENGTH; j++) {
        if (secretCopy[j] !== null && guessCopy[i] === secretCopy[j]) {
          correctColors++;
          // Mark as counted
          secretCopy[j] = null;
          guessCopy[i] = null;
          break;
        }
      }
    }
  }
  
  return { correctPositions, correctColors };
}

/**
 * Computer guess algorithm
 */
function computerGuess() {
  debug('Starting computer guess algorithm');
  
  gameOver = false;
  currentRow = 1;
  
  const guessDelay = 1500; // Delay between guesses for visual effect
  const colors = COLORS;
  let possibleCodes = [];
  
  // Generate all possible codes (using indices for efficiency)
  // Dynamically handle code length (4 or 5)
  if (CODE_LENGTH === 4) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < colors.length; j++) {
        for (let k = 0; k < colors.length; k++) {
          for (let l = 0; l < colors.length; l++) {
            possibleCodes.push([i, j, k, l]);
          }
        }
      }
    }
  } else if (CODE_LENGTH === 5) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < colors.length; j++) {
        for (let k = 0; k < colors.length; k++) {
          for (let l = 0; l < colors.length; l++) {
            for (let m = 0; m < colors.length; m++) {
              possibleCodes.push([i, j, k, l, m]);
            }
          }
        }
      }
    }
  }
  
  debug(`Generated ${possibleCodes.length} possible codes`);
  
  // Start with a simple first guess based on code length
  let currentGuessIndices;
  if (CODE_LENGTH === 4) {
    currentGuessIndices = [0, 0, 1, 1]; // Equivalent to "1122"
  } else { // CODE_LENGTH === 5
    currentGuessIndices = [0, 0, 1, 1, 2]; // Equivalent to "11223"
  }
  
  let currentGuessColors = indicesToColors(currentGuessIndices, colors);
  
  // Convert indices to actual colors (reused from original function)
  function indicesToColors(indices, colors) {
    return indices.map(index => colors[index]);
  }
  
  // The rest of the function remains largely the same,
  // but we need to make sure it handles variable code length
  
  // Convert colors to indices
  function colorsToIndices(colorArray, colors) {
    return colorArray.map(color => {
      const normalizedColor = normalizeColor(color);
      for (let i = 0; i < colors.length; i++) {
        if (normalizeColor(colors[i]) === normalizedColor) {
          return i;
        }
      }
      return 0;
    });
  }
  
  // Normalize color format (unchanged)
  function normalizeColor(color) {
    if (!color) return null;
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgb(${r},${g},${b})`;
    }
    if (color.startsWith('rgb')) {
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return `rgb(${rgbValues[0]},${rgbValues[1]},${rgbValues[2]})`;
      }
    }
    return color.toLowerCase().trim();
  }
  
  // Evaluate a guess - make sure it handles CODE_LENGTH properly
  function evaluateGuess(secretIndices, guessIndices) {
    let correctPositions = 0;
    let correctColors = 0;
    const secretCopy = [...secretIndices];
    const guessCopy = [...guessIndices];
    
    // Check correct positions
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        correctPositions++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }
    
    // Check correct colors in wrong positions
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] >= 0) {
        for (let j = 0; j < CODE_LENGTH; j++) {
          if (secretCopy[j] >= 0 && guessCopy[i] === secretCopy[j]) {
            correctColors++;
            secretCopy[j] = -1;
            break;
          }
        }
      }
    }
    
    return { correctPositions, correctColors };
  }
  
  // Filter codes based on feedback
  function filterCodes(codes, guessIndices, correctPositions, correctColors) {
    return codes.filter(codeIndices => {
      const result = evaluateGuess(codeIndices, guessIndices);
      return result.correctPositions === correctPositions && 
            result.correctColors === correctColors;
    });
  }
  
  // Choose next guess using minimax - handles any code length
  function chooseNextGuess() {
    if (possibleCodes.length === 1) return possibleCodes[0];
    
    let bestGuess = null;
    let minMaxScore = Infinity;
    
    // Sample candidate codes for efficiency
    const candidateCodes = possibleCodes.length <= 50 ? 
      possibleCodes : sampleCodes(possibleCodes, 50);
    
    for (const candidate of candidateCodes) {
      const scoreDistribution = {};
      
      // Sample evaluation codes for efficiency
      const evaluationCodes = possibleCodes.length <= 80 ? 
        possibleCodes : sampleCodes(possibleCodes, 80);
      
      for (const code of evaluationCodes) {
        const result = evaluateGuess(code, candidate);
        const key = `${result.correctPositions},${result.correctColors}`;
        scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
      }
      
      // Find max score (worst case)
      let maxScore = Math.max(...Object.values(scoreDistribution));
      
      if (maxScore < minMaxScore) {
        minMaxScore = maxScore;
        bestGuess = candidate;
      } else if (maxScore === minMaxScore && possibleCodes.some(c => 
        c.every((val, idx) => val === candidate[idx]))) {
        bestGuess = candidate;
      }
    }
    
    return bestGuess || possibleCodes[0];
  }
  
  // Sample codes for efficiency (unchanged)
  function sampleCodes(codes, sampleSize) {
    if (codes.length <= sampleSize) return [...codes];
    
    const sample = [];
    const codesCopy = [...codes];
    
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * codesCopy.length);
      sample.push(codesCopy[randomIndex]);
      codesCopy.splice(randomIndex, 1);
    }
    
    return sample;
  }
  
  // Display functions
  function displayComputerGuess(colorGuess, row) {
    const circles = document.querySelectorAll(`.circles-container[data-row="${row}"] .circle`);
    for (let i = 0; i < CODE_LENGTH; i++) {
      circles[i].style.backgroundColor = colorGuess[i];
    }
  }
  
  function displayFeedback(correctPositions, correctColors, row) {
    const rowElement = document.querySelector(`.circles-container[data-row="${row}"]`).closest('.row');
    rowElement.querySelector(".colors-feedback").textContent = correctColors;
    rowElement.querySelector(".position-feedback").textContent = correctPositions;
  }
  
  // Main guess function
  function makeGuess() {
    if (currentRow > MAX_ROWS || gameOver) return;
    
    // Display the computer's guess
    displayComputerGuess(currentGuessColors, currentRow);
    
    // Evaluate the guess
    const secretIndices = colorsToIndices(secretCode, colors);
    const { correctPositions, correctColors } = evaluateGuess(secretIndices, currentGuessIndices);
    
    // Display feedback
    displayFeedback(correctPositions, correctColors, currentRow);
    
    // Check if won
    if (correctPositions === CODE_LENGTH) {
      setTimeout(() => {
        alert(`${translations[currentLang].computerSuccess || "Computer cracked the code!"}`);
        gameOver = true;
      }, 500);
      return;
    }
    
    // Next row
    currentRow++;
    
    // Check if max rows reached
    if (currentRow > MAX_ROWS) {
      setTimeout(() => {
        alert(translations[currentLang].computerFailed || "Computer couldn't crack the code within the maximum attempts.");
        gameOver = true;
        // Show secret code
        for (let i = 0; i < CODE_LENGTH; i++) {
          guessArea.children[i].style.backgroundColor = secretCode[i];
        }
      }, 500);
      return;
    }
    
    // Filter and choose next guess
    possibleCodes = filterCodes(possibleCodes, currentGuessIndices, correctPositions, correctColors);
    currentGuessIndices = chooseNextGuess();
    currentGuessColors = indicesToColors(currentGuessIndices, colors);
    
    // Schedule next guess
    setTimeout(makeGuess, guessDelay);
  }
  
  // Start the process
  setTimeout(makeGuess, guessDelay);
}

/**
 * Update resource links with version parameter
 */
function updateResourceLinks() {
  debug(`Updating resource links with version: ${APP_VERSION}`);
  
  // Update CSS link
  const stylesLink = document.getElementById('styles-link');
  if (stylesLink) {
    stylesLink.href = `styles.css?v=${APP_VERSION}`;
  }
  
  // Update manifest link
  const manifestLink = document.getElementById('manifest-link');
  if (manifestLink) {
    manifestLink.href = `manifest.json?v=${APP_VERSION}`;
  }
}

/**
 * Initialize service worker
 */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      debug('Checking for service worker support');
      
      // Register service worker with version parameter
      navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`)
        .then(reg => {
          debug('Service worker registered!');
          
          // Force update check immediately
          reg.update();
          
          // Setup regular update checks
          setInterval(() => {
            debug('Checking for service worker updates...');
            reg.update();
          }, 60 * 60 * 1000); // Check hourly
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            debug('Service Worker update found!');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                debug('New service worker installed and ready for use!');
                
                // Create a more visible update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch(err => {
          console.error('Service worker registration failed:', err);
        });
    });
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '0';
  notification.style.left = '0';
  notification.style.right = '0';
  notification.style.backgroundColor = '#4CAF50';
  notification.style.color = 'white';
  notification.style.padding = '16px';
  notification.style.textAlign = 'center';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  
  notification.innerHTML = `
    <strong>New version available!</strong> 
    <button id="update-button" style="margin-left:15px; padding:8px; background-color:white; color:#4CAF50; border:none; border-radius:4px; cursor:pointer;">
      Update Now
    </button>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('update-button').addEventListener('click', function() {
    forceRefresh();
  });
}

/**
 * Force refresh the application
 */
function forceRefresh() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        debug('Unregistering service worker');
        registration.unregister();
      }
      
      // Clear caches
      if (window.caches) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
      
      debug('All service workers unregistered and caches cleared, reloading page');
      window.location.reload(true);
    });
  } else {
    // Fallback for browsers without service worker support
    window.location.reload(true);
  }
}

// Make force refresh globally available
window.forceRefresh = forceRefresh;

// Add a global error handler
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
});

// Add window resize event handler to adjust scaling
window.addEventListener('resize', function() {
  adjustGameScaling();
  
  // If color picker is open, reposition it
  if (!colorPicker.classList.contains('hidden')) {
    const row = parseInt(colorPicker.dataset.row);
    const col = parseInt(colorPicker.dataset.col);
    const isGuess = colorPicker.dataset.isGuess === 'true';
    
    const circle = isGuess
      ? guessArea.children[col]
      : document.querySelector(`.circles-container[data-row="${row}"] .circle[data-col="${col}"]`);
      
    if (circle) {
      positionPicker(colorPicker, circle);
    }
  }
  
  // If mode picker is open, reposition it
  if (!modePicker.classList.contains('hidden')) {
    positionPicker(modePicker, newGameBtn, true);
  }
});

// Main initialization when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  debug('DOM fully loaded, initializing game...');
  
  // Signal that we're running
  window.modulesLoaded = true;
  
  // First check if we can access all DOM elements
  if (!initDomReferences()) {
    console.error('Failed to initialize DOM references');
    return;
  }
  
  // Update resource links with version
  updateResourceLinks();
  
  // Colorize the heading
  colorizeHeading();
  
  // Set default language
  setLanguage(currentLang);
  
  // Add CSS for mode options
  addModeCss();
  
  // Set up language switcher
  setupLanguageSwitcher();
  
  // Set up document click handler
  setupDocumentClickHandler();
  
  // Call adjustGameScaling on load
  adjustGameScaling();
  
  // Initialize the game
  initGame();
  
  // Set up new game button
  newGameBtn.addEventListener("click", function(event) {
	  debug('New Game button clicked');
	  event.stopPropagation();
	  
	  modePicker.classList.remove("hidden");
	  updateModePicker();
	  
	  // Position the mode picker
	  positionPicker(modePicker, newGameBtn, true);
  });
  
  // Initialize service worker
  initServiceWorker();
  
  debug('Game initialized successfully');
  
  // Automatically show the mode picker when the page loads
  setTimeout(function() {
    debug('Auto-triggering new game button');
    modePicker.classList.remove("hidden");
    modePicker.style.display = 'flex';
    updateModePicker();
  }, 500); // Short delay to ensure everything is loaded
});