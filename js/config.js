// Supabase Configuration
const SUPABASE_URL = 'https://hgbrctkpnukjvqtdvspu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYnJjdGtwbnVranZxdGR2c3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODAyODgsImV4cCI6MjEwMzY1NjI4OH0.Ybqsdb6x7pdZd3s9q_7diyWavR21KfRBCwJeppgaNmA';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYnJjdGtwbnVranZxdGR2c3B1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA4MDI4OCwiZXhwIjoyMTAzNjU2Mjg4fQ.zb6Rt4__btB68F14xs18KjRPHqXB8Jdx5nWkFsHu7Ww';
const CLOUDINARY_CLOUD_NAME = 'nbdswgx7';
const CLOUDINARY_UPLOAD_PRESET = 'rupkotha_preset';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
export const DEFAULT_IMAGE = 'https://res.cloudinary.com/nbdswgx7/image/upload/v1788179884/457134438_1933153253856578_464632734835800339_n.jpg';

// Export
export { 
    supabase, 
    supabaseAdmin,
    SUPABASE_URL, 
    SUPABASE_ANON_KEY, 
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    SUPABASE_SERVICE_ROLE
};
