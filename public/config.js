/**
 * Shared API Base URL Configuration for PN Neet Diw
 *
 * Production Backend: https://pnneet-api.onrender.com
 * Production Frontend: https://pnneet.netlify.app
 */
(function () {
  var DEFAULT_PROD_API_URL = "https://pnneet-api.onrender.com";
  var viteEnvUrl = '';

  try {
    if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      viteEnvUrl = import.meta.env.VITE_API_BASE_URL;
    }
  } catch (_) {
    try {
      viteEnvUrl = (new Function('try { return import.meta.env.VITE_API_BASE_URL; } catch(e) { return ""; }'))();
    } catch (_) {}
  }

  var candidate = (
    viteEnvUrl ||
    window.VITE_API_BASE_URL ||
    window.API_BASE_URL ||
    (typeof localStorage !== 'undefined' && (localStorage.getItem('VITE_API_BASE_URL') || localStorage.getItem('API_BASE_URL'))) ||
    DEFAULT_PROD_API_URL
  );

  if (typeof window !== 'undefined') {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      candidate = window.VITE_API_BASE_URL || window.API_BASE_URL || 'http://localhost:3000';
    }
  }

  var clean = (candidate || DEFAULT_PROD_API_URL).replace(/\/+$/, '');
  window.API_BASE_URL = clean;
  window.VITE_API_BASE_URL = clean;
  console.log('[API Config] Base URL configured:', clean);
})();
