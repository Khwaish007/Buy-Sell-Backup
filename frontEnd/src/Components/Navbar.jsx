import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <>
      <nav className="navbar">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Profile"><b>Profile</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Buy"><b>Buy</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/OrderHistory"><b>OrderHistory</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Cart"><b>Cart</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Support"><b>Support</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Login"><b>Login</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/Sell"><b>Sell</b></a>
          </li>
          <li className="nav-item">
            <a className="nav-link" aria-current="page" href="/DeliverItems"><b>DeliverItems</b></a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;