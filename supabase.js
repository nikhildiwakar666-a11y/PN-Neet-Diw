require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = 'pnneet-uploads';

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isConfigured = true;
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
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
  isConfigured,
  bucketName,
  uploadFile
};
