import React from 'react';
import { Redirect } from "react-router-dom";

export default class Checkout extends React.Component {
  constructor(props) {
    super(props);
    
    let token = document.cookie.split('; ').find(row => row.startsWith('token'));
    token = token.split('=')[1];
    
    var user;
    let cart = [];
    if (this.props.location.state === undefined) {
      user = "";
    } else {
      user = this.props.location.state.user;
      cart = this.props.location.state.cart;
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
      total: 0,
      token: token,
      shop: false,
      payment: false,
    };

    this.onShop=this.onShop.bind(this);
    this.clearCart=this.clearCart.bind(this);
    this.calculateTotal=this.calculateTotal.bind(this);
    this.updateItemInCart=this.updateItemInCart.bind(this);
    this.removeFromCart=this.removeFromCart.bind(this);
    this.purchase=this.purchase.bind(this);
    this.logOut=this.logOut.bind(this);
  }

  // Runs as soon as Checkout mounts
  // Not in constructor to avoid warning
  componentDidMount() {
    this.calculateTotal();
  }

  calculateTotal() {
    let newItems = this.state.items;
    let totalPrice = 0;
    
    for (let i = 0; i < newItems.length; i++) {
      
      let maxDeliveryFee = 0;
      for (let j = 0; j < newItems[i].length; j++) {
        // Calculate total price for item
        newItems[i][j].totalPriceForItem = +newItems[i][j].price * +newItems[i][j].amountToBuy;
        if (newItems[i][j].delivery && newItems[i][j].deliveryFee > maxDeliveryFee) {
          // newItems[i][j].totalPriceForItem = +newItems[i][j].totalPriceForItem + +newItems[i][j].deliveryFee;
          maxDeliveryFee = newItems[i][j].deliveryFee;
        }
        // Update total price for transaction
        totalPrice += newItems[i][j].totalPriceForItem;
        // Rounding
        newItems[i][j].totalPriceForItem = Math.round(newItems[i][j].totalPriceForItem * 100) / 100;
      }
      totalPrice = +totalPrice + +maxDeliveryFee;
      totalPrice = Math.round(totalPrice * 100) / 100;

      // Store max delivery fee of order with the first item
      newItems[i][0].maxDeliveryFee = maxDeliveryFee;
    }

    this.setState({ total: totalPrice });
  }

  onShop() {
    this.setState({ shop: true });
  }

  clearCart() {
    this.setState({ items: [] });
    this.setState({ total: 0 });
  }

  updateItemInCart(idx, isDelivery) {
    let sellerIdx = idx[0];

    let newItems = this.state.items;
    for (let i = 0; i < newItems[sellerIdx].length; i++) {
      newItems[sellerIdx][i].delivery = isDelivery;
    }

    this.setState( {items: newItems });
    this.calculateTotal();
  }

  removeFromCart(idx) {
    let sellerIdx = idx[0];
    let itemIdx = idx[1];
    let newItems = this.state.items;

    newItems[sellerIdx].splice(itemIdx, 1);

    // If item was the last one in the seller array, delete the (now empty) seller array from the cart
    if (newItems[sellerIdx].length === 0) {
      newItems.splice(sellerIdx, 1);
    }

    this.setState( {items: newItems });
    this.calculateTotal();
  }

  purchase() {
    if (this.state.total > 0) {
      this.setState({ payment: true });
    }
  }

  logOut(){
    document.cookie = "token=";
    this.setState({user: ""});
  }

  renderCards() {
    var cards = [];
    for (let i = 0; i < this.state.items.length; i++) {
      for (let j = 0; j < this.state.items[i].length; j++) {
        cards.push(<Card
                key={[i, j]}
                id={[i, j]}
                seller={this.state.items[i][j].seller}
                name={this.state.items[i][j].name}
                totalPriceForItem={this.state.items[i][j].totalPriceForItem}
                amountToBuy={this.state.items[i][j].amountToBuy}
                pickup={this.state.items[i][j].seller[0].address}
                deliveryFee={this.state.items[i][j].deliveryFee}
                delivery={this.state.items[i][j].delivery}
                updateItemInCart={this.updateItemInCart}
                removeFromCart={this.removeFromCart}
              />);
      }
    }
    return cards;
  }

  render() {

    if (this.state.user === "") {
        return(
          <Redirect to="/" />
        );
    }

    if (this.state.shop) {
      return (
        <Redirect to={{ pathname: '/Shop', state: { user: this.state.user, cart: this.state.items } }} />
      );
    }

    if (this.state.payment) {
      return (
        <Redirect to={{ pathname: '/Payment', state: { user: this.state.user, cart: this.state.items, total: this.state.total } }} />
      );
    }

    return (
      <React.Fragment>
        <section className="content-container">
          
          <h2 className="pageheader">Total: ${this.state.total.toFixed(2)}</h2>
          <button className="selectButton" onClick={this.purchase}>
            Purchase
          </button>
          <button className="selectButton" onClick={this.onShop}>
            Return to shopping
          </button>
          <button className="selectButton" onClick={this.clearCart}>
            Clear Cart
          </button>
          <button style={{ float: 'right'}} className="selectButton" onClick={this.logOut}>
            Log Out
            </button>
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
    };

    this.handleCheckboxChange=this.handleCheckboxChange.bind(this);
  }

  handleCheckboxChange(event) {
    const checked = event.target.checked;
    this.setState({
      [event.target.name]: checked
    });
    this.props.updateItemInCart(this.props.id, checked);
  }

  render () {
    return (
      <div className="itemColumns">
        <div className="itemValues" align="center">
          <p>Seller: {this.props.seller[0].name}</p>
          <p>Name: {this.props.name}</p>
          <p>Pickup: {this.props.pickup}</p>
          <p>Delivery: ${this.props.deliveryFee}</p>
          <br />
          <p>Amount to buy: {this.props.amountToBuy}</p>
          <p>Total price: ${this.props.totalPriceForItem.toFixed(2)}</p>

          <button className="itemButton" onClick={() => {
            this.props.removeFromCart(this.props.id);
          }}>Remove from Cart</button>
          <input type="checkbox" id="delivery" name="isDelivery" checked={this.props.delivery} onChange={this.handleCheckboxChange} />
          <label htmlFor="delivery"> Delivery?</label>
        </div>
      </div>
    );
  }

}