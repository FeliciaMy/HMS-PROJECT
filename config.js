// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}