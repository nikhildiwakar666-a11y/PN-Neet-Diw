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


