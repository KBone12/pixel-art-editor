"use strict";

class AbstractPenType {
  getColor() {
    return 0x000000;
  }
  setColor(_color) {
  }

  penDown(_pixels, _x, _y) {
  }

  penMove(_pixels, _x, _y) {
  }

  penUp(_pixels, _x, _y) {
  }
}

class FreeCurvePen extends AbstractPenType {
  _color;
  _drawing;
  _penX;
  _penY;

  constructor() {
    super();

    this._color = 0x000000;
    this._drawing = false;
    this._penX = 0;
    this._penY = 0;
  }

  getColor() {
    return this._color;
  }
  setColor(color) {
    this._color = color;
  }

  penDown(_pixels, x, y) {
    this._drawing = true;
    this._penX = x;
    this._penY = y;
  }

  penMove(pixels, x, y) {
    if (this._drawing) {
      pixels[this._penY][this._penX] = this._color;

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
  _color;
  _backupPixels;
  _startX;
  _startY;
  _delta;

  constructor() {
    super();

    this._color = 0x000000;
    this._backupPixels = undefined;
    this._startX = 0;
    this._startY = 0;
    this._delta = 0.25;
  }

  getColor() {
    return this._color;
  }
  setColor(color) {
    this._color = color;
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
        _pixels[parseInt(this._startY)][parseInt(this._startX)] = this._color;
      } else {
        for (let t = 0.0; t <= length; t += this._delta) {
          const currentX = parseInt((length - t) / length * this._startX + t / length * targetX);
          const currentY = parseInt((length - t) / length * this._startY + t / length * targetY);
          _pixels[currentY][currentX] = this._color;
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

  setColor(color) {
    this._penType.setColor(color);
  }

  withGrids(withGrids) {
    this._withGrids = withGrids;
  }

  selectPenType(penType) {
    const currentColor = this._penType.getColor();
    switch (penType) {
      case "free":
        this._penType = new FreeCurvePen();
        break;
      case "straight":
        this._penType = new StraightLinePen();
        break;
    }
    this._penType.setColor(currentColor);
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

const color_palette = document.getElementById("color-palette");
const selected_color_element = document.getElementById("selected-color");
let selected_color = 0x000000;
const colors = [0x000000, 0xff0000, 0x00ff00, 0x0000ff, 0x00ffff, 0xff00ff, 0xffff00, 0xffffff];
colors.map(color => {
  const button = document.createElement("button");
  button.className = "color-palette-element";
  button.style = `background-color: ${"#" + ("000000" + color.toString(16)).slice(-6)};`;
  button.addEventListener("click", _ => {
    if (pixelCanvas) {
      pixelCanvas.setColor(color);
    }
    selected_color = color;
    selected_color_element.style = `background-color: ${"#" + ("000000" + selected_color.toString(16)).slice(-6)};`;
  });
  color_palette.appendChild(button);
});
selected_color_element.style = `background-color: ${"#" + ("000000" + selected_color.toString(16)).slice(-6)};`;

const current_color_element = document.getElementById("current-color");
let current_color = 0x000000;
current_color_element.style = `background-color: #000000`;
document.getElementById("color-chooser").addEventListener("change", event => {
  current_color_element.style = `background-color: ${event.target.value}`;
  current_color = parseInt("0x" + event.target.value.slice(-6), 16);
});
document.getElementById("add-color-button").addEventListener("click", _ => {
  if (!colors.includes(current_color)) {
    colors.push(current_color);
    const button = document.createElement("button");
    button.className = "color-palette-element";
    button.style = `background-color: ${"#" + ("000000" + current_color.toString(16)).slice(-6)};`;
    button.addEventListener("click", _ => {
      if (pixelCanvas) {
        pixelCanvas.setColor(current_color);
      }
      selected_color = current_color;
      selected_color_element.style = `background-color: ${"#" + ("000000" + selected_color.toString(16)).slice(-6)};`;
    });
    color_palette.appendChild(button);
  }
});
document.getElementById("remove-color-button").addEventListener("click", _ => {
  if (colors.length > 1) {
    const index = colors.findIndex(color => color === selected_color);
    colors.splice(index, 1);
    color_palette.removeChild(color_palette.children[index]);
    if (index < colors.length) {
      selected_color = colors[index];
    } else {
      selected_color = colors[0];
    }
    selected_color_element.style = `background-color: ${"#" + ("000000" + selected_color.toString(16)).slice(-6)};`;
  }
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
