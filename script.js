
// Page switching
const pageButtons = document.querySelectorAll('.pageLink');
const pages = document.querySelectorAll('.page');

function getNormalizedRoute(route) {
    const currentRoute = route || '/';
    return currentRoute === '/' || currentRoute === '/minecraft' ? '/minecraft' : '/extra';
}

function updatePageState(route) {
    const normalizedRoute = getNormalizedRoute(route);
    const targetPageId = normalizedRoute === '/minecraft' ? 'minecraftPage' : 'extraPage';

    pageButtons.forEach((button) => {
        const isActive = button.dataset.route === normalizedRoute;
        button.classList.toggle('active', isActive);
    });

    pages.forEach((page) => {
        page.classList.toggle('active', page.id === targetPageId);
    });
}

function showPageFromUrl() {
    if (window.location.protocol === 'file:') {
        const hash = window.location.hash.replace('#', '');
        updatePageState(hash === 'extra' ? '/extra' : '/minecraft');
        return;
    }

    const path = window.location.pathname || '/';
    const route = path.replace(/\/+$/, '') || '/';
    updatePageState(route);
}

function goToRoute(route) {
    const normalizedRoute = getNormalizedRoute(route);

    if (window.location.protocol === 'file:') {
        window.location.hash = normalizedRoute === '/minecraft' ? '#minecraft' : '#extra';
        updatePageState(normalizedRoute);
        return;
    }

    const nextUrl = normalizedRoute === '/minecraft' ? '/' : '/extra';
    window.history.pushState({}, '', nextUrl);
    updatePageState(nextUrl);
}

pageButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        goToRoute(button.dataset.route);
    });
});

window.addEventListener('popstate', showPageFromUrl);
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    updatePageState(hash === 'extra' ? '/extra' : '/minecraft');
});

showPageFromUrl();

// Copy to clipboard

function copyToClipboard(text, where) {
    if (!text) return

    document.getElementById(where).innerHTML = `<p>Click to copy to clipboard: ${text}</p>`;
    document.getElementById(where).onclick = () => {
        navigator.clipboard.writeText(text).then(() => {
            document.getElementById(where).innerHTML = `<p>Copied to clipboard: ${text}</p>`;
        }).catch(err => {
            document.getElementById(where).innerHTML = `<p>Failed to copy to clipboard: ${text}</p>`;
        });
    };
}

// Pluralizer - Also yes, I'm autistic asf

function pluralize(amount, singular) {
    return `${amount} ${amount === 1 ? singular : `${singular}s`}`;
}


// Coords converter

const worldBorderLimit = 29999984;
const inputBorderMessage = "Error. Input must not be bigger than 29,999,984.";
const outputBorderMessage = "Lowered the converted coordinate to the max of 29,999,984, because it would have gone past the world border.";

function submitCoords() {
    const inputField = document.getElementById("coordsInputField");
    const typeSelect = document.getElementById("dimensionSelect");
    const [convertedCoordinates, originalCoordinates] = coordsConverter(inputField.value, typeSelect.value);
    document.getElementById("result1_1").innerHTML = `<p>Coordinates being converted: ${originalCoordinates}</p>`;
    document.getElementById("result1_2").innerHTML = `<p>Converted coordinates: ${convertedCoordinates}</p>`;
    copyToClipboard(convertedCoordinates, "result1_2");
}

function coordsConverter(coordinates, dimension) {
    console.log("")
    
    let numbers = coordinates
        .replace(/[a-zA-Z:]/g, " ")
        .replaceAll(",", " ")
        .split(" ")
        .filter(Boolean)
        .filter(item => !isNaN(Number(item)));
        
    const numbersLength = numbers.length;

    if (numbersLength > 5) return alert(`Error. Found ${numbersLength} coordinates. Input max 5 (only X & Z are needed, Y and Yaw and Pitch is optional).`)
    if (numbersLength === 4) return alert('Error. Found 4 coordinates. How are you getting 4? (only X & Z are needed, Y and Yaw and Pitch is optional).') 
    if (numbersLength < 2) return alert(`Error. Found ${pluralize(numbersLength, "coordinate")}. At least X & Z are needed.`)

    const x = Number(numbers[0]);
    const z = Number(numbers[numbersLength === 2 ? 1 : 2]);

    if (Math.abs(x) > worldBorderLimit || Math.abs(z) > worldBorderLimit) {
        return alert(inputBorderMessage);
    }

    let convertedX;
    let convertedZ;

    if (dimension === "Nether") {
        convertedX = Math.round(x / 8);
        convertedZ = Math.round(z / 8);
    } else if (dimension === "Overworld") {
        convertedX = Math.round(x * 8);
        convertedZ = Math.round(z * 8);
    }

    const outputExceedsBorder = Math.abs(convertedX) > worldBorderLimit || Math.abs(convertedZ) > worldBorderLimit;

    if (outputExceedsBorder) {
        alert(outputBorderMessage);
        convertedX = Math.max(-worldBorderLimit, Math.min(worldBorderLimit, convertedX));
        convertedZ = Math.max(-worldBorderLimit, Math.min(worldBorderLimit, convertedZ));
    }

    return [convertedX + " ~ " + convertedZ, x + " ~ " + z];
}

