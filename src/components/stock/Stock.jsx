import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory, Link } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import SVG from './SVGContainer';
import { Button, Navbar, Nav, NavItem, InputGroup } from 'react-bootstrap';

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

    this.setLG = this.setLG.bind(this);
    this.setCS = this.setCS.bind(this);
    this.buildChart.bind(this);

    // Default height and width
    this.state = { width: 1000, height: 400, chartType: "candlestick" }
  }

  componentWillMount() {
    let symbol = this.props.params.stock.toUpperCase();
    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      window.localStorage.setItem("__REDIRECTED_FROM_STOCK", symbol);
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0 || this.state.rawData.get(symbol).size === 0) {
      ApiUtils.fetchStockPrices(symbol);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let symbol = this.props.params.stock.toUpperCase();

    if (nextState.currentUser.size === 0 || nextState.currentUser.get('currentUser') === null) {
      window.localStorage.setItem("__REDIRECTED_FROM_STOCK", symbol);
      browserHistory.push('/welcome');
    } else {
      window.localStorage.removeItem("__REDIRECTED_FROM_STOCK");
    }
  }

  componentDidMount() {
    this.resizeListener = function (evt) {
      if (document.getElementById('chartBox')) {
        let width = document.getElementById('chartBox').clientWidth;
        let height = document.getElementById('chartBox').clientHeight;
        if (this.state.width !== width) {
          this.setState({
            width: width,
            height: height
          });
        }
      } else {
        this.setState({
          width: window.innerWidth*0.96,
          height: window.innerHeight*0.9
        })
      }
    }.bind(this);

    window.addEventListener('resize', this.resizeListener);
    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  buildChart() {
    var symbol = this.props.params.stock.toUpperCase();
    if (this.state.rawData.get(symbol)) {
      let stockData = this.state.rawData.get(symbol).get('filtered') ?
      this.state.rawData.get(symbol).get('filtered') :
      this.state.rawData.get(symbol).get('original');

      let chart = (
        <div key={ symbol }
          className="twelve column ridge-border full-height"
          id="chartBox">
          <SVG stockData={ stockData.toArray() }
            width={ this.state.width }
            height={ this.state.height }
            chartType={ this.state.chartType }/>
        </div>);
        return chart;
    } else {
      return "";
    }
  }

  setLG() {
    this.setState({ chartType: "linegraph" });
  }

  setCS() {
    this.setState({ chartType: "candlestick" });
  }

  render () {
    let stockChart = this.buildChart();
    let candlestickActive = this.state.chartType === "candlestick";

    return (
      <div>
          <div className="overwrite-full-width container">
            <div className="row">
              { stockChart }
            </div>
          </div>
          <Navbar fixedBottom fluid={ true }>
            <Nav>
              <NavItem href="/stocks">
                Back To StockMain
              </NavItem>
            </Nav>
            <Navbar.Form pullRight>
              <InputGroup>
                <InputGroup.Button>
                  <Button onClick={ this.setLG }
                          active={ !candlestickActive }
                          bsStyle={ candlestickActive ? "default" : "info" }>
                          LG</Button>
                </InputGroup.Button>
                <InputGroup.Button>
                  <Button onClick={ this.setCS }
                          active={ candlestickActive }
                          bsStyle={ !candlestickActive ? "default" : "info" }>
                          CS</Button>
                </InputGroup.Button>
              </InputGroup>
            </Navbar.Form>
          </Navbar>
      </div>);
  }
}

export default Container.create(Stock);
