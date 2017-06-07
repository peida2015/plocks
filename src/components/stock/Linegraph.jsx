import React, { Component } from 'react';
import { Container } from 'flux/utils';
import Axes from './Axes';
import * as d3 from 'd3';

class Linegraph extends Component {
  constructor(props) {
    super(props);

    this.tradingDayConversion = this.tradingDayConversion.bind(this);
    this.getXScale = this.getXScale.bind(this);
    this.getYScale = this.getYScale.bind(this);
  }

  tradingDayConversion() {
    var parser = d3.timeParse("%Y-%m-%d");

    this.props.stockData.forEach(function (d) {
      return d.tradingDay = parser(d.tradingDay);
    });
  }

  getXScale() {
    var startDate = this.props.stockData[0].tradingDay;
    var endDate = this.props.stockData[this.props.stockData.length-1].tradingDay;

    this.xMargin = Math.max(20, Math.min(50, this.props.width/16));
    this.yMargin = Math.max(20, Math.min(50, this.props.height/16));

    this.xScale = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, this.props.width - 2*this.xMargin]);
  }

  getYScale() {
    var max = -Infinity;
    var min = Infinity;

    for (var idx = 0; idx < this.props.stockData.length; idx++) {
      if (this.props.stockData[idx].high > max) {
          max = this.props.stockData[idx].high;
      };
      if (this.props.stockData[idx].low < min) {
          min = this.props.stockData[idx].low;
      };
    }

    this.yScale = d3.scaleLinear()
      .domain([min, max])
      .range([this.props.height - 4*this.yMargin, 0]);
  }

  render () {
    this.tradingDayConversion();
    this.getXScale();
    this.getYScale();

    return (
      <div>
        <svg width={ this.props.width }
              height={ this.props.height }>

          <Axes xScale={ this.xScale }
                yScale={ this.yScale }
                x={ this.xMargin }
                y={ this.props.height - 3*this.yMargin}
                yMargin={ this.yMargin } />
        </svg>
      </div>)
  }
}

export default Linegraph;
