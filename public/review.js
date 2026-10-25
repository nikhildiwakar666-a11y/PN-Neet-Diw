(() => {
  let questionStartedAt = 0;
  let questionTimes = {};
  let markedQuestions = {};
  let testStarted = false;
  let testStartedAt = 0;

  const style = document.createElement('style');
  style.textContent = `
    .test-instruction-box {
      text-align: center;
      max-width: 660px;
      margin: 0 auto;
      padding: 12px 4px;
    }
    .test-instruction-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 22px 0;
      text-align: left;
    }
    .instruction-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .instruction-card-icon {
      font-size: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .instruction-card b {
      display: block;
      font-size: 14px;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .instruction-card span {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.5;
    }

    /* Test Attempt Interface */
    .test-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }
    .test-title-area b {
      font-size: 18px;
      color: #0f172a;
      display: block;
      margin-bottom: 3px;
    }
    .test-title-area span {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .test-timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .test-timer-badge.warning {
      background: #ef4444 !important;
      animation: pulseAlert 1.2s infinite;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
    }
    @keyframes pulseAlert {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }
    .test-focus-note {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6d28d9;
      border-radius: 12px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      margin: 16px 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .test-palette-strip {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 6px 2px 14px;
      margin-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
    }
    .palette-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #334155;
      font-size: 13px;
      font-weight: 700;
      border: 1.5px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .palette-btn:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
      transform: translateY(-1px);
    }
    .palette-btn.active {
      background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
      color: #ffffff !important;
      border-color: #1d4ed8 !important;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }
    .palette-btn.answered {
      background: #ecfdf5;
      color: #047857;
      border-color: #6ee7b7;
      font-weight: 800;
    }
    .palette-btn.marked {
      border: 2px dashed #d97706;
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
    }

    .question-statement-box {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.6;
      color: #0f172a;
      margin: 18px 0 22px;
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }

    .option-btn {
      width: 100%;
      text-align: left;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 15px;
      color: #1e293b;
      transition: all 0.16s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .option-btn:hover {
      border-color: #2563eb;
      background: #eff6ff;
      transform: translateY(-1px);
    }
    .option-btn.selected {
      border-color: #2563eb;
      background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
      color: #1d4ed8;
      font-weight: 700;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .option-letter {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .option-btn:hover .option-letter {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .option-btn.selected .option-letter {
      background: #2563eb;
      color: #ffffff;
    }

    .test-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }

    /* Result & Review Layout */
    .review-score-hero {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 32px 28px;
      text-align: center;
      margin: 14px 0 24px;
      box-shadow: 0 12px 32px -4px rgba(37, 99, 235, 0.28);
      position: relative;
      overflow: hidden;
    }
    .review-score-hero::after {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      pointer-events: none;
    }
    .review-score-hero h2 {
      margin: 0 0 6px;
      font-size: 24px;
      font-weight: 800;
    }
    .review-score-number {
      font-size: 52px;
      font-weight: 900;
      letter-spacing: -0.03em;
      margin: 12px 0 6px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }
    .review-stat-pills {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .review-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(4px);
      color: #ffffff;
    }
    .review-stat-pill.correct { background: rgba(16, 185, 129, 0.35); border: 1px solid rgba(16, 185, 129, 0.4); }
    .review-stat-pill.wrong { background: rgba(239, 68, 68, 0.35); border: 1px solid rgba(239, 68, 68, 0.4); }
    .review-stat-pill.unanswered { background: rgba(148, 163, 184, 0.25); border: 1px solid rgba(148, 163, 184, 0.3); }

    /* Weak Topics & Improvement Suggestions Card */
    .weak-topics-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 22px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .weak-topics-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .weak-topic-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #991b1b;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      margin: 4px;
    }
    .suggestion-box {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 14px;
      font-size: 13.5px;
      color: #1e40af;
      line-height: 1.55;
    }

    .review-item-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: border-color 0.15s ease;
    }
    .review-item-card:hover {
      border-color: #cbd5e1;
    }
    .review-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .review-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
    .review-badge.correct { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .review-badge.wrong { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .review-badge.unanswered { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

    .review-option-row {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 14.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .review-option-row.is-correct {
      background: #ecfdf5;
      border-color: #86efac;
      color: #065f46;
      font-weight: 700;
    }
    .review-option-row.is-wrong {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #991b1b;
      font-weight: 700;
    }

    /* Submit Confirmation Modal */
    .submit-confirm-box {
      text-align: center;
      padding: 24px 16px;
      max-width: 500px;
      margin: 0 auto;
    }
    .submit-confirm-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 22px 0;
    }
    .submit-stat-tile {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 10px;
    }
    .submit-stat-number {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
    }
    .submit-stat-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }
  `;
  document.head.appendChild(style);

  function recordQuestionTime() {
    if (!testStarted || !test?.questions?.[test.i] || !questionStartedAt) return;
    const questionId = test.questions[test.i].id;
    questionTimes[questionId] = (questionTimes[questionId] || 0) + (Date.now() - questionStartedAt) / 1000;
    questionStartedAt = 0;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `⏱ ${m}:${String(s).padStart(2, '0')}`;
  }

  window.start = async function (id) {
    if (!user) {
      applyViewState();
      return;
    }
    const meta = tests.find(item => item.id === id);
    if (meta?.startAt && new Date(meta.startAt) > Date.now()) {
      return alert('This test opens on ' + when(meta.startAt));
    }
    try {
      test = await api('tests/' + id);
      if (!test.questions.length) return alert('This test has no questions yet.');
      answers = {};
      questionTimes = {};
      markedQuestions = {};
      test.i = 0;
      test.left = test.duration * 60;
      ended = false;
      testStarted = false;
      clearInterval(timer);
      show('test');
      window.renderInstructions();
    } catch (error) {
      alert(error.message);
    }
  };

  window.renderInstructions = function () {
    $('testBox').innerHTML = `
      <div class="test-instruction-box">
        <span class="tag" style="background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe;font-size:12px;padding:4px 14px;font-weight:800">📋 NEET EXAM INSTRUCTIONS</span>
        <h2 style="font-size:26px;margin:14px 0 6px;color:#0f172a">${esc(test.title)}</h2>
        <p class="muted" style="margin:0 0 20px;font-size:14px">${esc(test.subject)} · ${esc(test.chapter || 'General')} · <b>${test.questions.length} Questions</b> · <b>${test.duration} Minutes</b></p>

        <div class="test-instruction-grid">
          <div class="instruction-card">
            <span class="instruction-card-icon">⏱️</span>
            <div>
              <b>Timed Countdown</b>
              <span>Starts automatically upon clicking Begin Practice Test.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">🔒</span>
            <div>
              <b>Focus Protection</b>
              <span>Switching tabs auto-submits your test to maintain exam integrity.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">🔖</span>
            <div>
              <b>Mark for Review</b>
              <span>Flag tricky questions and easily revisit them from the palette.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">📊</span>
            <div>
              <b>Instant Analytics</b>
              <span>Get detailed solutions, accuracy scores, and weak-topic suggestions.</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
          <button style="padding:14px 28px;font-size:15px;font-weight:800;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 6px 18px rgba(37,99,235,0.25)" onclick="beginTest()">Begin Practice Test →</button>
          <button class="out" style="padding:14px 22px" onclick="hide('test')">Cancel & Return</button>
        </div>
      </div>
    `;
  };

  window.beginTest = function () {
    testStarted = true;
    testStartedAt = Date.now();
    questionStartedAt = Date.now();
    window.renderQuestion();
    clearInterval(timer);
    timer = setInterval(() => {
      if (--test.left <= 0) {
        window.finish('Time over');
      } else {
        const timerEl = $('timer');
        if (timerEl) {
          timerEl.textContent = formatTime(test.left);
          if (test.left <= 300) {
            timerEl.classList.add('warning');
          }
        }
      }
    }, 1000);
  };

  window.changeQuestion = function (index) {
    recordQuestionTime();
    test.i = index;
    questionStartedAt = Date.now();
    window.renderQuestion();
  };

  window.selectAnswer = function (questionId, answerIndex) {
    answers[questionId] = answerIndex;
    if (!questionTimes[questionId]) {
      questionTimes[questionId] = Math.max(1, Math.round((Date.now() - testStartedAt) / 1000));
    }
    window.renderQuestion();
  };

  window.toggleMark = function (questionId) {
    markedQuestions[questionId] = !markedQuestions[questionId];
    window.renderQuestion();
  };

  renderQuestion = window.renderQuestion = function () {
    const q = test.questions[test.i];
    const isMarked = !!markedQuestions[q.id];
    const isAnswered = answers[q.id] !== undefined;
    const answeredCount = Object.keys(answers).length;

    $('testBox').innerHTML = `
      <div class="test-header-bar">
        <div class="test-title-area">
          <b>${esc(test.title)}</b>
          <span>Question ${test.i + 1} of ${test.questions.length} · <b>${answeredCount} answered</b> (${test.questions.length - answeredCount} remaining)</span>
        </div>
        <span class="test-timer-badge ${test.left <= 300 ? 'warning' : ''}" id="timer">${formatTime(test.left)}</span>
      </div>

      <div class="test-focus-note">
        <span>🔒 Focus Protection Active: Please keep this exam window focused until submission.</span>
      </div>

      <!-- Question Palette -->
      <div class="test-palette-strip">
        ${test.questions.map((question, idx) => {
          const hasAnswer = answers[question.id] !== undefined;
          const isCurrent = idx === test.i;
          const mark = !!markedQuestions[question.id];
          let classes = 'palette-btn';
          if (isCurrent) classes += ' active';
          else if (hasAnswer) classes += ' answered';
          if (mark) classes += ' marked';
          return `<button type="button" class="${classes}" onclick="changeQuestion(${idx})" title="Question ${idx + 1}">${idx + 1}</button>`;
        }).join('')}
      </div>

      <!-- Current Question Statement -->
      <div class="question-statement-box">
        <span style="font-size:13px;font-weight:800;color:#2563eb;display:block;margin-bottom:6px">QUESTION ${test.i + 1}</span>
        ${esc(q.question)}
      </div>

      <!-- Options List -->
      <div>
        ${q.options.map((opt, optIdx) => {
          const isSelected = answers[q.id] === optIdx;
          return `
            <button type="button" class="option-btn ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${q.id}, ${optIdx})">
              <span class="option-letter">${'ABCD'[optIdx]}</span>
              <span>${esc(opt)}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Footer Action Navigation -->
      <div class="test-actions-bar">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button type="button" class="out" ${test.i === 0 ? 'disabled' : ''} onclick="changeQuestion(${test.i - 1})">← Previous</button>
          <button type="button" class="light" onclick="toggleMark(${q.id})">
            ${isMarked ? '🔖 Marked for Review' : '☆ Mark for Review'}
          </button>
        </div>

        <div style="display:flex;gap:10px;align-items:center">
          ${test.i < test.questions.length - 1
            ? `<button type="button" onclick="changeQuestion(${test.i + 1})">Next Question →</button>`
            : `<button type="button" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;box-shadow:0 4px 12px rgba(16,185,129,0.3)" onclick="showSubmitConfirmModal()">Submit Mock Test ✓</button>`
          }
        </div>
      </div>
    `;
  };

  window.showSubmitConfirmModal = function () {
    const answered = Object.keys(answers).length;
    const total = test.questions.length;
    const unanswered = total - answered;
    const marked = Object.values(markedQuestions).filter(Boolean).length;

    $('testBox').innerHTML = `
      <div class="submit-confirm-box">
        <div style="width:60px;height:60px;border-radius:50%;background:#eff6ff;color:#2563eb;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          📝
        </div>
        <h3 style="font-size:22px;color:#0f172a;margin:0 0 6px;">Submit Mock Test?</h3>
        <p style="color:#64748b;font-size:14px;margin:0;">Are you sure you want to finish your test? Review your status summary below:</p>

        <div class="submit-confirm-summary">
          <div class="submit-stat-tile">
            <div class="submit-stat-number" style="color:#059669">${answered}</div>
            <div class="submit-stat-label">Answered</div>
          </div>
          <div class="submit-stat-tile">
            <div class="submit-stat-number" style="color:#dc2626">${unanswered}</div>
            <div class="submit-stat-label">Unanswered</div>
          </div>
          <div class="submit-stat-tile">
            <div class="submit-stat-number" style="color:#d97706">${marked}</div>
            <div class="submit-stat-label">Marked for Review</div>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
          <button type="button" class="out" style="padding:12px 20px;" onclick="renderQuestion()">← Return to Questions</button>
          <button type="button" style="padding:12px 24px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;box-shadow:0 4px 14px rgba(37,99,235,0.3);" onclick="finish('Submitted by Student')">Confirm & Submit Test ✓</button>
        </div>
      </div>
    `;
  };

  window.finishPrompt = function () {
    window.showSubmitConfirmModal();
  };

  finish = window.finish = async function (reason) {
    if (ended || !testStarted) return;
    ended = true;
    recordQuestionTime();
    testStarted = false;
    clearInterval(timer);

    try {
      const result = await api('attempts', {
        method: 'POST',
        body: JSON.stringify({
          testId: test.id,
          answers,
          timeSpent: questionTimes,
          marked: markedQuestions
        })
      });

      const percentage = Math.round((result.score / result.total) * 100);
      const isPass = percentage >= 50;

      $('testBox').innerHTML = `
        <div class="review-score-hero">
          <span class="tag" style="background:rgba(255,255,255,0.2);color:#ffffff;border:none;margin-bottom:8px">${esc(reason)}</span>
          <h2>Test Completed Successfully 🎉</h2>
          <div class="review-score-number">${result.score} / ${result.total}</div>
          <p style="margin:0;color:rgba(255,255,255,0.9);font-size:16px">Overall Accuracy Score: <b>${percentage}%</b></p>

          <div class="review-stat-pills">
            <span class="review-stat-pill ${isPass ? 'correct' : 'wrong'}">${isPass ? '🎯 Target Score Met' : '⚠️ Practice Needed'}</span>
            <span class="review-stat-pill">${test.questions.length} Total Questions</span>
            <span class="review-stat-pill">${esc(test.subject)}</span>
          </div>

          <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
            <button style="background:#ffffff;color:#1d4ed8;font-weight:800;padding:12px 22px;box-shadow:0 4px 12px rgba(0,0,0,0.1)" onclick="viewReview(${result.attemptId})">View Detailed Solutions →</button>
            <button class="out" style="background:rgba(255,255,255,0.15);color:#ffffff;border:1.5px solid rgba(255,255,255,0.4);padding:12px 20px" onclick="start(${test.id})">🔄 Re-attempt Test</button>
            <button class="out" style="background:transparent;color:#ffffff;border:1.5px solid rgba(255,255,255,0.3);padding:12px 20px" onclick="hide('test');if(typeof loadStudentDashboard==='function')loadStudentDashboard()">Dashboard</button>
          </div>
        </div>
      `;
    } catch (error) {
      alert(error.message);
      hide('test');
    }
  };

  window.viewReview = async function (attemptId) {
    try {
      const attempt = await api('my-results/' + attemptId);
      if (!attempt.review) {
        return alert('Detailed review is not available for this older result.');
      }
      hide('results');

      const correctCount = attempt.review.filter(q => q.selectedAnswer === q.correctAnswer).length;
      const wrongCount = attempt.review.filter(q => q.selectedAnswer !== null && q.selectedAnswer !== q.correctAnswer).length;
      const unattemptedCount = attempt.review.filter(q => q.selectedAnswer === null).length;
      const percentage = Math.round((attempt.score / attempt.total) * 100);

      // Weak topics identification
      const incorrectQuestions = attempt.review.filter(q => q.selectedAnswer !== q.correctAnswer);

      $('testBox').innerHTML = `
        <button class="close" onclick="hide('test')">✕</button>
        <span class="tag" style="background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe;font-weight:800">📊 DETAILED EXAM ANALYSIS</span>
        <h2 style="margin:12px 0 4px;font-size:24px;color:#0f172a">${esc(attempt.title)}</h2>
        <p class="muted" style="margin:0 0 16px;font-size:13.5px">Completed on ${new Date(attempt.createdAt).toLocaleString('en-IN')} · ${esc(attempt.subject || 'General')}</p>

        <div class="review-score-hero" style="padding:24px 20px;margin-bottom:20px">
          <div style="font-size:36px;font-weight:900">${attempt.score} / ${attempt.total} (${percentage}%)</div>
          <div class="review-stat-pills">
            <span class="review-stat-pill correct">✓ ${correctCount} Correct</span>
            <span class="review-stat-pill wrong">✗ ${wrongCount} Incorrect</span>
            <span class="review-stat-pill unanswered">— ${unattemptedCount} Unattempted</span>
          </div>
        </div>

        <!-- Weak Topics & Recommendations Section -->
        ${incorrectQuestions.length > 0 ? `
          <div class="weak-topics-card">
            <div class="weak-topics-title">
              <span>⚠️</span>
              <span>Identified Weak Topics & High-Yield Revisions</span>
            </div>
            <p style="font-size:13px;color:#64748b;margin:0 0 10px;">
              Based on your missed questions in this test, we recommend revisiting the following chapters:
            </p>
            <div>
              <span class="weak-topic-pill">📌 ${esc(attempt.chapter || attempt.subject || 'Core Concepts')}</span>
              <span class="weak-topic-pill">⏱️ Speed Accuracy (${percentage}% current)</span>
              ${wrongCount > 2 ? `<span class="weak-topic-pill">💡 Negative Marking Alert: ${wrongCount} missed questions</span>` : ''}
            </div>
            <div class="suggestion-box">
              💡 <b>Faculty Suggestion:</b> Read the NCERT summary for <b>${esc(attempt.chapter || attempt.subject)}</b> and re-attempt this chapter mock test to improve your accuracy above 85%.
            </div>
          </div>
        ` : `
          <div class="weak-topics-card" style="border-color:#bbf7d0;background:#f0fdf4">
            <div class="weak-topics-title" style="color:#166534">
              <span>🎉</span>
              <span>Outstanding Performance!</span>
            </div>
            <p style="font-size:13.5px;color:#15803d;margin:0;">
              You answered all questions with exceptional precision. Maintain this streak on upcoming tests!
            </p>
          </div>
        `}

        <div style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 16px;flex-wrap:wrap;gap:10px;">
          <h3 style="margin:0;font-size:18px;color:#0f172a">Question-by-Question Detailed Solutions</h3>
          <button class="out" style="padding:8px 16px;font-size:13px;" onclick="start(${attempt.testId || attempt.id || 'null'})">🔄 Re-attempt Test</button>
        </div>

        <div>
          ${attempt.review.map((q, idx) => {
            const isCorrect = q.selectedAnswer === q.correctAnswer;
            const isUnattempted = q.selectedAnswer === null;
            let statusBadge = isCorrect
              ? `<span class="review-badge correct">✓ Correct</span>`
              : (isUnattempted ? `<span class="review-badge unanswered">— Not Attempted</span>` : `<span class="review-badge wrong">✗ Incorrect</span>`);

            return `
              <article class="review-item-card">
                <div class="review-item-header">
                  <b style="font-size:14.5px;color:#0f172a">Question ${idx + 1}</b>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    ${statusBadge}
                    <span style="font-size:12px;color:#64748b">⏱ Spent: ${Math.round(q.timeSpent || 0)}s</span>
                    ${q.marked ? `<span style="font-size:11.5px;color:#b45309;font-weight:700">🔖 Marked</span>` : ''}
                  </div>
                </div>

                <div style="font-size:16px;font-weight:600;margin-bottom:14px;color:#0f172a;line-height:1.55">
                  ${esc(q.question)}
                </div>

                <div>
                  ${q.options.map((opt, optIdx) => {
                    const isAnswer = optIdx === q.correctAnswer;
                    const isUserChoice = optIdx === q.selectedAnswer;
                    let rowClass = 'review-option-row';
                    let labelTag = '';

                    if (isAnswer) {
                      rowClass += ' is-correct';
                      labelTag = '✓ Correct Answer';
                    } else if (isUserChoice) {
                      rowClass += ' is-wrong';
                      labelTag = '✗ Your Choice';
                    }

                    return `
                      <div class="${rowClass}">
                        <span><b>${'ABCD'[optIdx]}.</b> ${esc(opt)}</span>
                        ${labelTag ? `<span style="font-size:12px;font-weight:800">${labelTag}</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </article>
            `;
          }).join('')}
        </div>

        <div style="margin-top:24px;text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button style="padding:12px 28px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff" onclick="hide('test')">Close Review</button>
          <button class="out" style="padding:12px 22px" onclick="if(typeof openStudentSection==='function')openStudentSection('results')">All My Results</button>
        </div>
      `;
      show('test');
    } catch (error) {
      alert(error.message);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (!ended && testStarted && document.hidden) {
      window.finish('Focus change: auto-submitted');
    }
  });

  window.addEventListener('blur', () => {
    if (!ended && testStarted) {
      setTimeout(() => {
        if (!ended && testStarted) {
          window.finish('Focus change: auto-submitted');
        }
      }, 150);
    }
  });
})();
