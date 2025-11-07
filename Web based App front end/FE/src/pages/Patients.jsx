<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Patient Portal | HMS</title>
<link rel="stylesheet" href="../css/portals.css" />
</head>
<body>
<header class="portal-header">
<h1>Patient Portal</h1>
<div class="portal-actions">
<span id="username">—</span>
<button id="logoutBtn" class="btn small">Logout</button>
</div>
</header>


<main class="portal-main">
<section class="panel">
<h2>Your Appointments</h2>
<table id="appointmentsTable" class="table">
<thead><tr><th>ID</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
<tbody></tbody>
</table>
</section>


<section class="panel">
<h2>Book Appointment</h2>
<form id="bookForm" class="form-inline">
<label>Doctor ID</label>
<input id="doctorId" required />
<label>Date & Time</label>
<input id="apptDate" type="datetime-local" required />
<button type="submit" class="btn">Book</button>
</form>
</section>
</main>


<script src="../js/api.js"></script>
<script src="../js/common.js"></script>
<script src="../js/portal-patient.js"></script>
</body>
</html>
