/*JamalTamal */
console.log("JS funcionando");
console.log(questions)

/*CONFIG*/
let MAX_QUESTIONS = 10
let MAX_PUNTUATION = 100

/*initial params*/
let question = 0
let puntuation = 0

/*vars*/
const startButton = document.getElementById("primary-button")
const nextButton = document.getElementById("continue-button")
const restartButton = document.getElementById("restart-button")

const moreInfoButton = document.getElementById("secondary-button")


/*functions*/

/*PRIV*/
function showQuestion() {

};

function nextQuestion() {

};

/*PUBLIC*/
function startTest() {
    console.log("Test iniciado")
};

function showResult() {

};

function restartTest() {

};

/*events*/

startButton.addEventListener("click", function() {
    startTest()
});