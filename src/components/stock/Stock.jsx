import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import StockStore from '../../stores/StockStore';
import { browserHistory } from 'react-router';
import { Container } from 'flux/utils';
import ApiUtils from '../../ApiUtils/ApiUtils';
import StockActions from '../../actions/StockActions';
import SVG from './SVGContainer';
import Timeline from './Timeline';
import ContainedModal from './ContainedModal';
import { Button, Navbar, InputGroup, Grid, Row, Col, Glyphicon, ButtonToolbar, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import * as d3 from 'd3';
import lgIcon from '../../../public/lg-icon.png';
import csIcon from '../../../public/cs-icon.png';
import sliderIcon from '../../../public/slider.png';
import drawLineIcon from '../../../public/stock_draw-line.png';
import { svgString2Image, getSVGString } from '../../Utils/ExportImg';

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
    this.buildDateRangeSelector = this.buildDateRangeSelector.bind(this);
    this.buildChart = this.buildChart.bind(this);
    this.navbarToggleHandler = this.navbarToggleHandler.bind(this);
    this.toggleEditControls = this.toggleEditControls.bind(this);

    // Default height and width
    this.state = {
      showLayoverLines: true,
      width: 1000,
      height: 400,
      timescale: null,
      chartType: "candlestick",
      editControls: null
    }
  }

  componentWillMount() {
    let symbol = this.props.params.stock.toUpperCase();
    let path = this.props.location.pathname;

    // Check authentication or preload data;
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      window.localStorage.setItem("__REDIRECTED_FROM_STOCK", path);
      browserHistory.push('/welcome');
    } else if (this.state.rawData.size === 0 || this.state.rawData.get(symbol).size === 0) {
      this.state.currentUser.get('currentUser').getToken(true)
        .then(function (idToken){
          ApiUtils.fetchStockPrices(symbol, idToken);
        });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let symbol = this.props.params.stock.toUpperCase();
    if (nextState.currentUser.size === 0 ||
          nextState.currentUser.get('currentUser') === null) {
      // Only store redirect when there is not any currentUser, not when the user is signing out
      if (!this.state.currentUser) {
        window.localStorage.setItem("__REDIRECTED_FROM_STOCK", symbol);
      }
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
              .get(this.props.params.stock.toUpperCase()).get('original');
      let domain = [stockData.first().tradingDay,
                    stockData.last().tradingDay];
      let range = [0, bluebox.clientWidth];
      this.setState({
        timescale: d3.scaleTime().domain(domain).range(range)
      });
    }
  }

  componentDidMount() {
    this.resizeListener();
    window.addEventListener('resize', this.resizeListener);
    let title = document.getElementsByTagName('title')[0];
    title.textContent = this.props.params.stock.toUpperCase();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  buildChart() {
    var symbol = this.props.params.stock.toUpperCase();
    var cardContent;

    if (this.state.rawData.get(symbol)) {
      let stockData = this.state.rawData.get(symbol).get('filtered') ?
      this.state.rawData.get(symbol).get('filtered') :
      this.state.rawData.get(symbol).get('original');

      cardContent = (
          <SVG stockData={ stockData.toArray() }
            width={ this.state.width }
            height={ this.state.height }
            chartType={ this.state.chartType }
            editControls={ this.state.editControls }
            showLayoverLines={ this.state.showLayoverLines }/>)
    } else {
      cardContent = (<ContainedModal symbol={ symbol }/>)
    }

    return (
      <div key={ symbol }
          className="ridge-border full-height"
          id="chartBox">
          { cardContent }
      </div>);
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

  bsDate(data, date) {
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

  buildDateRangeSelector() {
    let timeline = this.state.timescale ? (
      <Timeline timescale={ this.state.timescale }
        selectDateRange={ this.selectDateRange.bind(this) }>
      </Timeline>): "";

      return (
        <Col xs={12} sm={8}
          id="dateRangeSelector"
          key="dateRangeSelector">
          <Navbar.Collapse>
            <div id="bluebox" className="footer-vertical-align content"></div>
            { timeline }
          </Navbar.Collapse>
        </Col>
      );
  }

  buildFooter() {
    let candlestickActive = this.state.chartType === "candlestick";
    let dateSelector = this.buildDateRangeSelector();

    let toolIcons = (<Popover>
        <ButtonToolbar onClick={ this.toggleEditControls }>
          <OverlayTrigger placement="top"
                  overlay={ <Tooltip>Free-style doodling</Tooltip> }>
            <Button name="freeDrawing"
                  bsStyle={ this.state.editControls === "freeDrawing" ? "success" : null }>
                    <Glyphicon glyph="pencil"/>
                </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top"
                  overlay={ <Tooltip>Click to set points to draw up to 2 trendlines</Tooltip> }>
            <Button name="drawLine" style={ { padding: "3px 6px" } }
                  bsStyle={ this.state.editControls === "drawLine" ? "success" : null }>
                  <img src={ drawLineIcon }width="25" role="presentation"/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top"
                  overlay={ <Tooltip>Click to erase last addition when red</Tooltip> }>
            <Button name="erase"
                  bsStyle={ this.state.editControls === "erase" ? "danger" : null }>
                  <Glyphicon glyph="erase" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top"
                  overlay={ <Tooltip>Click to start over when red</Tooltip> }>
            <Button name="eraseAll"
                  bsStyle={ this.state.editControls === "eraseAll" ? "danger" : null }>
                  <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top"
                  overlay={ <Tooltip>Toggle layover lines</Tooltip> }>
            <Button name="layover"
                  bsStyle={ this.state.showLayoverLines ? "info" : null }>
                  <Glyphicon glyph="asterisk" />
            </Button>
          </OverlayTrigger>
        </ButtonToolbar>
    </Popover>)

    let toolbarButton = (<Col xs={6} md={10}
                  className="footer-vertical-align"
                  style={ { paddingLeft: "0px"}}>
            <ButtonToolbar>
              <OverlayTrigger placement="top"
                    trigger="click"
                    overlay={ toolIcons }>
                <Button>
                  <Glyphicon glyph="edit"/>
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
          </Col>);

    let sliderButton = (<img src={ sliderIcon }
                            width="25" role="presentation"/>);

    let toggleButton = (<Col xs={2}
                      xsPush={5}
                     smHidden>
              <Navbar.Toggle children={ sliderButton }
                      style={ { padding: "3px 6px" } }/>
            </Col>)

    let toolbarToggleWrapper = (<Col xs={7} sm={2}>
        <Grid>
          <Row>
            { toolbarButton }
            { toggleButton }
          </Row>
        </Grid>
      </Col>)

    let chartTypeSelector = (
      <Col xs={1} className="footer-vertical-align"
            id="chartTypeSelector"
            key="chartTypeSelector">
            <InputGroup>
              <Button onClick={ this.exportImage }>
                <Glyphicon glyph="download-alt" />
                <a id="dlLink" style={ { display: "none"} }></a>
              </Button>
              {" "}
              <InputGroup.Button>
                <Button active={ !candlestickActive }
                  onClick={ this.setLG }
                  bsStyle={ candlestickActive ? "default" : "info" }
                  style={{ padding: "3px 6px" }}>
                  <img src={ lgIcon } width="25" role="presentation"/>
                </Button>
              </InputGroup.Button>
              <InputGroup.Button>
                <Button active={ candlestickActive }
                  onClick={ this.setCS }
                  bsStyle={ !candlestickActive ? "default" : "info" }
                  style={{ padding: "3px 6px" }}>
                  <img src={ csIcon } width="25" role="presentation"/>
                </Button>
              </InputGroup.Button>
            </InputGroup>
        </Col>
    )

    return (<Grid>
      <Row>
        { window.innerWidth >= 768 ?
          [toolbarToggleWrapper, dateSelector] :
          [dateSelector, toolbarToggleWrapper] }
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

  navbarToggleHandler(navExpanded) {
    if (navExpanded) {
      // Cannot detect .bluebox width before it's rendered.  Get the containing box minus 62 (2 * handles width + 2 * border width)
      let length = document.getElementById('dateRangeSelector').clientWidth-62;
      let stockData = this.state.rawData
              .get(this.props.params.stock).get('original');
      let domain = [stockData.first().tradingDay,
                    stockData.last().tradingDay];
      let range = [0, length];
      this.setState({
        timescale: d3.scaleTime().domain(domain).range(range)
      });
    }
  }

  exportImage() {
    let svg = document.getElementsByTagName('svg')[0];
    let svgString = getSVGString(svg);

    let handleImageBlob = (blob, filesize)=> {
      let dlLink = document.getElementById('dlLink');

      dlLink.href = window.URL.createObjectURL(blob);
      dlLink.click();
    };

    svgString2Image(svgString, svg.width.baseVal.value,
                  svg.height.baseVal.value, 'png', handleImageBlob);
  }

  toggleEditControls(evt) {
    // When clicking on some icons, evt.target is different accross browsers.  Get the button element
    let target = evt.target.name && evt.target.name.length > 0 ? evt.target : evt.target.parentElement;

    if (target.name !== "layover") {
      let currControl = target.name === this.state.editControls ? null : target.name;

      this.setState({
        editControls: currControl
      })
    } else {
      this.setState({ showLayoverLines : !this.state.showLayoverLines })
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
          <Navbar fixedBottom
                  fluid={ true }
                  onToggle={ this.navbarToggleHandler }
                  style={{ zIndex: 20 }}>
              { footerContents }
          </Navbar>
          <canvas style={ {display: "none"} }></canvas>
      </div>);
  }
}

export default Container.create(Stock);