// Itemcount to Stack converter

function submitItemCount() {
    const inputField = document.getElementById("itemCountInput");
    const stackSizeSelect = document.getElementById("stackSizeSelect");
    const result = itemCountConverter(inputField.value, stackSizeSelect.value);
    copyToClipboard(result, "result3");
}

function itemCountConverter(itemCount, stackSize) {
    const count = Number(itemCount);
    const stack = Number(stackSize);

    if (isNaN(count)) return alert("Error. Please provide a valid number.");
    if (count < 0) return alert("Error. Please provide a positive number.");

    const fullStacks = Math.floor(count / stack);
    const remainder = count % stack;

    const stackText = `${pluralize(fullStacks, "stack")} of ${stack}`;
    const itemText = pluralize(remainder, "item");

    return remainder === 0
        ? stackText
        : fullStacks === 0
            ? itemText
            : `${stackText} and ${itemText}`;
}


// RGB/Hex converter

function updateRgbHexInputField() {
    const select = document.getElementById('colorFormatSelect');
    const input = document.getElementById('colorValuesInputField');
    const button = document.getElementById('colorSubmitButton');

    const hasSelection = Boolean(select.value);
    input.disabled = !hasSelection;
    button.disabled = !hasSelection;

    if (!hasSelection) {
        input.value = '';
        input.placeholder = 'Choose a type first';
        return;
    }

    input.placeholder = select.value === 'Hex'
        ? 'Type your RGB value here'
        : 'Type your Hex value here';
}

function submitColorValues() {
    const inputField = document.getElementById("colorValuesInputField");
    const typeSelect = document.getElementById("colorFormatSelect");
    const result = colorFormatConverter(inputField.value, typeSelect.value);
    copyToClipboard(result, "result2");
}

function colorFormatConverter(input, colorFormat) {
    if (colorFormat === 'Hex') {
        const values = input
            .replace(/[a-zA-Z:]/g, " ")
            .replaceAll(",", " ")
            .split(" ")
            .filter(Boolean)
            .filter(item => !isNaN(Number(item)));

        if (values.length !== 3) {
            return alert(`Error. Requires exactly 3 values. ${values.length} were given.`);
        }

        for (let i = 0; i < values.length; i++) {
            const value = Number(values[i]);
            if (value > 255 || value < 0) {
                return alert(`Error. Values must be between 0-255. Value #${i + 1} was ${value}.`);
            }
        }

        let r = Number(values[0]).toString(16);
        let g = Number(values[1]).toString(16);
        let b = Number(values[2]).toString(16);

        if (r.length === 1) r = "0" + r;
        if (g.length === 1) g = "0" + g;
        if (b.length === 1) b = "0" + b;

        return "#" + r + g + b;
    } else {
        const match = input.match(/#([0-9a-fA-F]{6})/);
        if (!match) {
            return alert("Error. Please provide a valid hex code like #ff8800.");
        }

        const values = match[1];

        const r = parseInt(values.substring(0, 2), 16);
        const g = parseInt(values.substring(2, 4), 16);
        const b = parseInt(values.substring(4, 6), 16);

        if (r > 255) return alert("Error. Value of R is too big. Max ff/255.");
        if (g > 255) return alert("Error. Value of G is too big. Max ff/255.");
        if (b > 255) return alert("Error. Value of B is too big. Max ff/255.");

        return r + ", " + g + ", " + b;
    }
}

// Password generator

const passwordCharacterSets = {
    lowercaseOption: 'abcdefghijklmnopqrstuvwxyz',
    uppercaseOption: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbersOption: '0123456789',
    specialCharactersOption: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
};

function getSelectedPasswordCharacters() {
    return Object.entries(passwordCharacterSets)
        .filter(([optionId]) => document.getElementById(optionId).checked)
        .map(([, characters]) => characters)
        .join('');
}

function getSecureRandomIndex(maximum) {
    const randomValues = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / maximum) * maximum;
    let randomValue;

    do {
        crypto.getRandomValues(randomValues);
        randomValue = randomValues[0];
    } while (randomValue >= limit);

    return randomValue % maximum;
}

function generatePassword() {
    const selectedCharacters = getSelectedPasswordCharacters();
    const length = Number(document.getElementById('passwordLengthInput').value);
    const result = document.getElementById('passwordResult');

    if (!selectedCharacters) {
        result.textContent = 'Choose at least one character type.';
        return;
    }

    if (!Number.isInteger(length) || length < 1) {
        result.textContent = 'Password length must be a positive whole number.';
        return;
    }

    let password = '';
    for (let index = 0; index < length; index += 1) {
        password += selectedCharacters[getSecureRandomIndex(selectedCharacters.length)];
    }

    result.innerHTML = `<p>Generated password: ${password}</p>`;
    result.onclick = () => copyToClipboard(password, 'passwordResult');
}

document.getElementById('passwordGenerateButton').addEventListener('click', generatePassword);

// QR Code generator

const qrFrame = document.getElementById('qrFrame');
const qrButton = document.getElementById('qrSubmit');

function generateQr() {
    qrFrame.style.display = 'none';

    setTimeout(() => {
        qrFrame.style.display = 'block';
    }, 200);
}

qrButton.addEventListener('click', generateQr);
