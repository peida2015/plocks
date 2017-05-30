import Dispatcher from '../dispatcher';

const FirebaseActions = {
  setFirebaseInstance(authInstance, fbUIinstance) {
    Dispatcher.dispatch({
      type: "SET_AUTH_INSTANCE",
      auth: authInstance,
      ui: fbUIinstance
    })
  }
};

export default FirebaseActions;
