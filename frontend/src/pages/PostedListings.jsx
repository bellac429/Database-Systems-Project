import './PostedListings.css';
import { useEffect, useState } from "react";

function toDateTimeLocalValue(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function PostedListings() {
        const [user, setUser] = useState(null);
        const [listings, setListings] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [selectedListingId, setSelectedListingId] = useState(null);
        const [formData, setFormData] = useState({
                description: "",
                externalLink: "",
                dateDue: "",
        });
        const [saving, setSaving] = useState(false);
        const [saveMessage, setSaveMessage] = useState("");

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

        function handleSelectListing(listing) {
                setSelectedListingId(listing.listingID);
                setSaveMessage("");
                setError("");
                setFormData({
                        description: listing.description || "",
                        externalLink: listing.externalLink || "",
                        dateDue: toDateTimeLocalValue(listing.dateDue),
                });
        }

        function handleChange(e) {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        }

        async function handleSave(e) {
                e.preventDefault();
                setSaveMessage("");
                setError("");

                if (!selectedListingId) return;
                if (!formData.dateDue) {
                        setError("Due date is required.");
                        return;
                }
                if (formData.description.length > 1000) {
                        setError("Description must be 1000 characters or fewer.");
                        return;
                }
                if (formData.externalLink.length > 100) {
                        setError("External link must be 100 characters or fewer.");
                        return;
                }

                setSaving(true);
                try {
                        const res = await fetch(`http://localhost:5001/api/listings/${selectedListingId}`, {
                                method: "PATCH",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                        companyUserId: user.userID,
                                        companyEmail: user.email,
                                        dateDue: formData.dateDue,
                                        description: formData.description.trim() || null,
                                        externalLink: formData.externalLink.trim() || null,
                                }),
                        });

                        const data = await res.json();
                        if (!data.ok) {
                                setError(data.error || "Failed to update listing.");
                                return;
                        }

                        setListings((prev) =>
                                prev.map((listing) =>
                                        listing.listingID === selectedListingId
                                                ? {
                                                          ...listing,
                                                          description: formData.description.trim() || null,
                                                          externalLink: formData.externalLink.trim() || null,
                                                          dateDue: formData.dateDue,
                                                  }
                                                : listing
                                )
                        );
                        setSaveMessage("Listing updated successfully.");
                } catch (_err) {
                        setError("Something went wrong while updating listing.");
                } finally {
                        setSaving(false);
                }
        }

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
                                        <button
                                                key={listing.listingID}
                                                className={`posted-listing-card ${selectedListingId === listing.listingID ? "selected" : ""}`}
                                                type="button"
                                                onClick={() => handleSelectListing(listing)}
                                        >
                                                <h3>{listing.description || "Untitled listing"}</h3>
                                                <p><strong>Listing ID:</strong> {listing.listingID}</p>
                                                <p><strong>Company:</strong> {listing.companyName || "Unknown"}</p>
                                                <p><strong>Posted:</strong> {new Date(listing.postDate).toLocaleString()}</p>
                                                <p><strong>Due:</strong> {new Date(listing.dateDue).toLocaleString()}</p>
                                                <p><strong>External Link:</strong> {listing.externalLink || "N/A"}</p>
                                        </button>
                                ))}
                        </div>

                        {selectedListingId && (
                                <form className="edit-listing-form" onSubmit={handleSave}>
                                        <h2>Edit Listing #{selectedListingId}</h2>

                                        <label htmlFor="description">Description</label>
                                        <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                maxLength={1000}
                                        />

                                        <label htmlFor="externalLink">External Link</label>
                                        <input
                                                id="externalLink"
                                                name="externalLink"
                                                type="text"
                                                value={formData.externalLink}
                                                onChange={handleChange}
                                                maxLength={100}
                                        />

                                        <label htmlFor="dateDue">Due Date</label>
                                        <input
                                                id="dateDue"
                                                name="dateDue"
                                                type="datetime-local"
                                                value={formData.dateDue}
                                                onChange={handleChange}
                                                required
                                        />

                                        {saveMessage && <p className="success">{saveMessage}</p>}
                                        <button type="submit" disabled={saving}>
                                                {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                </form>
                        )}
                </div>
        )
}

export default PostedListings