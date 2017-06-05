import * as d3 from 'd3';
import StockActions from '../actions/StockActions';

const ApiUtils = {
  fetchStockPrices(symb) {
    d3.request('http://localhost:8888/stockdata/'+symb)
      .mimeType("application/json")
      .response(function(xhr) { return JSON.parse(xhr.responseText); })
      .get(function (resp) {
        if (resp && resp.status.code === 200) {
          StockActions.getStockPrices(resp.results);
        } else {
          StockActions.getStockPrices(null);
        }
      })
  }
}

export default ApiUtils;
