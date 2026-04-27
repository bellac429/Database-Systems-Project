import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import JobListing from "./pages/JobListing";
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobListing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
