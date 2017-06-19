import React, { Component } from 'react';
import * as d3 from 'd3';

class Linegraph extends Component {
  constructor() {
    super();

    this.state = {
      selectedTradingDay: null,
      pos: { x: null, y: null }
    }
  }

  buildLinegraph() {
    let linegraph = d3.line()
          .x((d)=> { return this.props.xScale(d.tradingDay); })
          .y((d)=> { return this.props.yScale(d.open); });

    return (<path d={ linegraph(this.props.stockData) } />);
  }

  mouseOverListener(evt) {
    let clientRect = evt.target.getBoundingClientRect();

    var tradingDayData = this.props.stockData.find((item)=> {
      return Math.abs(item.tradingDay - this.props.xScale.invert(evt.clientX - clientRect.left)) < 1000 * 60 * 60 *24;
    });

    if (tradingDayData) {
      this.setState({
        selectedTradingDay: tradingDayData,
        pos: {
          x: this.props.xScale(tradingDayData.tradingDay),
          y: this.props.yScale(tradingDayData.open)
        }
      })
    }
  }

  buildTradingDayOverlay() {
    var layOverLines;
    var xRange = this.props.xScale.range();
    var data = this.state.selectedTradingDay;
    var dateFormat = d3.timeFormat('%m/%d/%y');
    let twoSigFig = d3.format("$.2f");

    if (this.state.pos.x && this.state.pos.y) {
      layOverLines = (
        <g>
          <line className="horizontal-layover"
            x2={ xRange[xRange.length-1] }
            y1={ this.state.pos.y }
            y2={ this.state.pos.y }
            stroke="black"/>
          <text className="layover" dx={ xRange[xRange.length-1] }
                dy={ this.state.pos.y }>
                { `${twoSigFig(data.open)}` }
            </text>
          <line className="vertical-layover"
            x1={ this.state.pos.x }
            x2={ this.state.pos.x }
            y1="15"
            y2={ this.props.yScale.range()[0] }
            stroke="black"/>
          <text className="layover" dx={ this.state.pos.x - 25 }
                dy={ 15 }>
            { dateFormat(data.tradingDay) }
          </text>
          <circle cx={ this.state.pos.x }
                  cy={ this.state.pos.y }
                  r="5"
                  fill="none"
                  stroke="blue"/>
        </g>
      )
    } else {
      layOverLines = ""
    }
    return layOverLines;
  }

  render () {
    let linegraph = this.buildLinegraph.apply(this);
    let xRange = this.props.xScale.range();
    let layOverLines = this.buildTradingDayOverlay.apply(this);

    return (
      <g  className="line"
        transform={ `translate(${this.props.xMargin},
          ${this.props.yMargin})` }>
          { linegraph }
          <rect dx="0" dy="0"
                id="mousemoveDetectArea"
                width={ xRange[xRange.length-1] }
                height={ this.props.yScale.range()[0] }
                fill="transparent"
                onMouseMove={ this.mouseOverListener.bind(this) }/>
          { layOverLines }
      </g>)
  }
}

export default Linegraph;
