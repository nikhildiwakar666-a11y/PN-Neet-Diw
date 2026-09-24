(() => {
  let questionStartedAt = 0;
  let questionTimes = {};
  let markedQuestions = {};
  let testStarted = false;
  let testStartedAt = 0;

  const style = document.createElement('style');
  style.textContent = '.review-question{margin:18px 0;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px}.review-option{padding:10px 12px;margin:7px 0;border-radius:8px;background:#f8f9fc;border:1px solid var(--line)}.review-option.correct{background:#e9f8ed;border-color:#2b9a50}.review-option.wrong{background:#fff0f0;border-color:#d44b4b}.review-meta{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.review-meta span{padding:5px 8px;border-radius:99px;background:#eef0f5;font-size:12px;font-weight:bold}.instruction-list{line-height:1.8;padding-left:20px}';
  document.head.appendChild(style);

  function recordQuestionTime() {
    if (!testStarted || !test?.questions?.[test.i] || !questionStartedAt) return;
    const questionId = test.questions[test.i].id;
    questionTimes[questionId] = (questionTimes[questionId] || 0) + (Date.now() - questionStartedAt) / 1000;
    questionStartedAt = 0;
  }

  window.start = async function (id) {
    if (!user) {
      loginOpen();
      return;
    }
    const meta = tests.find(item => item.id === id);
    if (meta.startAt && new Date(meta.startAt) > Date.now()) return alert('This test opens on ' + when(meta.startAt));
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
    $('testBox').innerHTML = `<div class="center"><span class="tag">Before you begin</span><h2>${esc(test.title)}</h2><p class="muted">${test.questions.length} questions · ${test.duration} minutes</p><div class="panel" style="text-align:left;margin-top:18px"><h3>How to attempt this test</h3><ol class="instruction-list"><li>Read each question and click one option to select your answer.</li><li>Use <b>Next</b> and <b>Previous</b> to move between questions.</li><li>Use <b>Mark for review</b> when you want to revisit a question later.</li><li>Click <b>Submit Test</b> after checking your answers. Unanswered questions are counted as not attempted.</li><li>Do not change tabs, windows, or minimize the browser. Doing so automatically submits the test.</li><li>The timer starts only after you click <b>Start Test Now</b>.</li></ol></div><button style="margin-top:18px" onclick="beginTest()">Start Test Now →</button></div>`;
  };

  window.beginTest = function () {
    testStarted = true;
    testStartedAt = Date.now();
    questionStartedAt = 0;
    window.renderQuestion();
    clearInterval(timer);
    timer = setInterval(() => {
      if (--test.left <= 0) window.finish('Time over');
      else $('timer').textContent = format(test.left);
    }, 1000);
  };

  window.selectAnswer = function (questionId, answer) {
    answers[questionId] = answer;
    if (!questionTimes[questionId]) questionTimes[questionId] = Math.max(1, Math.round((Date.now() - testStartedAt) / 1000));
    window.renderQuestion();
  };

  window.changeQuestion = function (index) {
    recordQuestionTime();
    test.i = index;
    questionStartedAt = Date.now();
    window.renderQuestion();
  };

  window.toggleMark = function (questionId) {
    markedQuestions[questionId] = !markedQuestions[questionId];
    window.renderQuestion();
  };

  renderQuestion = window.renderQuestion = function () {
    $('testBox').innerHTML = `<div class="testbar"><div><b>${esc(test.title)}</b><div class="muted">${test.questions.length} questions · Answer all questions before submitting</div></div><span class="timer" id="timer">${format(test.left)}</span></div><div class="warning">Warning: changing tab/window or minimizing the browser automatically submits this test.</div>${test.questions.map((question, questionIndex) => { const isMarked = !!markedQuestions[question.id], answeredIn = questionTimes[question.id]; return `<article class="review-question"><div class="question">${questionIndex + 1}. ${esc(question.question)}</div>${question.options.map((option, optionIndex) => `<button class="option ${answers[question.id] === optionIndex ? 'selected' : ''}" onclick="selectAnswer(${question.id},${optionIndex})"><b>${'ABCD'[optionIndex]}.</b> ${esc(option)}</button>`).join('')}<div class="review-meta"><span>${answeredIn ? `Answered in ${answeredIn} sec` : 'Not answered yet'}</span><button class="light" onclick="toggleMark(${question.id})">${isMarked ? '✓ Marked for Review' : '☆ Mark for Review'}</button></div></article>`; }).join('')}<div class="nav"><span class="muted">Check every answer before submitting.</span><button onclick="finish('Submitted')">Submit Test</button></div>`;
  };

  finish = window.finish = async function (reason) {
    if (ended || !testStarted) return;
    ended = true;
    recordQuestionTime();
    testStarted = false;
    clearInterval(timer);
    try {
      const result = await api('attempts', { method: 'POST', body: JSON.stringify({ testId: test.id, answers, timeSpent: questionTimes, marked: markedQuestions }) });
      $('testBox').innerHTML = `<div class="center"><span class="tag">${esc(reason)}</span><h2>Test Complete</h2><div class="score">${result.score}/${result.total}</div><p class="muted">Score: ${Math.round(result.score / result.total * 100)}%</p><button onclick="viewReview(${result.attemptId})">View Answers & Review</button> <button class="out" onclick="hide('test')">Back to Home</button></div>`;
    } catch (error) {
      alert(error.message);
      hide('test');
    }
  };

  window.viewReview = async function (attemptId) {
    try {
      const attempt = await api('my-results/' + attemptId);
      if (!attempt.review) return alert('Detailed review is not available for this older result. Take the test again to see answer-by-answer review.');
      hide('results');
      $('testBox').innerHTML = `<button class="close" onclick="hide('test')">×</button><h2>${esc(attempt.title)}</h2><p class="muted">Answer review · ${new Date(attempt.createdAt).toLocaleString('en-IN')}</p><div class="score" style="font-size:36px">${attempt.score}/${attempt.total}</div>${attempt.review.map((question, index) => { const status = question.selectedAnswer === null ? 'Not attempted' : question.selectedAnswer === question.correctAnswer ? 'Correct' : 'Incorrect'; return `<article class="review-question"><b>Question ${index + 1}. ${esc(question.question)}</b><div class="review-meta"><span>${status}</span><span>Time spent: ${question.timeSpent} sec</span>${question.marked ? '<span>Marked for review</span>' : ''}</div>${question.options.map((option, optionIndex) => `<div class="review-option ${optionIndex === question.correctAnswer ? 'correct' : optionIndex === question.selectedAnswer ? 'wrong' : ''}"><b>${'ABCD'[optionIndex]}.</b> ${esc(option)} ${optionIndex === question.correctAnswer ? '✓ Correct answer' : optionIndex === question.selectedAnswer ? '✗ Your answer' : ''}</div>`).join('')}</article>`; }).join('')}<button onclick="hide('test')">Close Review</button>`;
      show('test');
    } catch (error) {
      alert(error.message);
    }
  };

  resultsOpen = window.resultsOpen = async function () {
    if (!user) {
      loginOpen();
      return;
    }
    const results = await api('my-results');
    $('resultsList').innerHTML = results.length ? results.map(result => `<div class="row"><span><b>${esc(result.title)}</b><br><small>${new Date(result.createdAt).toLocaleString('en-IN')}</small></span><span><span class="tag">${result.score}/${result.total} · ${Math.round(result.score / result.total * 100)}%</span> <button class="light" onclick="viewReview(${result.id})">View Review</button></span></div>`).join('') : '<p class="muted">No completed tests yet.</p>';
    show('results');
  };

  document.addEventListener('visibilitychange', () => {
    if (!ended && testStarted && document.hidden) window.finish('Focus change: auto-submitted');
  });
})();
