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
