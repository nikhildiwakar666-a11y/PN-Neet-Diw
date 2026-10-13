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
    .hero {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 28px;
      background: #111111;
      border-radius: 24px;
      padding: 44px;
      overflow: hidden;
      color: #ffffff;
    }
    .hero p { color: #d7d7d2; line-height: 1.6; }
    .hero-image {
      width: 100%;
      min-height: 260px;
      object-fit: cover;
      border-radius: 17px;
      filter: saturate(.72) contrast(1.08);
    }
    .hero button { color: #ffffff; background: #30302e; }
    .hero button:hover { background: #444440; }
    .intro { margin: 46px 0; }
    .intro h2, .why h2 { text-align: center; font-size: clamp(24px, 3.5vw, 34px); margin-bottom: 10px; color: #111111; }
    .intro > p, .why > p {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 26px;
      line-height: 1.7;
      color: #61615d;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 17px;
    }
    .feature {
      background: #ffffff;
      border: 1px solid #e2e2dc;
      border-radius: 16px;
      padding: 24px;
      line-height: 1.65;
    }
    .feature .icon { font-size: 28px; }
    .feature h3 { margin: 12px 0 7px; color: #111111; font-size: 16px; }
    .motivation {
      margin: 40px 0;
      padding: 28px;
      background: #e7e7e2;
      border-radius: 18px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      line-height: 1.6;
      color: #111111;
    }
    .motivation span {
      display: block;
      font-size: 14px;
      font-weight: normal;
      color: #61615d;
      margin-top: 8px;
    }
    .card { box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03); border-color: #e5e5e0; }
    .card:hover { transform: translateY(-3px); transition: .2s; }
    @media (max-width: 768px) {
      .hero, .feature-grid { grid-template-columns: 1fr; }
      .hero { padding: 26px; }
      .hero-image { min-height: 200px; }
    }
  `;
  document.head.appendChild(style);

  window.renderStudentDashboardHero = function () {
    const container = document.getElementById('studentHeroSection');
    if (!container) return;
    container.innerHTML = `
      <section class="hero">
        <div>
          <span class="tag" style="background:#262624;color:#f0f0ed">NEET 2026/2027 Practice Portal</span>
          <h1 style="font-size:clamp(28px,4vw,40px);margin:14px 0 10px;letter-spacing:-0.02em">Every focused study session brings your NEET dream closer.</h1>
          <p>PN Neet Diw is your personal practice space: master a chapter, test with honesty, analyze mistakes, and return stronger tomorrow.</p>
          <button onclick="startFirst()" style="margin-top:8px">Start Practice Test →</button>
        </div>
        <img class="hero-image" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85" alt="Focused student studying">
      </section>
      <section class="intro">
        <h2>Study smart. Test honestly. Improve daily.</h2>
        <p>Built to keep you focused, recognize your weak areas, and make every chapter count.</p>
        <div class="feature-grid">
          <article class="feature">
            <div class="icon">📚</div>
            <h3>Learn with clarity. Practice with confidence.</h3>
            <p>Revise notes and lecture recordings at your own pace before taking a test.</p>
          </article>
          <article class="feature">
            <div class="icon">⏱️</div>
            <h3>Timed Exam Practice</h3>
            <p>Attempt questions under realistic NEET countdown conditions.</p>
          </article>
          <article class="feature">
            <div class="icon">✨</div>
            <h3>Analyze Mistakes</h3>
            <p>See correct answers, your chosen answers, and per-question time analysis.</p>
          </article>
        </div>
      </section>
      <section class="motivation">
        “You do not have to be perfect today. You only have to be a little more prepared than yesterday.”
        <span>One chapter. One test. One honest effort at a time.</span>
      </section>
    `;
  };

  if (window.user && window.user.role === 'student') {
    window.renderStudentDashboardHero();
  }
})();
