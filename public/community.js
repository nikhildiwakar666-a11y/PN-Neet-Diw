(() => {
  const style = document.createElement('style');
  style.textContent = `
    .chat-modal-box {
      max-width: 760px;
      width: 100%;
      height: 86vh;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e5e5e0;
      border-radius: 18px;
    }
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e5e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      flex-shrink: 0;
    }
    .chat-header h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      color: #111111;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chat-header-status {
      font-size: 12px;
      color: #555552;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .chat-header-status::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #111111;
    }
    .chat-guideline {
      padding: 8px 18px;
      background: #f7f7f5;
      border-bottom: 1px solid #ebebe6;
      font-size: 12px;
      color: #737370;
      flex-shrink: 0;
    }
    .chat-feed {
      flex: 1;
      overflow-y: auto;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
    }
    .chat-message-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      position: relative;
    }
    .chat-avatar-wrap {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
      background: #111111;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
      border: 1px solid #e5e5e0;
    }
    .chat-avatar-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .chat-bubble-container {
      flex: 1;
      min-width: 0;
    }
    .chat-bubble-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .chat-author-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #111111;
    }
    .chat-role-tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 4px;
      background: #111111;
      color: #ffffff;
    }
    .chat-role-tag.student {
      background: #f0f0ed;
      color: #666662;
    }
    .chat-timestamp {
      font-size: 11.5px;
      color: #8c8c88;
    }
    .chat-bubble-body {
      background: #f7f7f5;
      border: 1px solid #e5e5e0;
      border-radius: 12px;
      padding: 11px 14px;
      color: #111111;
      font-size: 13.5px;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .chat-bubble-body.mine {
      background: #f0f0ed;
      border-color: #dcdcd6;
    }
    .chat-shared-photo {
      display: block;
      max-width: min(100%, 340px);
      max-height: 240px;
      object-fit: cover;
      border-radius: 9px;
      margin-top: 9px;
      border: 1px solid #dcdcd6;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .chat-shared-photo:hover {
      opacity: 0.92;
    }
    .chat-bubble-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 5px;
      font-size: 12px;
    }
    .chat-action-btn {
      background: none;
      border: none;
      color: #666662;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-radius: 4px;
    }
    .chat-action-btn:hover {
      color: #111111;
      background: #f0f0ed;
    }
    .chat-action-btn.delete {
      color: #c93b3b;
    }
    .chat-action-btn.delete:hover {
      background: #fff0f0;
      color: #b02a2a;
    }

    /* Threaded / Nested Replies */
    .chat-thread-container {
      margin-top: 10px;
      padding-left: 14px;
      border-left: 2px solid #e0e0da;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .chat-reply-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .chat-reply-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      background: #333333;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .chat-reply-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .chat-reply-bubble {
      flex: 1;
      background: #fafaf8;
      border: 1px solid #ebebe6;
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 13px;
      line-height: 1.5;
      color: #111111;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .chat-reply-bubble.mine {
      background: #f0f0ed;
    }

    /* Composer Area */
    .chat-composer-wrap {
      border-top: 1px solid #e5e5e0;
      background: #ffffff;
      padding: 12px 18px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chat-reply-target-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f5f5f2;
      border-left: 3px solid #111111;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #444440;
    }
    .chat-reply-target-bar span b {
      color: #111111;
    }
    .chat-reply-cancel-btn {
      background: none;
      border: none;
      color: #888884;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      padding: 0 4px;
    }
    .chat-reply-cancel-btn:hover {
      color: #111111;
    }
    .chat-image-preview-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      background: #f8f8f6;
      border: 1px solid #e5e5e0;
      border-radius: 8px;
      max-width: 300px;
    }
    .chat-image-preview-thumb {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #dcdcd6;
    }
    .chat-image-preview-name {
      flex: 1;
      min-width: 0;
      font-size: 11.5px;
      color: #555550;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chat-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .chat-textarea {
      flex: 1;
      min-height: 44px;
      max-height: 120px;
      padding: 10px 12px;
      border: 1px solid #d4d4cd;
      border-radius: 10px;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.45;
      resize: none;
      color: #111111;
      background: #ffffff;
      transition: border-color 0.15s ease;
    }
    .chat-textarea:focus {
      outline: none;
      border-color: #111111;
    }
    .chat-attach-btn {
      background: #f7f7f5;
      border: 1px solid #dcdcd6;
      color: #333330;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      font-size: 17px;
      transition: all 0.15s ease;
    }
    .chat-attach-btn:hover {
      background: #eeeeea;
      border-color: #111111;
      color: #111111;
    }
    .chat-send-btn {
      background: #111111;
      color: #ffffff;
      border: none;
      height: 42px;
      padding: 0 16px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }
    .chat-send-btn:hover {
      background: #333330;
    }
    .chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  let activeReplyTo = null; // { id, author, snippet }
  let selectedChatFile = null;

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function getAvatarHtml(name, avatarUrl, sizeClass = '') {
    const letter = (name || 'S').trim().charAt(0).toUpperCase();
    if (avatarUrl) {
      return `<div class="chat-avatar-wrap ${sizeClass}"><img src="${avatarUrl}" alt="${esc(name)}"></div>`;
    }
    return `<div class="chat-avatar-wrap ${sizeClass}"><span>${letter}</span></div>`;
  }

  window.communityOpen = async function () {
    if (!user) {
      loginOpen();
      return;
    }

    $('testBox').innerHTML = `
      <div class="chat-modal-box">
        <div class="chat-header">
          <div>
            <h3>💬 NEET Community Chat</h3>
            <span class="chat-header-status">Respectful Doubts & Discussion</span>
          </div>
          <button class="close" onclick="hide('test')" style="position:static">✕</button>
        </div>
        <div class="chat-guideline">
          Ask doubts directly, reply to discuss concepts, attach questions, and support fellow NEET aspirants.
        </div>
        <div class="chat-feed" id="chatFeed">
          <p class="muted" style="text-align:center;padding:20px">Loading chat messages...</p>
        </div>
        <div class="chat-composer-wrap">
          <div id="replyTargetBar" style="display:none" class="chat-reply-target-bar">
            <span id="replyTargetText"></span>
            <button class="chat-reply-cancel-btn" onclick="cancelReply()">✕</button>
          </div>
          <div id="imagePreviewBar" style="display:none" class="chat-image-preview-bar">
            <img id="imagePreviewThumb" class="chat-image-preview-thumb" src="" alt="Selected image">
            <span id="imagePreviewName" class="chat-image-preview-name"></span>
            <button class="chat-reply-cancel-btn" onclick="clearSelectedImage()">✕</button>
          </div>
          <div class="chat-input-row">
            <textarea id="chatInput" class="chat-textarea" placeholder="Type your doubt or question... (Enter to send, Shift+Enter for newline)"></textarea>
            <input type="file" id="chatFileInput" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none">
            <button type="button" class="chat-attach-btn" onclick="$('chatFileInput').click()" title="Attach image (JPG, PNG, WebP, GIF)">📷</button>
            <button type="button" class="chat-send-btn" id="chatSendBtn" onclick="sendChatMessage()">Send ➤</button>
          </div>
        </div>
      </div>
    `;
    show('test');

    // Wire up image input change
    const fileInput = $('chatFileInput');
    if (fileInput) {
      fileInput.onchange = handleImageSelect;
    }

    // Enter key submits (Shift+Enter for newline)
    const textarea = $('chatInput');
    if (textarea) {
      textarea.onkeydown = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      };
      textarea.focus();
    }

    activeReplyTo = null;
    selectedChatFile = null;

    await loadChatMessages();
  };

  function handleImageSelect() {
    const input = $('chatFileInput');
    const file = input?.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.mimetype || file.type)) {
      alert('Only JPG, PNG, WebP, and GIF images are allowed.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10 MB.');
      input.value = '';
      return;
    }

    selectedChatFile = file;
    const previewBar = $('imagePreviewBar');
    const thumb = $('imagePreviewThumb');
    const nameLabel = $('imagePreviewName');

    if (previewBar && thumb && nameLabel) {
      thumb.src = URL.createObjectURL(file);
      nameLabel.textContent = file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)';
      previewBar.style.display = 'flex';
    }
  }

  window.clearSelectedImage = function () {
    selectedChatFile = null;
    const input = $('chatFileInput');
    if (input) input.value = '';
    const previewBar = $('imagePreviewBar');
    if (previewBar) previewBar.style.display = 'none';
  };

  window.setReplyTarget = function (postId, authorName, textSnippet) {
    activeReplyTo = { id: postId, author: authorName, snippet: textSnippet };
    const bar = $('replyTargetBar');
    const text = $('replyTargetText');
    if (bar && text) {
      text.innerHTML = `Replying to <b>${esc(authorName)}</b>: <i>${esc(textSnippet.slice(0, 50))}${textSnippet.length > 50 ? '...' : ''}</i>`;
      bar.style.display = 'flex';
    }
    const input = $('chatInput');
    if (input) {
      input.focus();
      input.placeholder = `Write a reply to ${authorName}...`;
    }
  };

  window.cancelReply = function () {
    activeReplyTo = null;
    const bar = $('replyTargetBar');
    if (bar) bar.style.display = 'none';
    const input = $('chatInput');
    if (input) input.placeholder = 'Type your doubt or question... (Enter to send, Shift+Enter for newline)';
  };

  async function loadChatMessages() {
    try {
      const posts = await api('community');
      const feed = $('chatFeed');
      if (!feed) return;

      if (!posts.length) {
        feed.innerHTML = `
          <div style="text-align:center;padding:40px 20px;color:#888884">
            <div style="font-size:36px;margin-bottom:10px">💬</div>
            <b>No messages in Community yet</b>
            <p style="font-size:13px;margin:6px 0">Be the first to ask a NEET biology, chemistry, or physics question!</p>
          </div>
        `;
        return;
      }

      feed.innerHTML = posts.map(post => {
        const isMine = post.userId === user?.id;
        const isAdmin = user?.role === 'admin';
        const roleTag = post.authorRole === 'admin'
          ? `<span class="chat-role-tag">Teacher / Admin</span>`
          : `<span class="chat-role-tag student">Student</span>`;

        const imageHtml = post.image
          ? `<img class="chat-shared-photo" src="${post.image}" alt="Shared image" onclick="viewChatPhoto('${post.image}')">`
          : '';

        const repliesHtml = (post.comments || []).map(comment => {
          const commentIsMine = comment.userId === user?.id;
          const commentRoleTag = comment.authorRole === 'admin'
            ? `<span class="chat-role-tag" style="font-size:9px">Admin</span>`
            : '';
          const commentImageHtml = comment.image
            ? `<img class="chat-shared-photo" src="${comment.image}" alt="Reply image" onclick="viewChatPhoto('${comment.image}')">`
            : '';

          return `
            <div class="chat-reply-row">
              <div class="chat-reply-avatar">
                ${comment.authorAvatar ? `<img src="${comment.authorAvatar}" alt="${esc(comment.author)}">` : `<span>${(comment.author || 'S').charAt(0).toUpperCase()}</span>`}
              </div>
              <div class="chat-reply-bubble ${commentIsMine ? 'mine' : ''}">
                <div class="chat-bubble-header">
                  <span class="chat-author-name" style="font-size:12.5px">${esc(comment.author)}</span>
                  ${commentRoleTag}
                  <span class="chat-timestamp">${formatTime(comment.createdAt)}</span>
                  ${isAdmin ? `<button class="chat-action-btn delete" onclick="deleteReply(${post.id}, ${comment.id})">✕</button>` : ''}
                </div>
                <div>${esc(comment.body)}</div>
                ${commentImageHtml}
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="chat-message-row" id="post-${post.id}">
            ${getAvatarHtml(post.author, post.authorAvatar)}
            <div class="chat-bubble-container">
              <div class="chat-bubble-header">
                <span class="chat-author-name">${esc(post.author)}</span>
                ${roleTag}
                <span class="chat-timestamp">${formatTime(post.createdAt)}</span>
              </div>
              <div class="chat-bubble-body ${isMine ? 'mine' : ''}">
                <div>${esc(post.body)}</div>
                ${imageHtml}
              </div>
              <div class="chat-bubble-actions">
                <button class="chat-action-btn" onclick="setReplyTarget(${post.id}, '${esc(post.author).replace(/'/g, "\\'")}', '${esc(post.body).replace(/'/g, "\\'")}')">
                  ↩ Reply ${post.comments?.length ? `(${post.comments.length})` : ''}
                </button>
                ${isAdmin ? `<button class="chat-action-btn delete" onclick="deleteMessage(${post.id})">🗑 Remove</button>` : ''}
              </div>

              ${post.comments?.length ? `<div class="chat-thread-container">${repliesHtml}</div>` : ''}
            </div>
          </div>
        `;
      }).join('');

      feed.scrollTop = feed.scrollHeight;
    } catch (e) {
      const feed = $('chatFeed');
      if (feed) feed.innerHTML = `<p class="muted" style="color:#ce3b3b;padding:20px">${esc(e.message)}</p>`;
    }
  }

  window.sendChatMessage = async function () {
    const input = $('chatInput');
    const sendBtn = $('chatSendBtn');
    const bodyText = (input?.value || '').trim();

    if (!bodyText && !selectedChatFile) {
      alert('Please enter a message or attach a photo.');
      return;
    }

    try {
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
      }

      const form = new FormData();
      form.append('body', bodyText);
      if (selectedChatFile) {
        form.append('image', selectedChatFile);
      }

      if (activeReplyTo) {
        // Send threaded reply
        await api(`community/${activeReplyTo.id}/comments`, {
          method: 'POST',
          body: form
        });
      } else {
        // Send direct message
        await api('community', {
          method: 'POST',
          body: form
        });
      }

      input.value = '';
      clearSelectedImage();
      cancelReply();
      await loadChatMessages();
    } catch (e) {
      alert(e.message || 'Failed to send message.');
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send ➤';
      }
    }
  };

  window.deleteMessage = async function (id) {
    if (confirm('Delete this community message and its replies?')) {
      try {
        await api('community/' + id, { method: 'DELETE' });
        await loadChatMessages();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  window.deleteReply = async function (postId, commentId) {
    if (confirm('Delete this reply?')) {
      try {
        await api(`community/${postId}/comments/${commentId}`, { method: 'DELETE' });
        await loadChatMessages();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  window.viewChatPhoto = function (src) {
    const lightbox = document.createElement('div');
    lightbox.className = 'modal show';
    lightbox.style.zIndex = '2000';
    lightbox.innerHTML = `
      <div style="position:relative;max-width:92vw;max-height:92vh;display:flex;align-items:center;justify-content:center">
        <button class="close" style="top:-36px;right:0;color:#fff;background:#111" onclick="this.closest('.modal').remove()">✕</button>
        <img src="${src}" style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:12px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      </div>
    `;
    lightbox.onclick = e => { if (e.target === lightbox) lightbox.remove(); };
    document.body.appendChild(lightbox);
  };

  // Modern Study Calendar feature
  window.calendarOpen = async function () {
    if (!user) { applyViewState(); return; }
    $('testBox').innerHTML = `
      <button class="close" onclick="hide('test')">✕</button>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span class="tag">Daily Revision Tracker</span>
      </div>
      <h2 style="margin:0 0 6px;font-size:24px">🗓️ My Study Calendar</h2>
      <p class="muted" style="margin:0 0 20px">Organize daily chapter targets, revision milestones, and track completion privately.</p>

      <div class="panel formgrid" style="margin-top:16px;background:#fcfcfb">
        <div class="wide">
          <label style="margin-top:0">Study Topic or Chapter Goal</label>
          <input id="planTitle" placeholder="e.g. Biology: Photosynthesis & Calvin Cycle Notes">
        </div>
        <div>
          <label>Subject</label>
          <select id="planSubject">
            <option>Biology</option>
            <option>Chemistry</option>
            <option>Physics</option>
            <option>General Revision</option>
          </select>
        </div>
        <div>
          <label>Target Date & Time</label>
          <input id="planStart" type="datetime-local">
        </div>
        <div class="wide" style="margin-top:8px">
          <button style="width:100%;font-weight:700" onclick="savePlan()">+ Add Study Target to Calendar</button>
        </div>
      </div>

      <div class="section-head" style="margin:24px 0 12px">
        <h3 style="margin:0;font-size:17px">Scheduled Study Sessions</h3>
      </div>
      <div id="planList"></div>
    `;
    show('test');
    await loadPlans();
  };

  async function loadPlans() {
    try {
      const plans = await api('study-plan');
      const list = $('planList');
      if (!list) return;

      if (!plans.length) {
        list.innerHTML = `
          <div style="text-align:center;padding:30px 20px;background:#f8f8f6;border-radius:12px;border:1px dashed var(--line)">
            <p class="muted" style="margin:0">No revision targets planned yet. Set your first NEET goal above!</p>
          </div>
        `;
        return;
      }

      list.innerHTML = plans.map(p => `
        <div class="calendar-card ${p.done ? 'is-done' : ''}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <span class="tag ${p.done ? 'green' : ''}">${p.done ? '✓ Completed' : '○ Scheduled'} · ${esc(p.subject)}</span>
              <h4 style="margin:8px 0 4px;font-size:16px;color:#111;text-decoration:${p.done ? 'line-through' : 'none'}">${esc(p.title)}</h4>
              <small class="muted">📅 ${new Date(p.startAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
            </div>
            <div style="display:flex;gap:8px">
              <button class="light" style="padding:6px 12px;font-size:12.5px" onclick="completePlan(${p.id}, ${!p.done})">
                ${p.done ? 'Mark as Pending' : '✓ Mark Done'}
              </button>
              <button class="red" style="padding:6px 12px;font-size:12.5px" onclick="deletePlan(${p.id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (_) {}
  }

  window.savePlan = async function () {
    const title = $('planTitle')?.value.trim();
    const start = $('planStart')?.value;
    if (!title) return alert('Please enter a chapter topic or goal.');
    if (!start) return alert('Please select a target date and time.');

    try {
      await api('study-plan', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subject: $('planSubject')?.value || 'General',
          startAt: new Date(start).toISOString()
        })
      });
      $('planTitle').value = '';
      $('planStart').value = '';
      await loadPlans();
    } catch (e) {
      alert(e.message);
    }
  };

  window.completePlan = async function (id, done) {
    await api('study-plan/' + id, { method: 'PUT', body: JSON.stringify({ done }) });
    loadPlans();
  };

  window.deletePlan = async function (id) {
    if (confirm('Delete this study target?')) {
      await api('study-plan/' + id, { method: 'DELETE' });
      loadPlans();
    }
  };

  // Modern Help & Support feature
  window.helpOpen = function () {
    $('testBox').innerHTML = `
      <button class="close" onclick="hide('test')">✕</button>
      <span class="tag">Support & Guidance</span>
      <h2 style="margin:10px 0 6px;font-size:24px">❓ NEET Practice Help & Guidance</h2>
      <p class="muted" style="margin:0 0 22px">Official instructions, exam rules, and helpful FAQs for PN Neet Diw.</p>

      <div style="display:flex;flex-direction:column;gap:12px">
        <details class="faq-card" open>
          <summary><b>How do I start a timed NEET mock test?</b></summary>
          <p>Go to your Student Dashboard, browse the Chapter-wise Test Schedule, and click <b>Start Test →</b>. Review the exam instructions and click <b>Start Test Now</b> to initiate the realistic countdown timer.</p>
        </details>

        <details class="faq-card">
          <summary><b>What is the strict Focus Protection rule?</b></summary>
          <p>To simulate actual NEET examination computer-based test honesty, switching browser tabs, minimizing the window, or losing window focus automatically submits your test attempt immediately.</p>
        </details>

        <details class="faq-card">
          <summary><b>How do I review answers and view my score analytics?</b></summary>
          <p>Click <b>My Results</b> in the navigation bar or under the user menu. Click <b>Review Answers</b> on any attempt to inspect question-by-question breakdown, correct answers (highlighted in green), and your selected choices.</p>
        </details>

        <details class="faq-card">
          <summary><b>How do I join a teacher's Live Class?</b></summary>
          <p>When a teacher starts broadcasting, a live broadcast card appears on your student dashboard. Simply click <b>Join Live Class →</b> to connect via interactive WebRTC.</p>
        </details>

        <details class="faq-card">
          <summary><b>How do I update my profile and photo?</b></summary>
          <p>Click your avatar circle in the top right corner and choose <b>My Profile</b>. You can update your display name and upload a JPG, PNG, WebP, or GIF avatar up to 5 MB.</p>
        </details>
      </div>

      <div style="margin-top:24px;text-align:center">
        <button style="padding:10px 24px" onclick="hide('test')">Close Guidance</button>
      </div>
    `;
    show('test');
  };
})();
