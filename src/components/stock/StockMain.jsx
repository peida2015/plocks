import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class StockMain extends Component {
  componentWillMount() {
    let user = this.props.auth.currentUser;

    if (!user) {
      browserHistory.push('/welcome');
    }
  }

  componentWillUpdate() {

  }

  signOut() {
    this.props.auth.signOut();
  };

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <div className="content-top-margin">StockMain Here</div>
        <button onClick={this.signOut.bind(this)}>Sign Out</button>
      </div>
    )
  }
}

export default StockMain;
