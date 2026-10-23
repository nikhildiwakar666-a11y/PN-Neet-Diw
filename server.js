require('dotenv').config();
const express = require('express'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  multer = require('multer'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  crypto = require('crypto'),
  { Server } = require('socket.io');

const allowedOrigins = ['https://pnneet.netlify.app', 'http://localhost:3000', 'http://127.0.0.1:3000'];
const app = express(),
  server = http.createServer(app),
  io = new Server(server, { cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true } }),
  dataPath = path.join(__dirname, 'data.json'),
  uploadDir = path.join(__dirname, 'uploads'),
  secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const { uploadFile, supabase, supabaseAdmin, supabaseAnon, isConfigured: isSupabaseReady } = require('./supabase');
const { sendPasswordResetEmail, sendVerificationEmail } = require('./email-service');

fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'))
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /^(application\/pdf|video\/mp4|video\/webm|video\/quicktime)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Sirf PDF, MP4, WebM ya MOV file upload karein.'));
  }
});
const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Upload JPG, PNG, WebP, or GIF images only.'));
  }
});
const profileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Profile photo must be a JPG, PNG, WebP, or GIF image.'));
  }
});

function handleProfileUpload(req, res, next) {
  profileUpload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image size exceeds 5 MB. Please choose a smaller photo.' });
      return res.status(400).json({ error: err.message || 'Invalid image. Upload JPG, PNG, WebP, or GIF under 5 MB.' });
    }
    next();
  });
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const indexPage = () => fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/api/health', (req, res) => res.json({ ok: true, supabase: isSupabaseReady }));

const seed = {
  users: [],
  tests: [
    { id: 1, title: 'NEET Biology: Cell & Biomolecules', subject: 'Biology', duration: 15, active: true },
    { id: 2, title: 'NEET Chemistry: Basic Concepts', subject: 'Chemistry', duration: 15, active: true },
    { id: 3, title: 'NEET Physics: Motion', subject: 'Physics', duration: 15, active: true }
  ],
  questions: [
    { id: 1, testId: 1, question: 'Which organelle is known as the powerhouse of a cell?', options: ['Ribosome', 'Mitochondrion', 'Golgi body', 'Nucleus'], answer: 1 },
    { id: 2, testId: 1, question: 'What is the full form of DNA?', options: ['Deoxyribonucleic Acid', 'Dynamic Nuclear Acid', 'Double Nitrogen Acid', 'Deoxy Nuclear Atom'], answer: 0 },
    { id: 3, testId: 2, question: 'How many particles are present in one mole?', options: ['6.022 × 10²³', '3.14 × 10²³', '9.8 × 10²³', '1.6 × 10⁻¹⁹'], answer: 0 },
    { id: 4, testId: 3, question: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 2 }
  ],
  attempts: []
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return structuredClone(seed);
  }
}

let db = load();
if (!Array.isArray(db.resources)) db.resources = [];
if (!Array.isArray(db.community)) db.community = [];
if (!Array.isArray(db.plans)) db.plans = [];
if (!Array.isArray(db.passwordResets)) db.passwordResets = [];
if (!db.liveClass) db.liveClass = null;
db.tests.forEach((t) => {
  if (!t.chapter) t.chapter = 'General';
  if (!('startAt' in t)) t.startAt = null;
});

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
}

function next(k) {
  return Math.max(0, ...db[k].map((x) => x.id || 0)) + 1;
}

/**
 * Find user in Supabase Auth by email
 */
async function findAuthUserByEmail(email) {
  if (!isSupabaseReady || !supabaseAdmin) return null;
  const target = (email || '').trim().toLowerCase();
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error || !data?.users) return null;
    return data.users.find((u) => (u.email || '').toLowerCase() === target) || null;
  } catch (err) {
    console.warn('findAuthUserByEmail error:', err.message);
    return null;
  }
}

/**
 * Bootstrap production Admin & Teacher in Supabase Auth & profiles table on server startup
 */
