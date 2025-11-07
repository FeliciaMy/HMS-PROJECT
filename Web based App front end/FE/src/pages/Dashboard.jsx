<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f9fafb;
      padding: 2rem;
    }
    h1 {
      margin-bottom: 1rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    .btn:hover {
      background-color: #2563eb;
    }
    .flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .card {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .text-sm {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .text-3xl {
      font-size: 2rem;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <div class="flex">
    <h1>Dashboard</h1>
    <button class="btn" id="seedBtn">Seed Demo Data</button>
  </div>

  <div class="grid">
    <div class="card">
      <div class="text-sm">Total Patients</div>
      <div class="text-3xl" id="patientsCount">0</div>
    </div>
    <div class="card">
      <div class="text-sm">Appointments Today</div>
      <div class="text-3xl" id="appointmentsCount">0</div>
    </div>
  </div>

  <script>
    const API_BASE = 'https://your-api.example.com'; // change to your backend URL

    const patientsCountEl = document.getElementById('patientsCount');
    const appointmentsCountEl = document.getElementById('appointmentsCount');
    const seedBtn = document.getElementById('seedBtn');

    async function apiGet(endpoint, params = '') {
      const url = API_BASE + endpoint + (params ? '?' + new URLSearchParams(params).toString() : '');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    }

    async function apiPost(endpoint) {
      const res = await fetch(API_BASE + endpoint, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }

    async function loadStats() {
      try {
        // Total Patients
        const p = await apiGet('/patients', { page: 1, limit: 1 });
        const totalPatients = p.pagination?.total || (p.patients ? p.patients.length : 0);
        patientsCountEl.textContent = totalPatients;

        // Appointments Today
        const today = new Date().toISOString().split('T')[0];
        const a = await apiGet('/appointments', { date: today });
        appointmentsCountEl.textContent = a.count || 0;
      } catch (err) {
        console.error(err);
      }
    }

    seedBtn.addEventListener('click', async () => {
      if (!confirm('Seed demo data?')) return;
      try {
        await apiPost('/seed');
        alert('Seeded');
        window.location.reload();
      } catch (e) {
        alert(e.message || 'Seed failed');
      }
    });

    loadStats();
  </script>

</body>
</html>
