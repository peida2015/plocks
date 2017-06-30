import React, { Component } from 'react';
import { List } from 'immutable';

class EditLayer extends Component {
  constructor() {
    super();

    this.buildLines = this.buildLines.bind(this);
    this.drawLineHandler = this.drawLineHandler.bind(this);
    this.freeDrawingHandler = this.freeDrawingHandler.bind(this);

    this.state = {
      lines: List(),
      freeDrawing: List(),
      lastEdit: List()
    }
  }

  componentDidUpdate() {
    var editDetectArea = document.getElementById("editDetectArea");
    switch (this.props.editControls) {
      case "drawLine":
        editDetectArea.addEventListener("click", this.drawLineHandler);
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

      let points = this.state.lines.toArray().map((line, idx)=>{
        return line.map((point, idx)=>{
          var x = xScale(point.x),
              y = yScale(point.y);

          if (x > 0 && y > 0 && x < width && y < height) {
            return (<circle key={ `${point.x}, ${point.y}`}
              r="3"
              fill="transparent"
              stroke="red"
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

  drawLineHandler(evt) {
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
