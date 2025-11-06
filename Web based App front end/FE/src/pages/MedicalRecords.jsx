import React, { useState } from 'react'
import api from '../api'

export default function MedicalRecords(){
  const [patientId, setPatientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState(null)

  const submit = async ()=>{
    if(!patientId) return alert('Patient id required')
    const fd = new FormData()
    fd.append('patient', patientId)
    fd.append('title', title)
    fd.append('description', description)
    if(files){ for(const f of files) fd.append('files', f) }
    try{ await api.uploadMedicalRecord(fd); alert('Uploaded'); setTitle(''); setDescription(''); setFiles(null) }catch(e){ alert(e.message||'Upload failed') }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Medical Records - Upload</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Patient ObjectId" value={patientId} onChange={e=>setPatientId(e.target.value)} className="border p-2" />
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="border p-2" />
          <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="border p-2 col-span-2"></textarea>
          <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
        </div>
        <div className="mt-3"><button className="btn btn-primary" onClick={submit}>Upload</button></div>
      </div>
    </div>
  )
}
