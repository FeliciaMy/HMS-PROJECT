import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard(){
  const [stats,setStats]=useState({patients:0,appointmentsToday:0})
  useEffect(()=>{
    (async ()=>{
      try{
        const p = await api.getPatients(1,1)
        setStats(s=>({...s, patients: p.pagination?.total || (p.patients? p.patients.length:0)}))
        const today = new Date().toISOString().split('T')[0]
        const a = await api.getAppointments({ date: today })
        setStats(s=>({...s, appointmentsToday: a.count || 0}))
      }catch(err){ console.error(err) }
    })()
  },[])

  const seed = async ()=>{
    if(!confirm('Seed demo data?')) return
    try{ await api.seed(); alert('Seeded'); window.location.reload() }catch(e){ alert(e.message||'Seed failed') }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div>
          <button className="btn" onClick={seed}>Seed Demo Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Patients</div>
          <div className="text-3xl font-bold">{stats.patients}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Appointments Today</div>
          <div className="text-3xl font-bold">{stats.appointmentsToday}</div>
        </div>
      </div>
    </div>
  )
}
