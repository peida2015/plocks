import Dispatcher from '../dispatcher';

const CurrentUserActions = {
  setCurrentUser (currentUser) {
    Dispatcher.dispatch({
      type: "SET_CURRENTUSER",
      currentUser: currentUser
    });
  }
}

export default CurrentUserActions;
