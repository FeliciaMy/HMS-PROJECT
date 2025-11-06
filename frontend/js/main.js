// State management
const state = {
  currentUser: null,
  currentPage: 'dashboard',
  patients: [],
  appointments: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Check authentication
async function checkAuth() {
  const token = api.getToken();
  
  if (!token) {
    showPage('login');
    return;
  }

  try {
    const response = await api.getProfile();
    state.currentUser = response.user;
    showPage('dashboard');
    updateUserInfo();
    loadDashboardData();
  } catch (error) {
    console.error('Auth check failed:', error);
    api.removeToken();
    showPage('login');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  // Patient search
  const searchBtn = document.getElementById('searchPatientBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handlePatientSearch);
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const response = await api.login(email, password);
    api.setToken(response.token);
    state.currentUser = response.user;
    errorDiv.textContent = '';
    showPage('dashboard');
    updateUserInfo();
    loadDashboardData();
  } catch (error) {
    errorDiv.textContent = error.message || 'Login failed';
  }
}

// Handle logout
function handleLogout() {
  api.removeToken();
  state.currentUser = null;
  showPage('login');
}

// Handle navigation
function handleNavigation(e) {
  e.preventDefault();
  const page = e.target.dataset.page;
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  e.target.classList.add('active');

  // Update page title
  document.getElementById('pageTitle').textContent = 
    page.charAt(0).toUpperCase() + page.slice(1);

  // Show content section
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${page}Content`).classList.add('active');

  state.currentPage = page;
  loadPageData(page);
}

// Load page-specific data
async function loadPageData(page) {
  switch(page) {
    case 'dashboard':
      await loadDashboardData();
      break;
    case 'patients':
      await loadPatients();
      break;
    case 'appointments':
      await loadAppointments();
      break;
    default:
      break;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load statistics
    const patients = await api.getPatients(1, 1);
    document.getElementById('totalPatients').textContent = patients.pagination?.total || 0;

    // Load today's appointments
    const today = new Date().toISOString().split('T')[0];
    const appointments = await api.getAppointments({ date: today });
    document.getElementById('todayAppointments').textContent = appointments.count || 0;

  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Load patients
async function loadPatients() {
  try {
    const response = await api.getPatients();
    state.patients = response.patients;
    displayPatients(response.patients);
  } catch (error) {
    console.error('Error loading patients:', error);
    showError('Failed to load patients');
  }
}

// Display patients in table
function displayPatients(patients) {
  const container = document.getElementById('patientsList');
  
  if (!patients || patients.length === 0) {
    container.innerHTML = '<p class="no-data">No patients found</p>';
    return;
  }

  let html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Phone</th>
          <th>Blood Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  patients.forEach(patient => {
    html += `
      <tr>
        <td>${patient.patientId}</td>
        <td>${patient.personalInfo.firstName} ${patient.personalInfo.lastName}</td>
        <td>${patient.age || 'N/A'}</td>
        <td>${patient.personalInfo.gender}</td>
        <td>${patient.personalInfo.phone}</td>
        <td>${patient.personalInfo.bloodType || 'N/A'}</td>
        <td>
          <button class="btn-small btn-view" onclick="viewPatient('${patient._id}')">View</button>
          <button class="btn-small btn-edit" onclick="editPatient('${patient._id}')">Edit</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Handle patient search
async function handlePatientSearch() {
  const searchInput = document.getElementById('patientSearch').value;
  
  if (!searchInput.trim()) {
    loadPatients();
    return;
  }

  try {
    const response = await api.searchPatients({ name: searchInput });
    displayPatients(response.patients);
  } catch (error) {
    console.error('Search error:', error);
    showError('Search failed');
  }
}

// Show page
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageName}Page`).classList.add('active');
}

// Update user info display
function updateUserInfo() {
  if (state.currentUser) {
    document.getElementById('userName').textContent = state.currentUser.username;
    document.getElementById('userRole').textContent = state.currentUser.role.toUpperCase();
  }
}

// Show error message
function showError(message) {
  alert(message); // Replace with better UI notification
}