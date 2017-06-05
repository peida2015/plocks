import Dispatcher from '../dispatcher';

const StockActions = {
  getStockPrices: (stockData)=> {
    debugger
    Dispatcher.dispatch({
      type: "STOCK_DATA_RECEIVED",
      data: stockData
    })
  }
};

export default StockActions;
