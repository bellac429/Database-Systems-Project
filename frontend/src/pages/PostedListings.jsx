import './PostedListings.css';
import { useEffect, useState } from "react";

function PostedListings() {
        const [user, setUser] = useState(null);
        const [listings, setListings] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");

        useEffect(() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                setUser(storedUser);
        }, []);

        useEffect(() => {
                if (!user) {
                        setLoading(false);
                        return;
                }

                if (user.role !== "company") {
                        setError("Only company users can view posted listings.");
                        setLoading(false);
                        return;
                }

                fetch(`http://localhost:5001/api/companies/${user.userID}/listings`)
                  .then((res) => res.json())
                  .then((data) => {
                        if (!data.ok) {
                                setError(data.error || "Failed to load listings.");
                                return;
                        }
                        setListings(data.data);
                  })
                  .catch(() => setError("Something went wrong while loading listings."))
                  .finally(() => setLoading(false));
        }, [user]);

        if (loading) {
                return (
                        <div className='posted-listings-container'>
                                <h1>Posted Listings</h1>
                                <p>Loading...</p>
                        </div>
                );
        }

        if (!user) {
                return (
                        <div className='posted-listings-container'>
                                <h1>Posted Listings</h1>
                                <p>Please log in as a company to view your listings.</p>
                        </div>
                );
        }

        return(
                <div className='posted-listings-container'>
                        <h1>Posted Listings</h1>
                        {error && <p className="error">{error}</p>}
                        {!error && listings.length === 0 && (
                                <p>No listings posted yet.</p>
                        )}

                        <div className="posted-listings-list">
                                {listings.map((listing) => (
                                        <div key={listing.listingID} className="posted-listing-card">
                                                <h3>{listing.description || "Untitled listing"}</h3>
                                                <p><strong>Listing ID:</strong> {listing.listingID}</p>
                                                <p><strong>Company:</strong> {listing.companyName || "Unknown"}</p>
                                                <p><strong>Posted:</strong> {new Date(listing.postDate).toLocaleString()}</p>
                                                <p><strong>Due:</strong> {new Date(listing.dateDue).toLocaleString()}</p>
                                                <p><strong>External Link:</strong> {listing.externalLink || "N/A"}</p>
                                        </div>
                                ))}
                        </div>
                </div>
        )
}

export default PostedListings