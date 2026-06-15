/*JamalTamal */
import { questions } from "./questions.js";

/*CONFIG*/
let MAX_QUESTIONS = questions.length;

let MAX_PUNTUATION = 100;

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJ1q1WoVNddxall-1W98mj02jb2LgmN9NnP2lyxrH9XW9lt12_BuW8QOKFUr3A8KQu/exec";

/*initial params*/
let questionIndex = 0;
let puntuation = 0;

/*vars*/
const answers = {
    Sueño: [],
    Organización: [],
    "Carga academica": [],
    "Presión academica": [],
    Bienestar: []
};

const answerValues = {
    "Muy frecuentemente": 4,
    "Frecuentemente": 3,
    "Más o menos/A veces": 2,
    "Casi nunca": 1,
    "Nunca": 0
};

const infoButton = document.getElementById("primary-button")
const startButton = document.getElementById("start-test")
const nextButton = document.getElementById("continue-button")
const restartButton = document.getElementById("restart-button")

const moreInfoButton = document.getElementById("secondary-button")
const gradeSelect = document.getElementById("student-grade");
const ageSelect = document.getElementById("student-age");

const initialScreen = document.getElementById("initial-screen")
const infoScreen = document.getElementById("student-info")
const testScreen = document.getElementById("test-screen")
const resultScreen = document.getElementById("result-card");

const resultBadge = document.getElementById("result-badge");
const mainFactorText = document.getElementById("main-factor");

let questionTitle = document.getElementById("question-title");
let questionStep = document.getElementById("question-step");
let questionProgress = document.getElementById("question-indicator");
let progressBar = document.getElementById("progress")

let progress = (questionIndex / MAX_QUESTIONS) * 100;

const options = document.querySelectorAll(".option-card");

/*FUNCTIONS*/

/*PRIV*/

//Main page functions
function changeScreens(initial, next) {
initial.classList.add("hidden");
next.classList.remove("hidden");
};

function validateForm() {
    
    let state = startButton.disabled =
        gradeSelect.value === "" ||
        ageSelect.value === "";
    
    if (state === false) {
        startButton.style.background = 
        "linear-gradient(135deg, #22C55E, #12fd4d)";
    } else {
        startButton.style.background = 
        "linear-gradient(135deg, #5f5f5f, #969696)";
    };
        //console.log(startButton.disabled);
}

//Anwers selection functions
function selectAnswer(answer) {

    document
        .querySelectorAll(".option-card")
        .forEach(card => {
            card.classList.remove("selected");
        });

    answer.classList.add("selected");
    nextButton.style.background = 
        "linear-gradient(135deg, #22C55E, #12fd4d)";
}

function resetAnswer() {

    document.querySelectorAll(".selected").forEach(element => {
        element.classList.remove("selected");
    });

    nextButton.style.background =
        "linear-gradient(135deg, #5f5f5f, #969696)";
}

//Score savers function
function saveAnswer(answerValue) {

    const currentQuestion = questions[questionIndex];

    if (!answers[currentQuestion.category]) {
        console.error(
           "Categoría no encontrada:",
           currentQuestion.category
        );
        console.log("Categorías válidas:", Object.keys(answers));
        return;
    }

    answers[currentQuestion.category].push(answerValue);
}

function getCategoryScore(category) {

    return answers[category].reduce((sum, value) => {
        return sum + value;
    }, 0);

}

function getCategoryPercentage(category) {

    const score = getCategoryScore(category);

    const maxScore =
        answers[category].length * 4;

    if (maxScore === 0) {
        return 0;
    }

    return Math.round((score / maxScore) * 100);
}

//Result functions
function getTotalScore() {

    let total = 0;

    for (let category in answers) {

        total += getCategoryScore(category);

    }

    return total;
}

function getStressLevel() {

    const total = getTotalScore();

    if (total <= 13) {
        updateTips("low");
        return "Bajo";
    }

    if (total <= 26) {
        updateTips("moderate");
        return "Moderado";

    }

    updateTips("high");
    return "Alto";
}

function getMainFactor() {

    let highestCategory = "";
    let highestScore = -1;

    for (let category in answers) {

        const score = getCategoryScore(category);

        if (score > highestScore) {

            highestScore = score;
            highestCategory = category;

        }
    }

    return highestCategory;
}

function updateResultDescription(stressLevel) {
    const description = document.getElementById("result-description");

    const texts = {
        bajo: "Tu nivel de estrés es bajo. Actualmente pareces manejar adecuadamente las situaciones de presión y mantener un buen equilibrio emocional.",
        
        moderado: "Tu nivel de estrés es moderado. Es posible que algunas situaciones académicas o personales estén generando tensión ocasionalmente.",
        
        alto: "Tu nivel de estrés es alto. Es recomendable prestar atención a tu bienestar emocional y considerar estrategias para reducir la carga de estrés."
    };

    description.textContent = texts[stressLevel];
}

