import React from 'react'
import { Link } from "react-router-dom"
import './Header.css'

const Header = () => {
    return (
        <React.Fragment>
            <header className="bg-image">
                <div className="bg-container">
                    <h1>Healthy Home-Made Food</h1>
                    <Link to="/">Get your food for cheap now!</Link>
                </div>
            </header>
        </React.Fragment>
    )
}

export default Header;