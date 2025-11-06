import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register(){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault(); setError('')
    try{
      const res = await api.register({ username, email, password })
      localStorage.setItem('authToken', res.token)
      nav('/')
    }catch(err){ setError(err.message||'Register failed') }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" />
        <div className="flex justify-end">
          <button className="btn btn-primary">Create account</button>
        </div>
      </form>
    </div>
  )
}
