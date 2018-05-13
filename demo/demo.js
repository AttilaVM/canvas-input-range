var range1 = document.getElementById("range1");
var range2 = document.getElementById("range2");
var range3 = document.getElementById("range3");
var rangeH = document.getElementById("range-h");
var rangeV = document.getElementById("range-v");

function cb(value, clientPos, targetElem) {
  targetElem.nextSibling.innerHTML = value;
};

function isPrime(num) {
  if (num < 2)
    return false;

	for (var i = 2; i <= num / 2; i++) {
    if (num % i === 0)
      return false;
  }
  return true;
}

function loadImg(path) {
	const img = document.createElement("img");
  const prom = new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
  img.src = path;
  return prom;
}

Promise.all([loadImg("rail.svg"), loadImg("knob.svg")])
  .then((imgArr) => {
    const railSvg = imgArr[0];
    const knobSvg = imgArr[1];
    range.init(
      range1,
      cb,
      railSvg,
      knobSvg,
    );

    range.init(
      range2,
      cb,
      railSvg,
      knobSvg,
      {
        doubleClickTimeout: 300,
        drawRail: function (ctx, img, v) {
	        ctx.drawImage(img, 0, 0);
          ctx.globalCompositeOperation = "lighter";
          const lightness = parseInt(v * 255 / 3);
          ctx.fillStyle = `rgb(${lightness}, ${lightness},${lightness})`;
          ctx.fillRect(0, 0, img.width, img.height);
          ctx.globalCompositeOperation = "source-over";
        },
        drawKnob: function (ctx, img, v) {
	        ctx.drawImage(img, 0, 0);
          ctx.globalCompositeOperation = "lighter";
          const lightness = parseInt(v * 255 / 3);
          ctx.fillStyle = `rgb(${lightness}, ${lightness},${lightness})`;
          ctx.fillRect(0, 0, img.width, img.height);
          ctx.globalCompositeOperation = "source-over";
        },
        valueMapping: function (v) {
	        return Math.round(10 + v * 100);
        },
        stepMapping: function (value) {
	        value = Math.round(10 + value * 100);
          if (isPrime(value))
            return (value - 10) / 100;
          else
            return null;
        }
      });

    const ctrl = range.init(
      range3,
      cb,
      railSvg,
      knobSvg,
      {
        doubleClickTimeout: 300,
        valueMapping: function (value) {
	        return Math.pow(2, parseInt(value * 10));
        },
        stepMapping: function (value) {
	        return Math.round(value * 10) / 10;
        }
      }
    );
    ctrl.changeValue(0.4);

    const ctrlH = range.init(
      rangeH,
      cb,
      railSvg,
      knobSvg,
    );

    const ctrlV = range.init(
      rangeV,
      cb,
      railSvg,
      knobSvg,
    );

    function loadSvg(url) {
      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          const content = xhr.responseXML.documentElement;
          resolve(content);
        };
        xhr.onerror = () => reject(xhr.statusText);
      });
      xhr.open("GET", url);
      xhr.send();
      return promise;
    }

    loadSvg("https://rawgit.com/AttilaVM/465959c9d5a2ed9261fbee3c2333dabc/raw/0b20a90c132cb45d85191ca5004ddbe704e6f619/chain.svg")
      .then((svg) => {
        const chainBox = document.getElementById("chain");
        const joinedIcon = svg.getElementById("joined");
        const disjunctIcon = svg.getElementById("disjunct");

        joinedIcon.classList.add("hide");
        chainBox.appendChild(svg);

        let state = 0;
        svg.addEventListener("mouseup", function () {
	        if (state === 0) {
               state = 1;
               joinedIcon.classList.remove("hide");
               disjunctIcon.classList.add("hide");
               ctrlH.selection(true);
               ctrlV.selection(true);
             }
             else {
               state = 0;
               disjunctIcon.classList.remove("hide");
               joinedIcon.classList.add("hide");
               ctrlH.selection(false);
               ctrlV.selection(false);
             }
        });
      });

  })
  .catch((err) => {
    console.error(err);
  });
