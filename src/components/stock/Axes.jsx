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
    var monthFormat = d3.timeFormat("%b");
    var yearFormat = d3.timeFormat("'%y");

    // Draw x-axis line
    let path = d3.path();
    let range = xScale.range();
    let length = range[range.length-1] - range[0];
    path.moveTo(0, 3);
    path.lineTo(0, 0);
    path.lineTo(length, 0);
    path.lineTo(length, 3);
    let wide = this.props.width > 500;
    let tall = this.props.height > 450;


    // Generate ticks on x-axis.
    let xTicks = xScale.ticks(wide ? 10 : 3).map((tick)=>{
    return (
      <g className='tick'
          key={ tick.toLocaleDateString()}
          transform={`translate(${xScale(tick)},0)`}>
          <line x2='0' y2='5'></line>
          <line className="grid"
                y2={ -this.props.height }></line>
          <text className="date"
            transform="rotate(-0)"
            x="-10"
            y="0"
            style={{ fontSize: this.fontSize }}>
              <tspan dy={ tall ? "1.4em" : "-1.4em"}>{ monthFormat(tick) }</tspan>
              <tspan x="-0.5em" dy={ tall ? "1.4em" : "-1.4em"}>{ yearFormat(tick) }</tspan>
          </text>
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
    let wide = this.props.width > 500;
    let tall = this.props.height > 450;

    let yTicks = yScale.ticks(tall ? 10 : 4).map((tick)=>{
    return (
      <g className='tick'
          key={ tick.toString() }
          transform={`translate(0, ${yScale(tick)-this.props.y+this.props.yMargin})`}>
          <line x2='-5' y2='5'></line>
          <line className="grid"
                x2={ this.props.width }></line>
          <text
            transform="rotate(0)"
            x="-30"
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
