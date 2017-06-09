import React, { Component } from 'react';
import Linegraph from './Linegraph';
import Candlestick from './Candlestick';
import Axes from './Axes';
import * as d3 from 'd3';

class SVG extends Component {
  constructor(props) {
    super();

    this.tradingDayConversion = this.tradingDayConversion.bind(this);
    this.getXScale = this.getXScale.bind(this);
    this.getYScale = this.getYScale.bind(this);
    this.buildGraph = this.buildGraph.bind(this);
  }

  tradingDayConversion() {
    // Do conversion only for the first time
    if (typeof this.props.stockData[0].tradingDay === "string") {
      var parser = d3.timeParse("%Y-%m-%d");

      this.props.stockData.forEach(function (d) {
        return d.tradingDay = parser(d.tradingDay);
      });
    }
  }

  getXScale() {
    var stockData = this.props.stockData;

    this.xMargin = Math.max(20, Math.min(50, this.props.width/16));
    this.yMargin = Math.max(20, Math.min(50, this.props.height/16));

    var domain = [],
        range = [],
        dataCount = stockData.length,
        unitLength = (this.props.width-2*this.xMargin)/dataCount;

    // Use only the days in tradingDay's for a scale
    for (var i = 0; i < dataCount; i++) {
      domain.push(stockData[i].tradingDay);
      range.push(i*unitLength);
    };

    // Create axis from scaleTime with preset domain and range;
    this.xScale = d3.scaleTime()
      .domain(domain)
      .range(range);
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

  buildGraph() {
    var extraProps = {
      xScale: this.xScale,
      yScale: this.yScale,
      xMargin: this.xMargin,
      yMargin: this.yMargin
    };

    var merged = { ...this.props, ...extraProps };
    if (this.props.chartType === "linegraph") {
      return (<Linegraph { ...merged } />);
    } else {
      return (<Candlestick { ...merged } />);
    }
  }

  render() {
    this.tradingDayConversion();
    this.getXScale();
    this.getYScale();
    let graph = this.buildGraph();

    return (
      <div className="centered-block">
        <svg width={ this.props.width }
              height={ this.props.height }>
          <text className="symbol"
                transform={`translate(${ this.props.width/2 },
                                      ${ this.yMargin })`}>
                { this.props.stockData[0].symbol }
          </text>
          <Axes xScale={ this.xScale }
                yScale={ this.yScale }
                x={ this.xMargin }
                y={ this.props.height - 3*this.yMargin }
                xMargin={ this.xMargin }
                yMargin={ this.yMargin }
                height={ this.props.height - 4*this.yMargin }
                width={ this.props.width - 2*this.xMargin }/>
          { graph }
        </svg>
      </div>
    )
  }
}

export default SVG;
