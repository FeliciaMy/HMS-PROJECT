<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HMS</title>
  <!-- TailwindCSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .btn {
      @apply bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded;
    }
  </style>
</head>
<body class="min-h-screen bg-gray-50">

  <!-- Header -->
  <header class="bg-white shadow">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <a href="/" class="font-bold text-xl">HMS</a>
      <nav class="flex gap-3 items-center" id="navLinks">
        <!-- Links will be populated by JS -->
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto p-4" id="mainContent">
    <!-- Pages will be loaded here -->
  </main>

  <script>
    const API_BASE = 'https://your-api.example.com'; // replace with your backend

    const main = document.getElementById('mainContent');
    const nav = document.getElementById('navLinks');

    let currentUser = null;

    function setNav() {
      nav.innerHTML = '';
      const links = [
        { href: '/', label: 'Dashboard' },
        { href: '/patients', label: 'Patients' },
        { href: '/doctors', label: 'Doctors' },
        { href: '/appointments', label: 'Appointments' },
        { href: '/medical-records', label: 'Medical Records' }
      ];

      links.forEach(l => {
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        a.className = 'hover:underline';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(l.href);
        });
        nav.appendChild(a);
      });

      if (currentUser) {
        const span = document.createElement('span');
        span.textContent = currentUser.username;
        span.className = 'text-sm text-gray-600 ml-4';
        nav.appendChild(span);

        const btn = document.createElement('button');
        btn.textContent = 'Logout';
        btn.className = 'btn ml-2';
        btn.addEventListener('click', () => logout());
        nav.appendChild(btn);
      } else {
        const loginLink = document.createElement('a');
        loginLink.href = '/login';
        loginLink.textContent = 'Login';
        loginLink.className = 'btn';
        loginLink.addEventListener('click', (e) => { e.preventDefault(); navigate('/login'); });
        nav.appendChild(loginLink);
      }
    }

    async function fetchProfile() {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const res = await fetch(API_BASE + '/profile', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        currentUser = data.user;
      } catch {
        localStorage.removeItem('authToken');
        currentUser = null;
      }
    }

    function logout() {
      localStorage.removeItem('authToken');
      currentUser = null;
      setNav();
      navigate('/login');
    }

    async function navigate(path) {
      if (path !== '/login' && !currentUser) {
        path = '/login';
      }

      switch (path) {
        case '/':
          main.innerHTML = '<h1 class="text-2xl font-semibold">Dashboard</h1><p>Loading dashboard...</p>';
          await loadDashboard();
          break;
        case '/patients':
          main.innerHTML = '<h1 class="text-2xl font-semibold">Patients</h1><p>Loading patients...</p>';
          break;
        case '/doctors':
          main.innerHTML = '<h1 class="text-2xl font-semibold">Doctors</h1><p>Loading doctors...</p>';
          break;
        case '/appointments':
          main.innerHTML = '<h1 class="text-2xl font-semibold">Appointments</h1><p>Loading appointments...</p>';
          break;
        case '/medical-records':
          main.innerHTML = '<h1 class="text-2xl font-semibold">Medical Records</h1><p>Loading medical records...</p>';
          break;
        case '/login':
          main.innerHTML = `
            <h1 class="text-2xl font-semibold mb-4">Login</h1>
            <div class="bg-white p-4 rounded shadow max-w-md">
              <input id="loginUser" placeholder="Username" class="border p-2 w-full mb-2"/>
              <input id="loginPass" type="password" placeholder="Password" class="border p-2 w-full mb-2"/>
              <button id="loginBtn" class="btn mt-2 w-full">Login</button>
            </div>
          `;
          document.getElementById('loginBtn').addEventListener('click', async () => {
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPass').value.trim();
            if (!username || !password) return alert('Enter credentials');

            try {
              const res = await fetch(API_BASE + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
              });
              if (!res.ok) throw new Error('Login failed');
              const data = await res.json();
              localStorage.setItem('authToken', data.token);
              currentUser = data.user;
              setNav();
              navigate('/');
            } catch (e) {
              alert(e.message || 'Login failed');
            }
          });
          break;
        default:
          main.innerHTML = '<p>Page not found</p>';
      }
    }

    async function loadDashboard() {
      main.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-white rounded shadow">
            <div class="text-sm text-gray-500">Total Patients</div>
            <div id="patientsCount" class="text-3xl font-bold">0</div>
          </div>
          <div class="p-4 bg-white rounded shadow">
            <div class="text-sm text-gray-500">Appointments Today</div>
            <div id="appointmentsCount" class="text-3xl font-bold">0</div>
          </div>
        </div>
      `;

      try {
        const p = await fetch(API_BASE + '/patients?page=1&limit=1').then(r => r.json());
        const totalPatients = p.pagination?.total || (p.patients ? p.patients.length : 0);
        document.getElementById('patientsCount').textContent = totalPatients;

        const today = new Date().toISOString().split('T')[0];
        const a = await fetch(API_BASE + '/appointments?date=' + today).then(r => r.json());
        document.getElementById('appointmentsCount').textContent = a.count || 0;
      } catch (err) {
        console.error(err);
      }
    }

    // Initialize
    (async () => {
      await fetchProfile();
      setNav();
      navigate(window.location.pathname || '/');
    })();
  </script>

</body>
</html>

