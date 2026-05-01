import './Applications.css'
import ApplicationEntry from '../components/ApplicationEntry'
import { useState, useEffect } from 'react';

function Register() {
        const [user, setUser] = useState(null);
        const [applications, setApplications] = useState([]);
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

                fetch(`http://localhost:5001/api/students/${user.userID}/applications`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.ok) {
                      setApplications(data.data);
                    }
                  })
                  .catch(err => console.error(err))
                  .finally(() => setLoading(false));
              }, [user]);

        if (loading) return <p>Loading...</p>;

        console.log(applications);

        return(
                <div className='applications-container'>
                        { applications.map(application => (
                                <ApplicationEntry 
                                key={application.applicationID} 
                                applicationID={application.applicationID}
                                companyName={application.companyName}
                                description={application.listingDescription}
                                dueDate={application.dateDue}
                                status={application.status}
                                listingID={application.listingID}
                                />
                        ))}
                </div>
        )
}

export default Register