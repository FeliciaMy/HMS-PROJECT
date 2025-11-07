<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Protected Page</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f9fafb;
      padding: 2rem;
    }
    .card {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .btn {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div class="card">
    <h2>Protected Page</h2>
    <p>If you see this, you are logged in!</p>
    <button class="btn" id="logoutBtn">Logout</button>
  </div>

  <script>
    // Simulate ProtectedRoute logic
    const token = localStorage.getItem('authToken');

    if (!token) {
      // If not logged in, redirect to login page
      window.location.replace('/login.html');
    }

    // Optional: logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.replace('/login.html');
    });
  </script>

</body>
</html>
