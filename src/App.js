import { IndexRedirect, Router, Route, browserHistory } from 'react-router';
import React, { Component } from 'react';
import Plocks from './components/Plocks.jsx';
import Welcome from './components/Welcome.jsx';
import StockMain from './components/stock/StockMain.jsx';
import './App.css';


class App extends Component {

  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Plocks}>
          <IndexRedirect to='/welcome'/>
          <Route path="/welcome" component={Welcome}/>
          <Route path="stock/:stock" component={StockMain}/>
        </Route>
      </Router>
    );
  }
}

export default App;
