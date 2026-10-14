(() => {
  let socket, cameraStream, recorder, recordingChunks = [];
  const teacherPeers = new Map();
  let studentPeer;
  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const style = document.createElement('style');
  style.textContent = `
    .live-classroom-container {
      background: #0f0f0e;
      color: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      margin: -10px 0 0;
    }
    .classroom-header {
      padding: 16px 22px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
    }
    .classroom-title-area h3 {
      margin: 4px 0 2px;
      font-size: 19px;
      color: #ffffff;
      font-weight: 700;
    }
    .classroom-title-area p {
      margin: 0;
      font-size: 12.5px;
      color: #a3a39e;
    }
    .classroom-video-theater {
      position: relative;
      background: #000000;
      width: 100%;
      min-height: 380px;
      max-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .classroom-video {
      width: 100%;
      height: 100%;
      max-height: 60vh;
      object-fit: contain;
    }
    .classroom-recording-pill {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(17, 17, 17, 0.75);
      backdrop-filter: blur(8px);
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: #fca5a5;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .classroom-controls-bar {
      padding: 16px 22px;
      background: #171716;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
    }
    .classroom-status-pills {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #d4d4cd;
    }
    .classroom-status-pill {
      background: #262624;
      padding: 5px 11px;
      border-radius: 6px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  function connect() {
    if (!socket && token) socket = io({ auth: { token } });
    return socket;
  }

  function room(title, body) {
    $('testBox').innerHTML = body;
    show('test');
  }

  window.startLiveClass = async function () {
    const title = prompt('Enter the live class title:', 'NEET High-Yield Live Lecture');
    if (!title?.trim()) return;

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      await api('admin/live-class/start', { method: 'POST', body: JSON.stringify({ title: title.trim() }) });

      recordingChunks = [];
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm';
      recorder = new MediaRecorder(cameraStream, { mimeType: mime });
      recorder.ondataavailable = event => { if (event.data.size) recordingChunks.push(event.data); };
      recorder.onstop = uploadRecording;
      recorder.start(1000);

      const liveSocket = connect();
      liveSocket.on('student:joined', createTeacherPeer);
      liveSocket.on('live:answer', async data => {
        const peer = teacherPeers.get(data.from);
        if (peer) await peer.setRemoteDescription(data.answer);
      });
      liveSocket.on('live:ice', async data => {
        const peer = teacherPeers.get(data.from);
        if (peer && data.candidate) await peer.addIceCandidate(data.candidate);
      });

      room(title, `
        <div class="live-classroom-container">
          <div class="classroom-header">
            <div class="classroom-title-area">
              <span class="tag" style="background:#dc2626;color:#ffffff;font-size:11px;padding:3px 9px">
                <span class="live-pulse-dot" style="margin-right:4px"></span>BROADCASTING LIVE
              </span>
              <h3>${esc(title)}</h3>
              <p>Host: ${esc(user?.name || 'Faculty')} · Live WebRTC Stream Active</p>
            </div>
            <button class="close" style="position:static;color:#ffffff;background:#262624;border-color:#3a3a36" onclick="hide('test')">✕</button>
          </div>

          <div class="classroom-video-theater">
            <div class="classroom-recording-pill">
              <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>
              Auto-Recording Active (Will upload to Notes & Videos)
            </div>
            <video class="classroom-video" id="hostVideo" autoplay muted playsinline></video>
          </div>

          <div class="classroom-controls-bar">
            <div class="classroom-status-pills">
              <span class="classroom-status-pill">🎥 Camera: ON</span>
              <span class="classroom-status-pill">🎤 Microphone: ON</span>
              <span class="classroom-status-pill">👥 Students Connected</span>
            </div>
            <button class="red" style="font-weight:700;padding:10px 18px" onclick="endLiveClass()">⏹ End Class & Save Recording</button>
          </div>
        </div>
      `);

      if ($('hostVideo')) $('hostVideo').srcObject = cameraStream;
      if (typeof checkStudentLiveStatus === 'function') checkStudentLiveStatus();
    } catch (error) {
      cameraStream?.getTracks().forEach(track => track.stop());
      cameraStream = null;
      alert(error.message || 'Camera and microphone access is required to host a live class.');
    }
  };

  async function createTeacherPeer(studentId) {
    if (!cameraStream) return;
    const peer = new RTCPeerConnection(iceServers);
    teacherPeers.set(studentId, peer);
    cameraStream.getTracks().forEach(track => peer.addTrack(track, cameraStream));
    peer.onicecandidate = event => {
      if (event.candidate) socket.emit('live:ice', { to: studentId, candidate: event.candidate });
    };
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('live:offer', { to: studentId, offer });
  }

  window.joinLiveClass = async function () {
    try {
      const live = await api('live-class');
      if (!live.active) return alert('This live class has concluded.');

      const liveSocket = connect();
      studentPeer = new RTCPeerConnection(iceServers);
      studentPeer.ontrack = event => {
        if ($('studentVideo')) $('studentVideo').srcObject = event.streams[0];
      };
      studentPeer.onicecandidate = event => {
        if (event.candidate) liveSocket.emit('live:ice', { to: teacherSocketId, candidate: event.candidate });
      };

      let teacherSocketId = null;
      liveSocket.on('live:offer', async data => {
        teacherSocketId = data.from;
        await studentPeer.setRemoteDescription(data.offer);
        const answer = await studentPeer.createAnswer();
        await studentPeer.setLocalDescription(answer);
        liveSocket.emit('live:answer', { to: teacherSocketId, answer });
      });
      liveSocket.on('live:ice', async data => {
        if (data.candidate) await studentPeer.addIceCandidate(data.candidate);
      });
      liveSocket.on('live:ended', closeStudentLive);

      room(live.title, `
        <div class="live-classroom-container">
          <div class="classroom-header">
            <div class="classroom-title-area">
              <span class="tag" style="background:#dc2626;color:#ffffff;font-size:11px;padding:3px 9px">
                <span class="live-pulse-dot" style="margin-right:4px"></span>LIVE CLASS
              </span>
              <h3>${esc(live.title)}</h3>
              <p>Faculty Instructor: ${esc(live.teacher || 'Faculty')}</p>
            </div>
            <button class="close" style="position:static;color:#ffffff;background:#262624;border-color:#3a3a36" onclick="hide('test')">✕</button>
          </div>

          <div class="classroom-video-theater">
            <video class="classroom-video" id="studentVideo" autoplay playsinline controls></video>
          </div>

          <div class="classroom-controls-bar">
            <span style="font-size:13px;color:#d4d4cd">
              💡 The complete session recording will be saved in <b>Notes & Videos</b> automatically when finished.
            </span>
            <button class="out" style="color:#ffffff;border-color:rgba(255,255,255,0.2)" onclick="hide('test')">Minimize Classroom</button>
          </div>
        </div>
      `);

      liveSocket.emit('student:join');
    } catch (error) {
      alert(error.message);
    }
  };

  function closeStudentLive() {
    studentPeer?.close();
    studentPeer = null;
    if ($('studentVideo')) $('studentVideo').srcObject = null;
    alert('The live class has concluded. Its recording will appear in Notes & Videos.');
    hide('test');
    if (typeof checkStudentLiveStatus === 'function') checkStudentLiveStatus();
  }

  window.endLiveClass = function () {
    if (!confirm('Conclude this live class? The recording will be saved automatically to Notes & Videos.')) return;
    socket?.emit('live:end');
    teacherPeers.forEach(peer => peer.close());
    teacherPeers.clear();
    cameraStream?.getTracks().forEach(track => track.stop());
    recorder?.stop();
    hide('test');
  };

  async function uploadRecording() {
    const file = new File([new Blob(recordingChunks, { type: 'video/webm' })], `live-class-${Date.now()}.webm`, { type: 'video/webm' });
    const form = new FormData();
    form.append('recording', file);
    try {
      await api('admin/live-class/end', { method: 'POST', body: form });
      alert('Live class ended. The recording is now available in Notes & Videos.');
      if (typeof libraryOpen === 'function' && window.currentOpenModal === 'library') libraryOpen();
      if (typeof renderTeacherDashboard === 'function') renderTeacherDashboard();
      if (typeof adminLoad === 'function' && user?.role === 'admin') adminLoad();
    } catch (error) {
      alert('Live class ended, but recording upload failed: ' + error.message);
    }
  }

  window.refreshLiveCard = function () {
    if (typeof checkStudentLiveStatus === 'function') checkStudentLiveStatus();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkStudentLiveStatus === 'function') checkStudentLiveStatus();
  });
})();
