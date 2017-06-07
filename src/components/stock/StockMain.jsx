import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import {browserHistory} from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import Linegraph from './Linegraph';


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
    this.signOut = this.signOut.bind(this);
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

  signOut() {
    this.state.firebase.get("auth").signOut();
  };

  componentDidMount() {
  }

  render() {
    let stockData = this.state.rawData.toObject();


    let stockCharts = [];
    for (var symbol in stockData) {
      let individualStockData = stockData[symbol].get('filtered') ?
                                stockData[symbol].get('filtered') :
                                stockData[symbol].get('original');

      let linechart = (
        <div id={ symbol }>
          <Linegraph stockData={ individualStockData.toArray() }
                      width={ 550 }
                      height={ 400 }/>
        </div>);
      stockCharts.push(linechart);
    }

    return (
      <div>
        <div className="content-top-margin">StockMain Here</div>
        <button onClick={this.signOut.bind(this)}>Sign Out</button>
        { stockCharts }
      </div>
    )
  }
}

export default Container.create(StockMain);
