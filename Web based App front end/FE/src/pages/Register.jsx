<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Register | HMS</title>
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
<main class="auth-container">
<form id="registerForm" class="card auth-card">
<h2>Create Account</h2>


<label>Full name</label>
<input id="name" type="text" required />


<label>Email</label>
<input id="email" type="email" required />


<label>Password</label>
<input id="password" type="password" required />


<label>Role</label>
<select id="role" required>
<option value="patient">Patient</option>
<option value="doctor">Doctor</option>
<option value="nurse">Nurse</option>
<option value="admin">Admin</option>
</select>


<button type="submit" class="btn">Register</button>
<p class="muted">Already have an account? <a href="login.html">Login</a></p>
</form>
</main>


<script src="js/api.js"></script>
<script src="js/auth.js"></script>
</body>
</html>
