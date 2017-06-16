import React, { Component } from 'react';
import * as d3 from 'd3';

class Axes extends Component {
  constructor(props) {
    super(props);
    this.fontSize = this.props.width > 600 ? "small" : "smaller"
    this.buildXAxis = this.buildXAxis.bind(this);
    this.buildYAxis = this.buildYAxis.bind(this);
  }

  buildXAxis() {
    let xScale = this.props.xScale;
    let domain = xScale.domain();
    let sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    let longerThanSixMonths = (domain[domain.length-1] - domain[0]) > sixMonths;

    var monthFormat = d3.timeFormat("%b");
    var yearFormat = d3.timeFormat("'%y");
    var monthDateFormat = d3.timeFormat("%m/%d");

    // Draw x-axis line
    let path = d3.path();
    let range = xScale.range();
    let length = range[range.length-1] - range[0];
    path.moveTo(0, 3);
    path.lineTo(0, 0);
    path.lineTo(length, 0);
    path.lineTo(length, 3);
    let wide = this.props.width > 500;
    let tall = this.props.height > 430;

    // Generate ticks on x-axis.
    var tickLabel;
    var xTicks = xScale.ticks(wide ? 10 : 3);
    var excessTicks = xTicks.length > 8;

    xTicks = xTicks.map((tick, idx)=>{
      if (longerThanSixMonths) {
        // Month and date as tick label
        tickLabel = (
          <text className="date"
            transform="rotate(-0)"
            x="-10"
            y="0"
            style={{ fontSize: this.fontSize }}>
            <tspan dy={ tall ? "1.4em" : "-1.4em"}>{ monthFormat(tick) }</tspan>
            <tspan x="-0.5em" dy={ "1.4em" }>{ yearFormat(tick) }</tspan>
          </text>
        )
      } else if (excessTicks && idx % 2 === 0) {
        // Skip every other labels if there are more than 8 ticks
        tickLabel = "";
      } else {
        tickLabel = (<text className="date"
                            transform="rotate(-0)"
                            x="-20"
                            y={ tall ? "1.4em" : "-1.4em"}
                            style={{ fontSize: this.fontSize }}>
                            { monthDateFormat(tick) }
                          </text>);
      };

    return (
      <g className='tick'
          key={ tick.toLocaleDateString()}
          transform={`translate(${xScale(tick)},0)`}>
          <line x2='0' y2='5'></line>
          <line className="grid"
                y2={ -this.props.height }></line>
          { tickLabel }
      </g>)
    });


    return (
      <g className="xAxis"
        transform={ `translate(${this.props.x}, ${this.props.y})`}>
        { xTicks }
        <path className="domain" d={ path.toString() }></path>
      </g>);
  }

  buildYAxis() {
    let yScale = this.props.yScale;
    // Generate ticks on y-axis.
    let tall = this.props.height > 430;
    let yTicks = yScale.ticks(tall ? 10 : 4).map((tick)=>{
    return (
      <g className='tick'
          key={ tick.toString() }
          transform={`translate(0, ${yScale(tick)-this.props.y+this.props.yMargin})`}>
          <line x2='-5' y2='5'></line>
          <line className="grid"
                x2={ this.props.width }></line>
          <text
            x={ this.props.xMargin <= 10 ? "10" : "-30"  }
            y="0"
            style={{ fontSize: this.fontSize }}>{ tick }</text>
      </g>)
    })

    // Generate y-axis line
    let path = d3.path();
    let length = yScale.range()[1] - yScale.range()[0];
    path.moveTo(3, 0);
    path.lineTo(0, 0);
    path.lineTo(0, length);
    path.lineTo(3, length);

    return (
      <g className="yAxis"
        transform={ `translate(${this.props.x}, ${this.props.y})`}>
        { yTicks }
        <path className="domain" d={ path.toString() }></path>
      </g>);
  }

  render () {
    let xAxis = this.buildXAxis();
    let yAxis = this.buildYAxis();

    return (
      <g>
        { xAxis }
        { yAxis }
      </g>)
  }
}

export default Axes;
