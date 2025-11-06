import React, { useEffect, useState } from 'react'
import api from '../api'
import { fmtDate } from '../utils'

export default function Appointments(){
  const [appts,setAppts]=useState([])
  const [patients,setPatients]=useState([])
  const [doctors,setDoctors]=useState([])
  const [form,setForm]=useState({ patient:'', doctor:'', date:'', reason:'' })

  useEffect(()=>{ load() }, [])
  const load = async ()=>{ try{ const a = await api.getAppointments(); setAppts(a.appointments || []); const p = await api.getPatients(1,200); setPatients(p.patients || []); const d = await api.getDoctors(); setDoctors(d || []) }catch(e){ console.error(e) } }

  const save = async ()=>{ try{ await api.createAppointment(form); setForm({}); await load() }catch(e){ alert(e.message||'Failed') } }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Appointments</h1>
      <div className="bg-white rounded shadow overflow-auto mb-6">
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="px-4 py-2">Patient</th><th className="px-4 py-2">Doctor</th><th className="px-4 py-2">Date</th><th className="px-4 py-2">Reason</th></tr></thead>
          <tbody>{appts.map(a=> <tr key={a._id} className="hover:bg-gray-50"><td className="px-4 py-2 border">{a.patient?.personalInfo ? `${a.patient.personalInfo.firstName} ${a.patient.personalInfo.lastName}` : a.patient?.patientId}</td><td className="px-4 py-2 border">{a.doctor?.name ? `${a.doctor.name.firstName} ${a.doctor.name.lastName}` : '—'}</td><td className="px-4 py-2 border">{fmtDate(a.date)}</td><td className="px-4 py-2 border">{a.reason}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">New Appointment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select className="border p-2" value={form.patient} onChange={e=>setForm(s=>({...s, patient: e.target.value }))}><option value="">Select patient</option>{patients.map(p=> <option key={p._id} value={p._id}>{p.patientId} - {p.personalInfo?.firstName} {p.personalInfo?.lastName}</option>)}</select>
          <select className="border p-2" value={form.doctor} onChange={e=>setForm(s=>({...s, doctor: e.target.value }))}><option value="">Select doctor</option>{doctors.map(d=> <option key={d._id} value={d._id}>{d.doctorId || d._id} - {d.name?.firstName} {d.name?.lastName}</option>)}</select>
          <input className="border p-2" type="datetime-local" value={form.date||''} onChange={e=>setForm(s=>({...s, date: e.target.value }))} />
          <input className="border p-2" placeholder="Reason" value={form.reason||''} onChange={e=>setForm(s=>({...s, reason: e.target.value }))} />
        </div>
        <div className="mt-3 flex justify-end"><button className="btn btn-primary" onClick={save}>Create</button></div>
      </div>
    </div>
  )
}
