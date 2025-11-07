<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Doctor Portal | HMS</title>
<link rel="stylesheet" href="../css/portals.css" />
</head>
<body>
<header class="portal-header">
<h1>Doctor Portal</h1>
<div class="portal-actions">
<span id="username">—</span>
<button id="logoutBtn" class="btn small">Logout</button>
</div>
</header>


<main class="portal-main">
<section class="panel">
<h2>Appointments</h2>
<table id="appointmentsTable" class="table">
<thead><tr><th>ID</th><th>Patient</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
<tbody></tbody>
</table>
</section>
</main>


<script src="../js/api.js"></script>
<script src="../js/common.js"></script>
<script src="../js/portal-doctor.js"></script>
</body>
</html>
