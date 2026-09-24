(() => {
  let socket, cameraStream, recorder, recordingChunks = [];
  const teacherPeers = new Map();
  let studentPeer;
  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const style = document.createElement('style');
  style.textContent = '.live-card{margin:20px 0;padding:22px;border-radius:16px;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:18px}.live-card p{color:#d7d7d2;margin:6px 0}.live-card button{background:#fff;color:#111}.live-video{width:100%;max-height:58vh;background:#080808;border-radius:12px;margin:14px 0}.live-status{color:#dcf2dc;font-weight:bold}@media(max-width:700px){.live-card{display:block}.live-card button{margin-top:12px}}';
  document.head.appendChild(style);

  function connect() {
    if (!socket && token) socket = io({ auth: { token } });
    return socket;
  }

  function room(title, body) {
    $('testBox').innerHTML = `<button class="close" onclick="hide('test')">×</button><h2>${esc(title)}</h2>${body}`;
    show('test');
  }

  async function refreshLiveCard() {
    const old = document.getElementById('liveCard');
    if (old) old.remove();
    if (!user || user.role !== 'student') return;
    try {
      const live = await api('live-class');
      if (!live.active) return;
      const card = document.createElement('section');
      card.id = 'liveCard'; card.className = 'live-card';
      card.innerHTML = `<div><span class="live-status">● LIVE NOW</span><h3>${esc(live.title)}</h3><p>Teacher: ${esc(live.teacher)} · Started ${new Date(live.startedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p></div><button onclick="joinLiveClass()">Join Live Class</button>`;
      document.getElementById('scheduleArea')?.prepend(card);
    } catch (_) {}
  }

  window.startLiveClass = async function () {
    const title = prompt('Enter the live class title:', 'NEET Live Class');
    if (!title?.trim()) return;
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await api('admin/live-class/start', { method: 'POST', body: JSON.stringify({ title }) });
      recordingChunks = [];
      recorder = new MediaRecorder(cameraStream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm' });
      recorder.ondataavailable = event => { if (event.data.size) recordingChunks.push(event.data); };
      recorder.onstop = uploadRecording;
      recorder.start(1000);
      const liveSocket = connect();
      liveSocket.on('student:joined', createTeacherPeer);
      liveSocket.on('live:answer', async data => { const peer = teacherPeers.get(data.from); if (peer) await peer.setRemoteDescription(data.answer); });
      liveSocket.on('live:ice', async data => { const peer = teacherPeers.get(data.from); if (peer && data.candidate) await peer.addIceCandidate(data.candidate); });
      room(title, '<p class="live-status">● You are live. Students can now join.</p><video class="live-video" id="hostVideo" autoplay muted playsinline></video><button class="red" onclick="endLiveClass()">End Live Class & Save Recording</button>');
      $('hostVideo').srcObject = cameraStream;
    } catch (error) {
      cameraStream?.getTracks().forEach(track => track.stop());
      cameraStream = null;
      alert(error.message || 'Camera and microphone permission is needed to start a live class.');
    }
  };

  async function createTeacherPeer(studentId) {
    const peer = new RTCPeerConnection(iceServers);
    teacherPeers.set(studentId, peer);
    cameraStream.getTracks().forEach(track => peer.addTrack(track, cameraStream));
    peer.onicecandidate = event => { if (event.candidate) socket.emit('live:ice', { to: studentId, candidate: event.candidate }); };
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('live:offer', { to: studentId, offer });
  }

  window.joinLiveClass = async function () {
    try {
      const live = await api('live-class');
      if (!live.active) return alert('This live class has ended.');
      const liveSocket = connect();
      studentPeer = new RTCPeerConnection(iceServers);
      studentPeer.ontrack = event => { $('studentVideo').srcObject = event.streams[0]; };
      studentPeer.onicecandidate = event => { if (event.candidate) liveSocket.emit('live:ice', { to: teacherSocketId, candidate: event.candidate }); };
      let teacherSocketId = null;
      liveSocket.on('live:offer', async data => { teacherSocketId = data.from; await studentPeer.setRemoteDescription(data.offer); const answer = await studentPeer.createAnswer(); await studentPeer.setLocalDescription(answer); liveSocket.emit('live:answer', { to: teacherSocketId, answer }); });
      liveSocket.on('live:ice', async data => { if (data.candidate) await studentPeer.addIceCandidate(data.candidate); });
      liveSocket.on('live:ended', closeStudentLive);
      room(live.title, `<p class="live-status">● Connected to live class</p><video class="live-video" id="studentVideo" autoplay playsinline controls></video><p class="muted">The class recording will appear in Notes & Videos after the teacher ends the live class.</p>`);
      liveSocket.emit('student:join');
    } catch (error) { alert(error.message); }
  };

  function closeStudentLive() {
    studentPeer?.close(); studentPeer = null;
    if ($('studentVideo')) $('studentVideo').srcObject = null;
    refreshLiveCard();
  }

  window.endLiveClass = function () {
    if (!confirm('End this live class? The recording will be saved to Notes & Videos.')) return;
    socket?.emit('live:end');
    teacherPeers.forEach(peer => peer.close()); teacherPeers.clear();
    cameraStream?.getTracks().forEach(track => track.stop());
    recorder?.stop();
    hide('test');
  };

  async function uploadRecording() {
    const file = new File([new Blob(recordingChunks, { type: 'video/webm' })], `live-class-${Date.now()}.webm`, { type: 'video/webm' });
    const form = new FormData(); form.append('recording', file);
    try { await api('admin/live-class/end', { method: 'POST', body: form }); alert('Live class ended. Its recording is now available in Notes & Videos.'); }
    catch (error) { alert('Live class ended, but recording upload failed: ' + error.message); }
  }

  function addAdminControl() {
    if (user?.role !== 'admin' || document.getElementById('liveAdminButton')) return;
    const tabs = document.querySelector('#admin .tabs');
    if (!tabs) return;
    const button = document.createElement('button');
    button.id = 'liveAdminButton'; button.className = 'light'; button.textContent = 'Start Live Class'; button.onclick = window.startLiveClass;
    tabs.appendChild(button);
  }

  const existingAdminLoad = window.adminLoad;
  adminLoad = window.adminLoad = async function () { await existingAdminLoad(); addAdminControl(); };
  const existingRefreshUser = window.refreshUser;
  refreshUser = window.refreshUser = function () { existingRefreshUser(); refreshLiveCard(); };
  document.addEventListener('DOMContentLoaded', refreshLiveCard);
  setTimeout(refreshLiveCard, 250);
})();
