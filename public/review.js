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
      max-width: 640px;
      margin: 0 auto;
      padding: 10px 0;
    }
    .test-instruction-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
      text-align: left;
    }
    .instruction-card {
      background: #f8f8f6;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .instruction-card-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .instruction-card b {
      display: block;
      font-size: 13.5px;
      color: #111111;
      margin-bottom: 3px;
    }
    .instruction-card span {
      font-size: 12px;
      color: var(--m);
      line-height: 1.45;
    }

    /* Test Attempt Interface */
    .test-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--line);
      flex-wrap: wrap;
    }
    .test-title-area b {
      font-size: 17px;
      color: #111111;
      display: block;
    }
    .test-title-area span {
      font-size: 12.5px;
      color: var(--m);
    }
    .test-timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #111111;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.02em;
    }
    .test-timer-badge.warning {
      background: #b91c1c;
      animation: pulse 1.5s infinite;
    }
    .test-focus-note {
      background: #fef8ee;
      border: 1px solid #fde0b2;
      color: #92400e;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12.5px;
      font-weight: 500;
      margin: 16px 0 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .test-palette-strip {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px 0 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--line);
    }
    .palette-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f0f0ed;
      color: #111111;
      font-size: 12.5px;
      font-weight: 700;
      border: 1px solid #e0e0da;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.12s ease;
    }
    .palette-btn:hover { background: #e2e2dc; }
    .palette-btn.active {
      background: #111111;
      color: #ffffff;
      border-color: #111111;
    }
    .palette-btn.answered {
      background: #ecfdf5;
      color: #15803d;
      border-color: #86efac;
    }
    .palette-btn.marked {
      border: 2px dashed #b45309;
    }

    .question-statement-box {
      font-size: 18px;
      font-weight: 600;
      line-height: 1.55;
      color: #111111;
      margin: 18px 0 20px;
    }

    .option-btn {
      width: 100%;
      text-align: left;
      background: #ffffff;
      border: 1.5px solid var(--line);
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14.5px;
      color: #171717;
      transition: all 0.15s ease;
    }
    .option-btn:hover {
      border-color: #111111;
      background: #fbfbf9;
    }
    .option-btn.selected {
      border-color: #111111;
      background: #111111;
      color: #ffffff;
    }
    .option-letter {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #f0f0ed;
      color: #111111;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
    }
    .option-btn.selected .option-letter {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    .test-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
      flex-wrap: wrap;
    }

    /* Result & Review Layout */
    .review-score-hero {
      background: #111111;
      color: #ffffff;
      border-radius: 16px;
      padding: 28px;
      text-align: center;
      margin: 14px 0 24px;
    }
    .review-score-hero h2 {
      margin: 0 0 6px;
      font-size: 24px;
    }
    .review-score-number {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 10px 0;
    }
    .review-stat-pills {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .review-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 700;
    }
    .review-stat-pill.correct { background: #15803d; color: #ffffff; }
    .review-stat-pill.wrong { background: #b91c1c; color: #ffffff; }
    .review-stat-pill.unanswered { background: #444440; color: #ffffff; }

    .review-item-card {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
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
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
    }
    .review-badge.correct { background: #ecfdf5; color: #15803d; border: 1px solid #86efac; }
    .review-badge.wrong { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
    .review-badge.unanswered { background: #f0f0ed; color: #666662; border: 1px solid #e0e0da; }

    .review-option-row {
      padding: 12px 14px;
      border-radius: 9px;
      margin-bottom: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid var(--line);
      background: #fafaf9;
    }
    .review-option-row.is-correct {
      background: #ecfdf5;
      border-color: #86efac;
      color: #14532d;
      font-weight: 600;
    }
    .review-option-row.is-wrong {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #7f1d1d;
      font-weight: 600;
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
        <span class="tag" style="background:#111111;color:#ffffff;font-size:12px;padding:4px 12px">Exam Instructions</span>
        <h2 style="font-size:24px;margin:12px 0 6px">${esc(test.title)}</h2>
        <p class="muted" style="margin:0 0 16px">${esc(test.subject)} · ${esc(test.chapter || 'General')} · ${test.questions.length} Questions · ${test.duration} Minutes</p>

        <div class="test-instruction-grid">
          <div class="instruction-card">
            <span class="instruction-card-icon">⏱️</span>
            <div>
              <b>Timed Countdown</b>
              <span>Countdown starts automatically upon clicking Start Test.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">🔒</span>
            <div>
              <b>Focus Protection</b>
              <span>Switching tabs or minimizing submits your attempt to ensure honesty.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">🔖</span>
            <div>
              <b>Mark for Review</b>
              <span>Flag tricky questions and revisit them before final submission.</span>
            </div>
          </div>
          <div class="instruction-card">
            <span class="instruction-card-icon">📊</span>
            <div>
              <b>Instant Review</b>
              <span>Receive question-by-question explanations and accuracy analytics.</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
          <button style="padding:12px 24px;font-size:15px;font-weight:700" onclick="beginTest()">Start Test Now →</button>
          <button class="out" style="padding:12px 20px" onclick="hide('test')">Cancel</button>
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
          <span>Question ${test.i + 1} of ${test.questions.length} · (${answeredCount} of ${test.questions.length} answered)</span>
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
          return `<button class="${classes}" onclick="changeQuestion(${idx})" title="Question ${idx + 1}">${idx + 1}</button>`;
        }).join('')}
      </div>

      <!-- Current Question Statement -->
      <div class="question-statement-box">
        ${test.i + 1}. ${esc(q.question)}
      </div>

      <!-- Options List -->
      <div>
        ${q.options.map((opt, optIdx) => {
          const isSelected = answers[q.id] === optIdx;
          return `
            <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${q.id}, ${optIdx})">
              <span class="option-letter">${'ABCD'[optIdx]}</span>
              <span>${esc(opt)}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Footer Action Navigation -->
      <div class="test-actions-bar">
        <div style="display:flex;gap:8px">
          <button class="out" ${test.i === 0 ? 'disabled' : ''} onclick="changeQuestion(${test.i - 1})">← Previous</button>
          <button class="light" onclick="toggleMark(${q.id})">
            ${isMarked ? '✓ Marked for Review' : '☆ Mark for Review'}
          </button>
        </div>

        <div style="display:flex;gap:8px">
          ${test.i < test.questions.length - 1
            ? `<button onclick="changeQuestion(${test.i + 1})">Next Question →</button>`
            : `<button style="background:#15803d" onclick="finishPrompt()">Submit Mock Test ✓</button>`
          }
        </div>
      </div>
    `;
  };

  window.finishPrompt = function () {
    const un = test.questions.length - Object.keys(answers).length;
    let msg = 'Are you ready to submit your test?';
    if (un > 0) {
      msg = `You have ${un} unattempted question(s). Are you sure you want to submit?`;
    }
    if (confirm(msg)) {
      window.finish('Submitted by Student');
    }
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

      $('testBox').innerHTML = `
        <div class="review-score-hero">
          <span class="tag" style="background:#262624;color:#f0f0ed">${esc(reason)}</span>
          <h2>Test Completed Successfully</h2>
          <div class="review-score-number">${result.score} / ${result.total}</div>
          <p style="margin:0;color:#d7d7d2;font-size:15px">Overall Accuracy Score: <b>${percentage}%</b></p>

          <div style="display:flex;gap:12px;justify-content:center;margin-top:22px">
            <button style="background:#ffffff;color:#111111;font-weight:700" onclick="viewReview(${result.attemptId})">View Answers & Explanations →</button>
            <button class="out" style="color:#ffffff;border-color:rgba(255,255,255,0.3)" onclick="hide('test');if(typeof loadStudentDashboard==='function')loadStudentDashboard()">Return to Dashboard</button>
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

      $('testBox').innerHTML = `
        <button class="close" onclick="hide('test')">✕</button>
        <span class="tag">Performance & Answer Review</span>
        <h2 style="margin:10px 0 4px;font-size:22px">${esc(attempt.title)}</h2>
        <p class="muted" style="margin:0 0 16px">Completed on ${new Date(attempt.createdAt).toLocaleString('en-IN')}</p>

        <div class="review-score-hero" style="padding:20px;margin-bottom:20px">
          <div style="font-size:32px;font-weight:800">${attempt.score} / ${attempt.total} (${percentage}%)</div>
          <div class="review-stat-pills">
            <span class="review-stat-pill correct">✓ ${correctCount} Correct</span>
            <span class="review-stat-pill wrong">✗ ${wrongCount} Incorrect</span>
            <span class="review-stat-pill unanswered">— ${unattemptedCount} Unattempted</span>
          </div>
        </div>

        <div style="margin-top:20px">
          ${attempt.review.map((q, idx) => {
            const isCorrect = q.selectedAnswer === q.correctAnswer;
            const isUnattempted = q.selectedAnswer === null;
            let statusBadge = isCorrect
              ? `<span class="review-badge correct">✓ Correct</span>`
              : (isUnattempted ? `<span class="review-badge unanswered">— Not Attempted</span>` : `<span class="review-badge wrong">✗ Incorrect</span>`);

            return `
              <article class="review-item-card">
                <div class="review-item-header">
                  <b>Question ${idx + 1}</b>
                  <div style="display:flex;align-items:center;gap:8px">
                    ${statusBadge}
                    <span style="font-size:12px;color:var(--m)">⏱ Spent: ${q.timeSpent}s</span>
                    ${q.marked ? `<span style="font-size:11.5px;color:#b45309">🔖 Marked</span>` : ''}
                  </div>
                </div>

                <div style="font-size:15.5px;font-weight:600;margin-bottom:14px;color:#111">
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
                        ${labelTag ? `<span style="font-size:12px;font-weight:700">${labelTag}</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </article>
            `;
          }).join('')}
        </div>

        <div style="margin-top:20px;text-align:center">
          <button style="padding:10px 24px" onclick="hide('test')">Close Review</button>
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
