import './Profile.css'
import { useState, useEffect } from 'react';

function Profile() {
        const [user, setUser] = useState(null);
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(true); 

        useEffect(() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                setUser(storedUser);
        }, []);

        useEffect(() => {
                if (!user) {
                        setLoading(false);
                        return;
                }

                setLoading(true);

                fetch(`http://localhost:5001/api/students/${user.userID}/profile`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.ok) {
                      setProfile(data.data);
                    }
                  })
                  .catch(err => console.error(err))
                  .finally(() => setLoading(false));
              }, [user]);

        if (loading) return <p>Loading...</p>;

        console.log(profile);

        return(
                <div className='profile-container'>
                        <div className='profile'>
                                <h1>{profile ? `${profile.firstName} ${profile.lastName}` : "No profile found"}</h1>
                                <p><strong>Email:</strong> {profile ? profile.email : "N/A"}</p>
                                <p><strong>Major:</strong> {profile ? profile.major : "N/A"}</p>
                                <p><strong>Year:</strong> {profile ? profile.year : "N/A"}</p>
                                <p><strong>DOB:</strong> {profile ? profile.dob : "N/A"}</p>
                                <p><strong>GPA:</strong> {profile ? profile.gpa : "N/A"}</p>
                                <p><strong>Skills:</strong> {profile ? profile.skill : "N/A"}</p>
                        </div>
                </div>
        )
}

export default Profile