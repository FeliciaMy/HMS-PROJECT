import React, { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'

export default function Doctors(){
  const [doctors,setDoctors]=useState([])
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({ doctorId:'', name:{ firstName:'', lastName:'' }, specialty:'', phone:'' })

  useEffect(()=>{ load() }, [])
  const load = async ()=>{ try{ const r = await api.getDoctors(); setDoctors(r || []) }catch(e){ console.error(e) } }

  const openAdd = ()=>{ setEditing(null); setForm({ doctorId:'', name:{ firstName:'', lastName:'' }, specialty:'', phone:'' }); setShowModal(true) }
  const openEdit = (d)=>{ setEditing(d._id); setForm({...d}); setShowModal(true) }

  const save = async ()=>{ try{ if(editing) await api.updateDoctor(editing, form); else await api.createDoctor(form); setShowModal(false); await load() }catch(e){ alert(e.message||'Save failed') } }
  const remove = async (id)=>{ if(!confirm('Delete?')) return; try{ await api.deleteDoctor(id); await load() }catch(e){ alert('Delete failed') } }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Doctors</h1>
        <div><button className="btn btn-primary" onClick={openAdd}>Add Doctor</button></div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="px-4 py-2">Doctor ID</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Specialty</th><th className="px-4 py-2">Phone</th><th className="px-4 py-2">Actions</th></tr></thead>
          <tbody>
            {doctors.map(d=>(
              <tr key={d._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{d.doctorId || d._id}</td>
                <td className="px-4 py-2 border">{d.name?.firstName} {d.name?.lastName}</td>
                <td className="px-4 py-2 border">{d.specialty}</td>
                <td className="px-4 py-2 border">{d.phone}</td>
                <td className="px-4 py-2 border">
                  <button className="btn btn-small mr-2" onClick={()=>openEdit(d)}>Edit</button>
                  <button className="btn btn-small" onClick={()=>remove(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Doctor' : 'Add Doctor'} onClose={()=>setShowModal(false)}>
          <div className="space-y-2">
            <input className="w-full border p-2" placeholder="Doctor ID" value={form.doctorId||''} onChange={e=>setForm(s=>({ ...s, doctorId: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2" placeholder="First name" value={form.name?.firstName||''} onChange={e=>setForm(s=>({ ...s, name:{ ...s.name, firstName: e.target.value } }))} />
              <input className="border p-2" placeholder="Last name" value={form.name?.lastName||''} onChange={e=>setForm(s=>({ ...s, name:{ ...s.name, lastName: e.target.value } }))} />
            </div>
            <input className="border p-2" placeholder="Specialty" value={form.specialty||''} onChange={e=>setForm(s=>({ ...s, specialty: e.target.value }))} />
            <input className="border p-2" placeholder="Phone" value={form.phone||''} onChange={e=>setForm(s=>({ ...s, phone: e.target.value }))} />
            <div className="flex justify-end mt-3"><button className="btn mr-2" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
