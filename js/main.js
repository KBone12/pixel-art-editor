"use strict";

class AbstractPenType {
  penDown(_pixels, _x, _y) {
  }

  penMove(_pixels, _x, _y) {
  }

  penUp(_pixels, _x, _y) {
  }
}

class FreeCurvePen extends AbstractPenType {
  _drawing;
  _penX;
  _penY;

  constructor() {
    super();

    this._drawing = false;
    this._penX = 0;
    this._penY = 0;
  }

  penDown(_pixels, x, y) {
    this._drawing = true;
    this._penX = x;
    this._penY = y;
  }

  penMove(pixels, x, y) {
    if (this._drawing) {
      pixels[this._penY][this._penX] = 0x000000;

      this._penX = x;
      this._penY = y;
    }
  }

  penUp(pixels, _x, _y) {
    if (this._drawing) {
      this.penMove(pixels, this._penX, this._penY);
    }
    this._drawing = false;
    this._penX = 0;
    this._penY = 0;
  }
}

class StraightLinePen extends AbstractPenType {
  _backupPixels;
  _startX;
  _startY;
  _delta;

  constructor() {
    super();

    this._backupPixels = undefined;
    this._startX = 0;
    this._startY = 0;
    this._delta = 0.25;
  }

  penDown(pixels, x, y) {
    this._backupPixels = pixels.slice();
    this._startX = x + 0.5;
    this._startY = y + 0.5;
  }

  penMove(_pixels, x, y) {
    if (this._backupPixels) {
      for (let i = 0; i < _pixels.length; ++i) {
        _pixels[i] = this._backupPixels[i].slice();
      }

      const targetX = x + 0.5;
      const targetY = y + 0.5;
      const length = Math.sqrt(Math.pow(targetX - this._startX, 2.0) + Math.pow(targetY - this._startY, 2));

      if (length === 0.0) {
        _pixels[parseInt(this._startY)][parseInt(this._startX)] = 0x000000;
      } else {
        for (let t = 0.0; t <= length; t += this._delta) {
          const currentX = parseInt((length - t) / length * this._startX + t / length * targetX);
          const currentY = parseInt((length - t) / length * this._startY + t / length * targetY);
          _pixels[currentY][currentX] = 0x000000;
        }
      }
    }
  }

  penUp(_pixels, _x, _y) {
    if (this._backupPixels) {
    }
    this._backupPixels = undefined;
  }
}

class PixelCanvas {
  _canvas;
  _scale;
  _width;
  _height;
  _pixels;
  _penType;
  _withGrids;

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
    this._penType = new FreeCurvePen();
    this._withGrids = true;
  }

  saveAsPNG() {
    this.saveToFile("image/png", "image.png");
  }

  saveAsBMP() {
    this.saveToFile("image/bmp", "image.bmp");
  }

  saveToFile(mime, fileName) {
    const originalScale = this._scale;
    const originalWithGrids = this._withGrids;

    this.resize(1.0);
    this._withGrids = false;
    this.render();
    const dummyLink = document.createElement("a");
    dummyLink.href = this._canvas.toDataURL(mime);
    dummyLink.download = fileName;
    dummyLink.click();

    this.resize(originalScale);
    this._withGrids = originalWithGrids;
    this.render();
  }

  resize(scale) {
    this._canvas.width = this._width * scale;
    this._canvas.height = this._height * scale;
    this._scale = scale;
  }

  withGrids(withGrids) {
    this._withGrids = withGrids;
  }

  selectPenType(penType) {
    switch (penType) {
      case "free":
        this._penType = new FreeCurvePen();
        break;
      case "straight":
        this._penType = new StraightLinePen();
        break;
    }
  }

  penDown(canvasX, canvasY) {
    const x = parseInt(canvasX / this._scale);
    const y = parseInt(canvasY / this._scale);
    this._penType.penDown(this._pixels, x, y);
  }

  penMove(canvasX, canvasY) {
    const x = parseInt(canvasX / this._scale);
    const y = parseInt(canvasY / this._scale);
    this._penType.penMove(this._pixels, x, y);
  }

  penUp(canvasX, canvasY) {
    const x = parseInt(canvasX / this._scale);
    const y = parseInt(canvasY / this._scale);
    this._penType.penUp(this._pixels, x, y);
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
    if (this._withGrids) {
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
document.getElementById("with-grids").addEventListener("change", event => {
  if (pixelCanvas) {
    pixelCanvas.withGrids(event.target.checked);
    pixelCanvas.render();
  }
});

document.getElementById("create-new-button").addEventListener("click", _ => {
  if (pixelCanvas) {
    pixelCanvas = undefined;
  }

  const canvas = document.getElementById("canvas");
  pixelCanvas = new PixelCanvas(canvas, 32, 32);
  pixelCanvas.resize(parseInt(scale_input.value));
  pixelCanvas.render();
});

document.getElementById("save-as-png").addEventListener("click", _ => {
  if (pixelCanvas) {
    pixelCanvas.saveAsPNG();
  }
});

document.getElementById("save-as-bmp").addEventListener("click", _ => {
  if (pixelCanvas) {
    pixelCanvas.saveAsBMP();
  }
});

Array.prototype.map.call(document.getElementsByName("pen-type"), element => {
  element.addEventListener("change", event => {
    if (pixelCanvas && event.target.checked) {
      pixelCanvas.selectPenType(event.target.value);
    }
  });
});

const canvas = document.getElementById("canvas");
canvas.addEventListener("mousedown", event => {
  if (pixelCanvas) {
    pixelCanvas.penDown(event.offsetX, event.offsetY);
  }
});
canvas.addEventListener("mouseup", event => {
  if (pixelCanvas) {
    pixelCanvas.penUp(event.offsetX, event.offsetY);
    pixelCanvas.render();
  }
});
canvas.addEventListener("mousemove", event => {
  if (pixelCanvas) {
    pixelCanvas.penMove(event.offsetX, event.offsetY);
    pixelCanvas.render();
  }
});