async function initProductionAdmin() {
  if (!isSupabaseReady || !supabaseAdmin) {
    console.warn('⚠️ Supabase admin client not ready, skipping production admin bootstrap.');
    return;
  }
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminName = (process.env.ADMIN_NAME || 'Platform Administrator').trim();

    if (adminEmail) {
      const existing = await findAuthUserByEmail(adminEmail);
      let adminId;

      if (!existing) {
        const { data: newAdmin, error } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPass || crypto.randomBytes(32).toString('hex'),
          email_confirm: true,
          user_metadata: { full_name: adminName, role: 'admin' }
        });
        if (error) {
          console.error('⚠️ Could not create admin in Supabase Auth:', error.message);
        } else if (newAdmin?.user) {
          adminId = newAdmin.user.id;
          console.log('✅ Production Admin account initialized in Supabase Auth:', adminEmail);
        }
      } else {
        adminId = existing.id;
        if (adminPass) {
          await supabaseAdmin.auth.admin.updateUserById(adminId, {
            password: adminPass,
            email_confirm: true,
            user_metadata: { ...existing.user_metadata, full_name: adminName, role: 'admin' }
          });
        }
        console.log('✅ Production Admin account verified in Supabase Auth:', adminEmail);
      }

      if (adminId) {
        await supabaseAdmin.from('profiles').upsert({
          id: adminId,
          full_name: adminName,
          role: 'admin'
        });
      }
    }

    const teacherEmail = (process.env.TEACHER_EMAIL || '').trim().toLowerCase();
    const teacherPass = process.env.TEACHER_PASSWORD;
    const teacherName = (process.env.TEACHER_NAME || 'Faculty Member').trim();

    if (teacherEmail) {
      const existingTeacher = await findAuthUserByEmail(teacherEmail);
      let teacherId;

      if (!existingTeacher) {
        const { data: newTeacher, error } = await supabaseAdmin.auth.admin.createUser({
          email: teacherEmail,
          password: teacherPass || crypto.randomBytes(32).toString('hex'),
          email_confirm: true,
          user_metadata: { full_name: teacherName, role: 'teacher' }
        });
        if (!error && newTeacher?.user) {
          teacherId = newTeacher.user.id;
          console.log('✅ Faculty account initialized in Supabase Auth:', teacherEmail);
        }
      } else {
        teacherId = existingTeacher.id;
        if (teacherPass) {
          await supabaseAdmin.auth.admin.updateUserById(teacherId, {
            password: teacherPass,
            email_confirm: true,
            user_metadata: { ...existingTeacher.user_metadata, full_name: teacherName, role: 'teacher' }
          });
        }
      }

      if (teacherId) {
        await supabaseAdmin.from('profiles').upsert({
          id: teacherId,
          full_name: teacherName,
          role: 'teacher'
        });
      }
    }
  } catch (err) {
    console.error('⚠️ Error bootstrapping admin/teacher in Supabase:', err.message);
  }
}
initProductionAdmin();

const issue = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name, email: u.email }, secret, { expiresIn: '7d' });

function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), secret);
    next();
  } catch {
    res.status(401).json({ error: 'Login required' });
  }
}

function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function teacherOrAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Teacher or Admin access required' });
  next();
}

// =========================================================================
// AUTHENTICATION ROUTES (SUPABASE AUTH & PROFILES)
// =========================================================================

/**
 * POST /api/register
 * Creates a student/teacher account centrally in Supabase Auth with email verification required.
 */
