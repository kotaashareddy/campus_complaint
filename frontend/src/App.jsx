import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/common/Login';
import Home from './components/common/Home';  
import SignUp from './components/common/SignUp';
import AgentHome from './components/agent/AgentHome';
import HomePage from './components/user/HomePage';
import Complaint from './components/user/Complaint';
import Status from './components/user/Status';
import AccordionAdmin  from './components/admin/AccordionAdmin';

import AdminHome from "./components/admin/AdminHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} /> 
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path='/agent' element={<AgentHome />} />
        <Route path='/user' element={<HomePage />} />
        <Route path='/status' element={<Status />} />
        <Route path="/admin" element={<AdminHome />}>
          <Route path="dashboard" element={<AccordionAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
