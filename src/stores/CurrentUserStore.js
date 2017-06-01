import { ReduceStore } from 'flux/utils';
import Dispatcher from '../dispatcher';
import { Map } from 'immutable';

class CurrentUserStore extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }

  getInitialState() {
    return Map();
  }

  reduce(state, action) {
    switch (action.type) {
      case "SET_CURRENTUSER":
        return Map({currentUser: action.currentUser});

      default:
        return state;
    }
  }
}

// Export an instance of the store so it is singular throughout the app;
export default new CurrentUserStore();
