import React from 'react';
import { Redirect } from "react-router-dom";


export default class Payment extends React.Component {
  constructor(props) {
    super(props);
    
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));
    token = token.split('=')[1];
    
    var user;
    let cart = [];
    var total = 0;
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
      cart = this.props.location.state.cart;
      total = this.props.location.state.total;
    }

    // Initialize totalPriceForItem for each item to 0, this will be updated when Checkout is mounted
    for (let i = 0; i < cart.length; i++) {
      for (let j = 0; j < cart[i].length; j++) {
        cart[i][j].totalPriceForItem = 0;
        if (cart[i][j].delivery === undefined) {
          cart[i][j].delivery = false;
        }
      }
    }

    this.state = {
      user: user,
      items: cart,
      total: total,
      token: token,
      checkout: false,
    };

    this.onCheckout=this.onCheckout.bind(this);
    this.purchase=this.purchase.bind(this);
  }

  onCheckout() {
    this.setState({ checkout: true });
  }

  async postOrder(newOrder) {
    await fetch('https://simplygoodfoodapi.herokuapp.com/orders', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`,
      },
      body: JSON.stringify(newOrder)
    }).then(response => {
      // Do nothing
    })
    .catch(err => {
      throw new Error(err)
    })
  }

  async purchase(event) {

    event.preventDefault();

    if(this.state.items.length <= 0) {
      return;
    }

    // Add orders to database
    for (let i = 0; i < this.state.items.length; i++) {

      let orderItems = [];
      for (var j = 0; j < this.state.items[i].length; j++) {
        orderItems.push( { foodItem: this.state.items[i][j], quantity: this.state.items[i][j].amountToBuy } );
      }

      let newOrder = {};
      if (this.state.items[i][0].delivery) {
        newOrder = {seller: this.state.items[i][0].seller[0].email, buyer: this.state.user, foodItems: orderItems, type: "delivery", deliveryFee: this.state.items[i][0].maxDeliveryFee };
      } else {
        newOrder = {seller: this.state.items[i][0].seller[0].email, buyer: this.state.user, foodItems: orderItems, type: "pickup", deliveryFee: 0 };
      }
      await this.postOrder(newOrder);
    }

    this.setState({ items: [] });
    this.setState({ total: 0 });
    alert("Thank you for your purchase!");

    this.setState({ checkout: true });
  }

  render() {

    if (this.state.user === "") {
        return(
          <Redirect to="/" />
        );
    }

    if (this.state.checkout) {
      return (
        <Redirect to={{ pathname: '/Checkout', state: { user: this.state.user, cart: this.state.items } }} />
      );
    }

    return (
      <React.Fragment>
        <section className="content-container">
          
          <h2 className="pageheader">Total: ${this.state.total.toFixed(2)}</h2>
          <button className="selectButton" onClick={this.onCheckout}>
            Return to Cart
          </button>
          <br />
          <br />

          <h2>Payment Details</h2>
          <br />
          <form onSubmit={this.purchase} id="login">
            
            <div className="form-group text-left">
              Billing Address: <input className="form-control"  required="true" type="text" name="billingAddress"></input>
            </div>
            
            <div className="form-group text-left">
              Credit Card Number: <input className="form-control"  required="true" type="text" name="cardNumber"></input>
            </div>

            <br/>

            <div className="form-group text-left">
              <button className="form-control selectButton">
                Purchase
              </button>
            </div>
            
          </form>

          <br />

          
        </section>
      </React.Fragment>
    );
  }
}