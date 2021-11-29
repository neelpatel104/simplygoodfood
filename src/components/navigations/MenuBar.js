import React from 'react'
import image from './sgfood.png'
import './MenuBar.css'
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    marginLeft: -10
  },
  spacer: {
    flex: 1,
  },
  logo: {
    maxWidth: "110px",
    marginLeft: -35
  },
});

const MenuBar = () => {
     const classes = useStyles();
    return (
        <nav className="header">
            <div className="nav-wrapper">
                <a href="/">  
                    <img src={image} className={classes.logo} />
                </a>
                <input className="menu-btn" type="checkbox" id="menu-btn"/>
                <label className="menu-icon" htmlFor="menu-btn"><span className="navicon"></span></label>

                <ul className="menu">
                    <li><a href="/">Home</a></li>
                    <li><a>About Us</a></li>
                    <li><a href="/ContactUs">Contact Us</a></li>                
                </ul>
            </div>
        </nav>
    )
}




export default MenuBar;