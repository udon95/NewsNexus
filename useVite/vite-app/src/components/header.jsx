
import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch logged-in user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const userEmail = user?.email;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "P";

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const renderNavLinks = () => {
    return (
      <>
        {/* <Link to="/">Home</Link> */}
        {/* <Link to="/explore">Explore</Link>
        <Link to="/subscription">Subscription</Link>
        <Link to="/guidelines">Platform Guidelines</Link> */}
      </>
    );
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-[60px] py-4">
        <Link to="/">
          <img
            loading="lazy"
            src={logo}
            className="h-10 sm:h-12 w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
        </Link>

        <nav className="nav-items flex items-center gap-6">
          {renderNavLinks()}

          {/* Show Profile Button if User is Logged In */}
          {userEmail && (
            <button
              className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md hover:bg-blue-300 transition"
              onClick={() => navigate("/profile")} // Navigate to profile page
              title="Profile"
            >
              {userInitial}
            </button>
          )}

          {/* Show Logout if Logged In */}
          {userEmail && (
            <button
              onClick={logout}
              className="text-red-500 font-medium hover:underline"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
