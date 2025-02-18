import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
// import "./header.css";
import logo from "../assets/Logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const userEmail = auth?.email;
  const userRole = auth?.userRole;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "P";

  const logout = () => {
    sessionStorage.removeItem("user-role");
    sessionStorage.removeItem("user-email");
    sessionStorage.removeItem("auth");
setAuth({});
    
    alert("Logout successful!");
    navigate("/");
  };

  const renderNavLinks = () => {
    switch (userRole) {
      case "Admin":
        return (
          <>
            <Link to="/admin">Manage Users</Link>
            <Link to="/admin/profiles">Manage Profiles</Link>
          </>
        );
      case "Free":
        return (
          <>
            <Link to="/buyer">View Listings</Link>
            <Link to="/buyer/wishlist">Wishlist</Link>
            <Link to="/buyer/loan">Calculate Loan</Link>
          </>
        );
      case "Premium":
        return (
          <>
            <Link to="/seller">My Listings</Link>
          </>
        );
      case "Expert":
        return (
          <>
            <Link to="/agent">Manage Listings</Link>
            <Link to="/agent/ratings">Ratings and Reviews</Link>
          </>
        );
      default:
        return null;
        // return <Link to="/login">Login</Link>;
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/">
        <img
          loading="lazy"
          img
          src={logo}
          className="h-10 sm:h-12 w-auto cursor-pointer"
          alt="NewsNexus Logo"
        />
        </Link>

        <nav className="nav-items flex items-center gap-6">
          {renderNavLinks()}
          {userEmail ? (
          <button
              className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
              onClick={() => navigate("/profile")} // Navigate to profile page
              title="Profile"
            >
              {userInitial}
            </button>
          ) : (
            <Link
              to="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
          {userEmail ? (
            <Link to="/" onClick={logout}>
              Logout
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export default Header;
