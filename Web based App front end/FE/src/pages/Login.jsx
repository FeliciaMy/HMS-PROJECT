import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login({ onLogin }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault(); setError('')
    try{
      const res = await api.login(email,password)
      localStorage.setItem('authToken', res.token)
      onLogin && onLogin(res.user)
      nav('/')
    }catch(err){ setError(err.message||'Login failed') }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <div className="flex justify-between items-center">
          <div>
            <Link to="/register" className="text-sm text-blue-600">Register</Link>
          </div>
          <button className="btn btn-primary">Login</button>
        </div>
      </form>
    </div>
  )
}
