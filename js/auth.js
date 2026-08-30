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
export function updateAuthUI(user) {
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        authLinks.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.user_metadata?.full_name || 'User';
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'User')}&background=8B5CF6&color=fff&size=32`;
        
        // Check if user is admin
        if (user.user_metadata?.role === 'admin') {
            adminLink.style.display = 'block';
        }
    } else {
        authLinks.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}