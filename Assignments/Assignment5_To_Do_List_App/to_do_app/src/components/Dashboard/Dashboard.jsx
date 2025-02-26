// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import TodoList from '../TodoList/TodoList';
import Navbar from '../Navbar/Navbar';
import './Dashboard.css';

function Dashboard({ isLoggedIn, currentUser, onLogout, LoginComponent, SignupComponent, showLogin, toggleAuthView }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const motivationalLines = useMemo(() =>[
        "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        "Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible.",
        "Don't watch the clock; do what it does. Keep going.",
        "Your future is created by what you do today, not tomorrow.",
        "Productivity is being able to do things that you were never able to do before."
    ], []);
    const [motivationalLine, setMotivationalLine] = useState("");

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, [motivationalLines]);

    useEffect(() => {
        setMotivationalLine(motivationalLines[Math.floor(Math.random() * motivationalLines.length)]);
    }, [motivationalLines]);

    return (
        <div className="dashboard-container">
            <Navbar isLoggedIn={isLoggedIn} username={currentUser} onLogout={onLogout} toggleAuthView={toggleAuthView} showLogin={showLogin}/>
            <header className="dashboard-header">
                <h2>Welcome to Your Interactive Dashboard!</h2>
                <p className="date-time">
                    {currentDate.toLocaleDateString()} - {currentDate.toLocaleTimeString()}
                </p>
                <p className="motivational-line">
                    "{motivationalLine}"
                </p>
            </header>
            <main className="dashboard-content">
                {isLoggedIn ? (
                    <TodoList currentUser={currentUser} /> // Pass currentUser to TodoList
                ) : (
                    <div className="auth-area">
                        {showLogin ? LoginComponent : SignupComponent}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
