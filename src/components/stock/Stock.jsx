import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory, Link } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import Linegraph from './Linegraph';

import './chart.css';

class Stock extends Component {
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

    this.buildChart.bind(this);

    // Default height and width
    this.state = { width: 1000, height: 400 }
  }

  componentWillMount() {
    let symbol = this.props.params.stock;
    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0 || this.state.rawData.get(symbol).size === 0) {
      ApiUtils.fetchStockPrices(symbol);
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
      let height = document.getElementById('chartBox').clientHeight;
      if (this.state.width !== width) {
        this.setState({
                        width: width,
                        height: height
                      });
      }
    }.bind(this);

    window.addEventListener('resize', this.resizeListener);
    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  buildChart() {
    var symbol = this.props.params.stock;
    if (this.state.rawData.get(symbol)) {
      let stockData = this.state.rawData.get(symbol).get('filtered') ?
      this.state.rawData.get(symbol).get('filtered') :
      this.state.rawData.get(symbol).get('original');

      let chart = (
        <div key={ symbol }
          className="twelve column ridge-border full-height"
          id="chartBox">
          <Linegraph stockData={ stockData.toArray() }
            width={ this.state.width }
            height={ this.state.height } />
        </div>);
        return chart;
    } else {
      return "";
    }
  }

  render () {
    let stockChart = this.buildChart();

    return (
      <div>
        <Link to="/stocks">
          <div className="overwrite-full-width container">
            <div className="row">
              { stockChart }
            </div>
          </div>
        </Link>
      </div>);
  }
}

export default Container.create(Stock);
