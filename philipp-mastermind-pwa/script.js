const translations = {
    en: {
        congratulations: "Congratulations! You cracked the code.",
        newGame: "NEW GAME",
        submit: "SUBMIT",
        check: "CHECK",
        colours: "Colours",
        positions: "Positions",
        codemaker: "CODEMAKER",
        codebreaker: "CODEBREAKER",
        "give up": "give up"
    },
    de: {
        congratulations: "Gratuliere! Du hast den Code geknackt.",
        newGame: "Neues Spiel",
        submit: "Senden",
        check: "Prüfen",
        colours: "Farben",
        positions: "Positionen",
        codemaker: "Ersteller",
        codebreaker: "Knacker",
        "give up": "aufgeben"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.translatable').forEach(element => {
        const key = element.dataset.key;
        element.textContent = translations[lang][key];
    });

    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Language switcher event listeners
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
        });
    });

    // Initial language setup
    setLanguage(currentLang);
});

const colors = ["#FF0000", "#FFFF00", "#FFC000", "#F36DED", "#0070C0", "#00B050", "#A6A6A6", "#000000"];
let secretCode = [];
let currentRow = 1;
let currentGuess = [null, null, null, null];
let isCodemakerTurn = true;
const maxRows = 10;

const board = document.getElementById("board");
const guessArea = document.getElementById("guess-area");
const colorPicker = document.getElementById("colorPicker");
const codemakerLabel = document.getElementById("codemaker-label");
const codebreakerLabel = document.getElementById("codebreaker-label");
const newGameBtn = document.getElementById("new-gamebtn");
const submitBtn = document.getElementById("submitbtn");

let checkButton = null;

function initGame() {
    board.innerHTML = "";
    guessArea.innerHTML = "";
    secretCode = [];
    currentRow = 1;
    currentGuess = [null, null, null, null];
    isCodemakerTurn = true;
    codemakerLabel.classList.add("active");
    codebreakerLabel.classList.remove("active");
    submitBtn.disabled = true;
    submitBtn.classList.remove("active");

    for (let row = maxRows; row >= 1; row--) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        rowDiv.innerHTML = `
            <span class="row-number">${row}</span>
            <span class="colorsfeedback"></span>
            <div class="circle" data-row="${row}" data-col="0"></div>
            <div class="circle" data-row="${row}" data-col="1"></div>
            <div class="circle" data-row="${row}" data-col="2"></div>
            <div class="circle" data-row="${row}" data-col="3"></div>
            <span class="positionfeedback"></span>
        `;
        const circles = rowDiv.querySelectorAll(".circle");
        circles.forEach(circle => {
            const rowNum = parseInt(circle.dataset.row);
            const col = parseInt(circle.dataset.col);
            circle.addEventListener("click", () => onCircleClick(rowNum, col));
        });
        board.appendChild(rowDiv);
    }

    for (let col = 0; col < 4; col++) {
        const circle = document.createElement("div");
        circle.className = "circle";
        circle.dataset.col = col;
        circle.addEventListener("click", () => onGuessCircleClick(col));
        guessArea.appendChild(circle);
    }

    setLanguage(currentLang);
}

function onCircleClick(row, col) {
    if (!isCodemakerTurn && row === currentRow) {
        showColorPicker(row, col, false);
    }
}

function onGuessCircleClick(col) {
    if (isCodemakerTurn) {
        showColorPicker(0, col, true);
    }
}

function showColorPicker(row, col, isGuess) {
    colorPicker.classList.remove("hidden");
    const circle = isGuess
        ? guessArea.children[col]
        : board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const rect = circle.getBoundingClientRect();
    const pickerWidth = 240;
    const circleWidth = rect.width;
    const offsetX = (pickerWidth - circleWidth) / 2;
    colorPicker.style.left = `${rect.left + window.scrollX - offsetX}px`;
    colorPicker.style.top = `${rect.top + window.scrollY - 100}px`;

    const options = colorPicker.querySelectorAll(".color-option");
    options.forEach((option, index) => {
        option.onclick = () => selectColor(row, col, colors[index], isGuess);
    });
}

