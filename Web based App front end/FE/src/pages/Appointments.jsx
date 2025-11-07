<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointments</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f9fafb;
      margin: 2rem;
    }
    h1, h2 {
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e5e7eb;
    }
    th {
      background-color: #f3f4f6;
      text-align: left;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    input, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
    }
    button {
      padding: 0.5rem 1rem;
      border: none;
      background-color: #3b82f6;
      color: white;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    button:hover {
      background-color: #2563eb;
    }
    .flex-end {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  </style>
</head>
<body>

  <h1>Appointments</h1>

  <div class="card">
    <table id="apptTable">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Doctor</th>
          <th>Date</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody id="apptBody">
        <tr><td colspan="4" style="text-align:center;">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>New Appointment</h2>
    <div class="grid">
      <select id="patientSelect">
        <option value="">Select patient</option>
      </select>
      <select id="doctorSelect">
        <option value="">Select doctor</option>
      </select>
      <input type="datetime-local" id="dateInput" />
      <input type="text" id="reasonInput" placeholder="Reason" />
    </div>
    <div class="flex-end">
      <button id="createBtn">Create</button>
    </div>
  </div>

  <script>
    const API_BASE = 'https://your-api.example.com'; // change to your backend URL

    const apptBody = document.getElementById('apptBody');
    const patientSelect = document.getElementById('patientSelect');
    const doctorSelect = document.getElementById('doctorSelect');
    const dateInput = document.getElementById('dateInput');
    const reasonInput = document.getElementById('reasonInput');
    const createBtn = document.getElementById('createBtn');

    async function apiGet(endpoint) {
      const res = await fetch(API_BASE + endpoint);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    }

    async function apiPost(endpoint, data) {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    }

    function fmtDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString();
    }

    async function loadData() {
      try {
        const [a, p, d] = await Promise.all([
          apiGet('/appointments'),
          apiGet('/patients?page=1&limit=200'),
          apiGet('/doctors')
        ]);

        // Populate appointments
        apptBody.innerHTML = '';
        (a.appointments || []).forEach(appt => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${appt.patient?.personalInfo ? `${appt.patient.personalInfo.firstName} ${appt.patient.personalInfo.lastName}` : appt.patient?.patientId || '—'}</td>
            <td>${appt.doctor?.name ? `${appt.doctor.name.firstName} ${appt.doctor.name.lastName}` : '—'}</td>
            <td>${fmtDate(appt.date)}</td>
            <td>${appt.reason || ''}</td>
          `;
          apptBody.appendChild(tr);
        });

        // Populate dropdowns
        patientSelect.innerHTML = '<option value="">Select patient</option>';
        (p.patients || []).forEach(pt => {
          const opt = document.createElement('option');
          opt.value = pt._id;
          opt.textContent = `${pt.patientId} - ${pt.personalInfo?.firstName || ''} ${pt.personalInfo?.lastName || ''}`;
          patientSelect.appendChild(opt);
        });

        doctorSelect.innerHTML = '<option value="">Select doctor</option>';
        (d || []).forEach(doc => {
          const opt = document.createElement('option');
          opt.value = doc._id;
          opt.textContent = `${doc.doctorId || doc._id} - ${doc.name?.firstName || ''} ${doc.name?.lastName || ''}`;
          doctorSelect.appendChild(opt);
        });

      } catch (err) {
        console.error(err);
        apptBody.innerHTML = `<tr><td colspan="4" style="color:red;text-align:center;">Failed to load data</td></tr>`;
      }
    }

    createBtn.addEventListener('click', async () => {
      const form = {
        patient: patientSelect.value,
        doctor: doctorSelect.value,
        date: dateInput.value,
        reason: reasonInput.value
      };

      if (!form.patient || !form.doctor || !form.date || !form.reason) {
        alert('Please fill in all fields.');
        return;
      }

      try {
        await apiPost('/appointments', form);
        dateInput.value = '';
        reasonInput.value = '';
        await loadData();
      } catch (e) {
        alert(e.message || 'Failed to create appointment');
      }
    });

    loadData();
  </script>

</body>
</html>

