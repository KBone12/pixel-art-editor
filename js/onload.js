Array.prototype.map.call(document.getElementsByClassName("canvas-wrapper"),
  element => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    console.log(width, height);
    const canvases = element.getElementsByTagName("canvas");
    if (canvases.length > 0) {
      const canvas = canvases[0];
      canvas.width = width;
      canvas.height = height;
      console.log(canvas);
    }
  }
);
