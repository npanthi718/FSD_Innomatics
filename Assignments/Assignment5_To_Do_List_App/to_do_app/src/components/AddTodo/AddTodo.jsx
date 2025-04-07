// src/components/AddTodo/AddTodo.js
import React, { useState } from 'react';
import './AddTodo.css';

function AddTodo({ onAddTodo }) {
    const [taskText, setTaskText] = useState('');
    const [dueDate, setDueDate] = useState(''); // State for due date

    const handleSubmit = (event) => {
        event.preventDefault();
        if (taskText.trim()) {
            onAddTodo(taskText, dueDate); // Pass dueDate to onAddTodo
            setTaskText('');
            setDueDate(''); // Clear due date after submission
        }
    };

    return (
        <form className="add-todo-form" onSubmit={handleSubmit}>
            <input
                type="text"
                className="add-todo-input"
                placeholder="Add task"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
            />
            <input
                type="date"
                className="add-todo-date-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
            <button className="add-todo-button" type="submit">Add</button>
        </form>
    );
}

export default AddTodo;