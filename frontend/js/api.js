const API_BASE_URL = 'http://localhost:5000/api';

// API client utility
const api = {
  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Set auth token
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  // Remove auth token
  removeToken() {
    localStorage.removeItem('authToken');
  },

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  // Patient endpoints
  async getPatients(page = 1, limit = 10) {
    return this.request(`/patients?page=${page}&limit=${limit}`);
  },

  async getPatient(id) {
    return this.request(`/patients/${id}`);
  },

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  async updatePatient(id, updates) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async searchPatients(query) {
    const params = new URLSearchParams(query).toString();
    return this.request(`/patients/search/query?${params}`);
  },




  

  // Appointment endpoints
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/appointments?${queryString}`);
  },

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  async updateAppointment(id, updates) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};