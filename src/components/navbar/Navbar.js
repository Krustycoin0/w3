import * as React from 'react'
import logo1 from './perseus.png';
import './navbar.css';
import ConnectWallet from "../ConnectWallet";
const Navbar = () => {
  return (
    <div className="per__navbar">
      <div className="per__navbar-links">
        <div className="per__navbar-links_logo">
          <img src={logo1} alt="logo" />
        </div>
        <div className="per__header-content">
          <h1 className="gradient__text">BOB4.0 Bridge</h1>
        </div>
      </div>
    </div>
  )
}

export default Navbar
