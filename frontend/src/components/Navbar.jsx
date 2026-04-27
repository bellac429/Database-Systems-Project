import './Navbar.css'
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
                <div className="logo">LOGO</div>

                <div className="links">
                        <Link to="/">Home</Link>
                        <Link to="/jobs/:id">Jobs</Link>
                        <Link to="/profile/:id">Profile</Link>
                </div>
        </nav>
    )
}

export default Navbar