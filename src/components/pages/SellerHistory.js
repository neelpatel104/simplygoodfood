import React from 'react';
import { Redirect } from "react-router-dom";

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import './FoodItems.css';

export default class SellerHistory extends React.Component {
  constructor(props) {
    super(props);

    var user;
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
    }
    
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));
    token = token.split('=')[1];

    this.state = {
      user: user,
      id: 0,
      //Orders of the buyer
      orders: [],
      fulfilledorders: [],
      message: "",
      token: token,
      logout: false,
      seller: false,
    };
    this.renderOrders=this.renderOrders.bind(this);
    this.handleTextChange=this.handleTextChange.bind(this);
    this.logOut=this.logOut.bind(this);
    this.getFoodItemName=this.getFoodItemName.bind(this);
    this.fulfill=this.fulfill.bind(this);
    this.onSeller=this.onSeller.bind(this);
  }

  componentDidMount() {
    this.getFoodItems();
    this.getOrders();
  }

  async getFoodItems(){
    await fetch('https://simplygoodfoodapi.herokuapp.com/foodItems', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'authorization': `Bearer ${this.state.token}`,
      },
    })
    .then(response => response.json())
    .then(responseJSON => {
      let newItems = responseJSON;
      
      this.setState({items: newItems});
    })
    .catch(err => {
      // this.setState({ user: "" });
      // Do nothing, will be redirected back to home page
      // throw new Error(err)
    })
  }
 
  /**
   * Fetch the orders of the user and load them into state.orders
   */
   async getOrders() {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/orders/${this.state.user}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${this.state.token}`,
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      if (responseJSON.length <= 0) {
        this.setState({ message: "No orders to show" });
      }

      this.setState({ orders: responseJSON });
    



    })
    .catch(err => {
      // Do nothing, will be redirected to home page
      // throw new Error(err);
    })
  }

  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  logOut(){
    document.cookie = "token=";
    this.setState({user: ""});
  }

  onSeller() {
    this.setState({ seller: true });
  }

  getFoodItemName(id) {
    var name = "Missing";

    for(var i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i]._id === id) {
        name = this.state.items[i].name;
      }
    }

    return name;
  }

  fulfill(key){
    this.state.orders[key].status = 'fulfilled';
    this.setState({ orders: this.state.orders });
    this.putOrder(this.state.orders[key]);
}

 /**
   * Updates a food item in the database
   * @param {FoodItem} newItem the food item with updated fields
   */
  async putOrder(newItem) {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/orders/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`,
      },
      body: JSON.stringify(newItem)
    }).then(response => {
      // Do nothing
    })
    .catch(err => {
      throw new Error(err)
    })
  }

  renderOrders() {

    if (this.state.orders.length <= 0) {
      return (
        <h2>{this.state.message}</h2>
      );
    }

    var orders = [];
    for(let i = this.state.orders.length - 1; i >= 0; i--) {
      
      var date = new Date(this.state.orders[i].date);

      let isNotfulFilled = false;
      if ( this.state.orders[i].status === 'pending'){
        isNotfulFilled = true;
      }

      let orderDetails = "";
      for(let j = 0; j < this.state.orders[i].foodItems.length; j++) {

        let name = this.getFoodItemName(this.state.orders[i].foodItems[j].foodItem);

        orderDetails = this.state.orders[i].foodItems[j].quantity + " " + name + ", $" + this.state.orders[i].foodItems[j].foodItemsPrice.toFixed(2);
        
        orders.push(<h4>{orderDetails}</h4>);
      }
      orders.push(<Order 
        key={i}
        number={i}
        date={date.toLocaleString()}
        totalPrice={this.state.orders[i].totalPrice.toFixed(2)}
        buyer={this.state.orders[i].buyer[0].name}
        type={this.state.orders[i].type}
        status={this.state.orders[i].status}
        address={this.state.orders[i].address}
        fulfill={this.fulfill}
        isNotfulFilled={isNotfulFilled }
      />);
      orders.push(<br/>);
      orders.push(<br/>);
    }
    return orders;
  }

  render() {
    // If no user is logged in
    if (this.state.user === "") {
        return(
          <Redirect to="/" />
        );
    }

    if (this.state.seller) {
      return (
        //Redirect to orderHistory.js with the user and their cart
        <Redirect to={{ pathname: '/Seller', state: { user: this.state.user } }} />
      );
    }

    return (
      <React.Fragment>
        <section className="content-container">
          <h1 className="pageheader">Order History</h1>
          <div className="rows">
            <button style={{ float: 'right'}} className="selectButton" onClick={this.logOut}>
            Log Out
            </button>
            <button style={{ float: 'right'}} className="selectButton" onClick={this.onSeller}>
            Seller Dashboard
            </button>
          </div>
          <br />
          <br />
          <br />
          <br />
          {this.renderOrders()}
          
          <br />

        </section>
      </React.Fragment>
    );
  }
}

class Order extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.handleTextChange=this.handleTextChange.bind(this);
      }
    
      handleTextChange(event) {
        let value = event.target.value;
        if (value > this.props.amount) {
          value = this.props.amount;
        } else if (value < 0) {
          value = 0;
        }
        this.setState({
          [event.target.name]: value
        });
      }
  render () {
    return (
      <div>
        <h2>Date: {this.props.date}</h2>
        <h3>Total: ${this.props.totalPrice}, Seller: {this.props.buyer}, Status: {this.props.status}</h3>
        <h4>Type: {this.props.type}, Address: {this.props.address}</h4>
        {this.props.isNotfulFilled && <button  className="itemButton" onClick={() => {
            this.props.fulfill(this.props.number);
          }}>Fulfill</button>}
      </div>
      
    );
  }
}