function selectColor(row, col, color, isGuess) {
    currentGuess[col] = color;
    if (isGuess) {
        guessArea.children[col].style.background = color;
    } else {
        const circle = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        circle.style.background = color;
    }
    colorPicker.classList.add("hidden");
    if (currentGuess.every(c => c !== null)) {
        if (isCodemakerTurn) {
            submitBtn.disabled = false;
            submitBtn.classList.add("active");
        } else {
            if (checkButton) {
                checkButton.disabled = false;
                checkButton.classList.add("active");
            }
        }
    }
}

function submitCode() {
    secretCode = [...currentGuess];
    currentGuess = [null, null, null, null];
    isCodemakerTurn = false;
    codemakerLabel.classList.remove("active");
    codebreakerLabel.classList.add("active");

    // Display codemaker's code on row 1
    const row1 = board.children[9]; // Index 9 for row number 1
    const circles = row1.querySelectorAll(".circle");
    for (let i = 0; i < 4; i++) {
        circles[i].style.background = secretCode[i];
    }

    // Reset guess area
    for (let circle of guessArea.children) {
        circle.style.background = "white";
    }

    // Change submit button to "give up"
    submitBtn.innerHTML = translations[currentLang]["give up"];
    submitBtn.dataset.key = "give up";
    submitBtn.onclick = function() {
        alert(secretCode.join(", "));
    };
    submitBtn.disabled = false;
    submitBtn.classList.add("active");

    // Set currentRow to 2 for codebreaker's first guess
    currentRow = 2;
    addCheckButton();
}

function addCheckButton() {
    if (checkButton) {
        checkButton.remove();
    }
    checkButton = document.createElement("button");
    checkButton.className = "checkbtn translatable";
    checkButton.dataset.key = "check";
    checkButton.textContent = translations[currentLang].check;
    checkButton.disabled = true;
    checkButton.onclick = checkGuess;
    const row = board.children[maxRows - currentRow];
    row.appendChild(checkButton);
}

function checkGuess() {
    const { correctPositions, correctColors } = checkGuessLogic(secretCode, currentGuess);
    const row = board.children[maxRows - currentRow];
    row.querySelector(".colorsfeedback").textContent = correctColors;
    row.querySelector(".positionfeedback").textContent = correctPositions;

    // Display the guess on the board row before feedback
    const circles = row.querySelectorAll(".circle");
    for (let i = 0; i < 4; i++) {
        circles[i].style.background = currentGuess[i];
    }

    currentGuess = [null, null, null, null];
    for (let circle of guessArea.children) {
        circle.style.background = "white";
    }
    checkButton.disabled = true;
    checkButton.classList.remove("active");
    currentRow++;
    if (currentRow <= maxRows) {
        addCheckButton();
    }
    if (correctPositions === 4) {
        alert(translations[currentLang].congratulations);
        initGame();
    } else if (currentRow > maxRows) {
        alert(secretCode.join(", "));
        // Do not call initGame()
    }
}

function checkGuessLogic(secret, guess) {
    let correctPositions = 0;
    let correctColors = 0;
    const secretTemp = [...secret];
    const guessTemp = [...guess];
    for (let i = 0; i < 4; i++) {
        if (guessTemp[i] === secretTemp[i]) {
            correctPositions++;
            secretTemp[i] = guessTemp[i] = null;
        }
    }
    for (let i = 0; i < 4; i++) {
        if (guessTemp[i] && secretTemp.includes(guessTemp[i])) {
            correctColors++;
            secretTemp[secretTemp.indexOf(guessTemp[i])] = null;
        }
    }
    return { correctPositions, correctColors };
}

newGameBtn.addEventListener("click", initGame);
submitBtn.addEventListener("click", submitCode);

initGame();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/philipp-mastermind-pwa/service-worker.js')
            .then(reg => console.log('Service worker registered!', reg))
            .catch(err => console.log('Service worker registration failed:', err));
    });
}