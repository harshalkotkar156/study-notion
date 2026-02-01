import { useEffect, useState } from 'react'
import {Route,Routes} from "react-router-dom";
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import './App.css'

function App() {

  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex-col font-inter '>
        <Navbar/>
        <Routes>
        <Route path='/' element={<Home/>} />
      </Routes>
    </div>
  )
}

export default App
