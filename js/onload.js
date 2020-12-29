const canvas = document.getElementsByTagName("canvas")[0];
const pixelWidth = 32;
const pixelHeight = 32;
const pixels = new Array(pixelHeight);
for (let i = 0; i < pixelHeight; ++i) {
  pixels[i] = new Array(pixelWidth);
  pixels[i].fill(0xff00ff);
}

const scale_label = document.getElementById("scale-label");
const scale_input = document.getElementById("scale-input");
scale_label.innerText = "x" + scale_input.value;
setCanvasSize(canvas, pixelWidth, pixelHeight, parseInt(scale_input.value));
scale_input.addEventListener("input", event => {
  const scale = parseInt(event.target.value);
  scale_label.innerText = "x" + scale;
  setCanvasSize(canvas, pixelWidth, pixelHeight, scale);
  draw(canvas, pixelWidth, pixelHeight, pixels);
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

canvas.addEventListener("click", event => {
  const width = event.target.width;
  const height = event.target.height;
  const rect = event.target.getBoundingClientRect();
  const x = parseInt((event.clientX - rect.left) / (width / pixelWidth));
  const y = parseInt((event.clientY - rect.top) / (height / pixelHeight));
  pixels[y][x] = 0x000000;
  draw(event.target, pixelWidth, pixelHeight, pixels);
});

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

function draw(canvas, pixelWidth, pixelHeight, pixels) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const scaleX = canvasWidth / pixelWidth;
  const scaleY = canvasHeight / pixelHeight;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < pixelHeight; ++i) {
    for (let j = 0; j < pixelWidth; ++j) {
      context.fillStyle = "#" + ("000000" + pixels[i][j].toString(16)).slice(-6);
      context.fillRect(j * scaleX, i * scaleY, scaleX, scaleY);
    }
  }

  renderGrids(canvas, scaleX, scaleY);
}

draw(canvas, pixelWidth, pixelHeight, pixels);
