import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import CreateListing from "./pages/CreateListing";
import PostedListings from "./pages/PostedListings";
import JobApply from "./pages/JobApply";
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/applications/:id" element={<Applications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/createlisting" element={<CreateListing />} />
        <Route path="/listings" element={<PostedListings />} />
        <Route path="/apply/:id" element={<JobApply />} />
      </Routes>
    </div>
  )
}

export default App
