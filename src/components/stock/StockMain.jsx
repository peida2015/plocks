import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import {browserHistory} from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import Linegraph from './Linegraph';

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
  }

  componentWillMount() {
    // Check authentication
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

  handleAdd(evt, inputBox) {
    evt.preventDefault();
    let entered = evt.target.firstChild.value;
    if (entered.length > 0) ApiUtils.fetchStockPrices(evt.target.firstChild.value.toUpperCase());
  };

  componentDidMount() {
  }

  render() {
    let stockData = this.state.rawData.toObject();


    var stockCharts = [];
    for (var symbol in stockData) {
      let individualStockData = stockData[symbol].get('filtered') ?
                                stockData[symbol].get('filtered') :
                                stockData[symbol].get('original');

      let linechart = (
        <div key={ symbol }
              className="one-half column ridge-border">
          <Linegraph stockData={ individualStockData.toArray() }
                    width={ 550 }
                    height={ 400 }/>
        </div>);
      stockCharts.push(linechart);
    }

    let inputBox = (<input className="u-full-width"
            placeholder="Type Stock Symbol"
            type="text" />);

    let addingPanel = (
        <div className="one-half column"
              key="addPanel">
          <form onSubmit={ this.handleAdd } >
          { inputBox }
          <input className="button-primary"
                  type="submit"
                  value="Add"
                  />
          </form>
        </div>)

    stockCharts.push(addingPanel);

    if (stockCharts.length > 1) {
      stockCharts = stockCharts.reduce((r, chart, idx)=> {
        if (idx % 2 === 0) r.push([]);
        r[r.length-1].push(chart);
        return r;
      }, []).map((pair, idx)=>{
        return (
          <div className="row" key={ idx }>
            { pair }
          </div>);
      })
    }

    return (
      <div>
        <div className="overwrite-full-width container">
          { stockCharts }
        </div>
      </div>
    )
  }
}

export default Container.create(StockMain);
