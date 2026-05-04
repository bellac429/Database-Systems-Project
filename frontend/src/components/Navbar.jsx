import './Navbar.css'
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';


function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);
    }, []);
  
    function handleLogout() {
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/";
    }

    return (
        <nav className="navbar" aria-label="Main navigation">
                <div className="navbar-inner">
                <div className="logo">LOGO</div>

                <div className="links">
                        {!user && (
                            <>
                            <Link to="/">Home</Link>
                            <Link to="/login">Log In</Link>
                            <Link to="/register">Register</Link>
                            </>
                        )}

                        {user && user.role === "student" && (
                            <>
                            <Link to="/">Home</Link>
                            <Link to="/applications/:id">Applications</Link>
                            <Link to={`/profile/${user.userID}`}>Profile</Link>
                            <button onClick={handleLogout}>Log Out</button>
                            </>
                        )}

                        {user && user.role === "company" && (
                            <>
                            <Link to="/createlisting/">New Listing</Link>
                            <Link to="/listings/">Posted Listings</Link>
                            <Link to={`/profile/${user.userID}`}>Profile</Link>
                            <button onClick={handleLogout}>Log Out</button>
                            </>
                        )}
                </div>
                </div>
        </nav>
    )
}

export default Navbar