// js/auth.js

import { supabase } from './config.js';

// =============================================
// 1. CHECK AUTH
// =============================================
export async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// =============================================
// 2. UPDATE UI
// =============================================
export function updateAuthUI(user) {
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        if (userName) {
            userName.textContent = user.user_metadata?.full_name || 'User';
        }
        if (userAvatar) {
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'User')}&background=8B5CF6&color=fff&size=32`;
        }
        
        if (adminLink) {
            adminLink.style.display = user.user_metadata?.role === 'admin' ? 'block' : 'none';
        }
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// =============================================
// 3. SETUP DROPDOWN
// =============================================
export function setupDropdown() {
    const userBtn = document.getElementById('userBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userBtn && dropdownMenu) {
        const newUserBtn = userBtn.cloneNode(true);
        userBtn.parentNode.replaceChild(newUserBtn, userBtn);
        
        newUserBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
        
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// =============================================
// 4. SETUP LOGOUT (✅ এখানে ফাংশনটি আছে)
// =============================================
export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await supabase.auth.signOut();
                showToast('✅ লগআউট সফল!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } catch (error) {
                console.error('Logout error:', error);
                showToast('❌ লগআউট করতে ব্যর্থ!', 'error');
            }
        });
    }
}

// =============================================
// 5. SETUP ADMIN LOGOUT (অ্যাডমিন পেজের জন্য)
// =============================================
export function setupAdminLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await supabase.auth.signOut();
                showToast('✅ লগআউট সফল!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 500);
            } catch (error) {
                console.error('Logout error:', error);
                showToast('❌ লগআউট করতে ব্যর্থ!', 'error');
            }
        });
    }
}

// =============================================
// 6. LOGIN FUNCTION
// =============================================
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// =============================================
// 7. REGISTER FUNCTION
// =============================================
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

// =============================================
// 8. TOAST
// =============================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast';
        document.body.appendChild(newToast);
        setTimeout(() => showToast(message, type), 100);
        return;
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}