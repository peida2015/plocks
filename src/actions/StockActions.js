import Dispatcher from '../dispatcher';

const StockActions = {
  getStockPrices: (stockData)=> {
    Dispatcher.dispatch({
      type: "STOCK_DATA_RECEIVED",
      data: stockData,
      symbol: stockData[0].symbol
    })
  },

  getFilteredPrices: (stockData)=> {
    Dispatcher.dispatch({
      type: "STOCK_DATA_FILTERED",
      data: stockData,
      symbol: stockData[0].symbol
    })
  }
};

export default StockActions;
