const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Directory con le immagini
const imagesDir = path.join(__dirname, 'foto'); // Percorso aggiornato

// Tolleranza per il bianco
const tolerance = 10;

// Funzione che verifica se un pixel è bianco con tolleranza
function isWhite(r, g, b, a) {
    return r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance && a === 255;
}

// Funzione per processare l'immagine
async function processImage(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let topBound = 0, bottomBound = canvas.height;
    let leftBound = 0, rightBound = canvas.width;

    // Rileva banda bianca superiore
    for (let y = 0; y < canvas.height; y++) {
        let isRowWhite = true;
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isRowWhite = false;
                break;
            }
        }
        if (!isRowWhite) {
            topBound = y;
            break;
        }
    }

    // Rileva banda bianca inferiore
    for (let y = canvas.height - 1; y >= 0; y--) {
        let isRowWhite = true;
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isRowWhite = false;
                break;
            }
        }
        if (!isRowWhite) {
            bottomBound = y;
            break;
        }
    }

    // Rileva banda bianca sinistra
    for (let x = 0; x < canvas.width; x++) {
        let isColWhite = true;
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isColWhite = false;
                break;
            }
        }
        if (!isColWhite) {
            leftBound = x;
            break;
        }
    }

    // Rileva banda bianca destra
    for (let x = canvas.width - 1; x >= 0; x--) {
        let isColWhite = true;
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            if (!isWhite(data[index], data[index + 1], data[index + 2], data[index + 3])) {
                isColWhite = false;
                break;
            }
        }
        if (!isColWhite) {
            rightBound = x;
            break;
        }
    }

    const croppedWidth = rightBound - leftBound;
    const croppedHeight = bottomBound - topBound;

    // Ritaglia e ridimensiona l'immagine
    const croppedCanvas = createCanvas(croppedWidth, croppedHeight);
    const croppedCtx = croppedCanvas.getContext('2d');
    const croppedData = ctx.getImageData(leftBound, topBound, croppedWidth, croppedHeight);
    croppedCtx.putImageData(croppedData, 0, 0);

    // Ridimensiona l'immagine per riempire l'area originale
    const outputCanvas = createCanvas(img.width, img.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(croppedCanvas, 0, 0, croppedWidth, croppedHeight, 0, 0, img.width, img.height);

    // Salva l'immagine
    const outStream = fs.createWriteStream(filePath);
    const stream = outputCanvas.createPNGStream();
    stream.pipe(outStream);
    outStream.on('finish', () => console.log(`Immagine processata: ${filePath}`));
}

// Legge tutte le immagini dalla cartella e le processa
fs.readdir(imagesDir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const filePath = path.join(imagesDir, file);
        if (path.extname(file).toLowerCase() === '.png' || path.extname(file).toLowerCase() === '.jpg' || path.extname(file).toLowerCase() === '.jpeg') {
            processImage(filePath);
        }
    });
});
