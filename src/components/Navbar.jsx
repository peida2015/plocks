import React, { Component } from 'react';
import logo from '../../public/logo2.png';
import { Container } from 'flux/utils';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseStore from '../stores/FirebaseStore';
import { Navbar as RBNavbar }  from 'react-bootstrap';
import { Button } from 'react-bootstrap';

class Navbar extends Component {
  static getStores() {
    return [FirebaseStore, CurrentUserStore];
  }

  static calculateState() {
    return {
       firebase: FirebaseStore.getState(),
       currentUser: CurrentUserStore.getState()
    }
  }

  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  componentWillMount() {
  }

  signOut() {
    this.state.firebase.get("auth")().signOut();
  }

  componentWillUpdate(nextProps, nextState) {
  }

  render() {
    let user = this.state.currentUser.get('currentUser');
    let showName = user && user.displayName ? (
      <RBNavbar.Text pullRight>
        {"Hi, "+ user.displayName}
      </RBNavbar.Text>) : "";

    let logoutButton = user ?
        (<RBNavbar.Form pullRight>
          <Button id='g-signin3' bsStyle="warning" onClick={ this.signOut }>
            Logout
          </Button>
        </RBNavbar.Form>) : "";

    return (
      <div>
          {/*<!-- navbar begins -->*/}
        <RBNavbar fixedTop={true} className="navBG">
            <RBNavbar.Header>
              <RBNavbar.Brand>
                <a href="/welcome">
                  <img src={logo} className="icon" alt="Plocks logo"/>
                </a>
                <a className="page-scroll" href="./">
                  <i className="fa fa-play-circle"></i> <span className="light title-font">PLOCKS</span>
                </a>
              </RBNavbar.Brand>
              <RBNavbar.Toggle />
            </RBNavbar.Header>
          {/*<!-- Collect the nav links, forms, and other content for toggling -->*/}
            <RBNavbar.Collapse>
              { showName }
              { logoutButton }
            </RBNavbar.Collapse>
          {/*<!-- /.navbar-collapse -->*/}
        </RBNavbar>
      </div>
    )
  }
}

export default Container.create(Navbar);