app.post('/api/register', async (req, res) => {
  try {
    let { name, email, password, role: reqRole } = req.body || {};
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      return res.status(400).json({
        error: 'Please provide your name, a valid email address, and a password with at least 6 characters.'
      });
    }

    if (!isSupabaseReady || !supabaseAdmin) {
      return res.status(503).json({ error: 'Central authentication database is unavailable. Please try again shortly.' });
    }

    // Check if account already exists with this email
    const existingUser = await findAuthUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'This email is already registered. Please sign in or reset your password.'
      });
    }

    const role = reqRole === 'teacher' ? 'teacher' : 'student';

    // Create user in Supabase Auth (unconfirmed email)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name, role }
    });

    if (createError) {
      console.error('Supabase createUser error:', createError);
      if (
        createError.message?.toLowerCase().includes('already registered') ||
        createError.message?.toLowerCase().includes('already exists') ||
        createError.status === 422
      ) {
        return res.status(409).json({
          error: 'This email is already registered. Please sign in or reset your password.'
        });
      }
      return res.status(400).json({ error: createError.message || 'Could not create account.' });
    }

    const userId = newUser.user.id;

    // Create profile row in public.profiles table
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: name,
      role
    });

    // Generate official Supabase verification link
    const origin = req.headers.origin;
    const frontendBase = (origin && allowedOrigins.includes(origin)) ? origin : (process.env.FRONTEND_URL || 'https://pnneet.netlify.app');
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${frontendBase}?verified=true`
      }
    });

    const verificationUrl = linkData?.properties?.action_link || `${frontendBase}?verified=true`;

    // Send verification email via nodemailer / branded email template
    await sendVerificationEmail({
      toEmail: email,
      recipientName: name,
      verificationUrl
    });

    res.json({
      ok: true,
      requiresVerification: true,
      email,
      message: 'Account created! Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

/**
 * POST /api/resend-verification
 * Resends verification email to an unverified user.
 */
app.post('/api/resend-verification', async (req, res) => {
  try {
    let email = (req.body?.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!isSupabaseReady || !supabaseAdmin) {
      return res.status(503).json({ error: 'Central authentication database is unavailable.' });
    }

    const user = await findAuthUserByEmail(email);
    if (!user) {
      return res.json({
        ok: true,
        message: 'If an unverified account exists with this email, a verification link has been sent.'
      });
    }

    if (user.email_confirmed_at) {
      return res.status(400).json({
        error: 'This email is already verified. Please sign in directly with your password.'
      });
    }

    const origin = req.headers.origin;
    const frontendBase = (origin && allowedOrigins.includes(origin)) ? origin : (process.env.FRONTEND_URL || 'https://pnneet.netlify.app');
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${frontendBase}?verified=true`
      }
    });

    const recipientName = user.user_metadata?.full_name || user.user_metadata?.name || 'Student';
    const verificationUrl = linkData?.properties?.action_link || `${frontendBase}?verified=true`;

    await sendVerificationEmail({
      toEmail: email,
      recipientName,
      verificationUrl
    });

    res.json({
      ok: true,
      message: 'A fresh verification email has been sent. Please check your inbox and spam folder.'
    });
  } catch (err) {
    console.error('Error in /api/resend-verification:', err);
    res.status(500).json({ error: 'Unable to resend verification email. Please try again.' });
  }
});

/**
 * POST /api/login
 * Authenticates against Supabase Auth. Enforces email verification and server-side roles.
 */
app.post('/api/login', async (req, res) => {
  try {
    let { email, password, expectedRole } = req.body || {};
    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }

    if (!isSupabaseReady) {
      return res.status(503).json({ error: 'Central authentication service is temporarily unavailable. Please try again shortly.' });
    }

    const client = supabaseAnon || supabaseAdmin;
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      const msg = (authError.message || '').toLowerCase();
      const code = authError.code || '';

      // Email unconfirmed check
      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        return res.status(403).json({
          error: 'Your email address is not verified yet. Please check your email inbox to verify your account before signing in.',
          unverified: true,
          email
        });
      }

      return res.status(401).json({
        error: 'Invalid email or password. Please check your credentials and try again.'
      });
    }

    const sbUser = authData.user;
    if (!sbUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Retrieve verified server-side role from public.profiles
    let { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', sbUser.id).maybeSingle();
    if (!profile) {
      const defaultRole = sbUser.user_metadata?.role || 'student';
      const fullName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0];
      const { data: createdProf } = await supabaseAdmin.from('profiles').insert({
        id: sbUser.id,
        full_name: fullName,
        role: defaultRole
      }).select().maybeSingle();
      profile = createdProf || { id: sbUser.id, full_name: fullName, role: defaultRole, avatar_path: null };
    }

    const role = profile.role || 'student';

    // Role enforcement: Prevent students/teachers from logging in to Admin Console, and vice-versa
    if (expectedRole === 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted: This account does not have Administrator privileges.' });
    }
    if (expectedRole === 'teacher' && role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted: This account is not registered as Faculty/Teacher. Please use Student Login.' });
    }

    const userObj = {
      id: profile.id,
      name: profile.full_name || sbUser.user_metadata?.full_name || email.split('@')[0],
      email: sbUser.email,
      role: role,
      avatar: profile.avatar_path || null
    };

    res.json({
      token: issue(userObj),
      user: userObj
    });
  } catch (err) {
    console.error('Error in /api/login:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login. Please try again.' });
  }
});

