import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory, Link } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import SVG from './SVGContainer';
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

    this.buildCharts.bind(this);
    this.buildAddPanel.bind(this);

    // Default height and width
    this.state = { width: 500, height: 400, tickerBelt: "" }
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
    } else if (nextState.rawData.size > 0) {
      this.updateTickerBelt.call(this, nextState.rawData.toObject());
    }
  }

  componentDidMount() {
    this.resizeListener = function (evt) {
      if (document.getElementById('chartBox')) {
        let width = document.getElementById('chartBox').clientWidth;
        if (this.state.width !== width) {
          this.setState({ width: width });
        }
      }

      document.getElementById('footer-margin').style.height = document.getElementById('footer').clientHeight+"px";
    }.bind(this);

    window.addEventListener('resize', this.resizeListener);
    this.resizeListener();

    // Start ticker belt
    this.startTickerBeltAnimation.apply(this);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  startTickerBeltAnimation() {
    // Start rolling text animation
    var rollingHeader = document.getElementById('rolling');
    var rollingText = document.getElementById('rolling-text');
    var prevTextLength = rollingText.textContent.length;
    var textWidth, offsetLeft, windowWidth, totalMoveLength;
    offsetLeft = rollingText.offsetParent.offsetLeft;
    var timeToComplete = 30 * 1000;

    var start = null;
    var lastUpdated = null;

    var step = (timestamp)=>{
      if (!start)  {
        start = timestamp;
        lastUpdated = timestamp;
      }
      var progress = timestamp - start;

      if (timestamp-lastUpdated > 50 && this.state.tickerBelt.length !== 0) {
        lastUpdated = timestamp;
        if (progress > timeToComplete ||
            prevTextLength !== this.state.tickerBelt.length) {
          // Reset after completion
          rollingText.textContent = this.state.tickerBelt;
          textWidth = rollingText.scrollWidth;
          windowWidth = window.innerWidth;
          totalMoveLength = windowWidth + textWidth;

          start = timestamp;
          rollingHeader.style.left = totalMoveLength - textWidth - offsetLeft + "px";
          prevTextLength = this.state.tickerBelt.length;
        } else {
          rollingHeader.style.left = totalMoveLength * (1 - progress/timeToComplete) - offsetLeft - textWidth + "px";
        }
      }
      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }

  updateTickerBelt(stockData) {
    console.log("updateTickerBelt");
    let tickerInfo = [];
    for (var symbol in stockData) {
      if (typeof symbol === "string") {

      let latest = stockData[symbol].get('original').last();
      // let latest = dataArr[dataArr.length-1];
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
    let entered = evt.target.firstChild.firstChild.firstChild.value;
    if (entered.length > 0) ApiUtils.fetchStockPrices(entered.toUpperCase());
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

  buildAddPanel() {
      let addPanel = (
          <Row>
            <Col lg={ 6 } lgOffset={ 3 } className="footer-vertical-align">
              <form onSubmit={ this.handleAdd }>
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

    if (stockCharts.length > 1) {
      stockCharts = this.wrapInRows(stockCharts);
    }

    return (
      <div>
        <Grid className="overwrite-full-width">
          { stockCharts }
        </Grid>
        <div id="footer-margin"></div>
        <Navbar fixedBottom={ true } id="footer">
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
