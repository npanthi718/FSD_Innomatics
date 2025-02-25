// src/components/Signup/Signup.js
import React, { useState } from 'react';
import './Signup.css';

function Signup({ onSignupSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Username and password cannot be empty.');
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.find(user => user.username === username)) {
            setError('Username already exists.');
            return;
        }

        const newUser = { username, password };
        localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
        onSignupSuccess(username); // Call onSignupSuccess to update auth state in App
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="signup-username">Username:</label>
                    <input
                        type="text"
                        id="signup-username"
                        className="signup-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="signup-password">Password:</label>
                    <input
                        type="password"
                        id="signup-password"
                        className="signup-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="signup-button">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;