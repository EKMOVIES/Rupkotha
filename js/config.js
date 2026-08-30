// Supabase Configuration
const SUPABASE_URL = 'https://hgbrctkpnukjvqtdvspu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYnJjdGtwbnVranZxdGR2c3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODAyODgsImV4cCI6MjEwMzY1NjI4OH0.Ybqsdb6x7pdZd3s9q_7diyWavR21KfRBCwJeppgaNmA';
const CLOUDINARY_CLOUD_NAME = 'nbdswgx7';
const CLOUDINARY_UPLOAD_PRESET = 'rupkotha_preset';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export
export { 
    supabase, 
    SUPABASE_URL, 
    SUPABASE_ANON_KEY, 
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET 
};