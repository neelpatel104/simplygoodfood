import React from 'react';
import { Redirect } from "react-router-dom";

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import './FoodItems.css'

/**
 * Seller dashboard webpage functionality
 */
export default class Seller extends React.Component {
  constructor(props) {
    super(props);

    // Takes the username that was passed as a prop to this page's location and sets it as part of the state
    var user;
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
    }

    // Takes the authentication token from the cookie and saves it in state
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));
    if (token === undefined) {
      user = "";
    }
    token = token.split('=')[1];

    // Sets state
    this.state = {
      // Username of seller that is logged in (email)
      user: user,
      // Food items the seller is selling
      items: [],
      // Name of new food item to add
      newName: "",
      // Price of new food item to add
      newPrice: "",
      // Quantity of new food item to add
      newQuantity: "",
      // Delivery fee of new food item to add
      newDeliveryFee: "",
      // Authorization token value of the logged in user
      token: token,
      //orderHistory
      sellerHistory: false,
    
    };

    // Binding
    this.addFood=this.addFood.bind(this);
    this.handleTextChange=this.handleTextChange.bind(this);
    this.save=this.save.bind(this);
    this.discard=this.discard.bind(this);
    this.getFoodItems=this.getFoodItems.bind(this);
    this.addTestingValues=this.addTestingValues.bind(this);
    this.logOut=this.logOut.bind(this);
    this.onSellerHistory=this.onSellerHistory.bind(this);

  }

  // Runs as soon as Seller mounts
  // Not in constructor to avoid warning
  componentDidMount() {
    this.getFoodItems();
  }

  /**
   * Fetch the food items of a specific seller and loads them into state.items
   */
  async getFoodItems() {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/foodItems/seller/${this.state.user}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${this.state.token}`,
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      let newItems = [];
      for (let i = 0; i < responseJSON.length; i++) {
        if (responseJSON[i].seller === this.state.user) {
          newItems.push(responseJSON[i]);
        }
      }
      this.setState({ items: newItems });
    })
    .catch(err => {
      // Do nothing, will be redirected to home page
      //throw new Error(err);
    })
  }

  /**
   * Adds a new food item to the database
   * @param {FoodItem} newItem the food item to add
   */
  async postFood(newItem) {
    await fetch('https://simplygoodfoodapi.herokuapp.com/foodItems', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`,
      },
      body: JSON.stringify(newItem)
    })
    .then(() => this.getFoodItems())
    .catch(err => {
      throw new Error(err)
    })
  }

  /**
   * Deletes a food item from the database
   * @param {String} name the name of the food item
   */
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

  /**
   * Updates a food item in the database
   * @param {FoodItem} newItem the food item with updated fields
   */
  async putFood(newItem) {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/foodItems`, {
      method: 'PUT',
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

  /**
   * Adds a food item to the database by calling postFood
   * @param {Event} event button click event
   */
  addFood(event) {
    event.preventDefault();
    let newItem = {name: this.state.newName,
                  price: this.state.newPrice, quantity: this.state.newQuantity, deliveryFee: this.state.newDeliveryFee};

    for (let i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i].name.toLowerCase() === newItem.name.toLowerCase()) {
        alert("Cannot add duplicate item");
        return;
      }
    }

    this.postFood(newItem);

    //Reset input boxes
    this.setState({newName: ""});
    this.setState({newPrice: ""});
    this.setState({newQuantity: ""});
    this.setState({newPickup: ""});
    this.setState({newDeliveryFee: ""});
  }

  /**
   * Handles input box text changes
   * @param {Event} event input box text change event
   */
  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  /**
   * Used by each Card to update the food item they represent by calling putFood
   * Method is passed to each Card as a prop
   * @param {*} name name of the food item to update
   * @param {*} price the new price
   * @param {*} quantity the new quantity
   * @param {*} deliveryFee the new delivery fee
   */
  save(name, price, quantity, deliveryFee) {
    let newItem = {name: name, price: price, quantity: quantity, deliveryFee: deliveryFee};
    this.putFood(newItem);
  }

  /**
   * Used by each Card to delete the food item they represent by calling deleteFood
   * Method is passed to each Card as a prop
   * @param {*} name the name of the food item to delete
   */
  discard(name) {
    this.deleteFood(name);
  }

  logOut(){
    document.cookie = "token=";
    this.setState({user: ""});
  }


  onSellerHistory() {
    this.setState({ sellerHistory: true });
  }

  /**
   * Renders html of all the food item cards
   * @returns html of all the food item cards
   */
  renderCards() {
    var cards = [];
    for (let i = 0; i < this.state.items.length; i++) {
      cards.push(<Card
              key={i}
              name={this.state.items[i].name}
              price={this.state.items[i].price}
              quantity={this.state.items[i].quantity}
              deliveryFee={this.state.items[i].deliveryFee}
              save={this.save}
              discard={this.discard}
            />);
    }
    return cards;
  }

  /**
   * Temporary functionality for adding food items for testing
   */
  addTestingValues() {
    let newFood = {name: "Tomatoes", price: 1.23, quantity: 15, pickup: "Address Dr", deliveryFee: 5.99};
    this.postFood(newFood);
    newFood = {name: "Leftover Pasta", price: 0.78, quantity: 9, pickup: "Address Dr", deliveryFee: 5.99};
    this.postFood(newFood);
    newFood = {name: "Cabbages", price: 3.45, quantity: 2, pickup: "Address Dr", deliveryFee: 5.99};
    this.postFood(newFood);
  }

  /**
   * Renders the card for the seller to use to add a new food item
   * @returns html for the card for the seller to use to add a new food item
   */
  renderForm() {
    return (
        <div className="itemColumns">
          <div className="itemValues" align="center">
            <form onSubmit={this.addFood}>
              Food name: <input type="text" name="newName" value={this.state.newName} onChange={this.handleTextChange}></input>
              <br />
              <br />
              Price: <input type="text" name="newPrice" value={this.state.newPrice} onChange={this.handleTextChange}></input>
              <br />
              <br />
              Quantity: <input type="number" name="newQuantity" value={this.state.newQuantity} onChange={this.handleTextChange}></input>
              <br />
              <br />
              Delivery fee: <input type="text" name="newDeliveryFee" value={this.state.newDeliveryFee} onChange={this.handleTextChange}></input>
              <br />
              <br />
              <br />
              <button className="itemButton">
                Add food
              </button>
            </form>
          </div>
        </div>
    );
  }

  /**
   * Renders the Seller component as html
   * @returns the Seller page as html
   */
  render() {
    //Return to home page if no user is logged in
    if (this.state.user === "") {
        return(
          <Redirect to="/" />
        );
    }

    if (this.state.sellerHistory) {
      return (
        //Redirect to orderHistory.js with the user and their cart
        <Redirect to={{ pathname: '/SellerHistory', state: { user: this.state.user } }} />
      );
    }

    return (
      <React.Fragment>
        <section className="content-container">
          <h1 className="pageheader">Seller Dashboard</h1>
          <br />

          <button style={{ float: 'right'}} className="selectButton" onClick={this.onSellerHistory}>
            Seller History
            </button>
          <div className="rows" align="right"> 
            <button align="right" className="selectButton" onClick={this.logOut}>
              Log Out
            </button>
          </div>
          
          <br />
          
          {this.renderCards()}

          {this.renderForm()}

          

        </section>
      </React.Fragment>
    );
  }
}

/**
 * Represents a food item 'card' on the webpage
 */
 class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: this.props.price,
      quantity: this.props.quantity,
      pickup: this.props.pickup,
      deliveryFee: this.props.deliveryFee,
    };
    this.handleTextChange=this.handleTextChange.bind(this);
  }

  /**
   * Handles input box text changes
   * @param {Event} event input box text change event
   */
  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  /**
   * Renders the food item card
   * @returns html of the food item card
   */
  render () {
    return (
      <div className="itemColumns">
        <div className="itemValues" align="center">
          <p>Name: {this.props.name}</p>
          <br />
          Price: <input type="text"  name="price" value={this.state.price} onChange={this.handleTextChange}></input>
          <br />
          <br />
          Quantity: <input type="number" name="quantity" min='0' value={this.state.quantity} onChange={this.handleTextChange}></input>
          <br />
          <br />
          Delivery: <input type="text" name="deliveryFee" value={this.state.deliveryFee} onChange={this.handleTextChange}></input>
          <br />
          <br />
          <br />

          <button className="itemButton" onClick={() => {
            // Calls the save method in Seller that was passed to Card as a prop
            this.props.save(this.props.name, this.state.price, this.state.quantity, this.state.deliveryFee);
          }}>Save</button>

          <button className="itemButton" onClick={() => {
            // Calls the discard method in Seller that was passed to Card as a prop
            this.props.discard(this.props.name);
          }}>Discard</button>

        </div>
      </div>
    );
  }
}
