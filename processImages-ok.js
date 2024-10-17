const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

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

// Funzione per rilevare sezioni bianche e verificare le bande bianche sui lati opposti
async function hasOppositeWhiteSections(filePath) {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let topBound = 0, bottomBound = canvas.height;
    let leftBound = 0, rightBound = canvas.width;

    // Trova bande bianche orizzontali
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

    // Trova bande bianche verticali
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

    // Controlla se ci sono bande bianche sui lati opposti
    if ((topWhiteBandFound && bottomWhiteBandFound) || (leftWhiteBandFound && rightWhiteBandFound)) {
        return true;
    }

    return false;
}

// Funzione per copiare le immagini con sezioni bianche nella nuova destinazione
async function processImages() {
    fs.readdir(imagesDir, async (err, files) => {
        if (err) {
            console.error('Errore nella lettura della cartella:', err);
            return;
        }

        for (const file of files) {
            const filePath = path.join(imagesDir, file);
            const ext = path.extname(file).toLowerCase();

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
                try {
                    if (await hasOppositeWhiteSections(filePath)) {
                        const outputFilePath = path.join(outputDir, file);
                        fs.copyFile(filePath, outputFilePath, (err) => {
                            if (err) {
                                console.error(`Errore nel copiare ${file} a ${outputFilePath}:`, err);
                            } else {
                                console.log(`Immagine con bande bianche sui lati opposti trovata e copiata: ${file}`);
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Errore durante il controllo dell'immagine ${file}:`, error);
                }
            }
        }
    });
}

processImages();