function updateTips(riskLevel) {

    const tipsContainer =
        document.getElementById("tips-container");

    tipsContainer.innerHTML = "";

    let tips = [];

    if (riskLevel === "low") {

        tips = [
            "Mantén tus hábitos actuales.",
            "Continúa organizando tu tiempo.",
            "Sigue realizando actividades recreativas."
        ];

    } else if (riskLevel === "moderate") {

        tips = [
            "Divide proyectos grandes en tareas pequeñas.",
            "Utiliza una agenda para planificar tu semana.",
            "Realiza pausas cortas durante sesiones largas de estudio."
        ];

    } else if (riskLevel === "high") {

        tips = [
            "Habla con una persona de confianza.",
            "Reduce la sobrecarga de actividades cuando sea posible.",
            "Busca apoyo profesional si el estrés persiste."
        ];

    }

    tips.forEach((tip) => {

        const tipCard = document.createElement("div");
        tipCard.classList.add("tip-card");

        const paragraph = document.createElement("p");
        paragraph.textContent = tip;

        tipCard.appendChild(paragraph);
        tipsContainer.appendChild(tipCard);

    });
}

function saveStressResult(score, level) {
    const result = {
        grade: String(gradeSelect.value),
        age: Number(ageSelect.value),
        score: score,
        level: level,
        date: new Date().toISOString()
    };

    const stressData =
        JSON.parse(localStorage.getItem("stressData")) || [];

    stressData.push(result);
    localStorage.setItem("stressData", JSON.stringify(stressData));

    console.log("Resultado guardado:", result);
    sendStressResultToSheet(result);
}

async function sendStressResultToSheet(result) {
    if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn(
            "Configura GOOGLE_APPS_SCRIPT_URL con la URL de tu Apps Script."
        );
        return;
    }

    try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(result),
            keepalive: true
        });

        console.log("Resultado enviado a Google Sheets.");
    } catch (error) {
        console.error("No se pudo enviar el resultado:", error);
    }
}

function showResult() {
    const totalScore = getTotalScore();
    const stressLevel = getStressLevel();

    resultBadge.textContent = stressLevel;

    mainFactorText.textContent = getMainFactor();

    document.getElementById("sleep-fill").style.width =
        getCategoryPercentage("Sueño") + "%";

    document.getElementById("organization-fill").style.width =
        getCategoryPercentage("Organización") + "%";

    document.getElementById("academic-load-fill").style.width =
        getCategoryPercentage("Carga academica") + "%";

    document.getElementById("academic-pressure-fill").style.width =
        getCategoryPercentage("Presión academica") + "%";

    document.getElementById("wellbeing-fill").style.width =
        getCategoryPercentage("Bienestar") + "%";

    changeScreens(testScreen, resultScreen);
    saveStressResult(totalScore, stressLevel);

    console.log("Total score:", totalScore);
    console.log("Level:", stressLevel);
    console.log("Main Factor:", getMainFactor());
};

/*PUBLIC*/
function nextQuestion() {

    const selectedAnswer = document.querySelector(".selected");

    if (!selectedAnswer) {
        nextButton.style.background =
        "linear-gradient(135deg, #5f5f5f, #969696)";
        return;
    }

   const answerValue = Number(
    selectedAnswer.dataset.value);

    saveAnswer(answerValue);

    resetAnswer();

    questionIndex++;

    if (questionIndex >= questions.length) {
        console.log("limit reached");
        showResult();
        return;
    }

    const actualQuestion = questions[questionIndex].question;

    progress = Math.round(
        (questionIndex / MAX_QUESTIONS) * 100
    );

    questionTitle.textContent = actualQuestion;

    questionStep.textContent =
        `Pregunta ${questionIndex + 1} de ${questions.length}`;

    questionProgress.textContent = `${progress}%`;

    progressBar.style.width = `${progress}%`;
}

function restartTest() {

};

/*EVENTS*/

infoButton.addEventListener("click", function() {
    changeScreens(initialScreen, infoScreen)
});

startButton.addEventListener("click", function() {
    changeScreens(infoScreen, testScreen)
   
});

gradeSelect.addEventListener("change", validateForm);
ageSelect.addEventListener("change", validateForm);

nextButton.addEventListener("click", function() {
    nextQuestion();  
});

options.forEach(answer => {
    answer.addEventListener("click", () => {
        selectAnswer(answer)
    });
});

startButton.disabled = true;
questionTitle.textContent = questions[0].question;
console.log("JS funcionando");
