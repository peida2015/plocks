import React from 'react';

function SVGStraightLine(props) {
  if (props.pointPair.length === 2) {
    let xScale = props.xScale;
    let yScale = props.yScale;
    let width = props.width;
    let height = props.height;

    let first = props.pointPair[0];
    let second = props.pointPair[1];

    let x1 = xScale(first.x);
    let x2 = xScale(second.x);
    let y1 = yScale(first.y);
    let y2 = yScale(second.y);

    // Calculate slope
    var slope = (y2-y1)/(x2-x1);

    var x3, y3, x4, y4;
    if (x1 === 0 || x1 === width || y1 === 0 || y1 === height) {
      x3 = x1;
      y3 = y1;
    } else {
      x3 = 0;
      y3 = y1 - x1*slope;

      // Check point 3 & fix if out of bound
      if (y3 > height || y3 < 0) {
        y3 = y3 > height ? height : 0;
        x3 = (y3 - y1)/slope + x1;
      }
    }

    if (x2 === 0 || x2 === width || y2 === 0 || y2 === height) {
      x4 = x2;
      y4 = y2;
    } else {
      x4 = props.width;
      y4 = y1 + (x4 - x1) * slope;

      // Check point 4 & fix if out of bound
      if (y4 > height || y4 < 0) {
        y4 = y4 > height ? height : 0;
        x4 = (y4 - y1)/slope + x1;
      }
    }

    return (<line x1={ x3 } y1={ y3 }
                  x2={ x4 } y2={ y4 }
                  stroke="black"
                  strokeDasharray="5" />)

  } else return null
}

export default SVGStraightLine;
