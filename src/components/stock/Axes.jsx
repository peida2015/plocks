import React, { Component } from 'react';
import * as d3 from 'd3';

class Axes extends Component {
  constructor(props) {
    super(props);
    this.buildXAxis = this.buildXAxis.bind(this);
    this.buildYAxis = this.buildYAxis.bind(this);
  }

  buildXAxis() {
    let xScale = this.props.xScale;
    // Generate ticks on x-axis.
    let xTicks = xScale.ticks().map((tick)=>{
    return (
      <g className='tick'
          key={tick.toLocaleDateString()}
          transform={`translate(${xScale(tick)},0)`}>
          <line x2='0' y2='5'></line>
          <text className="date"
            transform="rotate(-90)"
            x="-60"
            y="0">{ tick.toLocaleDateString() }</text>
      </g>)
    });

    // Draw x-axis line
    let path = d3.path();
    let length = xScale.range()[1] - xScale.range()[0];
    path.moveTo(0, 3);
    path.lineTo(0, 0);
    path.lineTo(length, 0);
    path.lineTo(length, 3);

    return (
      <g class="x-axis"
        transform={ `translate(${this.props.x}, ${this.props.y})`}>
        { xTicks }
        <path className="domain" d={ path.toString() }></path>
      </g>);
  }

  buildYAxis() {
    let yScale = this.props.yScale;
    // Generate ticks on y-axis.
    let yTicks = yScale.ticks().map((tick)=>{
    return (
      <g className='tick'
          transform={`translate(0, ${yScale(tick)-this.props.y+this.props.yMargin})`}>
          <line x2='-5' y2='5'></line>
          <text className="date"
            transform="rotate(0)"
            x="-25"
            y="0">{ tick }</text>
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
      <g class="y-axis"
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
