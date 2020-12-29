"use strict";

class PixelCanvas {
  _canvas;
  _scale;
  _width;
  _height;
  _pixels;

  constructor(canvas, width, height) {
    this._canvas = canvas;
    this._scale = 1;
    this._width = width;
    this._height = height;
    this._pixels = new Array(this._height);
    for (let i = 0; i < this._height; ++i) {
      this._pixels[i] = new Array(this._width);
      this._pixels[i].fill(0xffffff);
    }
  }

  resize(scale) {
    this._canvas.width = this._width * scale;
    this._canvas.height = this._height * scale;
    this._scale = scale;
  }

  putPixel(canvasX, canvasY) {
    const x = parseInt(canvasX / this._scale);
    const y = parseInt(canvasY / this._scale);
    this._pixels[y][x] = 0x000000;
  }

  render() {
    const context = this._canvas.getContext("2d");
    context.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Render pixels
    for (let i = 0; i < this._height; ++i) {
      for (let j = 0; j < this._width; ++j) {
        context.fillStyle = "#" + ("000000" + this._pixels[i][j].toString(16)).slice(-6);
        context.fillRect(j * this._scale, i * this._scale, this._scale, this._scale);
      }
    }

    // Render grids
    context.beginPath();
    for (let x = 0; x <= this._canvas.width; x += this._scale) {
      context.moveTo(x, 0);
      context.lineTo(x, this._canvas.height);
    }
    for (let y = 0; y <= this._canvas.height; y += this._scale) {
      context.moveTo(0, y);
      context.lineTo(this._canvas.width, y);
    }
    context.stroke();
  }
}

let pixelCanvas = undefined;

const scale_label = document.getElementById("scale-label");
const scale_input = document.getElementById("scale-input");
scale_label.innerText = "x" + scale_input.value;
scale_input.addEventListener("input", event => {
  const scale = parseInt(event.target.value);
  scale_label.innerText = "x" + scale;
  if (pixelCanvas) {
    pixelCanvas.resize(scale);
    pixelCanvas.render();
  }
});

document.getElementById("create-new-button").addEventListener("click", () => {
  if (pixelCanvas) {
    pixelCanvas = undefined;
  }

  const canvas = document.getElementById("canvas");
  pixelCanvas = new PixelCanvas(canvas, 32, 32);
  pixelCanvas.resize(parseInt(scale_input.value));
  pixelCanvas.render();
});

document.getElementById("canvas").addEventListener("click", event => {
  const rect = event.target.getBoundingClientRect();
  const x = parseInt(event.clientX - rect.left);
  const y = parseInt(event.clientY - rect.top);
  if (pixelCanvas) {
    pixelCanvas.putPixel(x, y);
    pixelCanvas.render();
  }
});
