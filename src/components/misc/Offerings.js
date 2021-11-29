import React from 'react'
import { MDBIcon} from 'mdbreact';
import {Redirect} from 'react-router-dom'

import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';
import './Offerings.css'


const Home = () => {

     

    return (
        <React.Fragment>
            <div className="content-container">
                

                <div className="columns">
                    <div className="values"  align="center">
                    <MDBIcon className="green-text pr-3" icon="handshake" size="5x"/>
                    <br></br>

                    <p>Become a partner, cook healthy meals and sell them on our website.</p>
                    <p>Help us control the waste of food and earn money without leaving your house.</p>
                    <a href="/Login">
                        <input className="button" type="button" value="Be the chef!"/>
                    </a>

                    </div>
                </div>

                <div className="columns">
                    <div className="values"  align="center">
                    <MDBIcon className="green-text pr-3" icon="mobile" size="5x"/>
                    <br></br>

                    <p>Order home-made healthy meals cooked by the lovely families around you.</p>
                    <p>Choose to deliver it to you or pick it up. Delicious ready-made meals costing less than $10.</p>

                    <a href="/Login">
                        <input className="button" type="button" value="Enjoy the food!"/>
                    </a> 

                    </div>
                </div>

                <div className="rows" align="center">
                <div className="values"  align="center">
                      
                        <a href="/Login">
                            <input className="button" type="button" value="Sign in or Create an account Today!"/>
                        </a>             


                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Home;