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
  const valueMapping = options.valueMapping || NaN;
  const stepMapping = options.stepMapping || NaN;

  let rangeValue = 0;
  let localPos = 0;
  let selected = false;
  let lastClickTime = NaN;
  let offset = 0;

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

  let leftPos;
  let topPos;
  let xScaleRail;
  let yScaleRail;
  let railLength;
  function getSize() {
    const boundingRect = targetElem.getBoundingClientRect();
    leftPos = boundingRect.x;
    topPos = boundingRect.y;

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

  function move(newValue) {
    // Browser wrongfully can trigger a mousemove event just after leaving the targer element so the range value must be clipped.
	  if (newValue > 1)
      newValue = 1;
    else if(newValue < 0)
      newValue = 0;

    rangeValue = newValue;

    if (stepMapping) {
      let stepValue = stepMapping(rangeValue);
      if (stepValue === null)
        return;
      else
        rangeValue = stepValue;
    }

    railTransform();
    drawRail(ctx, railImg, rangeValue);

    knobTransform(rangeValue);
    drawKnob(ctx, knobImg, rangeValue);

    if (valueMapping)
      cb(valueMapping(rangeValue), localPos, targetElem);
    else
      cb(rangeValue, localPos, targetElem);
  }

  function mousemove(e) {
      if (orientation === HORIZONTAL) {
        localPos = e.clientX - leftPos;
        move((localPos - height) / railLength + offset);
      }
      else {
        localPos = e.clientY - topPos;
        move(1 - (localPos - width) / railLength + offset);
      }
    }

    function wheel(e) {
      if (!selected)
        return;

      e.preventDefault();
      console.log(e.deltaY);

      offset += e.deltaY / Math.abs(e.deltaY) / 200;
      console.log(e.clientX);
      mousemove(e);
    }

    function mouseup(e) {
      if (selected && doubleClickTimeout !== doubleClickTimeout)
        return;

	    mousemove(e);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("wheel", wheel);
    };

  function mousedown(e) {

    console.log(e);

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

    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    targetElem.addEventListener("wheel", wheel);

  }
;
  targetElem.addEventListener("mousedown", mousedown);

  targetElem.addEventListener("touchstart", (e) => {
    e.preventDefault();

    function touchmove(e) {
      e.preventDefault();
      if (orientation === HORIZONTAL) {
        localPos = e.changedTouches[0].clientX - leftPos;
        move((localPos - height) / railLength);
      }
      else {
        localPos = e.changedTouches[0].clientY - topPos;
        move(1 - (localPos - width) / railLength);
      }

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

  const ctrl = {
    changeValue: function changeValue(v) {
      move(v);
    },
    selection: function selection(selectChange) {
      if (selectChange === true) {
        selected = selectChange;
        mousedown({clientX: 0, clientY: 0, which: 1, button: 0});
      }
      else if (selectChange === false) {
        selected = selectChange;
        mouseup({clientX: 0, clientY: 0, which: 1, button: 0});
      }
      else {
        console.error(`${selectChange} is not a boolean, required for change selection state`);
      }

    }
  };

  return ctrl;
}
