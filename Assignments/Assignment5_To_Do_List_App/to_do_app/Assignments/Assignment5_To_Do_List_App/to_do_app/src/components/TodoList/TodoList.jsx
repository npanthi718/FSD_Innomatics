// src/components/TodoList/TodoList.js
import React, { useState, useEffect } from 'react';
import TodoItem from '../TodoItem/TodoItem';
import AddTodo from '../AddTodo/AddTodo';
import './TodoList.css';

function TodoList({ currentUser }) { // Receive currentUser as prop
    const [isLoggedIn] = useState(() => localStorage.getItem('currentUser') !== null);
    const [todos, setTodos] = useState(() => {
        if (!currentUser) return []; // Return empty array if no user is logged in (should not happen in logged-in TodoList)
        const savedTodos = localStorage.getItem(`todos_${currentUser}`);
        return savedTodos ? JSON.parse(savedTodos) : [];
    });

    useEffect(() => {
        if (currentUser) { // Only save if a user is logged in
            localStorage.setItem(`todos_${currentUser}`, JSON.stringify(todos)); // Use user-specific key for saving
        }
    }, [todos, currentUser]);

    const handleAddTodo = (text, dueDate) => {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
            dueDate: dueDate || null
        };
        setTodos([...todos, newTodo]);
    };

    const handleCompleteTodo = (id) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(updatedTodos);
    };

    const handleEditTodo = (id, newText, newDueDate) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, text: newText, dueDate: newDueDate } : todo
        );
        setTodos(updatedTodos);
    };

    const handleDeleteTodo = (id) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
    };

    if (!isLoggedIn) {
        return (
            <div className="todo-list-container restricted">
                <p className="login-prompt">Please login to access your Todo List.</p>
            </div>
        );
    }

    return (
        <div className="todo-list-container">
            <AddTodo onAddTodo={handleAddTodo} />
            {todos.length === 0 ? (
                <p className="empty-message">Your todo list is currently empty. Add a task to get started!</p>
            ) : (
                <ul className="todos">
                    {todos.map(todo => (
                        <li key={todo.id} className="todo-list-item">
                            <TodoItem
                                todo={todo}
                                onComplete={handleCompleteTodo}
                                onEdit={handleEditTodo}
                                onDelete={handleDeleteTodo}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TodoList;