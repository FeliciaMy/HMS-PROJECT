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
return this.re
