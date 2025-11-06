import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Appointments from './pages/Appointments'
import MedicalRecords from './pages/MedicalRecords'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import api from './api'

export default function App(){
  const [user, setUser] = useState(null)
  const nav = useNavigate()

  useEffect(()=> {
    const t = localStorage.getItem('authToken')
    if(t && !user){
      api.profile().then(r=> setUser(r.user)).catch(()=> localStorage.removeItem('authToken'))
    }
  }, [])

  const logout = ()=> { localStorage.removeItem('authToken'); setUser(null); nav('/login') }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">HMS</Link>
          <nav className="flex gap-3 items-center">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/patients" className="hover:underline">Patients</Link>
            <Link to="/doctors" className="hover:underline">Doctors</Link>
            <Link to="/appointments" className="hover:underline">Appointments</Link>
            <Link to="/medical-records" className="hover:underline">Medical Records</Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.username}</span>
                <button onClick={logout} className="btn">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/medical-records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          <Route path="/login" element={<Login onLogin={(u)=>setUser(u)} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
