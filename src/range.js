const HORIZONTAL = 0;
const VERTICAL = 1;

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

  let imgSize = railImg.width;

  let orientation;
  let railTransform;
  let knobTransform;

  let xScaleRail;
  let yScaleRail;
  let railLength;
  function getSize() {


	  canvas.width = targetElem.clientWidth;
	  canvas.height = targetElem.clientHeight;

    width = canvas.width;
    height = canvas.height;

    if (width > height) {
      orientation = HORIZONTAL;
      railLength = width - height;

	    xScaleRail = width / imgSize;
      yScaleRail = height / imgSize;
      railTransform = function railTransform() {
        ctx.resetTransform();
        ctx.scale(xScaleRail, yScaleRail);
      };
      railTransform();
      drawRail(ctx, railImg, 0);

      knobTransform = function knobTransform(value) {
        ctx.resetTransform();
        ctx.translate((width - height) * value, 0);
        ctx.scale(yScaleRail, yScaleRail);
      };
      knobTransform();
      drawKnob(ctx, knobImg, 0);
    }
    else {
      orientation = VERTICAL;
      railLength = height - width;

      xScaleRail = width / imgSize;
      yScaleRail = height / imgSize;

      railTransform = function railTransform() {
        ctx.resetTransform();
        ctx.rotate(Math.PI / 2);
        ctx.translate(0, -width);
        ctx.scale(yScaleRail, xScaleRail);
      };
      railTransform();
      drawRail(ctx, railImg, 0);

      knobTransform = function knobTransform(value) {
        ctx.resetTransform();
        ctx.translate(0, height - width - (value) * (height - width));
        ctx.scale(xScaleRail, xScaleRail);
      };
      knobTransform(0);
      drawKnob(ctx, knobImg, 0);
    }
  }

  window.addEventListener("resize", getSize);
  getSize();

  function move(rangeValue) {
    // Browser wrongfully can trigger a mousemove event just after leaving the targer element so the range value must be clipped.
	  if (rangeValue > 1)
      rangeValue = 1;
    else if(rangeValue < 0)
      rangeValue = 0;

    railTransform();
    drawRail(ctx, railImg, rangeValue);

    knobTransform(rangeValue);
    drawKnob(ctx, knobImg, rangeValue);

    cb(rangeValue);
  }

  targetElem.addEventListener("mousedown", (e) => {

    if (e.which !== 1 || "button" in e && e.button !== 0)
      return;

    function mousemove(e) {
      if (orientation === HORIZONTAL)
        move((e.clientX - height) / railLength);
      else
        move(1 - (e.clientY - width) / railLength);
    }

    function mouseup(e) {
	    mousemove(e);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    };


    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

  });

  targetElem.addEventListener("touchstart", (e) => {
    e.preventDefault();

    function touchmove(e) {
      e.preventDefault();
      if (orientation === HORIZONTAL)
        move((e.changedTouches[0].clientX - height) / railLength);
      else
        move(1 - (e.changedTouches[0].clientY - width) / railLength);

      return false;
    }

    function touchend(e) {
      e.preventDefault();
	    touchmove(e);
      window.removeEventListener("touchmove", touchmove);
      window.removeEventListener("touchend", touchend);
      return false;
    };

    window.addEventListener("touchmove", touchmove);
    window.addEventListener("touchend", touchend);
    return false;
  });

  return function changeValue(v) {
    move(v);
  };

}
