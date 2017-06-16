import React, { Component } from "react";
import * as d3 from "d3";

class Timeline extends Component {
  constructor(props) {
    super(props);

    this.dragHandler = this.dragHandler.bind(this);

    this.state={
      dragging: false,
      currDragHandle: null,
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
    return (
      <div style={{ top: "0px", position: "absolute" }}>
        <div className="handle"
            style={ {...styleProps,
              left: `${ this.state.handle1Pos - 15}px`,
            }}
            onMouseDown={ this.beginDrag.bind(this) }
            onMouseUp={ this.endDrag.bind(this) }>
        </div>
        <div className="handle"
            style={ {...styleProps,
              left: `${ this.state.handle2Pos - 15}px`,
            }}
            onMouseDown={ this.beginDrag.bind(this) }
            onMouseUp={ this.endDrag.bind(this) }>
        </div>
      </div>);
  }

  beginDrag(evt) {
    if (!this.state.dragging) {
      this.setState({ dragging: true,
        currDragHandle: evt.target })
    }
  }

  endDrag(evt) {
    this.setState({ dragging: false,
                    currDragHandle: evt.target })
  }

  dragHandler(evt) {
    // Reset position only if dragging (with mouseDown)
    if(this.state.dragging) {
      let handles = document.getElementsByClassName('handle');

      if (evt.target === handles[0] &&
            this.state.currDragHandle === handles[0]) {
        let newPos = this.state.handle1Pos + evt.offsetX;
        // Put bounds on where handle1 can be
        newPos = Math.max(0, Math.min(newPos, this.state.handle2Pos - 30));

        this.setState({
          handle1Pos: newPos
        });
      } else if (evt.target === handles[1] &&
            this.state.currDragHandle === handles[1]){
        let newPos = this.state.handle2Pos + evt.offsetX;

        // Put bounds on where handle1 can be
        newPos = Math.max(this.state.handle1Pos + 30,
                        Math.min(newPos, this.props.timescale.range()[1]));

        this.setState({
          handle2Pos: newPos
        })
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let handles = document.getElementsByClassName('handle');

    if (handles && this.state.dragging) {
      this.state.currDragHandle.addEventListener('mousemove', this.dragHandler);
      this.state.currDragHandle.addEventListener('mouseleave', this.dragHandler);
    } else if (prevState.dragging) {
      this.state.currDragHandle.removeEventListener('mousemove', this.dragHandler);
      this.state.currDragHandle.addEventListener('mouseleave', this.dragHandler);
    }

    var timestamp = Date.now();

    if (prevState.dragging && timestamp - this.state.lastUpdated > 300) {
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
