import React, { Component } from 'react';
import * as d3 from 'd3';

class Linegraph extends Component {

  buildLinegraph() {
    let linegraph = d3.line()
          .x((d)=> { return this.props.xScale(d.tradingDay); })
          .y((d)=> { return this.props.yScale(d.open); });

    return (<path d={ linegraph(this.props.stockData) } />);
  }

  render () {
    let linegraph = this.buildLinegraph.apply(this);

    return (
      <g  className="line"
        transform={ `translate(${this.props.xMargin},
          ${this.props.yMargin})` }>
          { linegraph }
      </g>)
  }
}

export default Linegraph;
