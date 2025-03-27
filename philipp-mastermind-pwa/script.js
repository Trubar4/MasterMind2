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

    // Mastermind Game Setup
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

    function initGame() {
        board.innerHTML = "";
        guessArea.innerHTML = "";
        secretCode = [];
        currentRow = 1;
        currentGuess = [null, null, null, null];
        isCodemakerTurn = true;
        codemakerLabel.classList.add("active");
        codebreakerLabel.classList.remove("active");

        // Create initial board rows
        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            const rowNumber = document.createElement("span");
            rowNumber.classList.add("row-number");
            rowNumber.textContent = maxRows - i;
            row.appendChild(rowNumber);

            // Create circles for guess
            for (let j = 0; j < 4; j++) {
                const circle = document.createElement("div");
                circle.classList.add("circle");
                row.appendChild(circle);
            }

            // Create feedback circles
            for (let j = 0; j < 2; j++) {
                const feedbackCircle = document.createElement("div");
                feedbackCircle.classList.add("circle");
                feedbackCircle.style.background = "#B0BEC5";
                row.appendChild(feedbackCircle);
            }

            // Create check button
            const checkBtn = document.createElement("button");
            checkBtn.classList.add("checkbtn");
            checkBtn.textContent = translations[currentLang]["check"];
            row.appendChild(checkBtn);

            board.appendChild(row);
        }

        // Set up color picker
        const colorOptions = document.querySelectorAll(".color-option");
        colorOptions.forEach(option => {
            option.addEventListener("click", () => {
                const color = option.style.background;
                const activeCircle = guessArea.querySelector(".circle.active");
                if (activeCircle) {
                    activeCircle.style.background = color;
                    const index = Array.prototype.indexOf.call(guessArea.children, activeCircle);
                    currentGuess[index] = color;
                    activeCircle.classList.remove("active");
                }
            });
        });

        // Set up guess area
        for (let i = 0; i < 4; i++) {
            const circle = document.createElement("div");
            circle.classList.add("circle");
            circle.style.background = "#FFFFFF";
            circle.addEventListener("click", () => {
                circle.classList.toggle("active");
            });
            guessArea.appendChild(circle);
        }
    }

    function submitCode() {
        if (isCodemakerTurn) {
            secretCode = [...currentGuess];
            currentGuess = [null, null, null, null];
            isCodemakerTurn = false;
            codemakerLabel.classList.remove("active");
            codebreakerLabel.classList.add("active");

            // Hide codemaker's code
            const firstRow = board.children[9];
            const circles = firstRow.querySelectorAll(".circle");
            for (let i = 0; i < 4; i++) {
                circles[i].style.background = "#FFFFFF";
            }

            submitBtn.innerHTML = translations[currentLang]["give up"];
            submitBtn.dataset.key = "give up";
            submitBtn.onclick = function() {
                alert(secretCode.join(", "));
            };
        } else {
            // Handle codebreaker's guess
            const row = board.children[10 - currentRow];
            const circles = row.querySelectorAll(".circle");
            for (let i = 0; i < 4; i++) {
                circles[i].style.background = currentGuess[i];
            }

            // Check if codebreaker won
            if (currentGuess.every((color, index) => color === secretCode[index])) {
                alert(translations[currentLang]["congratulations"]);
            } else if (currentRow >= maxRows) {
                const colorNames = secretCode.map(color => {
                    const index = colors.indexOf(color);
                    return `Farbe ${index + 1}`;
                });
                alert(`Der Code war: ${colorNames.join(", ")}`);
            } else {
                currentRow++;
                currentGuess = [null, null, null, null];
            }
        }
    }

    newGameBtn.addEventListener("click", initGame);
    submitBtn.addEventListener("click", submitCode);

    initGame();
});
