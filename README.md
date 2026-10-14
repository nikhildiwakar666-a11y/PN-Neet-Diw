# PN Neet Diw

Complete NEET mock-test website: student account, secure admin login, test/question management, timed tests, and saved results.

## Run locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env`, then set a strong `JWT_SECRET` and a private `ADMIN_PASSWORD`.
3. In this folder run `npm install` and then `npm start`.
4. Open `http://localhost:3000`.

## Admin

Login using the email and password defined in `.env`. The server creates the admin account automatically on first run.

## Publish online

Push this folder to GitHub and deploy it on Render or Railway. Set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `PORT` as deployment environment variables. For durable production data, attach the provider's persistent disk to preserve `data.json`; for larger scale, migrate data to PostgreSQL.

Never use the sample `.env.example` credentials on a public deployment.

## System Architecture

```text
Browser (Student / Teacher / Admin)
│
├── Frontend
│   ├── HTML + CSS + Vanilla JavaScript
│   ├── Role-based UI
│   ├── Test engine and timers
│   ├── Community chat interface
│   ├── Study calendar
│   ├── Profile/settings
│   └── WebRTC camera/microphone live-class interface
│
├── HTTP API Requests
│   │
│   ▼
├── Node.js + Express Server
│   ├── Authentication API
│   ├── Student APIs
│   ├── Teacher APIs
│   ├── Admin APIs
│   ├── Test and result APIs
│   ├── Community chat APIs
│   ├── Study calendar APIs
│   ├── Resource upload APIs
│   └── Live class control APIs
│
├── Security Layer
│   ├── JWT token verification
│   ├── Password hashing using bcrypt
│   ├── Role checks: Student / Teacher / Admin
│   └── Protected admin and teacher routes
│
├── Real-Time Layer
│   ├── Socket.IO
│   ├── Live-class signalling
│   ├── Active live-class status
│   └── Student-teacher connection events
│
├── Video Layer
│   ├── WebRTC for teacher-to-student video
│   ├── Browser MediaRecorder for recording
│   └── Recording upload after live class ends
│
└── Storage Layer
    ├── data.json
    │   ├── Users
    │   ├── Tests
    │   ├── Questions
    │   ├── Attempts/results
    │   ├── Community messages/replies
    │   ├── Study plans
    │   ├── Resources
    │   └── Live-class status
    │
    └── uploads/
        ├── PDF notes
        ├── Videos
        ├── Live-class recordings
        ├── Community photos
        └── Profile photos
```

## Student Experience & Feature Workflow

```text
Student Portal
│
├── 📝 Mock Tests
│   └── Browse Schedule → Start Attempt → Live Countdown Timer → Submit → In-depth Result Review
│
├── 📚 Notes & Videos (Library)
│   └── Filter by Subject (Physics / Chemistry / Biology) / Format (PDF Notes or Video Lectures)
│
├── 💬 Community Chat
│   └── Peer discussion, doubt clearance, photo attachments, and nested threaded replies
│
├── 🗓️ Study Calendar
│   └── Daily study planner, subject scheduling, deadlines, and task completion checklists
│
├── ❓ Help & Support
│   └── NEET syllabus guide, marking pattern (+4 / -1), exam time strategy, and support FAQ
│
├── 🔴 Join Live Class
│   └── Real-time WebRTC live video broadcast with faculty, live status tag, and lecture replays
│
└── 👤 Profile & Settings
    └── Display name, avatar photo upload, focus mode protection, and alert preferences
```

## Live Class Architecture & Lifecycle

```text
Teacher / Faculty
   │
   ▼
1. Start Live Class
   │  • Faculty enters topic title
   │  • Server updates active state & broadcasts via Socket.IO
   │
   ▼
2. Camera + Microphone Stream
   │  • Browser requests navigator.mediaDevices.getUserMedia()
   │  • Local video stream renders in Faculty Studio
   │  • Browser MediaRecorder automatically starts recording
   │
   ▼
3. Students Join Through WebRTC
   │  • Live badge pulses in Student Dashboard
   │  • Student clicks "Join Live Class"
   │  • Socket.IO handles signalling (Offer / Answer / ICE Candidates)
   │  • Direct peer-to-peer low-latency video stream established
   │
   ▼
4. End Class
   │  • Faculty clicks "⏹ End Class & Save Recording"
   │  • Socket emits "live:ended" to disconnect all peers
   │  • MediaRecorder stops and compiles video chunks into WebM Blob
   │
   ▼
5. Recording Uploads to Notes & Videos
      • Browser uploads recording via POST /api/admin/live-class/end
      • Saved into uploads/ directory
      • Auto-indexed in data.json under "Live Class" category
      • Immediately available in student "Notes & Videos" for on-demand replay
```

## Admin Controls & Management Console

```text
Admin Controls
│
├── 📝 Tests and Questions
│   ├── Create mock tests (subject, chapter, duration, schedule)
│   ├── Add 4-option MCQs with single correct answer assignment
│   └── Edit or remove questions and tests
│
├── 📅 Schedule Management
│   ├── Schedule upcoming tests with live start timestamps
│   └── Toggle test visibility (Active / Inactive)
│
├── 📚 Notes and Videos
│   ├── Upload PDF notes and MP4/WebM video lectures
│   └── Categorize by subject and delete expired study materials
│
├── 👥 Students and Results
│   ├── Directory of all registered student accounts and email addresses
│   ├── Manage role permissions (Student / Teacher / Admin)
│   └── Real-time scorecard logs of all student test attempts and percentages
│
├── 💬 Community Moderation
│   ├── Oversee student doubt discussion threads
│   └── Delete inappropriate messages, spam, or photos
│
├── 🔴 Live Class Controls
│   ├── Start faculty live broadcast rooms
│   └── Archive recorded video streams automatically
│
└── ⚙️ Platform Settings
    ├── Exam focus mode toggle
    ├── Audio chime notifications for test start and finish
    └── Platform administrative preferences
```




