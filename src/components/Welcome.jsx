import React, { Component } from 'react';
import { Container } from 'flux/utils';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseStore from '../stores/FirebaseStore';
import CurrentUserActions from '../actions/CurrentUserActions';
import "../../node_modules/firebaseui/dist/firebaseui.css";
import logo from "../../public/logo2name.png";
import {browserHistory} from 'react-router';


class Welcome extends Component {
  static getStores() {
    return [FirebaseStore, CurrentUserStore];
  }

  static calculateState() {
    return {
      firebase: FirebaseStore.getState(),
      currentUser: CurrentUserStore.getState()
    }
  }

  componentWillMount() {
    if (this.state.currentUser.size > 0 && this.state.currentUser.get("currentUser") !== null) {
      browserHistory.push('/stock/GOOG');
    } else {
    }

  }

  componentDidMount() {
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      var uiConfig = {
        callbacks: {
          signInSuccess: function (user) {
            return false;
          }
        },
        signInFlow: 'popup',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          this.state.firebase.get("auth").GoogleAuthProvider.PROVIDER_ID,
          this.state.firebase.get("auth").EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: 'http://www.google.com'
      };

      this.state.firebase.get("ui").start('#firebaseui-auth-container', uiConfig);

      this.state.firebase.get("auth")().onAuthStateChanged(function(user) {
        CurrentUserActions.setCurrentUser(user);
      }, function(error) {
        console.log(error);
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentUser.size > 0 && nextState.currentUser.get("currentUser") !== null) {
      browserHistory.push('/stock/GOOG');
    }
  }

  signOut() {
    this.state.firebase.get("auth").signOut();
  };

  componentWillUnmount() {
    this.state.firebase.get("ui").reset();
  }

  render() {
    return (
      <div>
        <div>
          <div className="header-margin"></div>
          <div className="content-top-margin"></div>
          <div className="ctrlPanel row"></div>
          <div className="welcome">
            <div className="container-fluid">
                {/* <!-- Logo container -->  */ }
                <div className="container col-xs-12 col-lg-6">
                  <div className="col-lg-8 col-lg-offset-2">
                    <img src={logo} className="img-responsive logo centered"
                      alt='Plocks'/>
                  </div>
                </div>
                {/* <!-- Logo container END-->  */ }

                {/* <!-- Sign-in Buttons container --> */ }
                <div className="container col-xs-12 col-lg-6">
                  <div className="header-margin hidden-xs">
                  </div>
                  <h1 className="text-primary text-center top-margin title-font">We Plot Your Stocks</h1>

                  <div className="top-margin">
                    <div className="centered" id="g-signin2"></div>
                    <div id="firebaseui-auth-container"></div>
                  </div>
                  <div className="top-margin">
                    <div className="centered">
                        <div className="demo trial-text container" onClick={this.props.signOut}>
                        <div className="centered">
                          Try It for 5 Minutes
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-primary text-center top-margin">
                    Please sign-in through Google before continuing.
                  </h3>
                </div>
                {/* <!-- Sign-in Buttons container END --> */ }
            </div>

          </div>
        </div>
        <h1>Welcome to Plocks</h1>
        <div id="sign-in-status"></div>
        <div id="sign-in"></div>
        <div id="account-details"></div>
        <button onClick={this.signOut.bind(this)}>Sign Out</button>
      </div>
    )
  }
}

export default Container.create(Welcome);
