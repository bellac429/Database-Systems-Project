import './Home.css'
import JobEntry from '../components/JobEntry'
import { useEffect, useState } from "react";

function Home() {
        const [listings, setListings] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                fetch("http://localhost:5001/api/listings")
                  .then(res => res.json())
                  .then(data => {
                    if (data.ok) {
                      setListings(data.data);
                    }
                  })
                  .catch(err => console.error(err))
                  .finally(() => setLoading(false));
              }, []);

        if (loading) return <p className="loading-state">Loading listings…</p>;

        console.log(listings)

        return(
                <div className="home-container">
                        <header className="page-hero">
                                <h1 className="page-title">Open listings</h1>
                                <p className="page-subtitle">
                                        Browse open roles and apply in a few steps. Click a card to view details and submit your application.
                                </p>
                        </header>
                        { listings.map(listing => (
                                <JobEntry 
                                key={listing.listingID} 
                                listingID={listing.listingID}
                                companyName={listing.companyName}
                                description={listing.description}
                                dateDue={listing.dateDue}
                                postDate={listing.postDate}
                                externalLink={listing.externalLink}
                                />
                        ))}
                </div>
        )
}

export default Home