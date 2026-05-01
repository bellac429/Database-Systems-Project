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
        <nav className="navbar">
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
                            <Link to="/profile/:id">Profile</Link>
                            <button onClick={handleLogout}>Log Out</button>
                            </>
                        )}
                        
                        
                </div>
        </nav>
    )
}

export default Navbar