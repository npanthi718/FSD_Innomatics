// src/components/Navbar/Navbar.js
import React from 'react';
import './Navbar.css';

function Navbar({ isLoggedIn, username, onLogout, toggleAuthView, showLogin }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                My Todo Dashboard
            </div>
            <div className="navbar-actions">
                {isLoggedIn ? (
                    <>
                        <span className="username-display">Hello, {username}</span>
                        <button className="logout-button" onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button className="auth-button" onClick={toggleAuthView}>
                            {showLogin ? 'Signup' : 'Login'}
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;