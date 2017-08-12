import React, { Component } from 'react';
import logo from '../../public/logo2.png';
import { Container } from 'flux/utils';
import CurrentUserStore from '../stores/CurrentUserStore';
import FirebaseStore from '../stores/FirebaseStore';
import NavbarToggleButton from './NavbarToggleButton';
import { Link } from 'react-router';
import { Navbar as RBNavbar, Button, Collapse, Glyphicon }  from 'react-bootstrap';

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
    this.toggleShowNavbar = this.toggleShowNavbar.bind(this);

    this.state = {
      showNavbar: true
    };
  }

  componentDidMount() {
    window.setTimeout(()=>{
      this.toggleShowNavbar();
    }, 5000)
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  signOut() {
    document.querySelector('button.navbar-toggle').click();
    this.state.firebase.get("auth")().signOut();
  }


  toggleShowNavbar(evt) {
    this.setState({
      showNavbar: !this.state.showNavbar
    })
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
      <Collapse transitionAppear={ true }
                in={ this.state.showNavbar }
                timeout={ 1000 }>
        <div>
                {/*<!-- navbar begins -->*/}
          <RBNavbar fixedTop={true}
                    className="navBG"
                    onClick={ this.toggleShowNavbar }>
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
      <NavbarToggleButton direction="down"
                          onClick={ this.toggleShowNavbar }/>
      </div>
    )
  }
}

export default Container.create(Navbar);
