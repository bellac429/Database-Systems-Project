import './Login.css'
import { useState } from 'react';

function Login() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");

        async function handleSubmit(e) {
                e.preventDefault();
                setError("");
              
                try {
                  const res = await fetch("http://localhost:5001/api/auth/login", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                  });
              
                  const data = await res.json();
              
                  if (!data.ok) {
                    setError(data.error);
                    return;
                  }
              
                  //store user 
                  localStorage.setItem("user", JSON.stringify(data.data));
              
                  console.log("Logged in!", data.data);
              
                  //redirect to home
                  window.location.href = "/";
              
                } catch (err) {
                  setError("Something went wrong");
                }
        }

        console.log(JSON.parse(localStorage.getItem("user")));

        return(
                <div className="login-container">
                        <header className="page-hero page-hero--auth">
                                <h1 className="page-title">Log in</h1>
                                <p className="page-subtitle">
                                        Sign in to browse listings, apply to roles, and manage your profile.
                                </p>
                        </header>
                        <form className='login-console' onSubmit={handleSubmit}>
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

                                <button type="submit">Log In</button>
                        </form>
                </div>
        )
}

export default Login