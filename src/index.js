import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import { HouseholdProvider } from './contexts/HouseHoldContext'
import { TasksContext, TasksProvider } from './contexts/TasksContext'
import './index.css';
import App from './App';


ReactDOM.render(
    <BrowserRouter>
        <UserProvider>
            <HouseholdProvider>
                <TasksProvider>
                    <App />
                </TasksProvider>    
            </HouseholdProvider>
        </UserProvider>
    </BrowserRouter>,

    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
