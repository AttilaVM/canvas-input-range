function getSubElements(subElementIds, svg) {
  const subElements = {};
	for (var i = 0; i < subElementIds.length; i++) {
    let id = subElementIds[i];
    let elem = svg.getElementById(id);

    if (!elem) {
      console.error(`No element found with the ${id}`);
      continue;
    }

    subElements[id] = elem;
  }
  return subElements;
}

function init(svg, opts, subElements) {

  const onMouseDown = opts.onMouseDown;
  const onMouseUp = opts.onMouseUp;
  const onTouchStart = opts.onTouchStart ? opts.onTouchStart : onMouseDown;
  const onTouchEnd = opts.onTouchEnd ? opts.onTouchEnd : onMouseUp;
  const subElementIds = opts.subElementIds;


  function mousedown(e) {
    if (e.which !== 1 || "button" in e && e.button !== 0)
      return;

    console.log("mouse down");
    window.addEventListener("mouseup", mouseup);
	  if (onMouseDown) {
      onMouseDown(e, subElements, svg);
    }
  }

  function mouseup(e) {
    console.log("mouse up");
    window.removeEventListener("mouseup", mouseup);
	  if (onMouseUp) {
        onMouseUp(e, subElements, svg);
    }
  }

  function touchstart(e) {
    e.preventDefault();
    console.log("touch down");
	  window.addEventListener("touchend", touchend);
    if (onTouchStart) {
      onTouchStart(e, subElements, svg);
    }
  }

  function touchend(e) {
    e.preventDefault();
    console.log("touch up");
	  window.removeEventListener("touchend", touchend);
    if (onTouchEnd) {
      onTouchEnd(e, subElements, svg);
    }
  }

	svg.addEventListener("mousedown", mousedown);
	svg.addEventListener("touchstart", touchstart);
}

// API

function connectToButton(svgId, opts = {}) {
  let svgElem;
  if (typeof(svgId) === "string") {
    svgElem = document.getElementById(svgId);

    let subElements;
    if (opts.subElementIds)
      subElements = getSubElements(opts.subElementIds, svgElem);

    if (svgElem instanceof SVGSVGElement || svgElem instanceof SVGGElement)
      return init(svgElem, opts, subElements);
    else
      throw "Given element is not an <svg> or <g> element";
  }
  else{
    throw "The first argument must be a string (id of the SVG elem in the DOM";
  }
}

function attachButton(elem, targetElem, opts = {}) {
  let svgElem;
	if (elem instanceof SVGSVGElement) {
    svgElem = elem;
  }
  else if (elem instanceof SVGGElement) {
    svgElem = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svgElem.appendChild(elem);
  }
  else {
    throw "First argument must be an <svg> or a <g> element";
  }

  let subElements;
  if (opts.subElementIds)
    subElements = getSubElements(opts.subElementIds, svgElem);

  if (opts.preMount) {
    opts.preMount(subElements, svgElem);
  }

  targetElem.appendChild(elem);

  return init(svgElem, opts, subElements);
}

export default {
  connectToButton: connectToButton,
  attachButton: attachButton
};
