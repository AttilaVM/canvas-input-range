function draw(ctx, img, v) {
	ctx.drawImage(img, 0, 0);
}

export function init(
  targetElem,
  cb,
  railImg,
  knobImg,
  options = {}) {
  let width;
  let height;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let drawRail;
  if (options.drawRail)
    drawRail = options.drawRail;
  else
    drawRail = draw;

  let drawKnob;
  if (options.drawKnob)
    drawKnob = options.drawKnob;
  else
    drawKnob = draw;

  targetElem.appendChild(canvas);

  let yScale;
  let xScaleRail;
  let xScaleKnob;

  function getSize() {
	  canvas.width = targetElem.clientWidth;
	  canvas.height = targetElem.clientHeight;

    width = canvas.width;
    height = canvas.height;

    xScaleRail = width / railImg.width;
    yScale = height / railImg.height;

    // ctx.drawImage(railImg, 0, 0);
    ctx.scale(xScaleRail, yScale);
    drawRail(ctx, railImg, 0);
    // ctx.fillStyle = "#000";
    // ctx.fillRect(0, 0, railImg.width, railImg.height);

    ctx.resetTransform();

    xScaleKnob = height / knobImg.width;
    yScale = height / knobImg.height;


    ctx.scale(xScaleKnob, yScale);
    drawKnob(ctx, knobImg, 0);
  }


  window.addEventListener("resize", getSize);
  getSize();

  function move(rangeValue) {
    // Browser wrongfully can trigger a mousemove event just after leaving the targer element so the range value must be clipped.
	  if (rangeValue > 1)
      rangeValue = 1;
    else if(rangeValue < 0)
      rangeValue = 0;

    ctx.resetTransform();

    ctx.scale(xScaleRail, yScale);
    drawRail(ctx, railImg, rangeValue);

    ctx.resetTransform();

    ctx.resetTransform();
    ctx.translate((width - height) * rangeValue, 0);
    ctx.scale(xScaleKnob, yScale);
    drawKnob(ctx, knobImg, rangeValue);

    cb(rangeValue);
  }

  targetElem.addEventListener("mousedown", (e) => {

    function mousemove(e) {
      move(e.clientX / width);
    }

    function mouseup(e) {
	    mousemove(e);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    };


    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

  });

  return function changeValue(v) {
    move(v);
  };

}
