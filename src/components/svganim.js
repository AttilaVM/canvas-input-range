function arrContainsP(array, value) {
  for (let i = 0; i < array.length; i++) {
    let elem = array[i];
    if (elem === value || isNaN(elem) && isNaN(value) && value !== value)
      return true;
  }
  return false;
};

function parseNumbers(str) {
  let inNumperFlag = false;
  let numberBuffer = [];
  let numberArr = [];
	for (var i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    // ASCII codes 48 -> "0", 57 -> "9", 46 -> "."
    if ((charCode >= 48 && charCode <= 57 || charCode === 46)  && i !== str.length - 1) {
      inNumperFlag = true;
      numberBuffer.push(str[i]);
    }
    else if (inNumperFlag === true) {
      if (i !== str.length - 1) {
        inNumperFlag = false;
        numberArr.push(parseFloat(numberBuffer.join("")));
        numberBuffer.length = 0;
      }
      // on strign end
      else {
        numberBuffer.push(str[i]);
        numberArr.push(parseFloat(numberBuffer.join("")));
      }
    }
  }
  return numberArr;
}

function substitueNumbers(str, numberArr) {
	let inNumperFlag = false;
  let strArr = [];
  let numberBuffer = [];
  let numberCount = 0;
  // console.log(str);
	for (var i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    let isNum = charCode >= 48 && charCode <= 57 || charCode === 46;
    if (i === str.length - 1) {
      if (isNum)
        strArr.push(numberArr[numberCount - 1]);
      else {
        if (inNumperFlag === true) {
          strArr.push(numberArr[numberCount - 1]);
          strArr.push(str[i]);
        }
        else {
          strArr.push(str[i]);
        }

      }
    }
    // ASCII codes 48 -> "0", 57 -> "9", 46 -> "."
    else if (isNum) {
      if (inNumperFlag === false) {
        inNumperFlag = true;
        numberCount++;
      }
    }
    else if (inNumperFlag === true) {
        inNumperFlag = false;
        strArr.push(numberArr[numberCount - 1]);
        strArr.push(str[i]);

    }
    else {
      strArr.push(str[i]);
    }
  }
  // console.log(str);
  // console.log(strArr.join(""));
  return strArr.join("");
}

function linear(v1, v2, p) {
  return v1 + (v2 - v1) * p;
}

function scalar(v1, v2, timingFun, p) {
	return timingFun(parseFloat(v1), parseFloat(v2), p);
}

function attributeInterpolation(v1, v2, timingFun, p) {
  const numberArr1 = parseNumbers(v1);
  const numberArr2 = parseNumbers(v2);

  const numberArr = [];
  for (var i = 0; i < numberArr1.length; i++) {
    numberArr[i] = scalar(numberArr1[i], numberArr2[i], timingFun, p);
  }



  const v = substitueNumbers(v1, numberArr);

  return v;
}

function inbetween(targetAttributes, baseLayer, keyFrameArr, timingFun, startKeyFrameId, stopKeyFrameId,  p) {
  const startKeyFrame = keyFrameArr[startKeyFrameId];
  const stopKeyFrame = keyFrameArr[stopKeyFrameId];

  const descendantArr = baseLayer.getElementsByTagName("*");

  for (let j = 0; j < descendantArr.length; j++) {
    let node = descendantArr[j];
    let nodeId = node.getAttribute("id");

    for (var i = 0; i < startKeyFrame.length; i++) {
      let startAttribute = startKeyFrame[i];
      let stopAttribute = stopKeyFrame[i];
      let attributeName = startAttribute[0];
      let attributeTargetId = startAttribute[2];
      let startAttributeValue = startAttribute[1];
      let stopAttributeValue = startAttribute[1];

      if (!node.getAttribute(attributeName) || nodeId !== attributeTargetId)
        continue;

      let interpolatedAttribute = attributeInterpolation(
        startAttribute[1],
        stopAttribute[1],
        timingFun,
        p
      );


      node.setAttribute(attributeName, interpolatedAttribute);
  }

  }
}

export function svganim(targetElem, svg, targetAttributes, interval, layerPattern) {

  let layerArr = [];
  if (layerPattern) {
    const groupArr = svg.getElementsByTagName("g");
    for (let g = 0; g < groupArr.length; g++) {
      let group = groupArr[g];
      let groupId = group.getAttribute("id");
      if (groupId && groupId.indexOf(layerPattern) !== -1) {
        layerArr.push(group);
      }
    }
  }
  else {
    layerArr = svg.getElementsByTagName("g");
  }

  const keyFrameArr = [];
  let baseLayer = [];

  for (let i = 0; i < layerArr.length; i++) {
    let layer = layerArr[i];
    const descendantArr = layer.getElementsByTagName("*");
    let keyFrame = [];

    for (let j = 0; j < descendantArr.length; j++) {
      let node = descendantArr[j];

      for (var k = 0; k < targetAttributes.length; k++) {
        let attributeName = targetAttributes[k];
        let attributeValue = node.getAttribute(attributeName);

        if (!attributeValue)
          continue;

        keyFrame.push([
          attributeName,
          attributeValue,
          node.getAttribute("id")
        ]);

      }
    }
    keyFrameArr.push(keyFrame);
    // Delete every layer except the first one which is the base layer of the animation
    if (i === 0)
      baseLayer = layer;
    else
      layer.parentNode.removeChild(layer);

  }
  targetElem.appendChild(svg);

  let startTime = Date.now();
  let stopTime = startTime + interval;

  if (keyFrameArr.length > 0 && keyFrameArr[0].length > 0) {
  let id =setInterval(() => {
    let animTime = Date.now() - startTime;
    if (animTime < interval) {
      let p = animTime / interval;
      inbetween(targetAttributes, baseLayer, keyFrameArr, linear, 0, 1, p);
    }
    else {
      clearInterval(id);
    }
  }, 20);
  }
  else {
    return;
  }
}
