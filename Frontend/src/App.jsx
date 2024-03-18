import { useState } from 'react'

import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './page/Register'
import Verify from './page/Verify';
import Notfound from './page/Notfound';
import Login from './page/Login';
import ForgotPassword from './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';

function App() {
  return (
  
    <Router>
    <Routes>
      <Route path='/'  element={<Register/>} />
      <Route path='/verify/:id'  element={<Verify/>} />
      <Route path='/login'  element={<Login/>} />
      <Route path='/forgotPassword'  element={<ForgotPassword/>} />
      <Route path='/reset-password/:id'  element={<ResetPassword/>} />
      <Route path='/reset-password/:id'  element={<ResetPassword/>} />


      {/* magic found from medium */}
      <Route path="*" element={<Notfound />} /> 
    </Routes>
    </Router>
  
  )
}

export default App