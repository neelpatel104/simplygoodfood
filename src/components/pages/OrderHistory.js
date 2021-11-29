import React from 'react';
import { Redirect } from "react-router-dom";

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import './FoodItems.css';

export default class OrderHistory extends React.Component {
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
      //All food items in the system
      items: [],
      //Orders of the buyer
      orders: [],
      message: "",
      token: token,
      logout: false,
      shop: false,
    };
    this.renderOrders=this.renderOrders.bind(this);
    this.handleTextChange=this.handleTextChange.bind(this);
    this.getFoodItemName=this.getFoodItemName.bind(this);
    this.logOut=this.logOut.bind(this);
    this.onShop=this.onShop.bind(this);
  }

  componentDidMount() {
    this.getFoodItems();
    this.getOrders();
  }

  async getFoodItems(){
    await fetch('http://localhost:8080/foodItems', {
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
    await fetch(`http://localhost:8080/orders/${this.state.user}`, {
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
      console.log(responseJSON);
    })
    .catch(err => {
      // Do nothing, will be redirected to home page
      throw new Error(err);
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

  onShop() {
    this.setState({ shop: true });
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

  renderOrders() {
    if (this.state.orders.length <= 0) {
      return (
        <h2>{this.state.message}</h2>
      );
    }

    var orders = [];
    for(let i = this.state.orders.length - 1; i >= 0; i--) {
      
      var date = new Date(this.state.orders[i].date);

      orders.push(<Order key={i}
                    date={date.toLocaleString()}
                    totalPrice={this.state.orders[i].totalPrice.toFixed(2)}
                    seller={this.state.orders[i].seller[0].name}
                    type={this.state.orders[i].type}
                    status={this.state.orders[i].status}
                    address={this.state.orders[i].address}
                  />);

      let orderDetails = "";
      for(let j = 0; j < this.state.orders[i].foodItems.length; j++) {

        let name = this.getFoodItemName(this.state.orders[i].foodItems[j].foodItem);

        orderDetails = this.state.orders[i].foodItems[j].quantity + " " + name + ", $" + this.state.orders[i].foodItems[j].foodItemsPrice.toFixed(2);
        
        orders.push(<h4>{orderDetails}</h4>);
      }
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

    if (this.state.shop) {
      return (
        //Redirect to orderHistory.js with the user and their cart
        <Redirect to={{ pathname: '/Shop', state: { user: this.state.user, cart: this.props.location.state.cart } }} />
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
            <button style={{ float: 'right'}} className="selectButton" onClick={this.onShop}>
            Shop
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
  render () {
    return (
      <div>
        <h2>Date: {this.props.date}</h2>
        <h3>Total: ${this.props.totalPrice}, Seller: {this.props.seller}, Status: {this.props.status}</h3>
        <h4>Type: {this.props.type}, Address: {this.props.address}</h4>
      </div>
    );
  }
}