import React from 'react'
import {
  BrowserRouter as Router, 
  Switch,
  Route
} from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './components/pages/Home'
import ContactUs from './components/pages/ContactUs'
import Login from './components/pages/Login';
import Seller from './components/pages/Seller';
import Shop from './components/pages/Shop';
import Checkout from './components/pages/Checkout';
import Payment from './components/pages/Payment';
import OrderHistory from './components/pages/OrderHistory';
import SellerHistory from './components/pages/SellerHistory';

import './App.css';

function App() {
  return (
    <div className="body-wrap">
      <Router>
        <Layout>
          <Switch>
            <Route path={'/ContactUs'} component={ContactUs}></Route>
            <Route path={'/Login'} component={Login}></Route>
            <Route path={'/Seller'} component={Seller}></Route>
            <Route path={'/Shop'} component={Shop}></Route>
            <Route path={'/OrderHistory'} component={OrderHistory}></Route>
            <Route path={'/SellerHistory'} component={SellerHistory}></Route>
            <Route path={'/Checkout'} component={Checkout}></Route>
            <Route path={'/Payment'} component={Payment}></Route>
            <Route path={'/'} component={Home}></Route>
          </Switch>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
