// Canvas and context setup
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const colorPicker = document.getElementById('colorPicker');
const canvasColorPicker = document.getElementById('canvasColorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const opacityInput = document.getElementById('opacity');
const penButton = document.getElementById('pen_mode_btn');
const brushButton = document.getElementById('brush_btn'); 
const eraserButton = document.getElementById('eraser_mode_btn');
const resetButton = document.getElementById('reset_btn');
const downloadButton = document.getElementById('download_btn');
const notesTextarea = document.querySelector('.notes');

// Drawing state variables
let isDrawing = false;
let color = '#000000';
let canvasColor = '#FFFFFF';
let lineWidth = Math.ceil(lineWidthInput.max * 0.1); // Default to 10% of max value
let opacity = 1.0;
let lastX = 0;
let lastY = 0;
let allLines = [];

// Set initial value of line width
lineWidthInput.value = lineWidth;

// Load notes and canvas bg from localstorage
window.addEventListener('load', () => {
    const savedNotes = localStorage.getItem('savedNotes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }

    const savedCanvasData = localStorage.getItem('allLines');
    if (savedCanvasData) {
        allLines = JSON.parse(savedCanvasData);
    }

    const savedCanvasColor = localStorage.getItem('canvasColor');
    if (savedCanvasColor) {
        canvasColor = savedCanvasColor;
        canvasColorPicker.value = savedCanvasColor;
    }

    fillCanvasBackground(); // Redraw canvas background color
    redrawCanvas(); // Redraw the entire canvas including all lines
});

// Save notes to localstorage whenever the textarea content changes
notesTextarea.addEventListener('input', () => {
    localStorage.setItem('savedNotes', notesTextarea.value);
});

// Save drawing data and canvas background color to localstorage
function saveDrawingData() {
    localStorage.setItem('allLines', JSON.stringify(allLines));
    localStorage.setItem('canvasColor', canvasColor);
}

// Event listeners for drawing functionality
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Event listeners for UI controls
colorPicker.addEventListener('input', updatePenColor);
canvasColorPicker.addEventListener('input', updateCanvasColor);
lineWidthInput.addEventListener('input', updateLineWidth);
opacityInput.addEventListener('input', updateOpacity);
penButton.addEventListener('click', setPenMode);
brushButton.addEventListener('click', setBrushMode); 
eraserButton.addEventListener('click', setEraserMode);
resetButton.addEventListener('click', resetCanvas);
downloadButton.addEventListener('click', downloadCanvas);

// Function to start drawing on mouse down
function startDrawing(e) {
    isDrawing = true;
    allLines.push({
        color: color,
        lineWidth: lineWidth,
        opacity: opacity,
        points: [[e.offsetX, e.offsetY]]
    });
    //[lastX, lastY] = [e.offsetX, e.offsetY];
    saveDrawingData();
}

// Function to draw a line on mouse move
function drawLine(e) {
    if (!isDrawing) return;

    let currentLine = allLines[allLines.length - 1];
    currentLine.points.push([e.offsetX, e.offsetY]);

    redrawCanvas(); // Redraw the entire canvas including background and lines
}

// Function to redraw the entire canvas (bg and all lines)
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillCanvasBackground(); // Fill canvas with background color

    allLines.forEach(line => {
        ctx.lineWidth = line.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = line.opacity; // Set line opacity

        ctx.beginPath();
        ctx.moveTo(line.points[0][0], line.points[0][1]);

        for (let i = 1; i < line.points.length; i++) {
            ctx.lineTo(line.points[i][0], line.points[i][1]);
        }

        ctx.strokeStyle = line.color;
        ctx.stroke();
    });

    // Reset globalAlpha to 1.0 after drawing lines
    ctx.globalAlpha = 1.0;
}

// Function to fill the canvas with background color
function fillCanvasBackground() {
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to stop drawing on mouse up or mouse out
function stopDrawing() {
    isDrawing = false;
    saveDrawingData();
}

// Function to update pen color based on color picker
function updatePenColor() {
    color = colorPicker.value;
}

// Function to update canvas background color and reset canvas
function updateCanvasColor() {
    canvasColor = canvasColorPicker.value;
    fillCanvasBackground(); // Redraw canvas with new background color
    resetCanvas(); // Clear all lines and reset canvas completely
    saveDrawingData(); // Save the new canvas background color to localStorage
}

// Function to update line width based on input slider
function updateLineWidth() {
    lineWidth = lineWidthInput.value;
}

// Function to update line opacity based on input slider
function updateOpacity() {
    opacity = opacityInput.value;
}

// Function to set pen mode (high opacity, small line width)
function setPenMode() {
    opacityInput.value = 1.0;
    opacity = 1.0;
    lineWidthInput.value = Math.ceil(lineWidthInput.max * 0.1);
    color = "#000000";
    colorPicker.value = "#000000";
    updatePenColor();
    updateLineWidth();
}

// Function to set brush mode (medium opacity, medium line width)
function setBrushMode() {
    opacityInput.value = 0.8;
    opacity = 0.8;
    lineWidthInput.value = Math.ceil(lineWidthInput.max * 0.8);
    color = "#000000";
    colorPicker.value = "#000000";
    updatePenColor();
    updateLineWidth();
}

// Function to set eraser mode (high opacity, medium line width, canvas color)
function setEraserMode() {
    opacityInput.value = 1.0;
    opacity = 1.0;
    lineWidthInput.value = Math.ceil(lineWidthInput.max * 0.75);
    updateLineWidth();
    
    // Temporarily set pen color to canvas color
    color = canvasColorPicker.value;
    colorPicker.value = canvasColorPicker.value;
    updatePenColor();
}

// Function to reset canvas (clear all lines and reset background)
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillCanvasBackground();
    allLines = [];
    saveDrawingData();
}

// Function to download canvas as image (excluding)
function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'myImage.png';
    link.href = canvas.toDataURL();
    link.click();
}
