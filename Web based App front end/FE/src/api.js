import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const client = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } })

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('authToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.handleError = (err) => {
  if (err?.response?.data?.message) throw new Error(err.response.data.message)
  throw err
}

export default {
  // auth
  async login(email, password){ try{ const r = await client.post('/auth/login', { email, password }); return r.data } catch(e){ client.handleError(e) } },
  async register(user){ try{ const r = await client.post('/auth/register', user); return r.data } catch(e){ client.handleError(e) } },
  async profile(){ try{ const r = await client.get('/auth/profile'); return r.data } catch(e){ client.handleError(e) } },

  // patients
  async getPatients(page=1, limit=100){ try{ const r = await client.get(`/patients?page=${page}&limit=${limit}`); return r.data } catch(e){ client.handleError(e) } },
  async createPatient(payload){ try{ const r = await client.post('/patients', payload); return r.data } catch(e){ client.handleError(e) } },
  async updatePatient(id,payload){ try{ const r = await client.put(`/patients/${id}`, payload); return r.data } catch(e){ client.handleError(e) } },
  async deletePatient(id){ try{ const r = await client.delete(`/patients/${id}`); return r.data } catch(e){ client.handleError(e) } },

  // doctors
  async getDoctors(){ try{ const r = await client.get('/doctors'); return r.data } catch(e){ client.handleError(e) } },
  async createDoctor(payload){ try{ const r = await client.post('/doctors', payload); return r.data } catch(e){ client.handleError(e) } },
  async updateDoctor(id,payload){ try{ const r = await client.put(`/doctors/${id}`, payload); return r.data } catch(e){ client.handleError(e) } },
  async deleteDoctor(id){ try{ const r = await client.delete(`/doctors/${id}`); return r.data } catch(e){ client.handleError(e) } },

  // appointments
  async getAppointments(params={}){ try{ const qs = new URLSearchParams(params).toString(); const r = await client.get(`/appointments?${qs}`); return r.data } catch(e){ client.handleError(e) } },
  async createAppointment(payload){ try{ const r = await client.post('/appointments', payload); return r.data } catch(e){ client.handleError(e) } },

  // seed & medical upload
  async seed(){ try{ const r = await client.post('/seed'); return r.data } catch(e){ client.handleError(e) } },
  async uploadMedicalRecord(fd){ try{ const r = await client.post('/medical-records', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data } catch(e){ client.handleError(e) } }
}
