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
      padding: 48px;
      overflow: hidden;
    }
    .hero p { color: #d7d7d2; }
    .hero-image {
      width: 100%;
      min-height: 280px;
      object-fit: cover;
      border-radius: 17px;
      filter: saturate(.72) contrast(1.08);
    }
    .hero button { color: #ffffff; background: #30302e; }
    .hero button:hover { background: #444440; }
    .intro { margin: 46px 0; }
    .intro h2, .why h2 { text-align: center; font-size: clamp(26px, 4vw, 37px); margin-bottom: 10px; color: #111111; }
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
    .feature h3 { margin: 12px 0 7px; color: #111111; }
    .motivation {
      margin: 42px 0;
      padding: 30px;
      background: #e7e7e2;
      border-radius: 18px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      line-height: 1.6;
      color: #111111;
    }
    .motivation span {
      display: block;
      font-size: 15px;
      font-weight: normal;
      color: #61615d;
      margin-top: 8px;
    }
    .photo-row {
      display: grid;
      grid-template-columns: 1.25fr .75fr;
      gap: 17px;
      margin: 30px 0 46px;
    }
    .photo-row img {
      width: 100%;
      height: 235px;
      object-fit: cover;
      border-radius: 16px;
      filter: saturate(.65);
    }
    .head h2 { color: #111111; }
    .tag { background: #ededeb; color: #111111; }
    .card { box-shadow: 0 8px 22px #00000008; border-color: #e5e5e0; }
    .card:hover { transform: translateY(-3px); transition: .2s; }
    .login-gate {
      margin: 34px 0;
      padding: 30px;
      background: #111111;
      border-radius: 18px;
      color: #ffffff;
      text-align: center;
    }
    .login-gate p {
      color: #d7d7d2;
      margin: 8px auto 18px;
      max-width: 570px;
      line-height: 1.6;
    }
    .login-gate button { background: #ffffff; color: #111111; }
    .locked { display: none; }
    @media (max-width: 700px) {
      .hero, .feature-grid, .photo-row { grid-template-columns: 1fr; }
      .hero { padding: 27px; }
      .hero-image { min-height: 210px; }
      .photo-row img { height: 190px; }
    }
  `;
  document.head.appendChild(style);

  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <section class="hero">
        <div>
          <span class="tag">A calm space to prepare with confidence</span>
          <h1>Every small study session brings your NEET dream closer.</h1>
          <p>PN Neet Diw is made for students who want a clear path: understand a chapter, practise with purpose, learn from mistakes, and return stronger the next day.</p>
          <button onclick="startFirst()">Begin Your Practice →</button>
        </div>
        <img class="hero-image" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85" alt="Student studying with notes">
      </section>
      <section class="intro">
        <h2>Study smart. Test honestly. Improve daily.</h2>
        <p>This is not just a test website. It is your personal practice space for NEET preparation—built to help you stay focused, know your weak areas, and make every chapter count.</p>
        <div class="feature-grid">
          <article class="feature">
            <div class="icon">📚</div>
            <h3>Learn chapter by chapter</h3>
            <p>Use notes and videos to understand concepts at your own pace before you begin a test.</p>
          </article>
          <article class="feature">
            <div class="icon">⏱️</div>
            <h3>Practise like the real test</h3>
            <p>Attempt timed tests, choose answers, mark difficult questions, and build confidence under pressure.</p>
          </article>
          <article class="feature">
            <div class="icon">✨</div>
            <h3>Grow from every result</h3>
            <p>See every question, your answer, the correct answer, and time spent—then improve with clarity.</p>
          </article>
        </div>
      </section>
      <section class="motivation">
        “You do not have to be perfect today. You only have to be a little more prepared than yesterday.”
        <span>One chapter. One test. One honest effort at a time.</span>
      </section>
      <section class="why">
        <h2>Your preparation, made simple</h2>
        <p>Choose an available test, read the instructions, and begin when you are ready. Scheduled tests unlock at their set time; practice tests are always ready for you.</p>
        <div class="photo-row">
          <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1100&q=85" alt="Open study notebook">
          <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=85" alt="Focused student">
        </div>
      </section>
      <section class="login-gate" id="loginGate">
        <h2>Ready to begin?</h2>
        <p>Login to unlock your tests, notes, videos, personal results, and complete practice experience.</p>
        <button onclick="loginOpen()">Student Login to Continue</button>
      </section>
      <section id="scheduleArea">
        <div class="head">
          <h2>Test Schedule</h2>
          <button class="light" onclick="resultsOpen()">My Results</button>
        </div>
        <section class="grid" id="cards"></section>
      </section>
    `;
  }

  const originalRefreshUser = window.refreshUser;
  window.refreshUser = function () {
    if (typeof originalRefreshUser === 'function') originalRefreshUser();
    const loggedIn = !!user;
    const scheduleArea = document.getElementById('scheduleArea');
    const loginGate = document.getElementById('loginGate');
    if (scheduleArea) scheduleArea.classList.toggle('locked', !loggedIn);
    if (loginGate) loginGate.classList.toggle('locked', loggedIn);

    const libBtn = document.getElementById('navLibraryBtn');
    if (libBtn) libBtn.style.display = loggedIn ? '' : 'none';

    const commBtn = document.getElementById('navCommunityBtn');
    if (commBtn) commBtn.style.display = loggedIn ? '' : 'none';

    // Strict role check: admin controls are NEVER displayed for students or guests
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => {
      btn.style.display = (user && user.role === 'admin') ? '' : 'none';
    });
  };

  if (typeof refreshUser === 'function') refreshUser();
  if (typeof load === 'function') load();
})();
