require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const bucketName = 'pnneet-uploads';

let supabase = null;
let supabaseAdmin = null;
let supabaseAnon = null;
let isConfigured = false;

function getMissingConfig() {
  const missing = [];
  if (!supabaseUrl || supabaseUrl.includes('your-project')) missing.push('SUPABASE_URL');
  if (!anonKey || anonKey.includes('your-supabase-anon-key')) missing.push('SUPABASE_ANON_KEY');
  if (!serviceKey || serviceKey.includes('your-supabase-service-role-key')) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

const missingVars = getMissingConfig();

if (missingVars.length > 0) {
  console.error(`[Supabase Configuration Error] Central database is disabled. Missing required environment variable(s): ${missingVars.join(', ')}. Please set these variables in the Render Dashboard (Environment tab).`);
} else {
  try {
    supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    supabase = supabaseAdmin;

    supabaseAnon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    isConfigured = true;
    console.log('✅ Supabase central authentication and storage clients successfully initialized.');
  } catch (err) {
    console.error('⚠️ Could not initialize Supabase client:', err.message);
  }
}


/**
 * Upload a file to Supabase Storage (bucket: pnneet-uploads).
 * If Supabase is unavailable or upload fails, falls back to local disk storage (/uploads).
 *
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {string} localUploadDir
 * @returns {Promise<{ url: string, isCloud: boolean, filename: string }>}
 */
async function uploadFile(fileBuffer, originalName, mimeType, localUploadDir) {
  const safeName = Date.now() + '-' + (originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).upload(safeName, fileBuffer, {
        contentType: mimeType || 'application/octet-stream',
        upsert: true
      });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(safeName);
        if (publicData?.publicUrl) {
          return {
            url: publicData.publicUrl,
            isCloud: true,
            filename: safeName
          };
        }
      } else if (error) {
        console.warn('⚠️ Supabase upload warning, falling back to local:', error.message);
      }
    } catch (uploadErr) {
      console.warn('⚠️ Supabase upload exception, falling back to local:', uploadErr.message);
    }
  }

  // Local fallback
  fs.mkdirSync(localUploadDir, { recursive: true });
  const localPath = path.join(localUploadDir, safeName);
  fs.writeFileSync(localPath, fileBuffer);
  return {
    url: '/uploads/' + safeName,
    isCloud: false,
    filename: safeName
  };
}

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseAnon,
  isConfigured,
  bucketName,
  uploadFile,
  getMissingConfig
};

