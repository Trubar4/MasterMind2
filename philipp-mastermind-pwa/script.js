const translations = {
    en: {
        congratulations: "Congratulations! You cracked the code!",
        newGame: "NEW GAME",
        submit: "SUBMIT",
        check: "CHECK",
        colours: "Colours",
        positions: "Positions",
        codemaker: "CODEMAKER",
        codebreaker: "CODEBREAKER",
        both: "BOTH",
        mode: "MODE",
		giveUp: "give up"
    },
    de: {
        congratulations: "Gratuliere! Du hast den Code geknackt!",
        newGame: "Neues Spiel",
        submit: "Senden",
        check: "Prüfen",
        colours: "Farben",
        positions: "Positionen",
        codemaker: "ERSTELLER",
        codebreaker: "LÖSER",
        both: "BEIDE",
        mode: "MODUS",
		giveUp: "aufgeben"
    }
};

let currentLang = 'en';
let currentMode = 'both';

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

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-option').forEach(option => {
        option.classList.toggle('active', option.dataset.mode === mode);
    });
    document.getElementById('modepicker').classList.add('hidden');
    // No further action needed for now, as game remains manual
}

document.addEventListener('DOMContentLoaded', () => {
    // Language switcher event listeners
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
        });
    });

    // Mode picker event listeners
    document.getElementById('modebtn').addEventListener('click', () => {
        const modepicker = document.getElementById('modepicker');
        const modebtn = document.getElementById('modebtn');
        const rect = modebtn.getBoundingClientRect();
        modepicker.style.left = `${rect.left + window.scrollX}px`;
        modepicker.style.top = `${rect.top + window.scrollY - 100}px`;
        modepicker.classList.toggle('hidden');
    });

    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.dataset.mode;
            setMode(mode);
        });
    });

    // Initial language and mode setup
    setLanguage(currentLang);
    setMode(currentMode);
});

const colors = ["#FF0000", "#FFFF00", "#FFC000", "#F36DED", "#0070C0", "#00B050", "#A6A6A6", "#000000"];
let secretCode = [];
let currentRow = 1;
let currentGuess = [null, null, null, null];
let isCodemakerTurn = true;
const maxRows = 10;

const board = document.getElementById("board");
const guessArea = document.getElementById("guess-area");
const colorPicker = document.getElementById("colorpicker");
const codemakerLabel = document.getElementById("codemaker-label");
const codebreakerLabel = document.getElementById("codebreaker-label");
const newGamebtn = document.getElementById("new-gamebtn");
const submitbtn = document.getElementById("submitbtn");

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
    newGamebtn.disabled = false;
	submitbtn.disabled = true;
    submitbtn.classList.remove("active");

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
            const row = parseInt(circle.dataset.row);
            const col = parseInt(circle.dataset.col);
            circle.addEventListener("click", () => onCircleClick(row, col));
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
        guessArea.children[col].style.backgroundColor = color;
    } else {
        const circle = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        circle.style.backgroundColor = color;
    }
    colorPicker.classList.add("hidden");
    if (currentGuess.every(c => c !== null)) {
        if (isCodemakerTurn) {
            submitbtn.disabled = false;
            submitbtn.classList.add("active");
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
    document.getElementById("codemaker-label").classList.remove("active");
    document.getElementById("codebreaker-label").classList.add("active");
    setButtonLabel(submitBtn, 'giveUp');
    submitBtn.onclick = revealCode;
    for (let circle of guessArea.children) {
        circle.style.background = "white";
    }
    addCheckButton();
}

function setButtonLabel(button, key) {
    button.dataset.key = key;
    button.textContent = translations[currentLang][key];
}

function revealCode() {
    for (let i = 0; i < 4; i++) {
        guessArea.children[i].style.background = secretCode[i];
    }
    alert(`The code was ${secretCode.join(', ')}`);
    submitBtn.setAttribute("disabled", true);
    if (checkButton) checkButton.setAttribute("disabled", true);
}

function addCheckButton() {
    if (checkButton) {
        checkButton.remove();
    }
    checkButton = document.createElement("button");
    checkButton.className = "check-btn translatable";
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

    currentGuess = [null, null, null, null];
    for (let circle of guessArea.children) {
        circle.style.backgroundColor = "white";
    }
    checkButton.disabled = true;
    checkButton.classList.remove("active");
    currentRow++;

	if (currentRow > maxRows) {
		for (let i = 0; i < 4; i++) {
			guessArea.children[i].style.background = secretCode[i];
		}
		alert(`Game Over! The code was ${secretCode.join(', ')}`);
		submitBtn.setAttribute("disabled", true);
		if (checkButton) checkButton.setAttribute("disabled", true);
	}
	
	if (correctPositions == 4) {
		alert(translations[currentLang].congratulations);
		submitBtn.setAttribute("disabled", true);
		if (checkButton) checkButton.setAttribute("disabled", true);
	} else if (currentRow > maxRows) {
		for (let i = 0; i < 4; i++) {
			guessArea.children[i].style.background = secretCode[i];
		}
		alert(`Game Over! The code was ${secretCode.join(', ')}`);
		submitBtn.setAttribute("disabled", true);
		if (checkButton) checkButton.setAttribute("disabled", true);
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

newGamebtn.addEventListener("click", initGame);
submitbtn.addEventListener("click", submitCode);

initGame();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/philipp-mastermind-pwa/service-worker.js', { scope: '/philipp-mastermind-pwa/' })
            .then(reg => console.log('Service worker registered!', reg))
            .catch(err => console.log('Service worker registration failed:', err));
    });
}