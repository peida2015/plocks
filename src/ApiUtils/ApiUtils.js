import * as d3 from 'd3';
import StockActions from '../actions/StockActions';

const ApiUtils = {
  fetchStockPrices(symb) {
    d3.json('http://localhost:8888/stockdata/'+symb, function (resp) {
        if (resp && resp.status.code === 200) {
          StockActions.getStockPrices(resp.results);
        }
    })
  }
}

export default ApiUtils;
