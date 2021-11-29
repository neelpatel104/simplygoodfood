import React from 'react';
import { Redirect } from "react-router-dom";

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import './FoodItems.css'

export default class Shop extends React.Component {
  constructor(props) {
    super(props);

    var user;
    let cart = [];
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
      cart = this.props.location.state.cart;
    }
    
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));

    console.log(document.cookie);
    console.log(token);

    if (token === undefined) {
      user = "";
    }
    token = token.split('=')[1];

    this.state = {
      user: user,
      id: 0,
      //All food items for sale
      items: [],
      //Food items in buyer's cart - passed to checkout.js and back
      cart: cart,
      newSeller: "",
      newName: "",
      newPrice: "",
      newAmount: "",
      newPickup: "",
      newDelivery: "",
      token: token,
      message: "",
      checkout: false,
      logout: false,
      orderHistory: false,
    };
    this.handleTextChange=this.handleTextChange.bind(this);
    this.addToCart=this.addToCart.bind(this);
    this.onCheckout=this.onCheckout.bind(this);
    this.logOut=this.logOut.bind(this);
    this.onOrderHistory=this.onOrderHistory.bind(this);
  }

  componentDidMount() {
    this.getFoodItems();
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
      if (responseJSON.length <= 0) {
        this.setState({ message: "No items in the shop, sorry!" });
      }

      let newItems = responseJSON;
      let newCart = this.state.cart;
      for (let i = 0; i < newItems.length; i++) {
        newItems[i].amountToBuy = 0;
        // Check if seller exists in cart
        for (let j = 0; j < newCart.length; j++) {
          // If yes, loop through the array of items corresponding to the seller in the cart
          if (newItems[i].seller[0].name === newCart[j][0].seller[0].name) {
            // Check if item exists in cart
            for (let k = 0; k < newCart[j].length; k++) {
              // If yes
              if (newItems[i].name === newCart[j][k].name) {
                // Update the amount to buy and quantity of the displayed item to match the corresponding item in the cart
                newItems[i].amountToBuy = newCart[j][k].amountToBuy;
                newItems[i].quantity = +newItems[i].quantity - +newItems[i].amountToBuy;
              }
            }
          }
        }
      }

      // Do not display items that have a quantity of 0
      for (let i = newItems.length - 1; i >= 0; i--) {
        if (newItems[i].quantity <= 0) {
          newItems.splice(i, 1);
        }
      }
      
      this.setState({items: newItems});
    })
    .catch(err => {
      // this.setState({ user: "" });
      // Do nothing, will be redirected back to home page
      // throw new Error(err)
    })
  }

  async deleteFood(name) {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/foodItems/${name}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${this.state.token}`,
      },
    })
    .then(() => this.getFoodItems())
    .catch(err => {
      throw new Error(err)
    })
  }

  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  discard(seller, name) {
    this.deleteFood(seller, name);
  }

  addToCart(idx, amountToBuy, isDelivery) {
    // Error checking, cannot buy amount of 0
    if (amountToBuy <= 0) {
      return;
    }

    // Update displayed item
    var newItems = this.state.items;
    newItems[idx].amountToBuy = +newItems[idx].amountToBuy + +amountToBuy;
    newItems[idx].quantity = +newItems[idx].quantity - +amountToBuy;
    newItems[idx].isDelivery = isDelivery;
    this.setState( {items: newItems });

    // Update cart
    let newCart = this.state.cart;
    var sellerInCart = false;
    var itemInCart = false;
    // Find array corresponding to the correct seller
    // The cart is a 2d array structured as an array of arrays of items corresponding to each seller
    // [sellers][items]
    for (let i = 0; i < newCart.length; i++) { 
      // Found array corresponding to correct seller
      if (newItems[idx].seller[0].name === newCart[i][0].seller[0].name) {
        sellerInCart = true;
        // Find item
        for (let j = 0; j < newCart[i].length; j++) {
          // Found item
          if (newItems[idx].name === newCart[i][j].name) {
            itemInCart = true;
            newCart[i][j].amountToBuy = newItems[idx].amountToBuy;
          }
        }
        // If item not found, add it to cart
        if (!itemInCart) {
          newCart[i].push(newItems[idx]);
        }
      }
    }
    // If correct seller array not found, add the item to a new array in the cart
    if (!sellerInCart) {
      newCart.push([]);
      newCart[newCart.length - 1].push(newItems[idx]);
    }
    this.setState({ cart: newCart });
  }

  logOut(){
    document.cookie = "token=";
    this.setState({user: ""});
  }

  onOrderHistory() {
    this.setState({ orderHistory: true });
  }

  onCheckout() {
    this.setState({ checkout: true });
  }

  renderCards() {
    console.log(this.state.items);
    if (this.state.items.length <= 0) {
      return (
        <h2>{this.state.message}</h2>
      );
    }
    var cards = [];
    for (let i = 0; i < this.state.items.length; i++) {
      cards.push(<Card
              key={i}
              id={i}
              seller={this.state.items[i].seller[0].name}
              name={this.state.items[i].name}
              price={this.state.items[i].price}
              amount={this.state.items[i].quantity}
              pickup={this.state.items[i].seller[0].address}
              delivery={this.state.items[i].deliveryFee}
              addToCart={this.addToCart}
            />);
    }
    return cards;
  }

  render() {
    // If no user is logged in
    if (this.state.user === "") {
        return(
          <Redirect to="/" />
        );
    }

    if (this.state.checkout) {
      return (
        //Redirect to checkout.js with the user and their cart
        <Redirect to={{ pathname: '/Checkout', state: { user: this.state.user, cart: this.state.cart } }} />
      );
    }

    if (this.state.orderHistory) {
      return (
        //Redirect to orderHistory.js with the user and their cart
        <Redirect to={{ pathname: '/OrderHistory', state: { user: this.state.user, cart: this.state.cart } }} />
      );
    }

    return (
      <React.Fragment>
        <section className="content-container">
          <h1 className="pageheader">Shop</h1>
          <div className="rows">
            <button align="right" className="selectButton" onClick={this.onCheckout}>
              View Cart
            </button>
            <button style={{ float: 'right'}} className="selectButton" onClick={this.logOut}>
            Log Out
            </button>
            <button style={{ float: 'right'}} className="selectButton" onClick={this.onOrderHistory}>
            Order History
            </button>
          </div>
          <br />
          <br />
          {this.renderCards()}
          
          <br />

        </section>
      </React.Fragment>
    );
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amountToBuy: 0,
      isDelivery: false,
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
      <div className="itemColumns">
        <div className="itemValues" align="center">
          <p>Seller: {this.props.seller}</p>
          <p>Name: {this.props.name}</p>
          <p>Price: ${this.props.price}</p>
          <p>Amount: {this.props.amount}</p>
          <p>Pickup: {this.props.pickup}</p>
          <p>Delivery: ${this.props.delivery}</p>

          <button className="itemButton" onClick={() => {
            this.props.addToCart(this.props.id, this.state.amountToBuy, this.state.isDelivery);
            this.setState({ amountToBuy: 0 });
          }}>Add to Cart</button>
          Amount: <input type="number" className="amountInput" name="amountToBuy" min='0' max={this.props.amount} value={this.state.amountToBuy} onChange={this.handleTextChange}></input>
        </div>
      </div>
    );
  }
}