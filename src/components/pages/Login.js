import React from 'react';
import { Redirect } from 'react-router-dom';

/**
 * Login page
 */
export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Whether or not someone logged in, used for Redirecting
      loggedIn: false,
      // Whether or not the logged in user is a buyer or a seller, used to determine which page to redirect the user to
      seller: false,
      // Username of logged in user to pass to other pages
      user: "",

      // Login
      // Email the user logs in with
      email: "",
      // Password the user logs in with
      password: "",
      
      // Account creation
      // Name of the new user
      name:"",
      // Email of the new user
      newEmail:"",
      // Password of the new user
      newPassword: "",
      // Address of the new user
      address: "",
      // If the new user is a seller
      isSeller: false,
    };

    // Binding
    this.handleTextChange=this.handleTextChange.bind(this);
    this.handleCheckboxChange=this.handleCheckboxChange.bind(this);
    this.login=this.login.bind(this);
    this.createUser=this.createUser.bind(this);
    this.loginUser=this.loginUser.bind(this);
    this.postUser=this.postUser.bind(this);
    this.renderForm=this.renderForm.bind(this);
    this.clearState=this.clearState.bind(this);
  }

  /**
   * Makes a POST request to login as the provided user
   * @param {User} user the user to login as
   */
  async loginUser(user) {
    await fetch('https://simplygoodfoodapi.herokuapp.com/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(responseJSON => responseJSON.response.data)
    .then(responseData => {
      this.setState({ user: responseData.email });
      this.setState({ seller: false });
      console.log(responseData);
      if (responseData.role === 'seller') {
        this.setState({ seller: true });
      }
      console.log("logged in");
    })
    .catch(err => {
      console.log(err);
      throw new Error(err);
    })
  }

  /**
   * Makes a POST request to create a new user
   * @param {User} newUser the user to create
   * @param {*} role the role of the user (buyer or seller)
   */
  async postUser(newUser, role) {
    await fetch(`https://simplygoodfoodapi.herokuapp.com/users/register/${role}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    }).then(res => {
     
      if (!res.ok){
        res.text().then(text => {alert(text)})
      } else {
        alert("User created!");
      }
    
    }).catch(err => {
      console.log(err);
      throw err;
    })
  }

  /**
   * Logs in as the user with the email and password in the login input fields by calling loginUser
   * @param {Event} event login button click event
   */
  async login(event) {
    event.preventDefault();

    try {
      let user = {email: this.state.email, password: this.state.password };
      await this.loginUser(user);
      
      console.log("logged in 2");
      this.setState({ loggedIn: true });

    } catch (err) {
      alert("Invalid credentials");
    }

  }

  /**
   * Creates a new user with the values in the user creation input fields by calling postUser
   * @param {Event} event create user button click event
   */
  async createUser(event) {
    event.preventDefault();

    try {
      let newUser = {name: this.state.name, email: this.state.newEmail, password: this.state.newPassword, address: this.state.address };
      if (this.state.isSeller) {
        await this.postUser(newUser, "seller");
      } else {
        await this.postUser(newUser, "buyer");
      }
    } catch (err) {
      alert(err);
    }

    this.clearState();
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
   * Handles check box text changes
   * @param {Event} event check box text change event
   */
  handleCheckboxChange(event) {
    const checked = event.target.checked;
    this.setState({
      [event.target.name]: checked
    });
  }

  /**
   * Clears the input fields by resetting the state
   */
  clearState() {
    this.setState({ name: "", newEmail: "", newPassword: "", address: "", isSeller: false});
  }

  /**
   * Renders the form for user login and new user creation
   * @returns html for user login and new user creation
   */
  renderForm() {
    // If the user has logged in
    if (this.state.loggedIn) {
      // If the user is a seller
      if (this.state.seller) {
        // If the user is a seller, redirect to /Seller with the user's email as the parameter
        return (
          <Redirect to={{ pathname: '/Seller', state: { user: this.state.user } }} />
        );
      }
      // If the user is a buyer, redirect to /Shop with the user's email and an empty cart as the parameters
      return (
        <Redirect to={{ pathname: '/Shop', state: { user: this.state.user, cart: [], pastOrders: [] } }} />
      );
    }

    return (
        <div className="pageheader">
          
           <div className="col-left">
            <h2>Login</h2>
            <br />
            <form onSubmit={this.login}>
              <div className="form-group text-left">
                Email: <input className="form-control" required="true" type="text" name="email" value={this.state.email} onChange={this.handleTextChange}></input>
              </div>

              <div className="form-group text-left">
                Password: <input  className="form-control" required="true" type="password" name="password" value={this.state.password} onChange={this.handleTextChange}></input>
              </div>

              <div className="form-group text-left">
                <button className="form-control selectButton">  
                Login
               </button>
               </div>
              </form>
              </div>
       
            <div className="col-left">
          
            <h2>Create user</h2>
            <br />
            <form onSubmit={this.createUser} id="login">
              
              <div className="form-group text-left">
                Name: <input className="form-control"  required="true" type="text" name="name" value={this.state.name} onChange={this.handleTextChange}></input>
              </div>
              
              <div className="form-group text-left">
                Email: <input className="form-control"  required="true" type="email" name="newEmail" value={this.state.newEmail} onChange={this.handleTextChange}></input>
              </div>

              <div className="form-group text-left">
                Password: <input  className="form-control" required="true" type="password" name="newPassword" value={this.state.newPassword} onChange={this.handleTextChange}></input>
              </div>

              <div className="form-group text-left">
                Address: <input className="form-control" required="true" type="text" name="address" value={this.state.address} onChange={this.handleTextChange}></input>
              </div>

              <div className="form-group text-left">
              <input type="checkbox" id="seller" name="isSeller" checked={this.state.isSeller} onChange={this.handleCheckboxChange} />
              <label htmlFor="seller"> Seller</label>
              </div>

              <div className="form-group text-left">
              <button className="form-control selectButton">
                Create User
              </button>
              </div>
              
            </form>
            </div>
         
        </div>
    );
  }

  /**
   * Renders the login page
   * @returns html for the login page
   */
  render() {
    return (
      <React.Fragment>
        <section className="content-container">
          {this.renderForm()}
        </section>
      </React.Fragment>
    );
  }
}
