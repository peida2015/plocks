import React, { Component } from 'react';
import firebase from 'firebase';
import "../../node_modules/firebaseui/dist/firebaseui.css";
import logo from "../../public/logo2name.png";
import {browserHistory} from 'react-router';


class Welcome extends Component {

  componentWillMount() {
  }

  componentDidMount() {
    if (this.props.auth.currentUser) {
      browserHistory.push('/stock/GOOG');
    } else {
      var uiConfig = {
        callbacks: {
          signInSuccess: function (user) {
            return false;
          }
        },
        signInFlow: 'popup',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: 'http://www.google.com'
      };
      // console.log("/welcome");
      this.props.firebaseui.start('#firebaseui-auth-container', uiConfig);
    }
  }

  componentWillUpdate() {

  }

  signOut() {
    this.props.auth.signOut();
  };

  componentWillUnmount() {
    debugger
    this.props.firebaseui.reset();
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

export default Welcome;
