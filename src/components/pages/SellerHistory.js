import React from 'react';
import { Redirect } from "react-router-dom";

import 'bootstrap-css-only/css/bootstrap.min.css'; 

export default class SellerHistory extends React.Component {
  constructor(props) {
    super(props);
    
    var user;
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
    }
    console.log(this.state.user);
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));
    token = token.split('=')[1];

    this.state = {
      user: user,
    };
 
  }

   render() {

    return (
      <React.Fragment>
        <section className="content-container">
          <h1 className="pageheader">Order History</h1>
          <div className="rows">
            <button style={{ float: 'right'}} className="selectButton" >
            Log Out
            </button>
          </div>
          <br />
          <br />
          <br />
          <br />
          
          <br />

        </section>
      </React.Fragment>
    );
  }
}
