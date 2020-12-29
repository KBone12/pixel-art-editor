const canvas = document.getElementsByTagName("canvas")[0];
const pixelWidth = 32;
const pixelHeight = 32;

const scale_label = document.getElementById("scale-label");
const scale_input = document.getElementById("scale-input");
scale_label.innerText = "x" + scale_input.value;
setCanvasSize(canvas, pixelWidth, pixelHeight, parseInt(scale_input.value));
scale_input.addEventListener("input", event => {
  const scale = parseInt(event.target.value);
  scale_label.innerText = "x" + scale;
  setCanvasSize(canvas, pixelWidth, pixelHeight, scale);
  draw(canvas, pixelWidth, pixelHeight);
});

Array.prototype.map.call(document.getElementsByClassName("canvas-wrapper"),
  element => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    const length = width < height ? width : height;
    console.log(width, height);
    const canvases = element.getElementsByTagName("canvas");
    if (canvases.length > 0) {
      const canvas = canvases[0];
      canvas.width = length;
      canvas.height = length;
      console.log(canvas);
    }
  }
);

function renderGrids(canvas, scaleX, scaleY) {
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext("2d");
  context.beginPath();
  for (let x = 0; x <= width; x += scaleX) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += scaleY) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();
}

function setCanvasSize(canvas, pixelWidth, pixelHeight, scale) {
  canvas.width = pixelWidth * scale;
  canvas.height = pixelHeight * scale;
}

function draw(canvas, pixelWidth, pixelHeight) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  renderGrids(canvas, canvasWidth / pixelWidth, canvasHeight / pixelHeight);
}

draw(canvas, pixelWidth, pixelHeight);
