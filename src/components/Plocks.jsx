import React, { Component } from 'react';
import { Container } from 'flux/utils';
import Navbar from './Navbar.jsx';
import FirebaseStore from '../stores/FirebaseStore';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseActions from '../actions/FirebaseActions';
import firebaseui from 'firebaseui';

import './stock/chart.css';

// Initialize firebase;
import * as firebase from 'firebase';

var config = {
    apiKey: "AIzaSyDcwNKGkY22_SP4PQ1tUu8xOvkrfvuywFY",
    authDomain: "voltaic-tooling-115723.firebaseapp.com",
    databaseURL: "https://voltaic-tooling-115723.firebaseio.com",
    storageBucket: "voltaic-tooling-115723.appspot.com"
  };

firebase.initializeApp(config);


class Plocks extends Component {
  static getStores() {
    return [FirebaseStore, CurrentUserStore];
  }

  static calculateState(prevState) {
    return {
      firebase: FirebaseStore.getState(),
      currentUser: CurrentUserStore.getState()
    }
  }

  componentWillMount() {
    if (this.state.firebase.size === 0) {
      let auth = firebase.auth;
      let ui = new firebaseui.auth.AuthUI(auth());

      FirebaseActions.setFirebaseInstance(auth, ui);
    }

  }

  componentWillUnmount() {
    this.state.firebase.ui.reset();
  }

  render() {
    return (
      <div>
        <div className="header-margin"></div>
        <Navbar user={ this.state.currentUser }/>
        { this.props.children }
      </div>
    )
  }
}

export default Container.create(Plocks);
