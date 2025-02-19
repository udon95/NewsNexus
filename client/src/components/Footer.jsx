
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css"; // Modular CSS import

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">© 2025 NewsNexus. All Rights Reserved.</p>
        <Link to="/privacy-policy" className="privacy-policy">Privacy Policy</Link>
      </div>
    </footer>
  );
};

export default Footer;
