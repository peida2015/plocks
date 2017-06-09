import React, { Component } from 'react';

class Candlestick extends Component {
  buildCandlestick() {
    var stockData = this.props.stockData;
    let xScale = this.props.xScale,
        yScale = this.props.yScale;

    let candleWidth = 3;

    return stockData.map((d)=>{
      return (
        <g className="candlestick"
                key={ d.tradingDay.toLocaleDateString() }
                transform={ `translate(${this.props.xMargin},${this.props.yMargin})` } >

          // Draw sticks
          <line className="sticks"
            x1={ xScale(d.tradingDay) }
            x2={ xScale(d.tradingDay) }
            y1={ yScale(d.high) }
            y2={ yScale(d.low) } />

          // Draw candles
          <rect className={ d.close-d.open >= 0 ? "gain" : "loss" }
                width={ candleWidth }
                height={ Math.abs(yScale(d.open)-yScale(d.close)) }
                x={ xScale(d.tradingDay)-candleWidth/2 }
                y={ yScale(Math.max(d.open, d.close))} />
        </g>)
    })
  }

  render() {
    let candlestick = this.buildCandlestick.apply(this);

    return (
      <g>
        { candlestick }
      </g>);
  }
}

export default Candlestick;
