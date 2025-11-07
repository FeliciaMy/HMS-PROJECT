<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Login | HMS</title>
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
<main class="auth-container">
<form id="loginForm" class="card auth-card">
<h2>Log In</h2>
<label>Email</label>
<input id="email" type="email" required />


<label>Password</label>
<input id="password" type="password" required />


<button type="submit" class="btn">Login</button>
<p class="muted">Don't have an account? <a href="register.html">Register</a></p>
</form>
</main>


<script src="js/api.js"></script>
<script src="js/auth.js"></script>
</body>
</html>
