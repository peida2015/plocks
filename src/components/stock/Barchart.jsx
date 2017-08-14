import React, { Component } from 'react';

class Barchart extends Component {

  render() {
    var bars;

    if (this.props.width < 300 || this.props.height < 300){
      bars = "";
    } else {
      let xScale = this.props.xScale;
      let volScale = this.props.volScale;

      let size = this.props.stockData.length;
      let unitWidth = Math.max(1, Math.min(6, Math.floor(this.props.width/size)));

      bars = this.props.stockData.map((d) => {
        let styleProps = {
          stroke: d.open > d.close ? "darkred" : "forestgreen",
          strokeWidth: `${ unitWidth }px`
        };

        return (
          <line key={ d.tradingDay.toLocaleDateString() }
            x1={ xScale(d.tradingDay) }
            x2={ xScale(d.tradingDay) }
            y1={ volScale.range()[0] }
            y2={ volScale(d.volume) }
            style={ styleProps }
          />)
      })
    }
    return (
      <g className="bars"
          transform={ `translate(${this.props.xMargin}, ${this.props.yMargin})`}>
        { bars }
      </g>)
  }

}

export default Barchart;
