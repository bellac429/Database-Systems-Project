import './Profile.css'
import { useState, useEffect } from 'react';

function initialsFromName(first, last) {
        const a = (first || '').trim().charAt(0);
        const b = (last || '').trim().charAt(0);
        const s = `${a}${b}`.toUpperCase();
        return s || '?';
}

function initialsFromCompany(name) {
        const words = (name || '').trim().split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        }
        return (name || 'C').trim().charAt(0).toUpperCase() || '?';
}

function Profile() {
        const [user, setUser] = useState(null);
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(true); 
        const [isEditing, setIsEditing] = useState(false);
        const [formData, setFormData] = useState({});
        const [resume, setResume] = useState(null);
        const [resumeFile, setResumeFile] = useState(null);

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

        console.log(profile);

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
                if (!user) return;
              
                if (user.role === "company") {
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
              
                    if (!data.ok) {
                      alert(data.error || "Failed to update profile");
                      return;
                    }
              
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
                      body: JSON.stringify({
                        firstName: formData.firstName || null,
                        lastName: formData.lastName || null,
                        major: formData.major || null,
                        year: formData.year || null,
                        gpa: formData.gpa || null,
                        dob: formData.dob ? formData.dob.split("T")[0] : null,
                        skills: [] 
                      })
                    }
                  );
              
                  const data = await res.json();
              
                  if (!data.ok) {
                    alert(data.error || "Failed to update profile");
                    return;
                  }
              
                  const updatedProfile = {
                    ...profile,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    major: formData.major,
                    year: formData.year,
                    gpa: formData.gpa,
                    dob: formData.dob
                  };
              
                  setProfile(updatedProfile);
                  setFormData(updatedProfile);
                  setIsEditing(false);
              
                } catch (err) {
                  console.error(err);
                }
              }
              

        async function handleResumeUpload() {
                if (!resumeFile) {
                  alert("Select a PDF first");
                  return;
                }
                if (!user?.userID) {
                  alert("Please log in again before uploading a resume.");
                  return;
                }
              
                const formDataUpload = new FormData();
                formDataUpload.append("resume", resumeFile);
                formDataUpload.append("userId", user.userID);
              
                try {
                  const res = await fetch("http://localhost:5001/api/upload-resume", {
                    method: "POST",
                    body: formDataUpload
                  });
              
                  const data = await res.json();
              
                  if (data.ok) {
                    alert("Uploaded!");
              
                    setResume(data.data);
                  } else {
                    alert(data.error || "Resume upload failed.");
                  }
              
                } catch (err) {
                  console.error(err);
                  alert("Resume upload failed. Check backend logs and try again.");
                }
        }

        async function handleResumeDelete() {
                if (!user?.userID || !resume?.resumeID) {
                  alert("No stored resume found to delete.");
                  return;
                }

                const confirmed = window.confirm(
                  "Delete this stored resume? If it is used in an application, the database trigger will block deletion."
                );
                if (!confirmed) return;

                try {
                  const res = await fetch(
                    `http://localhost:5001/api/students/${user.userID}/resume/${resume.resumeID}`,
                    { method: "DELETE" }
                  );
                  const data = await res.json();

                  if (!data.ok) {
                    alert(data.error || "Could not delete resume.");
                    return;
                  }

                  setResume(null);
                  setResumeFile(null);
                  alert("Resume deleted.");
                } catch (err) {
                  console.error(err);
                  alert("Resume delete failed. Check backend logs and try again.");
                }
        }

        if (loading) return <p className="loading-state">Loading profile…</p>;

        if (user?.role === "company") {
                const displayName = profile?.companyName || "Company";
                const headline = "Employer · Hiring on this platform";

                return (
                        <div className="profile-container">
                                <header className="page-hero profile-page-hero">
                                        <h1 className="page-title">Company profile</h1>
                                        <p className="page-subtitle">
                                                Information visible to candidates and used when you post listings.
                                        </p>
                                </header>

                                <div className="profile-layout profile-layout--company">
                                        <article className="profile-shell">
                                                <div className="profile-hero-panel">
                                                <div className="profile-hero-body">
                                                        <div className="profile-avatar profile-avatar--company" aria-hidden="true">
                                                                {initialsFromCompany(profile?.companyName)}
                                                        </div>
                                                        <div className="profile-identity">
                                                                {isEditing ? (
                                                                        <>
                                                                        <h2 className="profile-name">Edit organization</h2>
                                                                        <p className="profile-headline">{headline}</p>
                                                                        </>
                                                                ) : (
                                                                        <>
                                                                        <h2 className="profile-name">{displayName}</h2>
                                                                        <p className="profile-headline">{headline}</p>
                                                                        </>
                                                                )}
                                                                <div className="profile-actions">
                                                                        {isEditing ? (
                                                                                <>
                                                                                <button type="button" className="profile-btn profile-btn--primary" onClick={handleSave}>Save</button>
                                                                                <button type="button" className="profile-btn profile-btn--ghost" onClick={() => {
                                                                                        setFormData(profile);
                                                                                        setIsEditing(false);
                                                                                }}>Cancel</button>
                                                                                </>
                                                                        ) : (
                                                                                <button type="button" className="profile-btn profile-btn--primary" onClick={() => setIsEditing(true)}>Edit profile</button>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                                </div>

                                                <div className="profile-body">
                                                        {isEditing ? (
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Organization</h3>
                                                                        <div className="profile-form-grid">
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-co-name">Company name</label>
                                                                                        <input id="pf-co-name" name="companyName" value={formData.companyName || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-co-email">Email</label>
                                                                                        <input id="pf-co-email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-co-phone">Phone</label>
                                                                                        <input id="pf-co-phone" name="phone" value={formData.phone || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field profile-field--full">
                                                                                        <label className="profile-label" htmlFor="pf-co-addr">Address</label>
                                                                                        <input id="pf-co-addr" name="address" value={formData.address || ""} onChange={handleChange} />
                                                                                </div>
                                                                        </div>
                                                                </section>
                                                        ) : (
                                                                <>
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Contact</h3>
                                                                        <dl className="profile-dl">
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Email</dt>
                                                                                        <dd>{profile?.email || "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Phone</dt>
                                                                                        <dd>{profile?.phone || "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Address</dt>
                                                                                        <dd>{profile?.address || "—"}</dd>
                                                                                </div>
                                                                        </dl>
                                                                </section>
                                                                <section className="profile-section-card profile-section-card--muted">
                                                                        <h3 className="profile-section-title">Account</h3>
                                                                        <p className="profile-meta-line"><span className="profile-meta-label">User ID</span> {profile?.userID ?? "—"}</p>
                                                                </section>
                                                                </>
                                                        )}
                                                </div>
                                        </article>
                                </div>
                        </div>
                );
        }

        const studentName = profile
                ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Student"
                : "Student";
        const studentHeadline = profile
                ? [profile.major, profile.year ? `Year ${profile.year}` : null, profile.gpa != null ? `GPA ${profile.gpa}` : null]
                        .filter(Boolean)
                        .join(" · ")
                : "Add your education details to stand out to employers.";

        return(
                <div className="profile-container">
                        <header className="page-hero profile-page-hero">
                                <h1 className="page-title">Your profile</h1>
                                <p className="page-subtitle">
                                        This is how you present yourself to companies — similar to a Handshake or LinkedIn profile.
                                </p>
                        </header>

                        <div className="profile-layout">
                                <div className="profile-main">
                                        <article className="profile-shell">
                                                <div className="profile-hero-panel">
                                                <div className="profile-hero-body">
                                                        <div className="profile-avatar" aria-hidden="true">
                                                                {initialsFromName(profile?.firstName, profile?.lastName)}
                                                        </div>
                                                        <div className="profile-identity">
                                                                {isEditing ? (
                                                                        <>
                                                                        <h2 className="profile-name">Edit profile</h2>
                                                                        <p className="profile-headline">Update your education and contact information</p>
                                                                        </>
                                                                ) : (
                                                                        <>
                                                                        <h2 className="profile-name">{studentName}</h2>
                                                                        <p className="profile-headline">{studentHeadline}</p>
                                                                        </>
                                                                )}
                                                                <div className="profile-actions">
                                                                        {isEditing ? (
                                                                                <>
                                                                                <button type="button" className="profile-btn profile-btn--primary" onClick={handleSave}>Save</button>
                                                                                <button type="button" className="profile-btn profile-btn--ghost" onClick={() => {
                                                                                        setFormData(profile);
                                                                                        setIsEditing(false);
                                                                                }}>Cancel</button>
                                                                                </>
                                                                        ) : (
                                                                                <button type="button" className="profile-btn profile-btn--primary" onClick={() => setIsEditing(true)}>Edit profile</button>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                                </div>

                                                <div className="profile-body">
                                                        {isEditing ? (
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Basics</h3>
                                                                        <div className="profile-form-grid">
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-first">First name</label>
                                                                                        <input id="pf-st-first" name="firstName" value={formData.firstName || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-last">Last name</label>
                                                                                        <input id="pf-st-last" name="lastName" value={formData.lastName || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field profile-field--full">
                                                                                        <label className="profile-label" htmlFor="pf-st-email">Email</label>
                                                                                        <input id="pf-st-email" name="email" readOnly disabled value={profile?.email || ""} />
                                                                                </div>
                                                                        </div>
                                                                </section>
                                                        ) : (
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Contact</h3>
                                                                        <dl className="profile-dl profile-dl--single">
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Email</dt>
                                                                                        <dd>{profile?.email || "—"}</dd>
                                                                                </div>
                                                                        </dl>
                                                                </section>
                                                        )}

                                                        {isEditing ? (
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Education</h3>
                                                                        <div className="profile-form-grid">
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-major">Major</label>
                                                                                        <input id="pf-st-major" name="major" value={formData.major || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-year">Year</label>
                                                                                        <input id="pf-st-year" name="year" type="number" min="1" max="8" value={formData.year || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-gpa">GPA</label>
                                                                                        <input id="pf-st-gpa" name="gpa" type="number" step="0.01" min="0" max="4" value={formData.gpa || ""} onChange={handleChange} />
                                                                                </div>
                                                                                <div className="profile-field">
                                                                                        <label className="profile-label" htmlFor="pf-st-dob">Date of birth</label>
                                                                                        <input id="pf-st-dob" name="dob" type="date" value={formData.dob ? formData.dob.split("T")[0] : ""} onChange={handleChange} />
                                                                                </div>
                                                                        </div>
                                                                </section>
                                                        ) : (
                                                                <section className="profile-section-card">
                                                                        <h3 className="profile-section-title">Education</h3>
                                                                        <dl className="profile-dl">
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Major</dt>
                                                                                        <dd>{profile?.major || "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Year</dt>
                                                                                        <dd>{profile?.year ?? "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>GPA</dt>
                                                                                        <dd>{profile?.gpa ?? "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Date of birth</dt>
                                                                                        <dd>{profile?.dob ? String(profile.dob).split("T")[0] : "—"}</dd>
                                                                                </div>
                                                                                <div className="profile-dl-row">
                                                                                        <dt>Skills</dt>
                                                                                        <dd>{profile?.skill || "—"}</dd>
                                                                                </div>
                                                                        </dl>
                                                                </section>
                                                        )}
                                                </div>
                                        </article>
                                </div>

                                <aside className="profile-aside">
                                        <div className="profile-sidebar-card">
                                                <h3 className="profile-sidebar-title">Resume</h3>
                                                <p className="profile-sidebar-lead">Recruiters often review your resume alongside this profile.</p>

                                                {resume ? (
                                                        <a
                                                                className="profile-resume-link"
                                                                href={`http://localhost:5001/uploads/${resume.fileName}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                        >
                                                                View resume
                                                        </a>
                                                ) : (
                                                        <p className="profile-sidebar-empty">No resume uploaded yet.</p>
                                                )}

                                                <label className="profile-file-label" htmlFor="profile-resume-file">
                                                        Choose PDF
                                                </label>
                                                <input
                                                        id="profile-resume-file"
                                                        type="file"
                                                        accept="application/pdf"
                                                        className="profile-file-native"
                                                        onChange={(e) => setResumeFile(e.target.files[0])}
                                                />

                                                <button type="button" className="profile-btn profile-btn--primary profile-btn--block" onClick={handleResumeUpload}>
                                                        Upload resume
                                                </button>
                                                {resume && (
                                                        <button type="button" className="profile-btn profile-btn--danger profile-btn--block" onClick={handleResumeDelete}>
                                                                Delete stored resume
                                                        </button>
                                                )}
                                        </div>
                                </aside>
                        </div>
                </div>
        )
}

export default Profile
