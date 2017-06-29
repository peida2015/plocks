import React, { Component } from 'react';
import logo from '../../public/logo2.png';
import { Container } from 'flux/utils';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseStore from '../stores/FirebaseStore';
import { Link } from 'react-router';
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

  componentDidUpdate(prevProps, prevState) {
    if (window.location.pathname.match('stock')) {
      document.addEventListener('mousemove', this.mousemoveHandler);
    } else {
      document.removeEventListener('mousemove', this.mousemoveHandler);
      this.setState({ showNavbar: true });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mousemoveHandler);
  }

  signOut() {
    // Manually trigger navbar collapse
    clearTimeout(this.collapseTimeout);
    document.querySelector('button.navbar-toggle').click();
    this.state.firebase.get("auth")().signOut();
  }

  mousemoveHandler(evt) {
    if (!this.state.lastUpdated) this.setState({ lastUpdated: Date.now() });
    if (Date.now() - this.state.lastUpdated > 300) {
      this.setState({ lastUpdated: Date.now() });
      if (evt.clientY < 80) {
        clearTimeout(this.collapseTimeout);
        this.collapseTimeout = null;
        this.setState({
          showNavbar: true
        });
      } else if (!this.collapseTimeout){
        this.collapseTimeout = setTimeout(()=>{
          this.setState({
            showNavbar: false
          });
        }, 8000);
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
        <div>
                {/*<!-- navbar begins -->*/}
        <RBNavbar fixedTop={true} className="navBG">
            <RBNavbar.Header>
              <RBNavbar.Brand>
                <Link to="/welcome">
                  <img src={logo} className="icon" alt="Plocks logo"/>
                </Link>
                {" "}
                <Link to="/welcome" className="page-scroll" >
                  <span className="light title-font">PLOCKS</span>
                </Link>
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
      </Collapse>
    )
  }
}

export default Container.create(Navbar);
