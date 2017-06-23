import * as d3 from 'd3';
import StockActions from '../actions/StockActions';

const ApiUtils = {
  fetchStockPrices(symb, accessToken) {
    let data ={
      "accessToken": accessToken
    };

    d3.request(`//${window.location.host}/stockdata/${symb}`)
      .mimeType("application/json")
      .header("Content-Type", "application/json")
      .response(function(xhr) { return JSON.parse(xhr.responseText); })
      .post(JSON.stringify(data), function (resp) {
        if (resp && resp.status.code === 200) {
          StockActions.getStockPrices(resp.results);
        }
      });
  }
}

export default ApiUtils;
