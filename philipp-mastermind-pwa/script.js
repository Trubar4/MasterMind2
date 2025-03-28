const colors = ["#FF0000", "#FFFF00", "#FFC000", "#F36DED", "#0070C0", "#00B050", "#A6A6A6", "#000000"];
let secretCode = [];
let currentRow = 1;
let currentGuess = [null, null, null, null];
let isCodemakerTurn = true;
const maxRows = 10;
let currentMode = 'both'; // Standardmodus
let currentLang = 'de'; // Standardeinstellung auf Deutsch

const translations = {
    en: {
        congratulations: "Congratulations! You cracked the code!",
        newGame: "NEW GAME",
        submit: "SUBMIT",
        giveUp: "GIVE UP",
        check: "CHECK",
        colours: "Colours",
        positions: "Positions",
        codemaker: "CODEMAKER",
        codebreaker: "CODEBREAKER",
        mode: "MODE",
        bothMode: "BOTH",
        codemakerMode: "CODEMAKER",
        codebreakerMode: "CODEBREAKER"
    },
    de: {
        congratulations: "Gratuliere! Du hast den Code geknackt!",
        newGame: "Neues Spiel",
        submit: "Senden",
        giveUp: "AUFGEBEN",
        check: "Prüfen",
        colours: "Farben",
        positions: "Positionen",
        codemaker: "Ersteller",
        codebreaker: "Löser",
        mode: "Modus",
        bothMode: "BEIDE",
        codemakerMode: "ERSTELLER",
        codebreakerMode: "LÖSER"
    }
};

function generateSecretCode() {
    return Array(4).fill().map(() => colors[Math.floor(Math.random() * colors.length)]);
}

function setButtonLabel(button, key) {
    button.dataset.key = key;
    button.textContent = translations[currentLang][key];
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.translatable').forEach(element => {
        const key = element.dataset.key;
        if (key) {
            element.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
}

function initGame() {
    board.innerHTML = "";
    guessArea.innerHTML = "";
    secretCode = [];
    currentRow = 1;
    currentGuess = [null, null, null, null];
    isCodemakerTurn = true;

    if (currentMode === 'both') {
        // Beide Spieler sind menschlich
    } else if (currentMode === 'codemakerMode') {
        // Computer ist Codebreaker, Mensch ist Codemaker
    } else if (currentMode === 'codebreakerMode') {
        secretCode = generateSecretCode();
        for (let circle of guessArea.children) {
            circle.style.background = "white";
        }
    }

    for (let row = maxRows; row >= 1; row--) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        rowDiv.innerHTML = `
            <span class="row-number">${row}</span>
            <span class="colorsfeedback"></span>
            <div class="circles" data-row="${row}"></div>
            <span class="positionfeedback"></span>
        `;
        const circlesDiv = rowDiv.querySelector(".circles");
        for (let col = 0; col < 4; col++) {
            const circle = document.createElement("div");
            circle.className = "circle";
            circle.dataset.row = row;
            circle.dataset.col = col;
            circle.addEventListener("click", () => onCircleClick(row, col));
            circlesDiv.appendChild(circle);
        }
        board.appendChild(rowDiv);
    }

    for (let col = 0; col < 4; col++) {
        const circle = document.createElement("div");
        circle.className = "circle";
        circle.dataset.col = col;
        if (currentMode !== 'codebreakerMode') {
            circle.addEventListener("click", () => onGuessCircleClick(col));
        }
        guessArea.appendChild(circle);
    }

    setLanguage(currentLang);
    setButtonLabel(document.getElementById('new-gamebtn'), 'newGame');
    setButtonLabel(document.getElementById('submitbtn'), 'submit');
    document.getElementById('submitbtn').disabled = true;
    document.getElementById('submitbtn').classList.remove('active');
    document.getElementById('submitbtn').onclick = submitCode;

    if (currentMode === 'codebreakerMode') {
        isCodemakerTurn = false;
        codemakerLabel.classList.remove("active");
        codebreakerLabel.classList.add("active");
        addCheckButton();
    }
}

function onCircleClick(row, col) {
    if (!isCodemakerTurn && row === currentRow && currentMode === 'both') {
        showColorPicker(row, col, false);
    }
}

function onGuessCircleClick(col) {
    if (isCodemakerTurn && (currentMode === 'both' || currentMode === 'codebreakerMode')) {
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
            submitBtn.disabled = false;
            submitBtn.classList.add("active");
        } else if (currentMode !== 'codemakerMode') {
            if (checkButton) {
                checkButton.disabled = false;
                checkButton.classList.add("active");
            }
        }
    }
}

function submitCode() {
    if (currentMode === 'both' || currentMode === 'codebreakerMode') {
        secretCode = [...currentGuess];
        currentGuess = [null, null, null, null];
        isCodemakerTurn = false;
        codemakerLabel.classList.remove("active");
        codebreakerLabel.classList.add("active");
        setButtonLabel(submitBtn, 'giveUp');
        submitBtn.onclick = revealCode;
        submitBtn.removeAttribute("disabled");
        for (let circle of guessArea.children) {
            circle.style.backgroundColor = "white";
        }
        addCheckButton();
    } else if (currentMode === 'codemakerMode') {
        secretCode = [...currentGuess];
        currentGuess = [null, null, null, null];
        isCodemakerTurn = false;
        codemakerLabel.classList.remove("active");
        codebreakerLabel.classList.add("active");
        computerGuess();
    }
}

function revealCode() {
    for (let i = 0; i < 4; i++) {
        guessArea.children[i].style.backgroundColor = secretCode[i];
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
    if (currentRow <= maxRows) {
        addCheckButton();
    } else {
        for (let i = 0; i < 4; i++) {
            guessArea.children[i].style.backgroundColor = secretCode[i];
        }
        alert(`Game Over! The code was ${secretCode.join(', ')}`);
        submitBtn.setAttribute("disabled", true);
        if (checkButton) checkButton.setAttribute("disabled", true);
    }
    if (correctPositions === 4) {
        alert(translations[currentLang].congratulations);
        submitBtn.setAttribute("disabled", true);
        if (checkButton) checkButton.setAttribute("disabled", true);
    }
}

function computerGuess() {
    if (currentRow > maxRows) {
        alert("Computer failed to crack the code.");
        return;
    }
    let guess = Array(4).fill().map(() => colors[Math.floor(Math.random() * colors.length)]);
    const row = board.children[maxRows - currentRow];
    const circles = row.querySelectorAll(".circle");
    for (let i = 0; i < 4; i++) {
        circles[i].style.backgroundColor = guess[i];
    }
    const { correctPositions, correctColors } = checkGuessLogic(secretCode, guess);
    row.querySelector(".colorsfeedback").textContent = correctColors;
    row.querySelector(".positionfeedback").textContent = correctPositions;
    if (correctPositions == 4) {
        alert("Computer cracked the code!");
        submitBtn.setAttribute("disabled", true);
        return;
    }
    currentRow++;
    setTimeout(computerGuess, 1000);
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

document.getElementById('new-gamebtn').addEventListener('click', initGame);
document.getElementById('submitbtn').addEventListener('click', submitCode);

setLanguage(currentLang);
initGame();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/philipp-mastermind-pwa/service-worker.js', { scope: '/philipp-mastermind-pwa/' })
            .then(reg => console.log('Service worker registered!', reg))
            .catch(err => console.log('Service worker registration failed:', err));
    });
}