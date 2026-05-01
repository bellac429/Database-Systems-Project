import './Profile.css'
import { useState, useEffect } from 'react';

function Profile() {
        const [user, setUser] = useState(null);
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(true); 
        const [isEditing, setIsEditing] = useState(false);
        const [formData, setFormData] = useState({});
        const [resume, setResume] = useState(null);
        const [resumeFile, setResumeFile] = useState(null);
        //get user info
        useEffect(() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                setUser(storedUser);
        }, []);

        //get profile info
        useEffect(() => {
                if (!user) {
                        setLoading(false);
                        return;
                }

                setLoading(true);
                const profileUrl =
                  user.role === "company"
                    ? `http://localhost:5001/api/companies/${user.userID}/profile`
                    : `http://localhost:5001/api/students/${user.userID}/profile`;

                fetch(profileUrl)
                  .then(res => res.json())
                  .then(data => {
                    if (data.ok) {
                      setProfile(data.data);
                    }
                  })
                  .catch(err => console.error(err))
                  .finally(() => setLoading(false));
        }, [user]);

        //get user resume
        useEffect(() => {
                if (!user || user.role !== "student") return;
              
                fetch(`http://localhost:5001/api/students/${user.userID}/resume`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.ok) {
                      setResume(data.data);
                    }
                  });
        }, [user]);

        console.log(formData);

        useEffect(() => {
                if (profile) {
                        setFormData(profile);
                }
        }, [profile]);

        function handleChange(e) {
                const { name, value } = e.target;
              
                let parsedValue = value;
              
                if (name === "year" || name === "gpa") {
                  parsedValue = value === "" ? "" : Number(value);
                }
              
                setFormData(prev => ({
                  ...prev,
                  [name]: parsedValue
                }));
        }

        async function handleSave() {
                if (user?.role === "company") {
                        if (!formData.email || !formData.companyName) {
                                alert("Email and company name are required");
                                return;
                        }

                        try {
                                const res = await fetch(
                                        `http://localhost:5001/api/companies/${user.userID}/profile`,
                                        {
                                                method: "PATCH",
                                                headers: {
                                                        "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({
                                                        email: formData.email,
                                                        phone: formData.phone || null,
                                                        address: formData.address || null,
                                                        companyName: formData.companyName
                                                })
                                        }
                                );

                                const data = await res.json();

                                if (data.ok) {
                                        const updatedProfile = {
                                                ...profile,
                                                email: formData.email,
                                                phone: formData.phone || null,
                                                address: formData.address || null,
                                                companyName: formData.companyName
                                        };
                                        setProfile(updatedProfile);
                                        setFormData(updatedProfile);
                                        setIsEditing(false);

                                        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                                        if (storedUser) {
                                                localStorage.setItem(
                                                        "user",
                                                        JSON.stringify({
                                                                ...storedUser,
                                                                email: formData.email,
                                                                companyName: formData.companyName
                                                        })
                                                );
                                        }
                                } else {
                                        alert(data.error || "Failed to update profile");
                                }
                        } catch (err) {
                                console.error(err);
                        }
                        return;
                }

                if (formData.gpa < 0 || formData.gpa > 4) {
                        alert("GPA must be between 0 and 4.0");
                        return;
                }
                
                if (!formData.year || formData.year < 1) {
                        alert("Year must be a valid number");
                        return;
                }

                try {
                        const res = await fetch(
                                `http://localhost:5001/api/students/${user.userID}/profile`,
                                {
                                method: "PATCH",
                                headers: {
                                "Content-Type": "application/json"
                                },
                                body: JSON.stringify(formData)
                                }
                        );
                
                        const data = await res.json();
                
                        if (data.ok) {
                        setProfile(formData);
                        setIsEditing(false);
                        }
                } catch (err) {
                        console.error(err);
                }
        }

        async function handleResumeUpload() {
                if (!resumeFile) {
                  alert("Select a PDF first");
                  return;
                }
              
                const formData = new FormData();
                formData.append("resume", resumeFile);
                formData.append("userId", user.userID);
              
                try {
                  const res = await fetch("http://localhost:5001/api/upload-resume", {
                    method: "POST",
                    body: formData
                  });
              
                  const data = await res.json();
              
                  if (data.ok) {
                    alert("Uploaded!");
              
                    // refresh resume
                    setResume(data.data);
                  }
              
                } catch (err) {
                  console.error(err);
                }
        }

        if (loading) return <p>Loading...</p>;

        if (user?.role === "company") {
                return (
                        <div className='profile-container'>
                                <div className='profile'>
                                        {isEditing ? (
                                                <>
                                                <h1>Edit Company Profile</h1>
                                                <p>Company Name</p>
                                                <input
                                                        name="companyName"
                                                        value={formData.companyName || ""}
                                                        onChange={handleChange}
                                                />
                                                <p>Email</p>
                                                <input
                                                        name="email"
                                                        type="email"
                                                        value={formData.email || ""}
                                                        onChange={handleChange}
                                                />
                                                <p>Phone</p>
                                                <input
                                                        name="phone"
                                                        value={formData.phone || ""}
                                                        onChange={handleChange}
                                                />
                                                <p>Address</p>
                                                <input
                                                        name="address"
                                                        value={formData.address || ""}
                                                        onChange={handleChange}
                                                />

                                                <button onClick={handleSave}>Save</button>
                                                <button onClick={() => {
                                                        setFormData(profile);
                                                        setIsEditing(false);
                                                }}>
                                                Cancel
                                                </button>
                                                </>
                                        ) : (
                                                <>
                                                <h1>{profile?.companyName || "Company Profile"}</h1>
                                                <p><strong>User ID:</strong> {profile?.userID || "N/A"}</p>
                                                <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
                                                <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
                                                <p><strong>Address:</strong> {profile?.address || "N/A"}</p>
                                                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                                                </>
                                        )}
                                </div>
                        </div>
                );
        }

        return(
                <div className='profile-container'>
                        <div className='profile'>
                                {isEditing ? (
                                        <>
                                        <p>First Name</p>
                                        <input
                                                name="firstName"
                                                value={formData.firstName || ""}
                                                onChange={handleChange}
                                        />
                                        <p>Last Name</p>
                                        <input
                                                name="lastName"
                                                value={formData.lastName || ""}
                                                onChange={handleChange}
                                        />
                                        <p>Major</p>
                                        <input
                                                name="major"
                                                value={formData.major || ""}
                                                onChange={handleChange}
                                        />
                                        <p>Year</p>
                                        <input
                                                name="year"
                                                type="number"
                                                min="1"
                                                max="8"
                                                value={formData.year || ""}
                                                onChange={handleChange}
                                        />
                                        <p>DOB</p>
                                        <input
                                                name="dob"
                                                type="date"
                                                value={formData.dob ? formData.dob.split("T")[0] : ""}
                                                onChange={handleChange}
                                        />
                                        <p>GPA</p>
                                        <input
                                                name="gpa"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                value={formData.gpa || ""}
                                                onChange={handleChange}
                                        />

                                        <button onClick={handleSave}>Save</button>
                                        <button onClick={() => {
                                                setFormData(profile);
                                                setIsEditing(false);
                                        }}>
                                        Cancel
                                        </button>
                                        </>
                                ) : (
                                        <>
                                        <h1>
                                                {profile
                                                ? `${profile.firstName} ${profile.lastName}`
                                                : "No profile found"}
                                        </h1>

                                        <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
                                        <p><strong>Major:</strong> {profile?.major || "N/A"}</p>
                                        <p><strong>Year:</strong> {profile?.year || "N/A"}</p>
                                        <p><strong>DOB:</strong> {profile?.dob || "N/A"}</p>
                                        <p><strong>GPA:</strong> {profile?.gpa || "N/A"}</p>
                                        <p><strong>Skills:</strong> {profile?.skill || "N/A"}</p>

                                        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                                        </>
                                )}
                        </div>
                        <div className="resume-section">
                                <h3>Resume</h3>

                                {resume ? (
                                        <a
                                        href={`http://localhost:5001/uploads/${resume.fileName}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        >
                                        View Current Resume
                                        </a>
                                ) : (
                                        <p>No resume uploaded</p>
                                )}
                                <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setResumeFile(e.target.files[0])}
                                />

                                <button onClick={handleResumeUpload}>
                                Upload Resume
                                </button>
                        </div>
                </div>
        )
}

export default Profile