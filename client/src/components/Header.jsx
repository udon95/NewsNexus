// import React from "react";
// import { Link } from "react-router-dom";
// import logo from "../NewsNexus.svg"; // Using local logo
// import "../index.css"; // Custom styles

// const Header = () => {
//   return (
//     <header className="header">
//       {/* Top Section: Logo & Profile Box */}
//       <div className="header-top">
//         {/* Clickable logo redirects to homepage */}
//         <Link to="/HomePage" className="logo-container">
//           <img src={logo} alt="NewsNexus Logo" className="logo" />
//         </Link>
//         <div className="profile-box">P</div>
//       </div>

//       {/* Navigation Bar */}
//       <nav className="navigation">
//         <ul className="nav-menu">
//           <li className="separator">|</li>
//           <li className="nav-item"><Link to="/HomePage">Home</Link></li>
//           <li className="separator">|</li>
//           <li className="nav-item"><Link to="/ExplorePage">Explore</Link></li>
//           <li className="separator">|</li>
//           <li className="nav-item"><Link to="/SubscriptionPage">Subscription</Link></li>
//           <li className="separator">|</li>
//           <li className="nav-item"><Link to="/GuidelinesPage">Platform Guidelines</Link></li>
//           <li className="separator">|</li>
//         </ul>
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/NewsNexus.svg"; // Organized inside assets
import "../styles/Header.css"; // Modular CSS import

const Header = () => {
  return (
    <header className="header">
      {/* Top Section: Logo & Profile Box */}
      <div className="header-top">
        <Link to="/HomePage" className="logo-container">
          <img src={logo} alt="NewsNexus Logo" className="logo" />
        </Link>
        <div className="profile-box">P</div>
      </div>

      {/* Navigation Bar */}
      <nav className="navigation">
        <ul className="nav-menu">
          <li className="separator">|</li>
          <li className="nav-item"><Link to="/HomePage">Home</Link></li>
          <li className="separator">|</li>
          <li className="nav-item"><Link to="/ExplorePage">Explore</Link></li>
          <li className="separator">|</li>
          <li className="nav-item"><Link to="/SubscriptionPage">Subscription</Link></li>
          <li className="separator">|</li>
          <li className="nav-item"><Link to="/GuidelinesPage">Platform Guidelines</Link></li>
          <li className="separator">|</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
