import React, { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'

export default function Patients(){
  const [patients,setPatients]=useState([])
  const [loading,setLoading]=useState(false)
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({ patientId:'', personalInfo:{ firstName:'', lastName:'', gender:'', phone:'' }, age:'' })

  useEffect(()=>{ load() }, [])

  const load = async ()=>{ setLoading(true); try{ const r = await api.getPatients(1,200); setPatients(r.patients || r) }catch(e){ console.error(e) } setLoading(false) }

  const openAdd = ()=>{ setEditing(null); setForm({ patientId:'', personalInfo:{ firstName:'', lastName:'', gender:'', phone:'' }, age:'' }); setShowModal(true) }
  const openEdit = (p)=>{ setEditing(p._id); setForm({...p}); setShowModal(true) }

  const save = async ()=>{
    try{
      if(editing) await api.updatePatient(editing, form)
      else await api.createPatient(form)
      setShowModal(false)
      await load()
    }catch(e){ alert(e.message||'Save failed') }
  }

  const remove = async (id)=>{ if(!confirm('Delete?')) return; try{ await api.deletePatient(id); await load() }catch(e){ alert(e.message||'Delete failed') } }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Patients</h1>
        <div>
          <button className="btn btn-primary" onClick={openAdd}>Add Patient</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Patient ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4">Loading...</td></tr> : (
              patients.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{p.patientId}</td>
                  <td className="px-4 py-2 border">{p.personalInfo?.firstName} {p.personalInfo?.lastName}</td>
                  <td className="px-4 py-2 border">{p.age || 'N/A'}</td>
                  <td className="px-4 py-2 border">{p.personalInfo?.phone}</td>
                  <td className="px-4 py-2 border">
                    <button className="btn btn-small mr-2" onClick={()=>openEdit(p)}>Edit</button>
                    <button className="btn btn-small" onClick={()=>remove(p._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Patient' : 'Add Patient'} onClose={()=>setShowModal(false)}>
          <div className="space-y-2">
            <input className="w-full border p-2" placeholder="Patient ID" value={form.patientId||''} onChange={e=>setForm(s=>({ ...s, patientId: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2" placeholder="First name" value={form.personalInfo?.firstName||''} onChange={e=>setForm(s=>({ ...s, personalInfo:{ ...s.personalInfo, firstName: e.target.value } }))} />
              <input className="border p-2" placeholder="Last name" value={form.personalInfo?.lastName||''} onChange={e=>setForm(s=>({ ...s, personalInfo:{ ...s.personalInfo, lastName: e.target.value } }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2" placeholder="Gender" value={form.personalInfo?.gender||''} onChange={e=>setForm(s=>({ ...s, personalInfo:{ ...s.personalInfo, gender: e.target.value } }))} />
              <input className="border p-2" placeholder="Phone" value={form.personalInfo?.phone||''} onChange={e=>setForm(s=>({ ...s, personalInfo:{ ...s.personalInfo, phone: e.target.value } }))} />
            </div>
            <input className="border p-2" placeholder="Age" value={form.age||''} onChange={e=>setForm(s=>({ ...s, age: e.target.value }))} />
            <div className="flex justify-end mt-3">
              <button className="btn mr-2" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
