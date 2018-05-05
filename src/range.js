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

  const doubleClickTimeout = options.doubleClickTimeout || NaN;

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

  let lastClickTime = NaN;
  let selected = false;
  let offset = 0;
  targetElem.addEventListener("mousedown", (e) => {

    if (e.which !== 1 || "button" in e && e.button !== 0)
      return;

    let time = Date.now();
    if (time - lastClickTime < doubleClickTimeout) {
      if (!selected) {
        selected = true;
      }
      else {
        selected = false;
        offset = 0;
      }

      lastClickTime = NaN;
      console.log(selected);
    }
    else {
      lastClickTime = time;
    }


    function mousemove(e) {
      if (orientation === HORIZONTAL)
        move((e.clientX - height) / railLength + offset);
      else
        move(1 - (e.clientY - width) / railLength + offset);
    }

    function wheel(e) {
      if (!selected)
        return;

      e.preventDefault();
      console.log(e.deltaY);

      offset += e.deltaY / Math.abs(e.deltaY) / 100;
      console.log(e.clientX);
      mousemove(e);
    }

    function mouseup(e) {
      if (selected)
        return;

	    mousemove(e);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("wheel", wheel);
    };


    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    targetElem.addEventListener("wheel", wheel);

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
