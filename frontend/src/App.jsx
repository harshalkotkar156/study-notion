import { useEffect, useState } from 'react'
import { Route, Routes } from "react-router-dom";
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import Error from "./pages/Error";
import OpenRoute from "./components/core/auth/OpenRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from './pages/VerifyEmail';

import './App.css'

function App() {

  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex-col font-inter '>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
