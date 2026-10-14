(() => {
  document.documentElement.style.setProperty('--p', '#111111');
  const style = document.createElement('style');
  style.textContent = `
    body { background: #f7f7f5; color: #171717; }
    header { border-color: #deded9; background: #ffffff; }
    .brand b { color: #111111; }
    button { background: #111111; }
    button.light { background: #ededeb; color: #111111; }
    button.light:hover { background: #e0e0dc; }
    .card { box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03); border-color: #e5e5e0; }
    .card:hover { transform: translateY(-3px); transition: .2s; }
  `;
  document.head.appendChild(style);

  window.renderStudentDashboardHero = function () {
    // Handled by role-based greeting banner in index.html
  };
})();
