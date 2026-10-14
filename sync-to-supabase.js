require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('./supabase');

if (!isConfigured || !supabase) {
  console.error('❌ Supabase is not configured in .env');
  process.exit(1);
}

const dataPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌ data.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

async function syncAll() {
  console.log('🔄 Starting data sync from data.json to Supabase...');

  // 1. Sync Users
  if (Array.isArray(db.users) && db.users.length) {
    console.log(`Syncing ${db.users.length} users...`);
    const formattedUsers = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role || 'student',
      avatar: u.avatar || null,
      created_at: u.createdAt || new Date().toISOString()
    }));
    const { error: userError } = await supabase.from('users').upsert(formattedUsers);
    if (userError) console.error('Users sync error:', userError.message);
    else console.log('✅ Users synced successfully.');
  }

  // 2. Sync Tests
  if (Array.isArray(db.tests) && db.tests.length) {
    console.log(`Syncing ${db.tests.length} tests...`);
    const formattedTests = db.tests.map(t => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      chapter: t.chapter || 'General',
      duration: t.duration || 15,
      start_at: t.startAt || null,
      active: t.active !== false,
      created_at: t.createdAt || new Date().toISOString()
    }));
    const { error: testError } = await supabase.from('tests').upsert(formattedTests);
    if (testError) console.error('Tests sync error:', testError.message);
    else console.log('✅ Tests synced successfully.');
  }

  // 3. Sync Questions
  if (Array.isArray(db.questions) && db.questions.length) {
    console.log(`Syncing ${db.questions.length} questions...`);
    const formattedQuestions = db.questions.map(q => ({
      id: q.id,
      test_id: q.testId,
      question: q.question,
      options: q.options,
      answer: q.answer
    }));
    const { error: qError } = await supabase.from('questions').upsert(formattedQuestions);
    if (qError) console.error('Questions sync error:', qError.message);
    else console.log('✅ Questions synced successfully.');
  }

  // 4. Sync Resources
  if (Array.isArray(db.resources) && db.resources.length) {
    console.log(`Syncing ${db.resources.length} resources...`);
    const formattedResources = db.resources.map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject || 'General',
      type: r.type,
      url: r.url,
      filename: r.filename || '',
      created_at: r.createdAt || new Date().toISOString()
    }));
    const { error: resError } = await supabase.from('resources').upsert(formattedResources);
    if (resError) console.error('Resources sync error:', resError.message);
    else console.log('✅ Resources synced successfully.');
  }

  // 5. Sync Community
  if (Array.isArray(db.community) && db.community.length) {
    console.log(`Syncing ${db.community.length} community posts...`);
    const formattedCommunity = db.community.map(c => ({
      id: c.id,
      user_id: c.userId,
      body: c.body || '',
      image: c.image || null,
      comments: c.comments || [],
      created_at: c.createdAt || new Date().toISOString()
    }));
    const { error: cError } = await supabase.from('community').upsert(formattedCommunity);
    if (cError) console.error('Community sync error:', cError.message);
    else console.log('✅ Community posts synced successfully.');
  }

  // 6. Sync Study Plans
  if (Array.isArray(db.plans) && db.plans.length) {
    console.log(`Syncing ${db.plans.length} study plans...`);
    const formattedPlans = db.plans.map(p => ({
      id: p.id,
      user_id: p.userId,
      title: p.title,
      subject: p.subject || 'General',
      start_at: p.startAt,
      end_at: p.endAt || null,
      done: !!p.done,
      created_at: p.createdAt || new Date().toISOString()
    }));
    const { error: planError } = await supabase.from('plans').upsert(formattedPlans);
    if (planError) console.error('Plans sync error:', planError.message);
    else console.log('✅ Study plans synced successfully.');
  }

  // 7. Sync Attempts
  if (Array.isArray(db.attempts) && db.attempts.length) {
    console.log(`Syncing ${db.attempts.length} attempts...`);
    const formattedAttempts = db.attempts.map(a => ({
      id: a.id,
      user_id: a.userId,
      test_id: a.testId,
      score: a.score,
      total: a.total,
      review: a.review || [],
      created_at: a.createdAt || new Date().toISOString()
    }));
    const { error: attemptError } = await supabase.from('attempts').upsert(formattedAttempts);
    if (attemptError) console.error('Attempts sync error:', attemptError.message);
    else console.log('✅ Attempts synced successfully.');
  }

  console.log('🏁 Sync script finished!');
}

syncAll().catch(err => console.error('Unexpected error during sync:', err));
