// Authentication Handler

// Check if user is authenticated
function checkAuth() {
  const token = api.getToken();
  
  if (!token) {
    showPage('login');
    return false;
  }
  
  const user = api.getUser();
  if (user) {
    showPage('dashboard');
    updateUserInfo(user);
    return true;
  }
  
  return false;
}

// Update user information display
function updateUserInfo(user) {
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  
  if (userName) {
    userName.textContent = user.username || 'User';
  }
  
  if (userRole) {
    userRole.textContent = (user.role || 'user').toUpperCase();
  }
}

// Show/hide pages
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show requested page
  if (pageName === 'login') {
    document.getElementById('loginPage').classList.add('active');
  } else if (pageName === 'dashboard') {
    document.getElementById('dashboardPage').classList.add('active');
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  // Clear previous errors
  errorDiv.textContent = '';
  
  try {
    const response = await api.login(email, password);
    
    if (response.success) {
      // Login successful
      updateUserInfo(response.user);
      showPage('dashboard');
      
      // Load dashboard data
      loadDashboardData();
    }
  } catch (error) {
    errorDiv.textContent = error.message || 'Login failed. Please try again.';
  }
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
  }
}