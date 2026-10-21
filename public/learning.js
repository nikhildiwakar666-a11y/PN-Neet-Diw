(() => {
  const getUser = () => JSON.parse(localStorage.user || 'null');
  const api = async (path, options = {}) => {
    const token = localStorage.token || '';
    const cleanPath = String(path).replace(/^\/?(api\/)?/, '');
    const baseUrl = (
      window.VITE_API_BASE_URL ||
      window.API_BASE_URL ||
      (typeof localStorage !== 'undefined' && (localStorage.getItem('VITE_API_BASE_URL') || localStorage.getItem('API_BASE_URL'))) ||
      ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://localhost:3000' : 'https://pnneet-api.onrender.com')
    ).replace(/\/+$/, '');
    const endpoint = `${baseUrl}/api/${cleanPath}`;

    let response;
    try {
      response = await fetch(endpoint, {
        ...options,
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
          ...(options.headers || {})
        }
      });
    } catch (e) {
      throw Error('Backend server is not reachable. Please verify the server is running and CORS is enabled.');
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    let raw = '';

    if (contentType.includes('application/json')) {
      try { data = await response.json(); } catch (_) { data = null; }
    } else {
      try { raw = await response.text(); } catch (_) { raw = ''; }
    }

    if (!response.ok) {
      let msg = data?.error || data?.message;
      if (!msg) {
        if (contentType.includes('text/html') || raw.includes('<!DOCTYPE') || raw.includes('<html')) {
          msg = `Server returned an HTML error page (${response.status}). Please check VITE_API_BASE_URL configuration.`;
        } else {
          msg = `Request failed (${response.status}).`;
        }
      }
      throw Error(msg);
    }

    if (data === null) {
      try { data = JSON.parse(raw); } catch (_) { throw Error('Invalid non-JSON response received from server.'); }
    }
    return data;
  };
  const escape = text => String(text).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' })[c]);
  document.querySelector('header > div:last-child').insertAdjacentHTML('beforeend', ' <button class="light" onclick="resourcesOpen()">Notes & Videos</button>');
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="resourcesModal"><div class="box"><button class="close" onclick="resourcesClose()">×</button><h2>Notes & Video Library</h2><p class="muted">NEET preparation material — Biology, Chemistry aur Physics.</p><div id="resourceList"></div><div id="adminUploadLink" style="margin-top:20px"></div></div></div>
    <div class="modal" id="uploadModal"><div class="box" style="max-width:500px"><button class="close" onclick="uploadClose()">×</button><h2>Upload Notes / Video</h2><p class="muted">PDF notes ya MP4, WebM, MOV video. Maximum size 100 MB.</p><label>Title</label><input id="resourceTitle" placeholder="e.g. Human Physiology Notes"><label>Subject</label><select id="resourceSubject"><option>Biology</option><option>Chemistry</option><option>Physics</option><option>General</option></select><label>File</label><input id="resourceFile" type="file" accept="application/pdf,video/mp4,video/webm,video/quicktime"><button style="margin-top:16px" onclick="uploadResource()">Upload karein</button></div></div>`);
  window.resourcesOpen = async () => {
    try {
      const list = await api('resources');
      document.getElementById('resourceList').innerHTML = list.length ? `<div class="grid">${list.map(r => `<article class="card"><span class="tag">${r.type === 'note' ? 'PDF Note' : 'Video'} · ${escape(r.subject)}</span><h3>${escape(r.title)}</h3>${r.type === 'video' ? `<video controls preload="metadata" style="width:100%;border-radius:8px" src="${r.url}"></video>` : `<p class="muted">${escape(r.filename)}</p><a href="${r.url}" target="_blank" download><button>Note download karein</button></a>`}${getUser()?.role === 'admin' ? `<button class="red" style="margin-top:10px" onclick="deleteResource(${r.id})">Delete</button>` : ''}</article>`).join('')}</div>` : '<p class="muted">Abhi notes ya videos upload nahi hue hain.</p>';
      document.getElementById('adminUploadLink').innerHTML = getUser()?.role === 'admin' ? '<button onclick="uploadOpen()">+ Notes / Video upload karein</button>' : '';
      document.getElementById('resourcesModal').classList.add('open');
    } catch (error) { alert(error.message); }
  };
  window.resourcesClose = () => document.getElementById('resourcesModal').classList.remove('open');
  window.uploadOpen = () => { document.getElementById('uploadModal').classList.add('open'); };
  window.uploadClose = () => document.getElementById('uploadModal').classList.remove('open');
  window.uploadResource = async () => {
    const file = document.getElementById('resourceFile').files[0];
    if (!file) return alert('Pehle file select karein.');
    const form = new FormData(); form.append('title', document.getElementById('resourceTitle').value); form.append('subject', document.getElementById('resourceSubject').value); form.append('file', file);
    try { await api('admin/resources', { method:'POST', body:form }); uploadClose(); resourcesOpen(); alert('Material upload ho gaya.'); } catch (error) { alert(error.message); }
  };
  window.deleteResource = async id => { if (confirm('Is material ko delete karna hai?')) { try { await api('admin/resources/' + id, { method:'DELETE' }); resourcesOpen(); } catch (error) { alert(error.message); } } };
})();