/**
 * POST /api/forgot-password
 * Sends password reset email for student, teacher, or admin.
 */
app.post('/api/forgot-password', async (req, res) => {
  try {
    let email = (req.body?.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid registered email address.' });
    }

    if (!isSupabaseReady || !supabaseAdmin) {
      return res.status(503).json({ error: 'Central authentication database is unavailable.' });
    }

    const user = await findAuthUserByEmail(email);
    if (!user) {
      // Do not leak whether user exists
      return res.json({ ok: true, message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    if (!Array.isArray(db.passwordResets)) db.passwordResets = [];
    db.passwordResets = db.passwordResets.filter((r) => r.email !== email || r.used);
    db.passwordResets.push({
      email: user.email,
      userId: user.id,
      hashedToken,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    });
    save();

    const origin = req.headers.origin;
    const frontendBase = (origin && allowedOrigins.includes(origin)) ? origin : (process.env.FRONTEND_URL || 'https://pnneet.netlify.app');
    const resetUrl = `${frontendBase}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const recipientName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
    await sendPasswordResetEmail({
      toEmail: user.email,
      recipientName,
      resetUrl
    });

    res.json({ ok: true, message: 'Password reset link sent! Please check your email inbox.' });
  } catch (err) {
    console.error('Error in /api/forgot-password:', err);
    res.status(500).json({ error: 'Unable to process password reset request. Please try again.' });
  }
});

/**
 * GET /api/verify-reset-token
 * Validates reset token before rendering Create New Password form
 */
app.get('/api/verify-reset-token', (req, res) => {
  let email = (req.query?.email || '').trim().toLowerCase();
  let token = (req.query?.token || '').trim();
  if (!email || !token) return res.status(400).json({ valid: false, error: 'Missing reset token or email.' });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const entry = (db.passwordResets || []).find((r) => r.email === email && r.hashedToken === hashedToken);
  if (!entry) return res.status(400).json({ valid: false, error: 'This password reset link is invalid or unrecognized.' });
  if (entry.used) return res.status(400).json({ valid: false, error: 'This password reset link has already been used.' });
  if (Date.now() > entry.expiresAt) return res.status(400).json({ valid: false, error: 'This password reset link has expired. Please request a new one.' });

  res.json({ valid: true });
});

/**
 * POST /api/reset-password
 * Resets user password centrally in Supabase Auth so it works across all devices immediately.
 */
app.post('/api/reset-password', async (req, res) => {
  try {
    let email = (req.body?.email || '').trim().toLowerCase();
    let token = (req.body?.token || '').trim();
    let newPassword = req.body?.newPassword;

    if (!email || !token) return res.status(400).json({ error: 'Invalid or missing reset token.' });
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const entry = (db.passwordResets || []).find((r) => r.email === email && r.hashedToken === hashedToken);
    if (!entry) return res.status(400).json({ error: 'This password reset link is invalid.' });
    if (entry.used) return res.status(400).json({ error: 'This password reset link has already been used. Please request a new one.' });
    if (Date.now() > entry.expiresAt) return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.' });

    if (!isSupabaseReady || !supabaseAdmin) {
      return res.status(503).json({ error: 'Central authentication database is unavailable. Please try again.' });
    }

    const user = await findAuthUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User account not found.' });

    // Update password in Supabase Auth & confirm email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true
    });

    if (updateError) {
      console.error('Password reset update error:', updateError);
      return res.status(500).json({ error: 'Failed to update password in central database.' });
    }

    entry.used = true;
    entry.usedAt = new Date().toISOString();
    save();

    res.json({ ok: true, message: 'Your password has been reset successfully! You can now log in with your new password on any device.' });
  } catch (err) {
    console.error('Error in /api/reset-password:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// =========================================================================
// PROFILE ROUTES
// =========================================================================

app.get('/api/profile', auth, async (req, res) => {
  try {
    if (isSupabaseReady && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', req.user.id).maybeSingle();
      if (profile) {
        return res.json({
          id: profile.id,
          name: profile.full_name || req.user.name,
          email: req.user.email,
          role: profile.role || req.user.role,
          avatar: profile.avatar_path || null
        });
      }
    }
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

app.put('/api/profile', auth, handleProfileUpload, async (req, res) => {
  try {
    let name = (req.body?.name || '').trim();
    let avatarUrl = null;

    if (req.file) {
      let fileBuffer = fs.readFileSync(req.file.path);
      let cloud = await uploadFile(fileBuffer, req.file.originalname, req.file.mimetype, uploadDir);
      avatarUrl = cloud.url;
      if (cloud.isCloud && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    if (isSupabaseReady && supabaseAdmin) {
      const updateData = {};
      if (name) updateData.full_name = name;
      if (avatarUrl) updateData.avatar_path = avatarUrl;

      const { data: updatedProf } = await supabaseAdmin.from('profiles').update(updateData).eq('id', req.user.id).select().maybeSingle();

      if (name) {
        await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
          user_metadata: { full_name: name }
        });
      }

      return res.json({
        id: req.user.id,
        name: updatedProf?.full_name || name || req.user.name,
        email: req.user.email,
        role: updatedProf?.role || req.user.role,
        avatar: updatedProf?.avatar_path || avatarUrl || null
      });
    }

    res.json({ id: req.user.id, name: name || req.user.name, email: req.user.email, role: req.user.role, avatar: avatarUrl || null });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// =========================================================================
// LEARNING, TESTS & ATTEMPTS ROUTES
// =========================================================================

app.get('/api/tests', auth, (req, res) =>
  res.json(db.tests.filter((t) => t.active).map((t) => ({ ...t, question_count: db.questions.filter((q) => q.testId === t.id).length })))
);

app.get('/api/resources', auth, (req, res) => res.json(db.resources.slice().reverse()));
app.get('/api/live-class', auth, (req, res) => res.json(db.liveClass?.active ? db.liveClass : { active: false }));

app.get('/api/community', auth, (req, res) =>
  res.json(
    db.community.slice().reverse().map((post) => {
      return {
        ...post,
        author: post.authorName || 'Student',
        authorAvatar: post.authorAvatar || null,
        authorRole: post.authorRole || 'student',
        comments: (post.comments || []).map((c) => ({
          ...c,
          author: c.authorName || 'Student',
          authorAvatar: c.authorAvatar || null,
          authorRole: c.authorRole || 'student'
        }))
      };
    })
  )
);

app.post('/api/community', auth, imageUpload.single('image'), async (req, res) => {
  let body = (req.body?.body || '').trim();
  if (!body && !req.file) return res.status(400).json({ error: 'Write a message or add a photo.' });
  let imageUrl = null;
  if (req.file) {
    let cloud = await uploadFile(fs.readFileSync(req.file.path), req.file.originalname, req.file.mimetype, uploadDir);
    imageUrl = cloud.url;
  }
  let post = {
    id: next('community'),
    userId: req.user.id,
    authorName: req.user.name,
    authorRole: req.user.role,
    body,
    image: imageUrl,
    comments: [],
    createdAt: new Date().toISOString()
  };
  db.community.push(post);
  save();
  res.json(post);
});

app.post('/api/community/:id/comments', auth, imageUpload.single('image'), async (req, res) => {
  let post = db.community.find((item) => item.id === +req.params.id),
    body = (req.body?.body || '').trim();
  if (!post) return res.status(404).json({ error: 'Message not found.' });
  if (!body && !req.file) return res.status(400).json({ error: 'Write a reply or add a photo.' });
  let imageUrl = null;
  if (req.file) {
    let cloud = await uploadFile(fs.readFileSync(req.file.path), req.file.originalname, req.file.mimetype, uploadDir);
    imageUrl = cloud.url;
  }
  let comment = {
    id: Math.max(0, ...db.community.flatMap((item) => item.comments || []).map((item) => item.id || 0)) + 1,
    userId: req.user.id,
    authorName: req.user.name,
    authorRole: req.user.role,
    body,
    image: imageUrl,
    createdAt: new Date().toISOString()
  };
  post.comments.push(comment);
  save();
  res.json(comment);
});

app.delete('/api/community/:id/comments/:commentId', auth, admin, (req, res) => {
  let post = db.community.find((item) => item.id === +req.params.id);
  if (!post) return res.status(404).json({ error: 'Message not found.' });
  post.comments = (post.comments || []).filter((c) => c.id !== +req.params.commentId);
  save();
  res.json({ ok: true });
});

app.delete('/api/community/:id', auth, admin, (req, res) => {
  db.community = db.community.filter((item) => item.id !== +req.params.id);
  save();
  res.json({ ok: true });
});

app.get('/api/study-plan', auth, (req, res) =>
  res.json(db.plans.filter((plan) => plan.userId === req.user.id).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)))
);

app.post('/api/study-plan', auth, (req, res) => {
  let { title, subject, startAt, endAt } = req.body || {};
  if (!title?.trim() || !startAt || Number.isNaN(new Date(startAt).getTime()))
    return res.status(400).json({ error: 'Add a topic and valid study date/time.' });
  let plan = {
    id: next('plans'),
    userId: req.user.id,
    title: title.trim(),
    subject: (subject || 'General').trim(),
    startAt,
    endAt: endAt || null,
    done: false,
    createdAt: new Date().toISOString()
  };
  db.plans.push(plan);
  save();
  res.json(plan);
});

app.put('/api/study-plan/:id', auth, (req, res) => {
  let plan = db.plans.find((item) => item.id === +req.params.id && item.userId === req.user.id);
  if (!plan) return res.status(404).json({ error: 'Study plan not found.' });
  plan.done = !!req.body?.done;
  save();
  res.json(plan);
});

app.delete('/api/study-plan/:id', auth, (req, res) => {
  db.plans = db.plans.filter((item) => !(item.id === +req.params.id && item.userId === req.user.id));
  save();
  res.json({ ok: true });
});

app.get('/api/tests/:id', auth, (req, res) => {
  let t = db.tests.find((x) => x.id === +req.params.id && x.active);
  if (!t) return res.status(404).json({ error: 'Test not found' });
  if (t.startAt && Date.now() < new Date(t.startAt).getTime())
    return res.status(403).json({ error: 'This test is scheduled for ' + new Date(t.startAt).toLocaleString() });
  res.json({ ...t, questions: db.questions.filter((q) => q.testId === t.id).map(({ answer, ...q }) => q) });
});

app.post('/api/attempts', auth, (req, res) => {
  let { testId, answers, timeSpent, marked } = req.body || {},
    qs = db.questions.filter((q) => q.testId === +testId),
    t = db.tests.find((x) => x.id === +testId && x.active);
  if (!t || !qs.length) return res.status(400).json({ error: 'Invalid test' });
  if (t.startAt && Date.now() < new Date(t.startAt).getTime())
    return res.status(403).json({ error: 'This test has not started yet.' });

  let score = qs.filter((q) => answers?.[q.id] === q.answer).length,
    review = qs.map((q) => ({
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      selectedAnswer: [0, 1, 2, 3].includes(answers?.[q.id]) ? answers[q.id] : null,
      timeSpent: Math.max(0, Math.round(Number(timeSpent?.[q.id]) || 0)),
      marked: !!marked?.[q.id]
    }));

  let attempt = {
    id: next('attempts'),
    userId: req.user.id,
    studentName: req.user.name,
    testId: +testId,
    score,
    total: qs.length,
    review,
    createdAt: new Date().toISOString()
  };
  db.attempts.push(attempt);
  save();
  res.json({ score, total: qs.length, attemptId: attempt.id, review });
});

app.get('/api/my-results', auth, (req, res) =>
  res.json(
    db.attempts
      .filter((a) => a.userId === req.user.id)
      .reverse()
      .map((a) => ({
        ...a,
        title: db.tests.find((t) => t.id === a.testId)?.title || 'NEET Test',
        subject: db.tests.find((t) => t.id === a.testId)?.subject || ''
      }))
  )
);

app.get('/api/my-results/:id', auth, (req, res) => {
  let a = db.attempts.find((x) => x.id === +req.params.id && x.userId === req.user.id);
  if (!a) return res.status(404).json({ error: 'Result not found' });
  res.json({
    ...a,
    title: db.tests.find((t) => t.id === a.testId)?.title || 'NEET Test',
    subject: db.tests.find((t) => t.id === a.testId)?.subject || ''
  });
});

// =========================================================================
// ADMIN ONLY ROUTES
// =========================================================================

app.get('/api/admin/tests', auth, admin, (req, res) =>
  res.json(db.tests.map((t) => ({ ...t, question_count: db.questions.filter((q) => q.testId === t.id).length })))
);

app.get('/api/admin/dashboard', auth, admin, async (req, res) => {
  try {
    let students = [];
    if (isSupabaseReady && supabaseAdmin) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
      const profMap = new Map((profiles || []).map((p) => [p.id, p]));

      students = (usersData?.users || [])
        .filter((u) => (profMap.get(u.id)?.role || u.user_metadata?.role || 'student') === 'student')
        .map((u) => ({
          id: u.id,
          name: profMap.get(u.id)?.full_name || u.user_metadata?.full_name || u.email,
          email: u.email,
          role: 'student',
          createdAt: u.created_at
        }));
    }

    res.json({
      tests: db.tests.map((t) => ({ ...t, questions: db.questions.filter((q) => q.testId === t.id) })),
      students,
      attempts: db.attempts.slice().reverse().map((a) => ({
        ...a,
        student: a.studentName || 'Student',
        test: db.tests.find((t) => t.id === a.testId)?.title || 'NEET Test'
      }))
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

app.get('/api/admin/users', auth, admin, async (req, res) => {
  try {
    if (isSupabaseReady && supabaseAdmin) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
      const profMap = new Map((profiles || []).map((p) => [p.id, p]));

      const list = (usersData?.users || []).map((u) => {
        const prof = profMap.get(u.id);
        return {
          id: u.id,
          name: prof?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0],
          email: u.email,
          role: prof?.role || u.user_metadata?.role || 'student',
          avatar: prof?.avatar_path || null,
          email_confirmed: !!u.email_confirmed_at,
          createdAt: u.created_at
        };
      });
      return res.json(list);
    }
    res.json([]);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

app.put('/api/admin/users/:id/role', auth, admin, async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.body?.role;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student, teacher, or admin.' });
    }

    if (id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin privileges.' });
    }

    if (isSupabaseReady && supabaseAdmin) {
      await supabaseAdmin.from('profiles').update({ role }).eq('id', id);
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { role }
      });
      return res.json({ id, role });
    }
    res.status(500).json({ error: 'Database service unavailable.' });
  } catch (err) {
    console.error('Error in /api/admin/users/:id/role:', err);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

app.post('/api/admin/resources', auth, teacherOrAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File select karein.' });
  let type = req.file.mimetype === 'application/pdf' ? 'note' : 'video',
    cloud = await uploadFile(fs.readFileSync(req.file.path), req.file.originalname, req.file.mimetype, uploadDir),
    r = {
      id: next('resources'),
      title: (req.body.title || req.file.originalname).trim(),
      subject: (req.body.subject || 'General').trim(),
      type,
      url: cloud.url,
      filename: req.file.originalname,
      createdAt: new Date().toISOString()
    };
  db.resources.push(r);
  save();
  res.json(r);
});

app.delete('/api/admin/resources/:id', auth, teacherOrAdmin, (req, res) => {
  let r = db.resources.find((x) => x.id === +req.params.id);
  if (r && r.url.startsWith('/uploads/')) {
    let file = path.join(uploadDir, path.basename(r.url));
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  db.resources = db.resources.filter((x) => x.id !== +req.params.id);
  save();
  res.json({ ok: true });
});

app.post('/api/admin/live-class/start', auth, teacherOrAdmin, (req, res) => {
  let title = (req.body?.title || 'Live NEET Class').trim();
  if (db.liveClass?.active) return res.status(409).json({ error: 'A live class is already running.' });
  db.liveClass = { active: true, title, startedAt: new Date().toISOString(), teacher: req.user.name, teacherId: req.user.id };
  save();
  io.emit('live:status', db.liveClass);
  res.json(db.liveClass);
});

app.post('/api/admin/live-class/end', auth, teacherOrAdmin, upload.single('recording'), async (req, res) => {
  if (!db.liveClass?.active) return res.status(400).json({ error: 'No live class is running.' });
  let live = db.liveClass;
  if (req.file) {
    let cloud = await uploadFile(fs.readFileSync(req.file.path), req.file.originalname, req.file.mimetype, uploadDir);
    let resource = {
      id: next('resources'),
      title: live.title + ' — Recording',
      subject: 'Live Class',
      type: 'video',
      url: cloud.url,
      filename: req.file.originalname,
      createdAt: new Date().toISOString()
    };
    db.resources.push(resource);
  }
  db.liveClass = null;
  save();
  io.emit('live:ended');
  res.json({ ok: true });
});

app.post('/api/admin/tests', auth, admin, (req, res) => {
  let { title, subject, chapter, duration, startAt } = req.body || {};
  if (!title || !subject || !chapter || !Number(duration))
    return res.status(400).json({ error: 'Title, subject, chapter, and duration are required.' });
  if (startAt && Number.isNaN(new Date(startAt).getTime()))
    return res.status(400).json({ error: 'Enter a valid schedule date and time.' });
  let t = {
    id: next('tests'),
    title: title.trim(),
    subject: subject.trim(),
    chapter: chapter.trim(),
    duration: +duration,
    startAt: startAt || null,
    active: true,
    createdAt: new Date().toISOString()
  };
  db.tests.push(t);
  save();
  res.json(t);
});

app.put('/api/admin/tests/:id', auth, admin, (req, res) => {
  let t = db.tests.find((x) => x.id === +req.params.id),
    { title, subject, chapter, duration, startAt, active } = req.body || {};
  if (!t || !title || !subject || !chapter || !Number(duration))
    return res.status(400).json({ error: 'Title, subject, chapter, and duration are required.' });
  if (startAt && Number.isNaN(new Date(startAt).getTime()))
    return res.status(400).json({ error: 'Enter a valid schedule date and time.' });
  Object.assign(t, {
    title: title.trim(),
    subject: subject.trim(),
    chapter: chapter.trim(),
    duration: +duration,
    startAt: startAt || null,
    active: active !== false
  });
  save();
  res.json(t);
});

app.delete('/api/admin/tests/:id', auth, admin, (req, res) => {
  let id = +req.params.id;
  db.tests = db.tests.filter((t) => t.id !== id);
  db.questions = db.questions.filter((q) => q.testId !== id);
  save();
  res.json({ ok: true });
});

app.post('/api/admin/questions', auth, admin, (req, res) => {
  let { testId, question, options, answer } = req.body || {};
  if (
    !db.tests.some((t) => t.id === +testId) ||
    !question ||
    !Array.isArray(options) ||
    options.length !== 4 ||
    ![0, 1, 2, 3].includes(answer) ||
    options.some((x) => !x?.trim())
  )
    return res.status(400).json({ error: 'Saare question fields bharein.' });
  db.questions.push({
    id: next('questions'),
    testId: +testId,
    question: question.trim(),
    options: options.map((x) => x.trim()),
    answer
  });
  save();
  res.json({ ok: true });
});

app.put('/api/admin/questions/:id', auth, admin, (req, res) => {
  let q = db.questions.find((x) => x.id === +req.params.id),
    { question, options, answer } = req.body || {};
  if (
    !q ||
    !question ||
    !Array.isArray(options) ||
    options.length !== 4 ||
    ![0, 1, 2, 3].includes(answer) ||
    options.some((x) => !x?.trim())
  )
    return res.status(400).json({ error: 'Saare question fields bharein.' });
  Object.assign(q, {
    question: question.trim(),
    options: options.map((x) => x.trim()),
    answer
  });
  save();
  res.json({ ok: true });
});

app.delete('/api/admin/questions/:id', auth, admin, (req, res) => {
  db.questions = db.questions.filter((q) => q.id !== +req.params.id);
  save();
  res.json({ ok: true });
});

io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth?.token || '', secret);
    next();
  } catch {
    next(new Error('Login required'));
  }
});

io.on('connection', (socket) => {
  socket.on('student:join', () => {
    if (db.liveClass?.active && socket.user.role === 'student') io.emit('student:joined', socket.id);
  });
  socket.on('live:offer', (data) => {
    if (['admin', 'teacher'].includes(socket.user.role)) io.to(data.to).emit('live:offer', { from: socket.id, offer: data.offer });
  });
  socket.on('live:answer', (data) => io.to(data.to).emit('live:answer', { from: socket.id, answer: data.answer }));
  socket.on('live:ice', (data) => io.to(data.to).emit('live:ice', { from: socket.id, candidate: data.candidate }));
  socket.on('live:end', () => {
    if (['admin', 'teacher'].includes(socket.user.role)) io.emit('live:ended');
  });
});

app.get('*', (req, res) => res.type('html').send(indexPage()));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`PN Neet Diw running at http://0.0.0.0:${PORT}`));
