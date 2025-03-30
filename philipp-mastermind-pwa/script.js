const translations = {
    en: {
        congratulations: "Congratulations! You cracked the code.",
        newGame: "NEW GAME",
        submit: "SUBMIT",
        giveUp: "GIVE UP",
        check: "CHECK",
        colours: "Colours",
        positions: "Positions",
        codemaker: "CODEMAKER",
        codebreaker: "CODEBREAKER",
        mode: "MODE",
        both: "BOTH",
        codemakerMode: "CODEMAKER",
        codebreakerMode: "CODEBREAKER"
    },
    de: {
        congratulations: "Gratuliere! Du hast den Code geknackt.",
        newGame: "Neues Spiel",
        submit: "Senden",
        giveUp: "AUFGEBEN",
        check: "Prüfen",
        colours: "Farben",
        positions: "Positionen",
        codemaker: "Ersteller",
        codebreaker: "Löser",
        mode: "Modus",
        both: "BEIDE",
        codemakerMode: "ERSTELLER",
        codebreakerMode: "LÖSER"
    }
};

let currentLang = 'de';
let currentMode = 'both';

function setLanguage(lang) {
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
}

document.addEventListener('DOMContentLoaded', function() {
    setLanguage(currentLang);

    const colors = ["#FF0000", "#FFFF00", "#FFC000", "#F36DED", "#0070C0", "#00B050", "#A6A6A6", "#000000"];
    let secretCode = [];
    let currentRow = 1;
    let currentGuess = [null, null, null, null];
    let isCodemakerTurn = true;
    const maxRows = 10;

    const board = document.getElementById("board");
    const guessArea = document.getElementById("guess-area");
    const colorPicker = document.getElementById("color-picker"); // Corrected ID
    const modePicker = document.getElementById("modepicker");
    const codemakerLabel = document.getElementById("codemaker-label");
    const codebreakerLabel = document.getElementById("codebreaker-label");
    const newGameBtn = document.getElementById("new-gamebtn");
    const submitBtn = document.getElementById("submitbtn");
    let modeBtn = document.getElementById("mode-btn");

    let checkButton = null;

    // Insert Mode button between Codemaker and Codebreaker labels
    if (!modeBtn) {
        const newModeBtn = document.createElement("button");
        newModeBtn.id = "mode-btn";
        newModeBtn.classList.add("translatable");
        newModeBtn.dataset.key = "mode";
        newModeBtn.textContent = translations[currentLang].mode;
        newModeBtn.addEventListener("click", () => {
            modePicker.classList.remove("hidden");
            const rect = newModeBtn.getBoundingClientRect();
            modePicker.style.left = `${rect.left + window.scrollX - 100}px`;
            modePicker.style.top = `${rect.top + window.scrollY - 150}px`;
        });
        const rolesDiv = document.querySelector(".roles");
        rolesDiv.insertBefore(newModeBtn, codebreakerLabel); // Insert between labels
    } else {
        modeBtn.addEventListener("click", () => {
            modePicker.classList.remove("hidden");
            const rect = modeBtn.getBoundingClientRect();
            modePicker.style.left = `${rect.left + window.scrollX - 100}px`;
            modePicker.style.top = `${rect.top + window.scrollY - 150}px`;
        });
    }

    // Language switcher
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
        });
    });

    // Mode picker options
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            currentMode = option.dataset.mode;
            modePicker.classList.add("hidden");
            initGame();
        });
    });

    function initGame() {
        board.innerHTML = "";
        guessArea.innerHTML = "";
        secretCode = [];
        currentRow = 1;
        currentGuess = [null, null, null, null];
        isCodemakerTurn = true;
        codemakerLabel.classList.add("active");
        codebreakerLabel.classList.remove("active");
        submitBtn.setAttribute("disabled", "true");
        submitBtn.classList.remove("active");

        for (let row = maxRows; row >= 1; row--) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            rowDiv.innerHTML = `
                <span class="row-number">${row}</span>
                <span class="colors-feedback"></span>
                <div class="circles" data-row="${row}"></div>
                <span class="position-feedback"></span>
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
            circle.addEventListener("click", () => onGuessCircleClick(col));
            guessArea.appendChild(circle);
        }

        newGameBtn.classList.add("active"); // Ensure button is always active
        submitBtn.textContent = translations[currentLang].submit;
    }

    function onCircleClick(row, col) {
        // Show color picker for codebreaker turn in 'both' mode or in 'codebreakerMode'
        if ((currentMode === 'both' && !isCodemakerTurn && row === currentRow) ||
            (currentMode === 'codebreakerMode' && row === currentRow)) {
            showColorPicker(row, col, false);
        }
    }

    function onGuessCircleClick(col) {
        // Show color picker for codemaker turn in 'both' mode or in 'codemakerMode'
        if ((currentMode === 'both' && isCodemakerTurn) || currentMode === 'codemakerMode') {
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
        colorPicker.style.top = `${rect.top + window.scrollY - 150}px`;
        colorPicker.style.zIndex = "1000";

        // Add click listeners to color options
        document.querySelectorAll(".color-option").forEach(option => {
            option.onclick = () => selectColor(row, col, option.style.backgroundColor, isGuess);
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
                submitBtn.removeAttribute("disabled");
                submitBtn.classList.add("active");
            } else {
                if (checkButton) {
                    checkButton.disabled = false;
					checkButton.removeAttribute("disabled");
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
			submitBtn.disabled = false;
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
		submitBtn.disabled = true;
		if (checkButton) checkButton.disabled = true;
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
        row.querySelector(".colors-feedback").textContent = correctColors;
        row.querySelector(".position-feedback").textContent = correctPositions;

        currentGuess = [null, null, null, null];
        for (let circle of guessArea.children) {
            circle.style.backgroundColor = "white";
        }
        // checkButton.setAttribute("disabled", "true");
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
            submitBtn.setAttribute("disabled", "true");
            // if (checkButton) checkButton.setAttribute("disabled", "true");
			if (checkButton) checkButton.disabled = true;
        }
        if (correctPositions === 4) {
            alert(translations[currentLang].congratulations);
            submitBtn.setAttribute("disabled", "true");
            // if (checkButton) checkButton.setAttribute("disabled", "true");
			if (checkButton) checkButton.disabled = true;
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
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/philipp-mastermind-pwa/service-worker.js', { scope: '/philipp-mastermind-pwa/' })
            .then(reg => console.log('Service worker registered!', reg))
            .catch(err => console.log('Service worker registration failed:', err));
    });
}