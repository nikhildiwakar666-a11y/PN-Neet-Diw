# PN Neet Diw — Setup aur Admin Guide

## Pehli baar setup (Windows)

1. [Node.js LTS](https://nodejs.org/) install karein. Command Prompt mein `node -v` aur `npm -v` chalna chahiye.
2. Is folder ko kholein: `outputs\neet-test-platform`.
3. `.env.example` ki copy banakar uska naam `.env` rakhein.
4. `.env` mein `JWT_SECRET`, `ADMIN_EMAIL`, aur `ADMIN_PASSWORD` apne private values se set karein.
5. Folder mein Command Prompt kholkar chalayein:

   ```bash
   npm install
   npm start
   ```

6. Browser mein `http://localhost:3000` kholein.

## Admin kaise handle karein

1. Website ke top-right mein **Admin** button par click karein.
2. `.env` ka admin email aur password use karke login karein.
3. Dashboard se naya test banayein, test select karke MCQ, chaar options aur correct answer add karein. Wahi se existing questions delete bhi kar sakte hain.
   Test aur questions dono ko edit/delete kiya ja sakta hai. Student aur recent-result list bhi dashboard mein milti hai.
4. Students apne email/password se Student Login/Register karenge. Unhe admin dashboard access nahi milega.

## Notes aur video upload

1. Admin login ke baad top-right mein **Notes & Videos** kholein.
2. **Notes / Video upload karein** par click karein.
3. Title, subject aur file select karke upload karein. PDF notes aur MP4/WebM/MOV videos supported hain; maximum file size 100 MB hai.
4. Students isi **Notes & Videos** library mein uploaded material dekh ya download kar sakte hain. Admin wahin se material delete bhi kar sakta hai.

## Website ko online live kaise karein

GitHub par code upload karke Render ya Railway par **New Web Service** banayein:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `data.json` aur `uploads` folder ko survive karane ke liye persistent disk attach karein.

Deployment ke baad mila public URL students ko share karein. Custom domain, jaise `pnneetdiw.in`, hosting dashboard se joda ja sakta hai.

## Security

`.env` aur `data.json` kabhi GitHub/public share na karein. Sample password live launch se pehle zaroor badlein.

## Test focus rule

Test ke dauran student tab switch kare, browser minimise kare, ya doosri window par jaye to test automatically submit ho jayega. Yeh browser-level rule hai; website operating system ke andar har app ko 100% detect nahi kar sakti.
