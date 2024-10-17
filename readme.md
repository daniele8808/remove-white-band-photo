# Image Processing Utility

Questo progetto è un'utility scritta in **Node.js** per elaborare immagini da una directory (immagini scaricate da replat in particolare), rilevando specifiche caratteristiche come **QR Code**, **sezioni bianche**, **piantine catastali** e **loghi a tutto schermo**. Le immagini che soddisfano uno dei criteri vengono copiate in una cartella di output per ulteriore elaborazione o archiviazione.

## Funzionalità

### 1. Rilevamento sezioni bianche
Il programma verifica se un'immagine contiene sezioni bianche opposte (sia orizzontali che verticali) con una tolleranza configurabile. Se tali sezioni bianche vengono trovate, l'immagine viene selezionata.

### 2. Rilevamento QR Code
Utilizza la libreria **qreader** per identificare QR Code presenti nell'immagine.

### 3. Rilevamento piantine catastali
Il programma verifica se un'immagine ha una percentuale alta di pixel bianchi e un numero ridotto di colori, tipico delle piantine catastali.

### 4. Rilevamento loghi a tutto schermo
Il programma analizza le immagini per verificare se un singolo colore domina più del 50% dell'area, suggerendo la presenza di un logo a tutto schermo.

## Requisiti

Prima di eseguire questo programma, assicurati di avere installato **Node.js** e le seguenti dipendenze:

- **canvas**: Per caricare e manipolare immagini.
- **qreader**: Per il rilevamento dei QR Code.
- **fs**: Per la gestione dei file.

Per installare tutte le dipendenze, esegui:

bash
npm install

## Utilizzo

	1.	Immagini di input:
	•	Posiziona le immagini che vuoi elaborare nella directory foto.
	2.	Esecuzione:
	•	Esegui il programma con il comando: node processImages.js
    3.	Output:
	•	Le immagini che soddisfano uno dei criteri (sezioni bianche, QR Code, piantine catastali o loghi a tutto schermo) verranno copiate nella cartella withWhiteSections.

## Configurazioni

Directory di input

Le immagini devono essere posizionate nella directory foto (può essere configurata nel codice).

Directory di output

Le immagini selezionate verranno copiate nella directory withWhiteSections.

Parametri di configurazione

Puoi personalizzare i seguenti parametri all’interno del codice:

	•	tolerance: Definisce la tolleranza per la rilevazione dei pixel bianchi (default: 10).
	•	minWhiteSectionSize: Definisce la dimensione minima in pixel per una sezione bianca da rilevare (default: 100).

Struttura del Progetto

	•	processImages.js: Il file principale che esegue l’elaborazione delle immagini.
	•	foto/: Directory in cui devono essere posizionate le immagini da elaborare.
	•	withWhiteSections/: Directory in cui verranno copiate le immagini che soddisfano i criteri.

Librerie utilizzate

	•	canvas: Per caricare e disegnare immagini.
	•	qreader: Per il rilevamento dei QR Code.
	•	fs: Per la lettura e scrittura di file.
	•	path: Per la gestione dei percorsi dei file.

## Esempi

Esempio di output in console durante l’esecuzione:
Scaricando immagine example.jpg come example_1.jpg...
Immagine example.jpg copiata in withWhiteSections

## Licenza

Questo progetto è rilasciato sotto la licenza MIT. Sentiti libero di modificarlo e adattarlo alle tue esigenze.

### Istruzioni su come usarlo:

1. Salva questo file come `README.md` nella directory principale del tuo progetto.
2. Aggiungilo al repository GitHub quando archivi il progetto.

Se hai altre domande o vuoi ulteriori modifiche, fammi sapere!