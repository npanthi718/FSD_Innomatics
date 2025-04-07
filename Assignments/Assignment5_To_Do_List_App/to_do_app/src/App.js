// src/App.js
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setIsLoggedIn(true);
            setCurrentUser(storedUser);
        }
    }, []);

    const handleLogin = (username) => {
        setIsLoggedIn(true);
        setCurrentUser(username);
        localStorage.setItem('currentUser', username);
    };

    const handleSignupSuccess = (username) => {
        setIsLoggedIn(true);
        setCurrentUser(username);
        localStorage.setItem('currentUser', username);
        setShowLogin(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const toggleAuthView = () => {
        setShowLogin(!showLogin);
    };

    return (
    <div className="app-container">
    <h1>Interactive Todo List</h1>
    <Dashboard
    isLoggedIn={isLoggedIn}
    currentUser={currentUser} // Ensure currentUser is passed here
    onLogout={handleLogout}
    LoginComponent={<Login onLogin={handleLogin} />}
    SignupComponent={<Signup onSignupSuccess={handleSignupSuccess} />}
    showLogin={showLogin}
    toggleAuthView={toggleAuthView}
    />
    </div>
    );
}

export default App;