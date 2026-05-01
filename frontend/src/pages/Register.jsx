import './Register.css'
import { useState } from 'react';

function Register() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
        const bodyData =
        role === "student"
                ? { role, email, password, firstName, lastName }
                : { role, email, password, companyName };
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.data));

      console.log("Registered!", data.data);

      window.location.href = "/";

    } catch (err) {
      setError("Something went wrong");
    }
  }

  return (
    <div className="register-container">
      <form className='register-console' onSubmit={handleSubmit}>
        <h1>Register</h1>

        {/* Role selector */}
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>

        {role === "student" && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </>
        )}
        
        {role === "company" && (
          <>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
