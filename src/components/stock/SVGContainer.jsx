import React, { Component } from 'react';
import Linegraph from './Linegraph';
import Candlestick from './Candlestick';
import Axes from './Axes';
import EditLayer from './EditLayer';
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

    this.xMargin = this.props.width > 500 ? Math.max(10, Math.min(50, this.props.width/16)) : 5;
    this.yMargin = Math.max(10, Math.min(50, this.props.height/16));

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

    // Determine yAxisLength;
    this.yAxisLength = this.props.height > 500 ?
                    this.props.height - 3 * this.yMargin :
                    this.props.height - 2 * this.yMargin;

    this.yScale = d3.scaleLinear()
      .domain([min, max])
      .range([this.yAxisLength, 0]);
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
      return (<Linegraph { ...merged }
                showLayoverLines={ this.props.showLayoverLines }/>);
    } else {
      return (<Candlestick { ...merged } />);
    }
  }

  render() {
    this.tradingDayConversion();
    this.getXScale();
    this.getYScale();
    let graph = this.buildGraph();
    let stockData = this.props.stockData;
    let change = stockData[stockData.length-1].open - stockData[0].open;
    let pctChange = change/stockData[0].open;
    let symbolPos = this.props.width > 600 ? 0.4 : 0.3;

    var props = {
      xScale: this.xScale,
      yScale: this.yScale,
      x: this.xMargin,
      y: this.props.height - (this.props.height > 500 ? 2*this.yMargin : this.yMargin),
      xMargin: this.xMargin,
      yMargin: this.yMargin,
      height: this.yAxisLength,
      width: this.props.width - 2*this.xMargin
    }


    return (
      <div className="centered-block">
        <svg width={ this.props.width + "px" }
              height={ this.props.height + "px" }>
          <rect x="0" y="0"
                width={ this.props.width }
                height={ this.props.height }
                style={ { fill: "white" } }/>
          <text className={`symbol ${ change >=0 ? "pos" : "neg" }` }
                style={ {
                  transform: `translate(${ symbolPos * this.props.width }px,
                                        ${ this.yMargin }px)`,
                  fontSize: "20px"
                } }>
                <tspan>{ this.props.stockData[0].symbol }</tspan>
                <tspan dx="3em">{ d3.format('+.2%')(pctChange) }</tspan>
          </text>
          <Axes { ...props }/>
          { graph }
          <EditLayer { ...props }
                    editControls={ this.props.editControls }
                    showLayoverLines={ this.props.showLayoverLines }/>
        </svg>
      </div>
    )
  }
}

export default SVG;
