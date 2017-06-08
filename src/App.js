import { IndexRedirect, Router, Route, browserHistory, Redirect } from 'react-router';
import React, { Component } from 'react';
import Plocks from './components/Plocks.jsx';
import Welcome from './components/Welcome.jsx';
import StockMain from './components/stock/StockMain.jsx';
import './normalize.css';
import './skeleton.css';

class App extends Component {

  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Plocks}>
          <IndexRedirect to='/welcome'/>
          <Route path="/welcome" component={Welcome}/>
          <Route path="stock/:stock" component={StockMain}/>
          <Redirect from="*" to="/welcome" />
        </Route>
      </Router>
    );
  }
}

export default App;
