import { supabase } from './config.js';

// Check if user is logged in
export async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Login function
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Register function
export async function registerUser(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'user'
            }
        }
    });
    if (error) throw error;
    return data;
}

// Logout function
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Update UI based on auth state
// js/auth.js - updateAuthUI function এর আপডেটেড ভার্সন

export function updateAuthUI(user) {
    // সব এলিমেন্টকে আলাদাভাবে সিলেক্ট করুন
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        // ইউজার লগইন থাকলে:
        // ১. অথ লিংক লুকান
        if (authLinks) authLinks.style.display = 'none';
        
        // ২. ইউজার মেনু দেখান
        if (userMenu) userMenu.style.display = 'block';
        
        // ৩. ইউজারের নাম ও ছবি আপডেট করুন
        if (userName) {
            userName.textContent = user.user_metadata?.full_name || 'User';
        }
        if (userAvatar) {
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'User')}&background=8B5CF6&color=fff&size=32`;
        }
        
        // ৪. অ্যাডমিন লিংক দেখান (শুধু অ্যাডমিনদের জন্য)
        if (adminLink) {
            if (user.user_metadata?.role === 'admin') {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }
    } else {
        // ইউজার লগইন না থাকলে:
        // ১. অথ লিংক দেখান
        if (authLinks) authLinks.style.display = 'flex';
        
        // ২. ইউজার মেনু লুকান
        if (userMenu) userMenu.style.display = 'none';
    }
}