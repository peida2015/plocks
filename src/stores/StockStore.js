import { ReduceStore } from 'flux/utils';
import Dispatcher from '../dispatcher';
import { List } from 'immutable';
import CurrentUserStore from './CurrentUserStore';

class StockStore extends ReduceStore {
  constructor () {
    super(Dispatcher);
  }

  getInitialState() {
    return List();
  }

  reduce (state, action) {
    switch (action.type) {
      case "STOCK_DATA_RECEIVED":
        Dispatcher.waitFor([CurrentUserStore.getDispatchToken()]);
        return List(action.data);

      default:
        return state;
    }
  }
}

export default new StockStore();
