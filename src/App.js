import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddItem from "./components/AddItem";
import Dashboard from "./components/Dashboard";


function App() {
  return <Dashboard />;
}

export default App;