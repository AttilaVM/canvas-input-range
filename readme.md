[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# HTML Canvas range input.

Tiny, fast and easy to use range input based on HTML canvas 2D rendering context with 0 runtime dependency. This project is very young and has not been tested on a wide range of browsers yet.

## Usage

### Steps
1. Install with

``` shell
npm instal --save canvas-input-range
```

Or just load [it](https://cdn.jsdelivr.net/npm/canvas-input-range@0.3.4/dist/range.min.js) from a CDN.

2. Define a container for the range input, which will automatically fill it and adapt to horizontal or vertical orientation using its parent aspect ratio.
3. Define a callback function, which will be invoked on every value change.
4. Load the rail and knob images. Both of them must have uniform scales (they must be drawn inside a square view port) and must have the same size. The rail will be scaled up to fill the parent element, therefore if it is an SVG (recommended) its `preserveAspectRatio` attribute must be set to `"none"`.
5. Call the range.init function after your images are loaded.

### Notes

- This library doesn't ship an image loader function, because one of your dependencies already does, if not, just borrow mine from the example.
- value of the range changes between 0 and 1.

### Example

``` javascript 
// Container element of the range input
var rangeBox = document.getElementById("range-box");
// The element where the input range value will be written
var valueBox = document.getElementById("value-box");

// Simple image loader function which returns a promise
function loadImg(path) {
	const img = document.createElement("img");
  const prom = new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
  img.src = path;
  return prom;
}

// Callback executed on every value change.
function cb(val) {
  valueBox.innerHTML = val
}

// Load rail.svg and knob.svg than init range input
Promise.all([loadImg("rail.svg"), loadImg("knob.svg")])
    .then((imgArr) => {
      range.init(
        rangeBox, // parent element
        cb, // callback
        imgArr[0], // rail image
        imgArr[1], // knob image
      );
});
```

Full [working example](https://canvas-input-range-example.glitch.me) on Glitch.

### Extra features

- Set initial value. When you call range.init it will return a function which can be used to set the value, hence the position of the range.
- You can override the rail and knob repaint events. Please check the example in the demo directory.

## Hints

- Set `user-select` CSS property to `none` for your gui elements in general to prevent users from accidentally selecting them.
- If you have trouble making the rail and knob images, use mine from the glitch example or from the demo directory.

## Milestones

- [ ] Accessibility keyboard control.
