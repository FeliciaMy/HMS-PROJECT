<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Medical Records Upload</title>
  <!-- TailwindCSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-6">

  <h1 class="text-xl font-semibold mb-4">Medical Records - Upload</h1>

  <div class="bg-white p-4 rounded shadow">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input id="patientId" placeholder="Patient ObjectId" class="border p-2" />
      <input id="title" placeholder="Title" class="border p-2" />
      <textarea id="description" placeholder="Description" class="border p-2 col-span-2"></textarea>
      <input type="file" id="files" multiple />
    </div>
    <div class="mt-3">
      <button id="uploadBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
    </div>
  </div>

  <script>
    const API_BASE = 'https://your-api.example.com'; // replace with your backend URL

    const patientInput = document.getElementById('patientId');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const filesInput = document.getElementById('files');
    const uploadBtn = document.getElementById('uploadBtn');

    async function uploadMedicalRecord(formData) {
      const res = await fetch(API_BASE + '/medical-records', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    }

    uploadBtn.addEventListener('click', async () => {
      const patientId = patientInput.value.trim();
      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const files = filesInput.files;

      if (!patientId) return alert('Patient id required');

      const formData = new FormData();
      formData.append('patient', patientId);
      formData.append('title', title);
      formData.append('description', description);

      if (files && files.length > 0) {
        for (const f of files) {
          formData.append('files', f);
        }
      }

      try {
        await uploadMedicalRecord(formData);
        alert('Uploaded successfully');

        // Reset form
        titleInput.value = '';
        descriptionInput.value = '';
        filesInput.value = '';
      } catch (e) {
        alert(e.message || 'Upload failed');
      }
    });
  </script>

</body>
</html>
