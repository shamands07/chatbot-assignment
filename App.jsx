import React, { useState } from 'react';
import './Login.css'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    alert(`Logging in with email: ${email}`);
  };

  const openGitHub = () => {
    window.open('https://github.com/shamands07/chatbot-assignment', '_blank');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src="https://subspace.money/index_files/logo.png" 
          alt="Subspace Logo"
          className="logo"
        />
        <h2>CHATBOT LOGIN</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={openGitHub} className="github-btn">
          View GitHub
        </button>
      </div>
    </div>
  );
}
