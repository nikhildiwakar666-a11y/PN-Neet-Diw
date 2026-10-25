(() => {
  // Theme initialization for PN Neet Diw - Modern Blue & Purple Palette
  document.documentElement.style.setProperty('--p', '#2563eb');
  document.documentElement.style.setProperty('--purple', '#7c3aed');

  window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    if (btn) {
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPass ? 'none' : 'block';
        eyeClosed.style.display = isPass ? 'block' : 'none';
      }
    }
  };

  window.renderStudentDashboardHero = function () {
    // Handled by role-based greeting banner in index.html
  };
})();
