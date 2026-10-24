# PN Neet Diw — Setup and Admin Guide

## Start locally

1. In this folder, run `npm install` whenever the project is updated.
2. Create `.env` by copying `.env.example`, then set a strong `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Run `npm start`, then open `http://localhost:3000`.

## Schedule chapter-wise tests

1. Log in through **Admin** with your administrator email and password.
2. Under **Tests & Questions**, enter the title, subject, chapter, duration, and scheduled start date/time.
3. Click **Save Test**, then add its questions.
4. Before the scheduled time, students can see the test but cannot start it. At the scheduled time, the Start Test button becomes available automatically.
5. Leave the schedule field blank for an instant practice test.

## Study materials

Open **Notes & Videos** as an admin to upload PDF notes or MP4/WebM/MOV videos (up to 100 MB). Students can access this library from the same button.

## Publish online

Deploy the folder to Render or Railway using `npm install` as the build command and `npm start` as the start command. Add `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as environment variables. Configure persistent storage for both `data.json` and `uploads`.

## Supabase Auth URL Configuration

For email verification redirects to function properly:
1. Open your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to:
   - `https://pnneet.netlify.app`
3. In **Redirect URLs**, add the following URLs:
   - `https://pnneet.netlify.app/email-verified`
   - `https://pnneet.netlify.app/**`
   - `http://localhost:3000/email-verified`
   - `http://127.0.0.1:3000/email-verified`
4. Click **Save Changes**.
