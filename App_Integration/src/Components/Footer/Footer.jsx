import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer>
    <div className="footer">
      <div className="footer__left">
        <NavLink activeClassName="is-active" to="/about">About</NavLink>
        <NavLink activeClassName="is-active" to="/team">Team</NavLink>
        <NavLink activeClassName="is-active" to="/contact">Contact</NavLink>
        <NavLink activeClassName="is-active" to="/privacy">Privacy</NavLink>
      </div>
      <div className="footer__right">
        <p>
          &copy; 2018 Chingu Voyage 6 Bears 5
          <a href="https://github.com/chingu-voyage6/Bears-Team-05/">GitHub</a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
