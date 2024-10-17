const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const QRReader = require('qreader');

// Directory con le immagini
const imagesDir = path.join(__dirname, 'foto');
const outputDir = path.join(__dirname, 'withWhiteSections'); // Cartella per immagini con sezioni bianche

// Crea la directory di output se non esiste
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Tolleranza per il bianco
const tolerance = 10;
const minWhiteSectionSize = 100; // Dimensione minima in pixel di una sezione bianca da rilevare

// Funzione che verifica se un pixel è bianco con tolleranza
function isWhite(r, g, b, a) {
    return r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance && a === 255;
}

// Funzione per verificare se una sezione è completamente bianca
function isCompletelyWhiteSection(x, y, width, height, data, canvasWidth) {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const index = ((y + i) * canvasWidth + (x + j)) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                return false;
            }
        }
    }
    return true;
}

// Funzione per rilevare bande bianche e verificare le bande bianche sui lati opposti
async function hasOppositeWhiteSections(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let topBound = 0, bottomBound = canvas.height;
    let leftBound = 0, rightBound = canvas.width;

    let topWhiteBandFound = false;
    let bottomWhiteBandFound = false;

    // Cerca bande bianche orizzontali in alto
    for (let y = 0; y < canvas.height; y++) {
        let isRowWhite = true;
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isRowWhite = false;
                break;
            }
        }
        if (isRowWhite) {
            if (y < minWhiteSectionSize) continue;
            topBound = y;
            topWhiteBandFound = true;
            break;
        }
    }

    // Cerca bande bianche orizzontali in basso
    for (let y = canvas.height - 1; y >= 0; y--) {
        let isRowWhite = true;
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isRowWhite = false;
                break;
            }
        }
        if (isRowWhite) {
            if (canvas.height - y < minWhiteSectionSize) continue;
            bottomBound = y;
            bottomWhiteBandFound = true;
            break;
        }
    }

    let leftWhiteBandFound = false;
    let rightWhiteBandFound = false;

    // Cerca bande bianche verticali a sinistra
    for (let x = 0; x < canvas.width; x++) {
        let isColWhite = true;
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isColWhite = false;
                break;
            }
        }
        if (isColWhite) {
            if (x < minWhiteSectionSize) continue;
            leftBound = x;
            leftWhiteBandFound = true;
            break;
        }
    }

    // Cerca bande bianche verticali a destra
    for (let x = canvas.width - 1; x >= 0; x--) {
        let isColWhite = true;
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isColWhite = false;
                break;
            }
        }
        if (isColWhite) {
            if (canvas.width - x < minWhiteSectionSize) continue;
            rightBound = x;
            rightWhiteBandFound = true;
            break;
        }
    }

    return (topWhiteBandFound && bottomWhiteBandFound) || (leftWhiteBandFound && rightWhiteBandFound);
}

// Funzione per rilevare QR code
async function containsQRCode(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = new QRReader();
    const decoded = qr.decode(imageData.data, canvas.width, canvas.height);

    return decoded !== null;
}

// Funzione per rilevare piantine catastali
async function containsTaxMap(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Controlla il bianco dominante e il numero di colori
    let whitePixelCount = 0;
    const uniqueColors = new Set();
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (isWhite(r, g, b, a)) {
            whitePixelCount++;
        } else {
            uniqueColors.add(`${r},${g},${b}`);
        }
    }

    // Percentuale di pixel bianchi e pochi colori
    const whitePixelPercentage = (whitePixelCount / (canvas.width * canvas.height)) * 100;
    const colorCount = uniqueColors.size;

    return whitePixelPercentage > 80 && colorCount < 10;
}

// Funzione per rilevare loghi a tutto schermo
async function containsFullScreenLogo(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Controlla se c'è un colore dominante
    const colorCount = {};
    for (let i = 0; i < data.length;
    // Controlla se c'è un colore dominante
    const colorCount = {};
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const colorKey = `${r},${g},${b}`;

        if (!colorCount[colorKey]) {
            colorCount[colorKey] = 0;
        }
        colorCount[colorKey]++;
    }

    // Trova il colore dominante
    const maxColorCount = Math.max(...Object.values(colorCount));
    const dominantColor = Object.keys(colorCount).find(key => colorCount[key] === maxColorCount);

    // Verifica se il colore dominante occupa più del 50% dell'immagine
    const dominantColorPercentage = (maxColorCount / (canvas.width * canvas.height)) * 100;
    return dominantColorPercentage > 50;
}

// Funzione principale per elaborare le immagini
async function processImages() {
    const files = fs.readdirSync(imagesDir);

    for (const file of files) {
        const filePath = path.join(imagesDir, file);
        const isWhiteSection = await hasOppositeWhiteSections(filePath);
        const hasQRCode = await containsQRCode(filePath);
        const hasTaxMap = await containsTaxMap(filePath);
        const hasLogo = await containsFullScreenLogo(filePath);

        if (isWhiteSection || hasQRCode || hasTaxMap || hasLogo) {
            fs.copyFileSync(filePath, path.join(outputDir, file));
            console.log(`Immagine ${file} copiata in ${outputDir}`);
        }
    }
}

// Esegui la funzione principale
processImages().catch(error => console.error('Errore durante l\'elaborazione delle immagini:', error));
