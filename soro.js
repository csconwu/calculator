//elements
let numberDisplayedElement = document.getElementById("displayP");
let activeButtonContainerElements = document.querySelectorAll(".buttonContainer");
let clearButton =  document.getElementById('clearbtn');
let operatorClickArray = ['equals','add','subtract','multiply','divide','powerOf'];
let currentOperatorDisplay = document.getElementById('currentOperatorDisplay');
let prevNumberDisplay = document.getElementById("previousNumberDisplay");
let clickOperatorMapping = { //For operator display
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
let hoverOperatorMapping = {  //for highlighting on keypress
    '*': 'multiply',
    '/': 'divide',
    '-': 'subtract',
    '+': 'add',
    'Enter': 'equals',
    '=': 'equals'
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
let numOfZeroAfterDecimal;
let addDecimalFirst;
let prevDispIsExpression;

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
    return (e.type == 'click' || e.type == 'touchend');
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
function toggleNegative() {
    if (errorMode) {return}
    if (currentNumber == null) {previousNumber *= -1}
    else {currentNumber *= -1}
    negativeRequest = true;
    updateDisplay();
}

function disableMostButtons() {
    activeButtonContainerElements.forEach(function(btnContainers) {
        btnContainers.firstElementChild.disabled = true;
    });
    clearButton.disabled = false;
    document.getElementById('sup01').classList.add('disabledSup');
}

function updatePreviousNumber() {
    if (!currentNumberIsAResult) {
        prevNumberDisplay.textContent = '(' + convertToformNumber(previousNumber) + ')';
    } else {
        prevNumberDisplay.textContent = "(            )";
    }
}

function updateOperatorDisplayed() {
    if (currentButton.length > 2 || currentButton == '*') { //added * here to change it to x displayed
        currentOperatorDisplay.textContent = clickOperatorMapping[currentButton];
    } else {
        currentOperatorDisplay.textContent = (operatorActive ? currentButton : '');
    }
}

function updateDisplay(e) {
    if (numberDisplayedElement.textContent === '') {
        numberDisplayedElement.textContent = '0';
        currentNumber = 0;
        return;
    }
    if (!e) {e = 'noArgument'}
    if (isDot(e)) {
        if (displayContainsDot()) {return}
        numberDisplayedElement.textContent += '.';
        dotEnabled = true;
    } else if ((dotEnabled || zeroAfterDot) && ((isKeyUp(e) && e.key === '0') || isClick(e) && e.target.parentElement.id === '0')) { //for adding 0 right after decimal place
        console.log("why are you hitting this?");
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
    if (!currentNumberIsAResult && !operatorActive ) {
        if (!displayContainsDot()) {
            currentNumber = Math.floor((currentNumber)/10);
            updateDisplay();
            return;
        }

        let displayedNumbLength = numberDisplayedElement.textContent.length - 1; //-1 for index purpose
        let lengthAfterRemoval = displayedNumbLength -1;
        let eCurrentNumber = `${numberDisplayedElement.textContent.replace(/,/g,'')}`; //remove commas
        let lastNumber = eCurrentNumber.slice(-1);

        if (lastNumber !== '0') {
            let unConvDecNum = numberDisplayedElement.textContent;
            numberDisplayedElement.textContent = unConvDecNum.substr(0, unConvDecNum.length-1);
            eCurrentNumber = eCurrentNumber.substr(0, eCurrentNumber.length-1);
            currentNumber = parseFloat(eCurrentNumber); //remove last character from number without commas
            if (dotEnabled) {
                console.log('Nothing Done')
                // numberDisplayedElement.textContent += '.';
            }
        } else {
            numOfZeroAfterDecimal = 0;
            addDecimalFirst = false;
            while (eCurrentNumber.slice(-1) === '0') {
                eCurrentNumber = eCurrentNumber.substr(0,eCurrentNumber.length-1);
                if (eCurrentNumber.slice(-1) === '0') {numOfZeroAfterDecimal++;}
                if (eCurrentNumber.slice(-1) === '.') {addDecimalFirst = true}
            }
            eCurrentNumber = parseFloat(eCurrentNumber);

            eCurrentNumber = convertToformNumber(eCurrentNumber);

            if (addDecimalFirst) {
                eCurrentNumber = eCurrentNumber+'.'+'0'.repeat(numOfZeroAfterDecimal);
            } else {
                eCurrentNumber = eCurrentNumber+'0'.repeat(numOfZeroAfterDecimal);
            }
            //clear variables for possible next backspace
            numberDisplayedElement.textContent = eCurrentNumber;
            eCurrentNumber = eCurrentNumber.replace(/,/g,'');
            currentNumber = +(eCurrentNumber);
            }
        if (numberDisplayedElement.textContent === '') {
            numberDisplayedElement.textContent = '0';
            currentNumber = 0;
        }

    }
}

//essentially reset everything.
function clearDisplay(e) {
    previousNumber = null;
    currentButton = null;
    currentNumber = 0;
    operatorActive = false;
    currentNumberIsAResult = false;
    dotEnabled = false;

    updateDisplay();
    prevNumberDisplay.textContent = "(            )"; //remove if you update updatePreviousNumber to handle this
    activeButtonContainerElements.forEach(function(btnContainer) {
        btnContainer.firstElementChild.disabled = false; //enable buttons if disabled by infinity result
    });
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

        if (currentButton !== 'Enter' && currentButton !== 'equals') { //update previous number display to show expression
            if (currentButton.length > 2) {
                prevNumberDisplay.textContent = `(${previousNumber}${clickOperatorMapping[currentButton]}${currentNumber})`;
            } else {
                prevNumberDisplay.textContent = `(${previousNumber}${currentButton}${currentNumber})`;
            }
            prevDispIsExpression = true;
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
    if (prevDispIsExpression) {
        updatePreviousNumber();
        prevDispIsExpression = false;
    }
    let numberFromClick;
    if (keypressIsNumber(e)) {numberFromClick = e.key}
    else {numberFromClick = e.target.parentElement.id}

    if (numberFromClick === '0' && numberDisplayedElement.textContent === '0') {return}

    if (numberFromClick === '0' && (dotEnabled || (displayContainsDot()) && !operatorActive && !currentNumberIsAResult)) {
        zeroAfterDot = true;
    } else if (numberFromClick === "." || numberFromClick === 'dot') {
        let love = 'do nothing';
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

function buttonPressed(e) {
    if (keypressIsNumber(e)) {
        document.getElementById(e.key).firstElementChild.classList.add('buttonPressed');
    } else if (keypressIsOperator(e)) {
        document.getElementById(hoverOperatorMapping[e.key]).firstElementChild.classList.add('buttonPressed')
    } else if (e.key === "Escape") {
        document.getElementById('clearbtn').classList.add("buttonPressed")
    } else if (e.key === 'Backspace') {
        document.getElementById('backspacebtn').classList.add("buttonPressed");
    }
}

function buttonReleased(e) {
    if (keypressIsNumber(e)) {
        document.getElementById(e.key).firstElementChild.classList.remove('buttonPressed');
    } else if (keypressIsOperator(e)) {
        document.getElementById(hoverOperatorMapping[e.key]).firstElementChild.classList.remove('buttonPressed')
    } else if (e.key === "Escape") {
        document.getElementById('clearbtn').classList.remove("buttonPressed")
    } else if (e.key === 'Backspace') {
        document.getElementById('backspacebtn').classList.remove("buttonPressed");
    }
}


//event handlers
window.addEventListener('keypress',preventEnterOnButtons);

//event handlers for keypresses.
window.addEventListener('keyup', evaluateOperator);
window.addEventListener('keyup', pickNumber);
window.addEventListener('keydown', buttonPressed);
window.addEventListener('keyup', buttonReleased);


if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // some code..
    document.getElementById('calculatorContainer').classList.add("mobilePhone");
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    let sizeToUse = (width - 20)/4;
    let all300 = "repeat(4,"+ sizeToUse + "px)";
    let height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    let sizeToUseH = (height - 170)/6;
    let all300H = "repeat(6,minmax(160px,"+ sizeToUseH + "px)";
    document.getElementById('calculatorContainer').style.gridTemplateRows =
        all300H;
    document.getElementById('calculatorContainer').style.gridTemplateColumns =
        all300;

    activeButtonContainerElements.forEach(function (buttonContainer) {
        if (buttonContainer.id === 'clear') {
            buttonContainer.firstElementChild.addEventListener('touchend', clearDisplay);
        } else if (buttonContainer.id === 'negativeToggle') {
            buttonContainer.firstElementChild.addEventListener('touchend', toggleNegative)
        } else if (buttonContainer.id === 'backspace') {
            buttonContainer.firstElementChild.addEventListener('touchend', removeLastNumber);
        } else if (buttonContainer.firstElementChild.classList.contains("operator")) {
            buttonContainer.firstElementChild.addEventListener('touchend', evaluateOperator);
        } else {
            buttonContainer.firstElementChild.addEventListener('touchend', pickNumber);
        }
    })
} else {
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
}