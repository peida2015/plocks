import React, { Component } from 'react';
import logo from '../../public/logo2.png';
// import firebase from 'firebase';



class Navbar extends Component {
  componentWillMount() {
  }

  render() {
    let user = this.props.user;
    let showName = user ? (
      <li>{"Hi, "+ user.displayName}</li>) : "";

    let logoutButton = user ?
    (<li id='g-signin3'>
        <a className='page-scroll'>Logout</a>
      </li>) : "";

    return (
      <div>
          {/*<!-- navbar begins -->*/}
        <nav className="navbar navbar-custom navbar-fixed-top" role="navigation">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand" href="/welcome">
                <img src={logo} className="icon" alt="Plocks logo"/>
              </a>
              <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-main-collapse">
                  Menu <i className="fa fa-bars"></i>
              </button>
              <a className="navbar-brand page-scroll" href="./" data-no-turbolink>
                  <i className="fa fa-play-circle"></i> <span className="light title-font">PLOCKS</span>
              </a>
            </div>

          {/*<!-- Collect the nav links, forms, and other content for toggling -->*/}
            <div className="collapse navbar-collapse navbar-right navbar-main-collapse">
              <ul className="nav navbar-nav">
                {/*<!-- Hidden li included to remove active className from about link when scrolled up past about section -->*/}
                <li className="hidden active">
                    <a href="#page-top"></a>
                </li>
                { showName }
                { logoutButton }
              </ul>
            </div>
          {/*<!-- /.navbar-collapse -->*/}
          </div>
        {/*<!-- /.container -->*/}
        </nav>
      </div>
    )
  }
}

export default Navbar;
