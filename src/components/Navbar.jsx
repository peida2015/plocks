import React, { Component } from 'react';
import logo from '../../public/logo2.png';
import { Container } from 'flux/utils';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseStore from '../stores/FirebaseStore';
import { Navbar as RBNavbar, Button, Collapse }  from 'react-bootstrap';

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
    this.mousemoveHandler = this.mousemoveHandler.bind(this);

    this.state = {
      lastUpdated: null,
      showNavbar: true
    };
  }

  componentWillMount() {
  }

  signOut() {
    this.state.firebase.get("auth")().signOut();
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentDidUpdate(prevProps, prevState) {
    if (window.location.pathname.match('stock')) {
      document.addEventListener('mousemove', this.mousemoveHandler);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mousemoveHandler);
  }

  mousemoveHandler(evt) {
    if (!this.state.lastUpdated) this.setState({ lastUpdated: Date.now() });
    if (Date.now() - this.state.lastUpdated > 300) {
      this.setState({ lastUpdated: Date.now() });
      if (evt.clientY < 80) {
        clearTimeout(this.collapseTimeout);
        this.setState({
          showNavbar: true
        })
      } else {
        this.collapseTimeout = setTimeout(()=>{
          this.setState({
            showNavbar: false
          });
        }, 10000);
      }
    }
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
      <Collapse transitionAppear={ true }
                in={ this.state.showNavbar }
                timeout={ 1000 }>
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
      </Collapse>
    )
  }
}

export default Container.create(Navbar);
