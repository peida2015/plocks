import React, { Component } from "react";
import * as d3 from "d3";

class Timeline extends Component {
  constructor(props) {
    super(props);

    this.dragHandler = this.dragHandler.bind(this);
    this.scrollInShadebox = this.scrollInShadebox.bind(this);

    this.state={
      dragging: false,
      currDragHandle: null,
      lastTouch: null,
      handle1Pos: 0,
      handle2Pos: this.props.timescale.range()[1],
      lastUpdated: Date.now()
    }
  }

  componentWillReceiveProps(nextProps) {
    let currLength = this.props.timescale.range()[1];
    let nextLength = nextProps.timescale.range()[1];

    if (currLength !== nextLength) {
      this.setState({
        handle1Pos: this.state.handle1Pos / currLength * nextLength,
        handle2Pos: this.state.handle2Pos / currLength * nextLength
      })
    }
  }

  buildTicks(ticks) {
    let scale = this.props.timescale;

    return ticks.map((date, idx)=> {
            var styleProps = {
              borderRight: "1px solid black",
              display: "inline-block",
              minHeight: "10px",
              left: "0px",
              userSelect: "none"
            }

            if (idx === 0) {
              styleProps.width = `${scale(date)}px`;
              return (<span className="tick-mark unselectable"
                            key={ "tick-mark"+date.toLocaleDateString() }
                            style={ styleProps }></span>);
            } else {
              styleProps.width = `${scale(date) - scale(ticks[idx-1])}px`;
              return (<span className="tick-mark unselectable"
                            key={ "tick-mark"+date.toLocaleDateString() }
                            style={ styleProps }></span>);
            }
          });

  }

  buildTickLabels(ticks) {
    let dateFormat = d3.timeFormat("%b '%y");
    let scale = this.props.timescale;

    return ticks.map((date, idx)=> {
          var styleProps = {
            display: "inline-block",
            marginTop: "0px",
            textAlign: "right",
            userSelect: "none"
          }

          if (idx === 0) {
            if (scale(date) < 45) {
              styleProps.minWidth = `45px`;
            } else {
              styleProps.width = `${scale(date)}px`;
              styleProps.marginLeft = "20px";
            }
            return (<span className="tick-label unselectable"
                          key={ "selector"+date.toLocaleDateString() }
                          style={ styleProps }>{ dateFormat(date) }</span>);
          } else {
            styleProps.width = `${scale(date) - scale(ticks[idx-1])}px`;
            return (<span className="tick-label unselectable"
                          key={ "selector"+date.toLocaleDateString() }
                          style={ styleProps }>{ dateFormat(date) }</span>);
          }
        });

  }

  buildHandles(scale) {
    let styleProps = {
      position: "absolute",
      width: "0px",
      height: "0px",
      background: "transparent",
      borderTop: "15px solid black",
      borderBottom: "15px solid transparent",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      top: "0px"
    }

    let shadeboxStyle = {
      position: "absolute",
      height: "27px",
      width: `${ this.state.handle2Pos - this.state.handle1Pos }px`,
      left: `${ this.state.handle1Pos }px`,
      background: "black",
      opacity: "0.4"
    }

    return (
      <div style={{ top: "0px", position: "absolute" }}
            onWheel={ this.scrollInShadebox }>
        <div className="shadebox"
              style={ shadeboxStyle }
              onTouchStart={ this.beginDrag.bind(this) }
              onMouseDown={ this.beginDrag.bind(this) }
              onTouchEnd={ this.endDrag.bind(this) }
              onMouseUp={ this.endDrag.bind(this) }>
        </div>
        <div className="handle"
            style={ {...styleProps,
              left: `${ this.state.handle1Pos - 15}px`,
            }}
            onTouchStart={ this.beginDrag.bind(this) }
            onMouseDown={ this.beginDrag.bind(this) }
            onTouchEnd={ this.endDrag.bind(this) }
            onMouseUp={ this.endDrag.bind(this) }>
        </div>
        <div className="handle"
            style={ {...styleProps,
              left: `${ this.state.handle2Pos - 15}px`,
            }}
            onTouchStart={ this.beginDrag.bind(this) }
            onMouseDown={ this.beginDrag.bind(this) }
            onTouchEnd={ this.endDrag.bind(this) }
            onMouseUp={ this.endDrag.bind(this) }>
        </div>
      </div>);
  }

  beginDrag(evt) {
    evt.target.style.borderColor = "red transparent transparent transparent";
    if (!this.state.dragging) {
      this.setState({ dragging: true,
        currDragHandle: evt.target })
    }
  }

  endDrag(evt) {
    evt.target.style.borderColor = "black transparent transparent transparent";
    this.setState({ dragging: false,
                    currDragHandle: evt.target,
                    lastTouch: null })
  }

