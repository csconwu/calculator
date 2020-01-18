//elements
let numberDisplayedElement = document.getElementById("displayP");
let activeButtonContainerElements = document.querySelectorAll(".buttonContainer");
let clearButton =  document.getElementById('clearbtn');
let operatorClickArray = ['equals','add','subtract','multiply','divide','powerOf'];
let currentOperatorDisplay = document.getElementById('currentOperatorDisplay');
let prevNumberDisplay = document.getElementById("previousNumberDisplay");
let clickOperatorMapping = {
    multiply: 'x',
    divide: "/",
    add: "+",
    subtract: '-',
    backspace: '',
    equals: "=",
    Enter: "=",
    '*': 'x',
    powerOf: '^'
};
let maxFraction = {
    style: 'decimal',
    maximumFractionDigits: 11,
    maximumSignificantDigits: 12
};

//variables
let previousNumber;
let currentButton;
let currentNumber;
let operatorActive;
let currentNumberIsAResult;
let negativeRequest;
let dotEnabled;
let zeroAfterDot;
let errorMode;

//initializations
clearDisplay();

//functions

//BOOOLEAN
function displayContainsDot() {
    return (numberDisplayedElement.textContent.indexOf('.') > -1)
}

function isDot(e) {
    return ((isClick(e) && e.target.parentElement.id === 'dot') ||
    isKeyUp(e) && e.key === '.');
}

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

function convertToformNumber(stringV) {
    return stringV.toLocaleString('en-US', maxFraction);
}

// toggle the current number on the display between positive and negative.
function toggleNegative(e) {
    if (currentNumber == null) {previousNumber *= -1}
    else {currentNumber *= -1}
    negativeRequest = true;
    updateDisplay();
}

function disableMostButtons() {
    activeButtonContainerElements.forEach(function(btnContainer) {
        btnContainer.firstElementChild.disabled = true;
    })
    clearButton.disabled = false;
    document.getElementById('sup01').classList.add('disabledSup');
}

function updatePreviousNumber() {
    if (!currentNumberIsAResult) {
        prevNumberDisplay.textContent = `(${convertToformNumber(previousNumber)})`;
    } else {
        prevNumberDisplay.textContent = "(            )";
    }
}

function updateOperatorDisplayed() {
    if (currentButton.length > 2 || currentButton == '*') {
        currentOperatorDisplay.textContent = clickOperatorMapping[currentButton];
    } else {
        currentOperatorDisplay.textContent = (operatorActive ? currentButton : '');
    }
}

function updateDisplay(e) {
    if (!e) {e = 'noArgument'}
    if (isDot(e)) {
        if (displayContainsDot()) {return}
        numberDisplayedElement.textContent += '.';
        dotEnabled = true;
    } else if (dotEnabled || zeroAfterDot) { //for adding 0 right after decimal place
        numberDisplayedElement.textContent += '0';
        zeroAfterDot = false;
    } else if (currentNumber == null && negativeRequest) {
        numberDisplayedElement.textContent = convertToformNumber(previousNumber);
    } else {
        numberDisplayedElement.textContent = convertToformNumber(currentNumber);
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
    prevNumberDisplay.textContent = "(            )"; //remove if you update updatePreviousNumber to handle this
    activeButtonContainerElements.forEach(function(btnContainer) {
        btnContainer.firstElementChild.disabled = false; //enable buttons if disabled by infinity result
    })
    errorMode = false;
    document.getElementById('sup01').classList.remove('disabledSup');
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
    dotEnabled = false;

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
            case "powerOf":
                result = previousNumber ** currentNumber;
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

        if (result > 999999999999 || result < -99999999999 || isNaN(result)) {
            numberDisplayedElement.textContent = 'ERROR, CLEAR!';
            errorMode = true;
            disableMostButtons();
            return;
        } else if (convertToformNumber(result).length > 10) result = result.toFixed(11);
        currentNumber = result;
        currentNumber = +(convertToformNumber(currentNumber).replace(/,/g,''));
        currentNumberIsAResult = true;
        updateDisplay();
        updatePreviousNumber();
        previousNumber = null;
    }

    if (isKeyUp(e) && keypressIsOperator(e)) {
        currentButton = e.key;
    } else if (operatorClickArray.indexOf(operIdFromParent) > -1) {
        currentButton = operIdFromParent;
    }
    updateOperatorDisplayed();

    if (operatorActive && currentNumber != null) {
        previousNumber = currentNumber;
        currentNumber = null;
    }
}

//for both keyboard and clicks. Replace number or concatenate to existing number.
function pickNumber(e) {
    if (currentNumberIsAResult && isDot(e)) return;
    if (currentNumber) {
        if (displayContainsDot() && currentNumber.toString().length >= 12) return;
        if (currentNumber.toString().length >= 11 && !displayContainsDot()) {return}
    }
    if (errorMode) return;
    if (isKeyUp(e) && !keypressIsNumber(e) && !isDot(e)) {return}
    console.log(e.type);
    let numberFromClick;
    if (keypressIsNumber(e)) {numberFromClick = e.key}
    else {numberFromClick = e.target.parentElement.id}

    if (numberFromClick === '0' && (dotEnabled || displayContainsDot()) && !operatorActive && !currentNumberIsAResult) {
        zeroAfterDot = true;
    } else if (dotEnabled) {
        currentNumber = +(`${numberDisplayedElement.textContent.replace(/,/g,'')}${numberFromClick}`);
        dotEnabled = false;
    } else if (!operatorActive && currentNumber != null && !currentNumberIsAResult) {
        currentNumber = +(`${numberDisplayedElement.textContent.replace(/,/g,'')}${numberFromClick}`); //add targetNumber to currentNumber
    } else if ((operatorActive && currentNumber == null) || currentNumberIsAResult) {
        currentNumber = +(numberFromClick); // set currentNumber = targetNumber
        operatorActive = false;
        currentNumberIsAResult = false;
        updatePreviousNumber();
    }
    updateDisplay(e);
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
