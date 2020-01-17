//elements
let numberDisplayedElement = document.getElementById("display");
let activeButtonContainerElements = document.querySelectorAll(".buttonContainer");
let clearButton =  document.getElementById('clearbtn');
let operatorClickArray = ['equals','add','subtract','multiply','divide'];

//variables
let previousNumber;
let currentButton;
let currentNumber;
let operatorActive;
let currentNumberIsAResult;
let negativeRequest;

//initializations
clearDisplay();

//functions

//BOOOLEAN
function isKeyUp(e) {
    return (e.type == 'keyup')
}

function isClick(e) {
    return (e.type == 'click')
}

//for keyboard presses. Check if key is number from 0 - 9
function keypressIsNumber(e) {
    return (e.key >= 0 && e.key <= 9)
}

//for keyboard presses. Check if key is an operator
function keypressIsOperator(e) {
    let operatorArr = ['*','-','/','+','=','Enter'];
    return (operatorArr.indexOf(e.key) > -1);
}

//BOOOLEAN END

// toggle the current number on the display between positive and negative.
function toggleNegative(e) {
    if (currentNumber == null) {previousNumber *= -1}
    else {currentNumber *= -1}
    negativeRequest = true;
    updateDisplay();
}

function updateDisplay() {
    if (currentNumber == null && negativeRequest) {
        numberDisplayedElement.textContent = previousNumber.toLocaleString();
    } else {
        numberDisplayedElement.textContent = currentNumber.toLocaleString();
    }
    negativeRequest = false;
}

//remove last character
function removeLastNumber(e) {
    if (!currentNumberIsAResult && !operatorActive) {
        currentNumber = Math.floor(currentNumber/10);
        updateDisplay();
    }
}

//essentially reset everything.
function clearDisplay(e) {
    previousNumber = null;
    currentButton = null;
    currentNumber = 0;
    operatorActive = false;
    currentNumberIsAResult = false;
    updateDisplay();
    activeButtonContainerElements.forEach(function(btnContainer) {
        btnContainer.firstElementChild.disabled = false;
    })
}

// for operator keys. On first press, set current button. if an operator already used, evaluate and get result.
function evaluateOperator(e) {
    if (e.key === "Backspace") {
        removeLastNumber();
        return;
    }

    if (e.key === "Escape") {
        clearDisplay();
        return;
    }

    let operIdFromParent;

    if (isKeyUp(e) && !keypressIsOperator(e)) {return}
    else if (isClick(e)) {
        operIdFromParent = e.target.parentElement.id;
        if (operatorClickArray.indexOf(operIdFromParent) < 0) {return}
    }

    operatorActive = true;

    if (previousNumber != null && currentNumber != null) {
        let result;
        switch (currentButton) {
            case 'add':
            case '+':
                result = currentNumber + previousNumber;
                break;
            case 'subtract':
            case "-":
                result = previousNumber - currentNumber;
                break;
            case 'multiply':
            case "*":
                result = currentNumber * previousNumber;
                break;
            case 'divide':
            case '/':
                result = previousNumber / currentNumber;
                break;
            case 'equals':
            case "Enter":
                result = currentNumber;
                break;
        }

        currentNumber = result;
        updateDisplay();
        previousNumber = null;
        currentNumberIsAResult = true;
    }

    if (isKeyUp(e) && keypressIsOperator(e)) {
        currentButton = e.key;
    } else if (operatorClickArray.indexOf(operIdFromParent) > -1) {
        currentButton = operIdFromParent;
    }

    if (operatorActive && currentNumber != null) {
        previousNumber = currentNumber;
        currentNumber = null;
    }
}

//for both keyboard and clicks. Replace number or concatenate to existing number.
function pickNumber(e) {
    if (isKeyUp(e) && !keypressIsNumber(e)) {return}
    console.log(e.type);
    let numberFromClick;
    if (keypressIsNumber(e)) {numberFromClick = e.key}
    else {numberFromClick = e.target.parentElement.id}

    if (!operatorActive && currentNumber != null && !currentNumberIsAResult) {
        currentNumber = +(`${currentNumber}${numberFromClick}`); //add targetNumber to currentNumber
    } else if ((operatorActive && currentNumber == null) || currentNumberIsAResult) {
        currentNumber = +(numberFromClick); // set currentNumber = targetNumber
        operatorActive = false;
        currentNumberIsAResult = false;
    }
    updateDisplay();
}

function preventEnterOnButtons(e) {
    if (e.key == 'Enter') {
        e.preventDefault();
    }
}


//event handlers
window.addEventListener('keypress',preventEnterOnButtons);


//event handlers for button clicks.
activeButtonContainerElements.forEach(function(buttonContainer) {
    if (buttonContainer.id === 'clear') {
        buttonContainer.firstElementChild.addEventListener('click', clearDisplay);
    } else if (buttonContainer.id === 'negativeToggle') {
        buttonContainer.firstElementChild.addEventListener('click', toggleNegative)
    } else if (buttonContainer.id === 'backspace') {
        buttonContainer.firstElementChild.addEventListener('click', removeLastNumber);
    } else if (buttonContainer.firstElementChild.classList.contains("operator")) {
        buttonContainer.firstElementChild.addEventListener('click', evaluateOperator);
    } else {
        buttonContainer.firstElementChild.addEventListener('click', pickNumber);
    }
});

//event handlers for keypresses.
window.addEventListener('keyup', evaluateOperator);
window.addEventListener('keyup', pickNumber);
