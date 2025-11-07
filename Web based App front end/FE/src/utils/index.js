<script>
  /**
   * Formats an ISO date string to "YYYY-MM-DD HH:mm"
   * @param {string} iso - ISO date string
   * @returns {string} formatted date or '-' if invalid
   */
  function fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';

    const pad = (n) => String(n).padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1); // Months are 0-indexed
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  // Example usage:
  console.log(fmtDate("2025-11-07T14:30:00Z")); // "2025-11-07 14:30"
  console.log(fmtDate(null)); // "-"
</script>

