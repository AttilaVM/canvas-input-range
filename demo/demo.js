var range1 = document.getElementById("range1");
var range2 = document.getElementById("range2");
var range3 = document.getElementById("range3");

function cb(v) {

};

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
      range.init(
        range1,
        cb,
        imgArr[0],
        imgArr[1],
      );

      range.init(
        range2,
        cb,
        imgArr[0],
        imgArr[1],
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
          }
        });

      const changeValue = range.init(
        range3,
        cb,
        imgArr[0],
        imgArr[1],
        {
          doubleClickTimeout: 300
        }
      );
      changeValue(0.4);
    })
    .catch((err) => {
      console.error(err);
    });
