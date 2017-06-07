import { ReduceStore } from 'flux/utils';
import Dispatcher from '../dispatcher';
import { List, Map } from 'immutable';
import CurrentUserStore from './CurrentUserStore';

class StockStore extends ReduceStore {
  constructor () {
    super(Dispatcher);
  }

  getInitialState() {
    return Map();
  }

  reduce (state, action) {
    let symbol = action.symbol;
    switch (action.type) {
      case "STOCK_DATA_RECEIVED":
        Dispatcher.waitFor([CurrentUserStore.getDispatchToken()]);
        return state.set(symbol, Map({"original": List(action.data) }));

      case "STOCK_DATA_FILTERED":
        let oldData = state.get(symbol);
        let newData = oldData.set("filtered", List(action.data));

        return state.set(symbol, newData);

      default:
        return state;
    }
  }
}

export default new StockStore();
