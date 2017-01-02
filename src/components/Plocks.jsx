import React, { Component } from 'react';
import Navbar from './Navbar.jsx';
import { browserHistory } from 'react-router';
// import firebase from 'firebase';
// import Welcome from './Welcome.jsx';
// import StockMain from './stock/StockMain.jsx';
import firebaseui from 'firebaseui';

// Initialize firebase;
import firebase from 'firebase';

var config = {
    apiKey: "AIzaSyDcwNKGkY22_SP4PQ1tUu8xOvkrfvuywFY",
    authDomain: "voltaic-tooling-115723.firebaseapp.com",
    databaseURL: "https://voltaic-tooling-115723.firebaseio.com",
    storageBucket: "voltaic-tooling-115723.appspot.com"
  };

firebase.initializeApp(config);


class Plocks extends Component {
  constructor (props) {
    super(props);
    this.state = ({ currentUser: firebase.auth().currentUser,
                    auth: firebase.auth(),
                    firebaseui: null
                  });
  }

  componentWillMount() {
    let auth = this.state.auth;
    let ui = new firebaseui.auth.AuthUI(auth);
    this.setState({ firebaseui: ui });

    firebase.auth().onAuthStateChanged(function(user) {
      this.setState({ currentUser: user,
        auth: firebase.auth()
      });
      if (user) {
        browserHistory.push('/stock/GOOG');
      } else {
        browserHistory.push('/welcome');
      }
        // if (user) {
          // User is signed in.
          // var displayName = user.displayName;
          // var email = user.email;
          // var emailVerified = user.emailVerified;
          // var photoURL = user.photoURL;
          // var uid = user.uid;
          // var providerData = user.providerData;
          // user.getToken().then(function(accessToken) {
            // document.getElementById('sign-in-status').textContent = 'Signed in';
            // document.getElementById('sign-in').textContent = 'Sign out';
            // document.getElementById('account-details').textContent = JSON.stringify({
            //   displayName: displayName,
            //   email: email,
            //   emailVerified: emailVerified,
            //   photoURL: photoURL,
            //   uid: uid,
            //   accessToken: accessToken,
            //   providerData: providerData
            // }, null, '  ');
          // });
          // browserHistory.push("/stock/GOOG");
        // } else {
          // User is signed out.
          // document.getElementById('sign-in-status').textContent = 'Signed out';
          // document.getElementById('sign-in').textContent = 'Sign in';
          // document.getElementById('account-details').textContent = 'null';
          // browserHistory.push("/welcome");
        // }
      }.bind(this), function(error) {
          console.log(error);
    });
  }

  componentWillUnmount() {
    this.state.firebaseui.reset();
  }

  render() {
    // debugger
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      if (child.props.location.pathname === "/welcome") {
        return React.cloneElement(child, {
          firebaseui: this.state.firebaseui,
          auth: this.state.auth
        })
      } else if (this.props.location.pathname.match(/^\/stock\/(\w+)$/)) {
        return React.cloneElement(child, {
          auth: this.state.auth
        });
      }
    });

    return (
      <div>
        <Navbar user={ this.state.currentUser }/>
        {childrenWithProps}
      </div>
    )
  }
}

export default Plocks;
