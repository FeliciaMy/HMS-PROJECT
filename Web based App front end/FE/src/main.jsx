<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HMS</title>
  <!-- TailwindCSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="min-h-screen bg-gray-50">

  <!-- Root container -->
  <div id="root"></div>

  <!-- App Script -->
  <script>
    // Insert the HMS App shell here
    // You can copy the full "HMS Web App Shell" code we built previously into this script
    // Example: append it to #root
    const root = document.getElementById('root');
    root.innerHTML = `
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" class="font-bold text-xl">HMS</a>
          <nav class="flex gap-3 items-center" id="navLinks"></nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto p-4" id="mainContent"></main>
    `;

    // Include all the JS logic from your previous HMS shell
    // Example: fetchProfile, setNav(), navigate(), loadDashboard(), etc.
    // For simplicity, include the full <script> code from the HMS shell here
  </script>

</body>
</html>

