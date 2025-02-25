// src/components/TodoItem/TodoItem.js
import React, { useState, useEffect } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onComplete, onEdit, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTaskText, setEditTaskText] = useState(todo.text);
    const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
    const [isMissed, setIsMissed] = useState(false); // State to track if todo is missed

    useEffect(() => {
        if (todo.dueDate && !todo.completed) {
            const dueDate = new Date(todo.dueDate);
            const now = new Date();
            if (dueDate < now) {
                setIsMissed(true);
            } else {
                setIsMissed(false);
            }
        } else {
            setIsMissed(false);
        }
    }, [todo.dueDate, todo.completed]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (editTaskText.trim()) {
            onEdit(todo.id, editTaskText, editDueDate);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditTaskText(todo.text);
        setEditDueDate(todo.dueDate || '');
    };

    return (
        <div className="todo-item">
            <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => onComplete(todo.id)}
            />
            {isEditing ? (
                <div className="todo-item-editing">
                    <input
                        type="text"
                        className="todo-edit-input"
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                    />
                    <input
                        type="date"
                        className="todo-edit-date-input"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                    />
                    <div className="todo-edit-actions">
                        <button className="todo-save-button" onClick={handleSave}>Save</button>
                        <button className="todo-cancel-button" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="todo-item-display">
                    <div className="todo-details">
                        <span className={`todo-text ${todo.completed ? 'completed' : ''} ${isMissed ? 'missed' : ''}`}>
                            {todo.text}
                        </span>
                        {todo.dueDate && <p className="todo-due-date">Due Date: {todo.dueDate}</p>}
                        {isMissed && !todo.completed && <p className="todo-missed-status">Missed</p>}
                    </div>
                    <div className="todo-actions">
                        {todo.completed ? (
                            <span className="completed-status">Completed</span>
                        ) : (
                            <>
                                <button className="todo-edit-button" onClick={handleEdit}>Edit</button>
                                <button className="todo-delete-button" onClick={() => onDelete(todo.id)}>Delete</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TodoItem;