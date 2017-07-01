import React, { Component } from 'react';
import { List } from 'immutable';

class EditLayer extends Component {
  constructor() {
    super();

    this.buildLines = this.buildLines.bind(this);
    this.setPointHandler = this.setPointHandler.bind(this);
    this.freeDrawingHandler = this.freeDrawingHandler.bind(this);
    this.toggleClickedCircle = this.toggleClickedCircle.bind(this);
    this.circleUpdatePosition = this.circleUpdatePosition.bind(this);

    this.state = {
      clickedPointIndex: null,
      lines: List(),
      freeDrawing: List(),
      lastEdit: List()
    }
  }

  componentDidUpdate() {
    var editDetectArea = document.getElementById("editDetectArea");
    switch (this.props.editControls) {
      case "drawLine":
        editDetectArea.addEventListener("click", this.setPointHandler);
        break;

      case "freeDrawing":
        editDetectArea.addEventListener('mousemove', this.freeDrawingHandler);
        break;

      default:
        break;
    }
  }


  buildLines() {
    if (this.state.lines.size > 0) {
      let xScale = this.props.xScale;
      let yScale = this.props.yScale;
      let xRange = xScale.range();
      let width = xRange[xRange.length-1];
      let height = this.props.yScale.range()[0];

      let clickedPoint = this.state.clickedPointIndex;

      var that = this;

      let points = this.state.lines.toArray().map((line, idx1)=> {
        return line.map((point, idx2)=> {
          var x = xScale(point.x),
              y = yScale(point.y);

          let clicked = clickedPoint && clickedPoint[0] === idx1 && clickedPoint[1] === idx2;

          let mousemoveHandler = clicked ? that.circleUpdatePosition : null

          if (x > 0 && y > 0 && x < width && y < height) {
            return (<circle key={ `${point.x}, ${point.y}`}
              r={ clicked ? 5 : 3 }
              fill="transparent"
              stroke="red"
              strokeWidth={ clicked ? 5 : 1}
              data-line-index={ `${idx1},${idx2}` }
              onClick={ that.toggleClickedCircle }
              onMouseMove={ mousemoveHandler }
              cx={ xScale(point.x) }
              cy={ yScale(point.y) }/>)
          } else return null;
        })
      }).reduce((accum, circles)=>{
        if (circles[0]) accum.push(circles[0])
        if (circles[1]) accum.push(circles[1])
        return accum
      }, []);

      return points;
    } else return null
  }

  setPointHandler(evt) {
    // Push each pair of x, y coordinates
    let x = evt.offsetX;
    let y = evt.offsetY;
    let xInverted = this.props.xScale.invert(x);
    let yInverted = this.props.yScale.invert(y);
    var point = {
      x: xInverted,
      y: yInverted
    };

    var currLine = this.state.lines.last();

    if (currLine && currLine.length === 1) {
      let tempLineArr = this.state.lines.pop();
      currLine.push(point);
      this.setState({
        lines: tempLineArr.push(currLine)
      })
    } else {
      currLine = [point]
      this.setState({
        lines: this.state.lines.push(currLine)
      });
    }
  }

  toggleClickedCircle(evt) {
    var targetIdx = evt.target.dataset.lineIndex.split(",")
                        .map(x=>parseInt(x, 10));

    let currentClicked = this.state.clickedPointIndex;

    if (currentClicked &&
        currentClicked[0] === targetIdx[0] &&
        currentClicked[1] === targetIdx[1]) {
      this.setState({ clickedPointIndex: null })
    } else {
      this.setState({ clickedPointIndex: targetIdx })
    }
  }

  circleUpdatePosition(evt) {
    let parentRect = evt.target.parentElement.getBoundingClientRect();

    let x = evt.clientX - parentRect.x;
    let y = evt.clientY - parentRect.y;

    let xInverted = this.props.xScale.invert(x);
    let yInverted = this.props.yScale.invert(y);
    var point = {
      x: xInverted,
      y: yInverted
    };

    let pointIdx = this.state.clickedPointIndex;
    this.setState({
      lines: this.state.lines.update(pointIdx[0],
        (oldPoint) => {
          oldPoint[pointIdx[1]] = point;
          return oldPoint
        })
    })
  }

  freeDrawingHandler(evt) {
    debugger
  }

  render() {
    let lines = this.buildLines();
    let xRange = this.props.xScale.range();

    return (
      <g name="editLayer"
        transform={ `translate(${this.props.xMargin}, ${this.props.yMargin})`}>
        <rect dx="0" dy="0"
              id="editDetectArea"
              name="editDetectArea"
              width={ xRange[xRange.length-1] }
              height={ this.props.yScale.range()[0] }
              fill="transparent"
              />
        { lines }
      </g>)
  }
}

export default EditLayer;
