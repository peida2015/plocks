import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory, Link } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import SVG from './SVGContainer';
import ContainedModal from './ContainedModal';
import { FormControl, FormGroup, Button, InputGroup,
          Glyphicon, Grid, Row, Col, Navbar } from 'react-bootstrap';

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

    this.resizeListener = this.resizeListener.bind(this);
    this.buildCharts = this.buildCharts.bind(this);
    this.buildQueuedBox = this.buildQueuedBox.bind(this);
    this.buildAddPanel = this.buildAddPanel.bind(this);

    // Default height and width
    this.state = {
      width: 500,
      height: 400,
      tickerBelt: "Loading GOOG ticker info...If you're new, try AMZN, TSLA, MSFT or KO",
      queued: ["GOOG"]
    }
  }

  componentWillMount() {
    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0) {
      ApiUtils.fetchStockPrices("GOOG");
    } else {
      this.updateTickerBelt.call(this, this.state.rawData.toObject());
    }

  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentUser.size === 0 || nextState.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    } else if (nextState.rawData.size > 0) {
      this.updateTickerBelt.call(this, nextState.rawData.toObject());

      let newQueued = this.state.queued.filter((symbol)=>{
        return !nextState.rawData.get(symbol);
      })

      if (newQueued.length !== this.state.queued.length)
            this.setState({ queued: newQueued });
    }
  }

  componentDidUpdate(){
    this.resizeListener();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);

    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  resizeListener() {
    if (document.getElementById('chartBox')) {
      let width = document.getElementById('chartBox').clientWidth;
      if (this.state.width !== width * .95) {
        this.setState({ width: width * .95 });
      }
    }

    document.getElementById('footer-margin').style.height = document.getElementById('footer').clientHeight+"px";
  }

  updateTickerBelt(stockData) {
    let tickerInfo = [];
    for (var symbol in stockData) {
      if (typeof symbol === "string") {

      let latest = stockData[symbol].get('original').last();
      let tickerStr = `${latest.symbol}: H${latest.high} L${latest.low}`;

      tickerInfo.push(tickerStr);
      }
    }

    if (tickerInfo.join(" || ") !== this.state.tickerBelt){
      this.setState({ tickerBelt: tickerInfo.join(" || ") });
    }
  }

  handleAdd(evt, inputBox) {
    evt.preventDefault();
    let entered = evt.target.firstChild.firstChild.firstChild.value.toUpperCase();
    if (entered.length > 0) {
      this.setState({
        queued: this.state.queued.concat(entered)
      });

      ApiUtils.fetchStockPrices(entered);
    }
  };

  buildCharts(stockData) {
    var stockCharts = [];
    for (var symbol in stockData) {
      if (typeof symbol === "string") {

        let individualStockData = stockData[symbol].get('filtered') ?
        stockData[symbol].get('filtered') :
        stockData[symbol].get('original');

        let linechart = (
          <Col lg={6}
            key={ symbol }
            className="ridge-border"
            style={ { minHeight: 350 } }
            id="chartBox">
            <Link to={ `/stock/${symbol}` }>
              <SVG stockData={ individualStockData.toArray() }
                width={ this.state.width }
                height={ this.state.height }
                chartType="candlestick" />
            </Link>
          </Col>);

        stockCharts.push(linechart);
      }
    }

    return stockCharts;
  }

  buildQueuedBox() {
    return this.state.queued.map((symbol)=> {
      return (<Col lg={6}
            key={ symbol }
            className="ridge-border"
            style={ { minHeight: 350 } }
            id="chartBox">
            <Link to={ `/stock/${symbol}` }>
              <ContainedModal symbol={ symbol } />
            </Link>
          </Col>);
    })
  }

  buildAddPanel() {
      let addPanel = (
          <Row>
            <Col lg={ 6 } lgOffset={ 3 } className="footer-vertical-align">
              <form onSubmit={ this.handleAdd.bind(this) }>
                <FormGroup>
                  <InputGroup>
                    <FormControl placeholder="Type Stock Symbol" type="text"/>
                    <InputGroup.Button>
                      <Button bsStyle="primary" type="submit">
                        <Glyphicon glyph="plus" />
                      </Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
              </form>
            </Col>
          </Row>
      )

      return addPanel;
  }

  wrapInRows(stockCharts) {
    return stockCharts.reduce((r, chart, idx)=> {
      if (idx % 2 === 0) r.push([]);
      r[r.length-1].push(chart);
      return r;
    }, []).map((pair, idx)=>{
      return (
        <Row key={ idx }>
          { pair }
        </Row>);
    });
  }

  render() {
    let stockData = this.state.rawData.toObject();

    let stockCharts = this.buildCharts(stockData);
    let addPanel = this.buildAddPanel();
    let queuedStock = this.buildQueuedBox();

    stockCharts = stockCharts.concat(queuedStock);

    if (stockCharts.length > 1) {
      stockCharts = this.wrapInRows(stockCharts);
    }

    return (
      <div>
        <Grid className="overwrite-full-width">
          { stockCharts }
        </Grid>
        <div id="footer-margin"></div>
        <Navbar fixedBottom={ true } id="footer" fluid={ true }
                style={{ zIndex: 20 }}>
            { addPanel }
            <Navbar.Header id="rolling">
              <code id="rolling-text">
                <span>{ this.state.tickerBelt }</span>
              </code>
            </Navbar.Header>
        </Navbar>
      </div>
    )
  }
}

export default Container.create(StockMain);
