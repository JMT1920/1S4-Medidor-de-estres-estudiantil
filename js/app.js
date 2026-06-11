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

const initialScreen = document.getElementById("initial-screen")
const testScreen = document.getElementById("test-screen")


/*functions*/

/*PRIV*/

function changeScreens(initial, next) {
initial.classList.add("hidden");
next.classList.remove("hidden");
};

function showQuestion() {

};

function nextQuestion() {

};

/*PUBLIC*/
function restartTest() {

};

/*events*/

startButton.addEventListener("click", function() {
    startTest();
    changeScreens(initialScreen, testScreen);
});