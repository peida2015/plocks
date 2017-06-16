import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import StockActions from '../../actions/StockActions';
import SVG from './SVGContainer';
import Timeline from './Timeline';
import { Button, Navbar, InputGroup, Grid, Row, Col } from 'react-bootstrap';
import * as d3 from 'd3';

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
    this.resizeListener = this.resizeListener.bind(this);
    this.buildFooter = this.buildFooter.bind(this);
    this.buildChart.bind(this);

    // Default height and width
    this.state = {
      width: 1000,
      height: 400,
      timescale: null,
      chartType: "candlestick"
    }
  }

  componentWillMount() {
    let symbol = this.props.params.stock;
    let path = this.props.location.pathname;

    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      window.localStorage.setItem("__REDIRECTED_FROM_STOCK", path);
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0 || this.state.rawData.get(symbol).size === 0) {
      ApiUtils.fetchStockPrices(symbol);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let symbol = this.props.params.stock.toUpperCase();
    if (nextState.currentUser.size === 0 ||
          nextState.currentUser.get('currentUser') === null) {
      window.localStorage.setItem("__REDIRECTED_FROM_STOCK", symbol);
      browserHistory.push('/welcome');
    } else {
      // Forget redirect route
      window.localStorage.removeItem("__REDIRECTED_FROM_STOCK");
    }
    this.resizeListener();
  }

  componentDidUpdate(){
    // Set chartType if params is present
    let allowedTypes = { candlestick: true, linegraph: true };
    let chartType = allowedTypes[this.props.params.chartType] ?
                this.props.params.chartType : null;


    if (chartType && this.state.chartType !== chartType) {
      this.setState({ chartType: chartType });
    }

    // Adjust timescale range for the dateSelector
    let bluebox = document.getElementById('bluebox');

    if (bluebox && bluebox.clientWidth !== 0 && this.state.rawData.size > 0 && (!this.state.timescale ||
           this.state.timescale.range()[1] !== bluebox.clientWidth)) {

      let stockData = this.state.rawData
              .get(this.props.params.stock).get('original');
      let domain = [stockData.first().tradingDay,
                    stockData.last().tradingDay];
      let range = [0, bluebox.clientWidth];
      this.setState({
        timescale: d3.scaleTime().domain(domain).range(range)
      });
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);
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
    browserHistory.replace(`/stock/${this.props.params.stock}/linegraph`);
  }

  setCS() {
    browserHistory.replace(`/stock/${this.props.params.stock}/candlestick`)
  }

  backToMain() {
    browserHistory.push('/stocks');
  }

  selectDateRange(date1, date2) {
    var symbol = this.props.params.stock.toUpperCase();
    let stockData = this.state.rawData.get(symbol).get('original').toArray();
    let idx1 = this.bsDate.call(this, stockData, date1);
    let idx2 = this.bsDate.call(this, stockData, date2);
    stockData = stockData.slice(Math.min(idx1, idx2), Math.max(idx1, idx2));

    StockActions.getFilteredPrices(stockData);
  }

  bsDate = function (data, date) {
    // A number is returned for any date input.
    if (data.length <= 1) { return 0;  };

    var oneDay = 1000*60*60*24;
    var midIdx = Math.floor(data.length/2);
    var timeDiff = data[midIdx].tradingDay - date;

    // There is no exact Datetime match, match tolerance is oneDay.
    if (Math.abs(timeDiff) < oneDay) { return midIdx; };

    if (timeDiff > 0) {
      return this.bsDate(data.slice(0, midIdx), date);
    } else {
      return midIdx + this.bsDate(data.slice(midIdx, data.length), date);
    };
  }

  buildFooter() {
    let candlestickActive = this.state.chartType === "candlestick";

    let timeline = this.state.timescale ? (
    <Timeline timescale={ this.state.timescale }
              selectDateRange={ this.selectDateRange.bind(this) }>
    </Timeline>): "";

    let dateSelector = (
      <Col xsHidden sm={8} md={9}>
        <div id="bluebox" className="footer-vertical-align content"></div>
        { timeline }
      </Col>
    );

    let chartTypeSelector = (
      <Col xs={1} xsPush={3} smPush={0} className="footer-vertical-align">
            <InputGroup>
              <InputGroup.Button>
                <Button active={ !candlestickActive }
                  onClick={ this.setLG }
                  bsStyle={ candlestickActive ? "default" : "info" }>
                  LG
                </Button>
              </InputGroup.Button>
              <InputGroup.Button>
                <Button active={ candlestickActive }
                  onClick={ this.setCS }
                  bsStyle={ !candlestickActive ? "default" : "info" }>
                  CS
                </Button>
              </InputGroup.Button>
            </InputGroup>
        </Col>
    )

    return (<Grid>
      <Row>
        <Col xs={3} md={2} className="footer-vertical-align">
          <Button onClick={ this.backToMain }>
            Back To StockMain
          </Button>
        </Col>
        { dateSelector }
        { chartTypeSelector }
      </Row>
    </Grid>);
  }

  resizeListener(evt) {
    if (document.getElementById('chartBox')) {
      let width = document.getElementById('chartBox').clientWidth;
      let height = document.getElementById('chartBox').clientHeight;
      if (this.state.width !== width || this.state.height !== height) {
        this.setState({
          width: width,
          height: height
        });
      }
    } else {
      this.setState({
        width: window.innerWidth*0.96,
        height: window.innerHeight*0.8
      })
    }
  }

  render () {
    let stockChart = this.buildChart();
    let footerContents = this.buildFooter();

    return (
      <div>
          <div className="overwrite-full-width container">
            <div className="row">
              { stockChart }
            </div>
          </div>
          <Navbar fixedBottom fluid={ true }>
            <Navbar.Header>
              { footerContents }
            </Navbar.Header>
          </Navbar>
      </div>);
  }
}

export default Container.create(Stock);
