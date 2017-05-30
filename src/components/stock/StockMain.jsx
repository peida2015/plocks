import React, { Component } from 'react';
import CurrentUserStore from '../../stores/CurrentUserStore';
import {browserHistory} from 'react-router';
import { Container } from 'flux/utils';

class StockMain extends Component {
  static getStores() {
    return [CurrentUserStore]
  }

  static calculateState () {
    return {
      currentUser: CurrentUserStore.getState()
    }
  }

  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  componentWillMount() {
    if (this.state.currentUser.size === 0 || this.state.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentUser.size === 0 || nextState.currentUser.get('currentUser') === null) {
      browserHistory.push('/welcome');
    }
  }

  signOut() {
    this.state.firebase.get("auth").signOut();
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

export default Container.create(StockMain);
