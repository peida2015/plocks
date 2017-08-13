import React, { Component } from 'react';
import * as d3 from 'd3';
import { List } from 'immutable';
import SVGStraightLine from './SVGStraightLine';

class EditLayer extends Component {
  constructor(props) {
    super(props);

    this.buildLines = this.buildLines.bind(this);
    this.setPointHandler = this.setPointHandler.bind(this);
    this.freeDrawingHandler = this.freeDrawingHandler.bind(this);
    this.toggleClickedCircle = this.toggleClickedCircle.bind(this);
    this.circleUpdatePosition = this.circleUpdatePosition.bind(this);
    this.addSketchPoint = this.addSketchPoint.bind(this);
    this.endSketch = this.endSketch.bind(this);
    this.buildFreedrawingSegments = this.buildFreedrawingSegments.bind(this);
    this.eraseLast = this.eraseLast.bind(this);

    this.state = {
      linegraphInstance: d3.line()
                            .x(d => d.x)
                            .y(d=> d.y),
      clickedPointIndex: null,
      lines: List(),
      freeDrawing: List(),
      lastEdit: List()
    }
  }

  componentDidUpdate() {
    var editDetectArea = document.getElementById("editDetectArea");

    // Detach all old listeners before adding new ones.
    editDetectArea.removeEventListener('mousedown', this.freeDrawingHandler);
    editDetectArea.removeEventListener('mouseup', this.endSketch);
    editDetectArea.removeEventListener('touchstart', this.freeDrawingHandler);
    editDetectArea.removeEventListener('touchend', this.endSketch);
    editDetectArea.removeEventListener('click', this.setPointHandler);
    editDetectArea.removeEventListener('mouseout', this.endSketch);

    var eraseButton = document.getElementsByName('erase')[0];
    if (eraseButton) eraseButton.removeEventListener('click', this.eraseLast);

    switch (this.props.editControls) {
      case "drawLine":
        editDetectArea.addEventListener("click", this.setPointHandler);
        break;

      case "freeDrawing":
        editDetectArea.addEventListener('touchstart', this.freeDrawingHandler);
        editDetectArea.addEventListener('touchend', this.endSketch);
        editDetectArea.addEventListener('mousedown', this.freeDrawingHandler);
        editDetectArea.addEventListener('mouseup', this.endSketch);
        editDetectArea.addEventListener('mouseout', this.endSketch);
        break;

      case "erase":
        eraseButton.addEventListener('click', this.eraseLast);
        break;

      case "eraseAll":
        // This will be called until everything is erased.
        this.eraseLast();
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

      let lines = this.state.lines.toArray().map((pointPair, idx1)=> {
        let points = pointPair.map((point, idx2)=> {
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

        let line = (<SVGStraightLine { ...that.props }
          pointPair={ pointPair }/>)
        return (<g key={ `SL-${idx1}` }>
          { points }
          { line }
        </g>)
      })

      return lines;
    } else return null
  }

  buildFreedrawingSegments() {
    var linegraph = this.state.linegraphInstance;

    var segments = this.state.freeDrawing.toArray().map((segment)=> {
      let path = typeof segment === "string" ? segment : linegraph(segment);
      return (<path className="unselectable"
                    key={ `segment-${path}` }
                    d={ path }
                    fill="none"
                    strokeWidth="2"
                    stroke="green"/>)
    });

    return (<g className="free-draw-segments">
      { segments }
    </g>)
  }

  setPointHandler(evt) {
    let secondLine = this.state.lines.get(1);
    if (!secondLine || (secondLine && secondLine.length < 2)) {
      // Push each pair of x, y coordinates
      let x = evt.clientX;
      let y = evt.clientY;
      let editDetectAreaRect = document.getElementById('editDetectArea').getBoundingClientRect();

      let xInverted = this.props.xScale.invert(x - editDetectAreaRect.left);
      let yInverted = this.props.yScale.invert(y - editDetectAreaRect.top);

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
      this.setState({ lastEdit: this.state.lastEdit.push("drawLine") })
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
    // Get boundingClientRect of the editDetectArea
    let editDetectAreaRect = document.getElementById('editDetectArea').getBoundingClientRect();

    let x = evt.clientX - editDetectAreaRect.left;
    let y = evt.clientY - editDetectAreaRect.top;

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
    evt.target.addEventListener('touchmove', this.addSketchPoint);
    evt.target.addEventListener('mousemove', this.addSketchPoint);
  }

  addSketchPoint(evt) {
    evt.preventDefault();
    let editDetectAreaRect = document.getElementById('editDetectArea')
                              .getBoundingClientRect();

    let x = evt.clientX || evt.touches[0].clientX;
    let y = evt.clientY || evt.touches[0].clientY;

    let point = {
      x: x - editDetectAreaRect.left,
      y: y - editDetectAreaRect.top
    }

    if (this.state.freeDrawing.size === 0 || typeof this.state.freeDrawing.last() === "string") {
      this.setState({
        freeDrawing: this.state.freeDrawing.push([point])
      })
    } else {
      let lastIdx = this.state.freeDrawing.size-1;
      this.setState({
        freeDrawing: this.state.freeDrawing
                    .update(lastIdx, arr => arr.concat([point]))
      })
    }
  }

  endSketch(evt) {

    evt.target.removeEventListener('touchmove', this.addSketchPoint);
    evt.target.removeEventListener('mousemove', this.addSketchPoint);

    // Convert segment into path string.
    let lastIdx = this.state.freeDrawing.size - 1;

    if (typeof this.state.freeDrawing.last() !== "string") {
      this.setState({
        freeDrawing: this.state.freeDrawing
            .update(lastIdx, seg => this.state.linegraphInstance(seg)),
        lastEdit: this.state.lastEdit.push("freeDrawing")
      })
    }
  }

  eraseLast(evt) {
    if (this.state.lastEdit.last()) {
      switch (this.state.lastEdit.last()) {
        case "drawLine":
        this.setState({ lines: this.state.lines.pop() })
        break;

        case "freeDrawing":
        this.setState({ freeDrawing: this.state.freeDrawing.pop() })
        break;

        default:
        break;
      }

      this.setState({ lastEdit: this.state.lastEdit.pop() })
    }
  }

  render() {
    let lines = this.buildLines();
    let freeDrawing = this.buildFreedrawingSegments();
    let xRange = this.props.xScale.range();

    return (
      <g name="editLayer"
        transform={ `translate(${this.props.xMargin}, ${this.props.yMargin})`}>
        { freeDrawing }
        <rect dx="0" dy="0"
              id="editDetectArea"
              name="editDetectArea"
              className="unselectable"
              width={ xRange[xRange.length-1] }
              height={ this.props.yScale.range()[0] }
              fill="transparent"
              pointerEvents={ this.props.showLayoverLines ? "none" : "all"}
              />
        { lines }
      </g>)
  }
}

export default EditLayer;