  dragHandler(evt) {
    var handles = document.getElementsByClassName('handle');
    var shadebox = document.getElementsByClassName('shadebox');
    var clientRect = evt.target.getBoundingClientRect();
    var xRange = this.props.timescale.range()[1];

    // Reset position only if dragging (with mouseDown)
    if (this.state.dragging && (evt.type === "mousemove" ||
        evt.type === "touchmove" ||
      (evt.clientX > clientRect.right || evt.clientX < clientRect.left))) {

      var newLeftPos, newRightPos;
      if (evt.target === handles[0] &&
            this.state.currDragHandle === handles[0]) {
        if (evt.offsetX) {
          newLeftPos = this.state.handle1Pos + evt.offsetX;
        } else {
          newLeftPos = evt.touches[0].clientX - evt.target.offsetParent.offsetLeft;
        }
        // Put bounds on where handle1 can be
        newLeftPos = Math.max(0, Math.min(newLeftPos, this.state.handle2Pos - 30));

        this.setState({
          handle1Pos: newLeftPos
        });
      } else if (evt.target === handles[1] &&
            this.state.currDragHandle === handles[1]){
        if (evt.offsetX) {
          newRightPos = this.state.handle2Pos + evt.offsetX;
        } else {
          newRightPos = evt.touches[0].clientX - evt.target.offsetParent.offsetLeft;
        }

        // Put bounds on where handle2 can be
        newRightPos = Math.max(this.state.handle1Pos + 30,
                        Math.min(newRightPos, xRange));

        this.setState({
          handle2Pos: newRightPos
        })
      } else if (evt.target === shadebox[0] &&
            this.state.currDragHandle === shadebox[0]) {
          if (evt.movementX) {
            newLeftPos = this.state.handle1Pos + evt.movementX;
            newRightPos = this.state.handle2Pos + evt.movementX;
            if (Math.abs(evt.movementX) > 80) {
              newLeftPos = this.state.handle1Pos + evt.offsetX;
              newRightPos = this.state.handle2Pos + evt.offsetX;
            }
          } else {
            if (!this.state.lastTouch && evt.type === "touchmove") {
              this.setState({
                lastTouch: evt.touches[0].clientX
              })
              // To end the handler
              return null;
            } else {
              let movementX = evt.touches[0].clientX - this.state.lastTouch;
              newLeftPos = this.state.handle1Pos + movementX;
              newRightPos = this.state.handle2Pos + movementX;
              this.setState({
                lastTouch: evt.touches[0].clientX
              })
            }
          }

          if (newLeftPos < 0) {
            this.setState({
              handle1Pos: 0,
              handle2Pos: this.state.handle2Pos - this.state.handle1Pos
            })
          } else if (newRightPos > xRange) {
            this.setState({
              handle1Pos: (xRange - this.state.handle2Pos) +
                                  this.state.handle1Pos,
              handle2Pos: xRange
            })
          } else {
            this.setState({
              handle1Pos: newLeftPos,
              handle2Pos: newRightPos
            })
          }
      }
    }
  }

  scrollInShadebox(evt) {
    let stepFactor = 5;

    var newLeftPos = this.state.handle1Pos + evt.deltaY * stepFactor;

    var newRightPos = this.state.handle2Pos - evt.deltaY * stepFactor;
    if (newRightPos - newLeftPos >= 30) {
      newLeftPos = Math.max(0, Math.min(newLeftPos, this.state.handle2Pos - 30));

      newRightPos = Math.max(this.state.handle1Pos + 30, Math.min(newRightPos, this.props.timescale.range()[1]));

      this.setState({
        handle1Pos: newLeftPos,
        handle2Pos: newRightPos
      })
    } else {
      let midPoint = Math.ceil((this.state.handle1Pos +
                                this.state.handle2Pos)/2);

      this.setState({
        handle1Pos: midPoint-15,
        handle2Pos: midPoint+15
      })
    }
  }


  componentDidUpdate(prevProps, prevState) {
    let handles = document.getElementsByClassName('handle');

    if (this.state.currDragHandle && this.state.dragging) {
      this.state.currDragHandle.addEventListener('touchmove', this.dragHandler);
      this.state.currDragHandle.addEventListener('mousemove', this.dragHandler);
      this.state.currDragHandle.addEventListener('mouseleave', this.dragHandler);
    } else if (prevState.dragging) {
      this.state.currDragHandle.removeEventListener('touchmove', this.dragHandler);
      this.state.currDragHandle.removeEventListener('mousemove', this.dragHandler);
      this.state.currDragHandle.removeEventListener('mouseleave', this.dragHandler);
    }

    var timestamp = Date.now();

    // Update graph if it is "long" since lastUpdated and position has changed
    if (timestamp - this.state.lastUpdated > 300 &&
        (this.state.handle1Pos !== prevState.handle1Pos ||
            this.state.handle2Pos !== prevState.handle2Pos)) {
      this.setState({
        lastUpdated: timestamp
      })

      let date1 = this.props.timescale.invert(this.state.handle1Pos);
      let date2 = this.props.timescale.invert(this.state.handle2Pos);
      this.props.selectDateRange(date1, date2);
    }
  }

  render() {
    var scale = this.props.timescale;
    var length = scale.range()[1];
    var ticks = scale.ticks(length > 500 ? 8 : 3);

    let tickMarks = this.buildTicks.call(this, ticks);
    let tickLabels = this.buildTickLabels.call(this, ticks);
    let handles = this.buildHandles(scale);

    let styleProps = {
      position: "relative",
      left: "0px",
      marginTop: "-15px"
    }

    return (
      <div>
        <div style={ styleProps }>
          { tickMarks }
        </div>
        <div>
          { tickLabels }
        </div>
        <div>
          { handles }
        </div>
      </div>
    )
  }
}

export default Timeline;
