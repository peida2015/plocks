import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory, Link } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import SVG from './SVGContainer';

import './chart.css';

class StockMain extends Component {
  static getStores() {
    return [CurrentUserStore, StockStore]
  }

  static calculateState () {
    return {
      currentUser: CurrentUserStore.getState(),
      rawData: StockStore.getState()
    }
  }

  constructor(props) {
    super(props);

    this.buildCharts.bind(this);
    this.buildAddPanel.bind(this);

    // Default height and width
    this.state = { width: 500, height: 400 }
  }

  componentWillMount() {
    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0) {
      ApiUtils.fetchStockPrices("GOOG");
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentUser.size === 0 || nextState.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    }
  }

  componentDidMount() {
    this.resizeListener = function (evt) {
      let width = document.getElementById('chartBox').clientWidth;
      if (this.state.width !== width) {
        this.setState({ width: width });
      }

      document.getElementById('footer-margin').style.height = document.getElementById('footer').clientHeight+"px";
    }.bind(this);

    window.addEventListener('resize', this.resizeListener);
    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  handleAdd(evt, inputBox) {
    evt.preventDefault();
    let entered = evt.target.firstChild.value;
    if (entered.length > 0) ApiUtils.fetchStockPrices(evt.target.firstChild.value.toUpperCase());
  };

  buildCharts(stockData) {
    var stockCharts = [];
    for (var symbol in stockData) {
      if (typeof symbol === "string") {

        let individualStockData = stockData[symbol].get('filtered') ?
        stockData[symbol].get('filtered') :
        stockData[symbol].get('original');

        let linechart = (
          <div key={ symbol }
            className="one-half column ridge-border"
            id="chartBox">
            <Link to={ `/stock/${symbol}` }>
              <SVG stockData={ individualStockData.toArray() }
                width={ this.state.width }
                height={ this.state.height }
                chartType="candlestick" />
            </Link>
          </div>);

        stockCharts.push(linechart);
      }
    }

    return stockCharts;
}

  buildAddPanel() {
    let inputBox = (<input className={
      window.innerWidth < 550 ? "two-thirds-vw columns" : "eight columns"
    }
                            placeholder="Type Stock Symbol"
                            type="text" />);

    let submitButton = (<input className={
      window.innerWidth < 550 ? "one-thirds-vw  columns button-primary" : "four columns button-primary"
    }
                                type="submit"
                                value="Add" />);

    let addPanel = (
      <div className="row">
        <div className={
            window.innerWidth < 550 ? "twelve columns" :
            "offset-by-three six columns"
          }
          key="addPanel"
          id="chartBox">
          <form onSubmit={ this.handleAdd } >
                { inputBox }
                { submitButton }
          </form>
        </div>
      </div>)

      return addPanel;
  }

  wrapInRows(stockCharts) {
    return stockCharts.reduce((r, chart, idx)=> {
      if (idx % 2 === 0) r.push([]);
      r[r.length-1].push(chart);
      return r;
    }, []).map((pair, idx)=>{
      return (
        <div className="row" key={ idx }>
          { pair }
        </div>);
    });
  }

  render() {
    let stockData = this.state.rawData.toObject();

    let stockCharts = this.buildCharts(stockData);
    let addPanel = this.buildAddPanel();

    // stockCharts.push(addPanel);

    if (stockCharts.length > 1) {
      stockCharts = this.wrapInRows(stockCharts);
    }

    return (
      <div>
        <div className="overwrite-full-width container">
          { stockCharts }
        </div>
        <div id="footer-margin"></div>
        <div className="overwrite-full-width container" id="footer">
          { addPanel }
        </div>
      </div>
    )
  }
}

export default Container.create(StockMain);
