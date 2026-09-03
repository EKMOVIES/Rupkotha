// js/admin.js

import { supabase, supabaseAdmin } from './config.js';

// =============================================
// 1. CHECK ADMIN
// =============================================
export async function isAdmin() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return false;
        return user.user_metadata?.role === 'admin';
    } catch (error) {
        console.error('Error checking admin:', error);
        return false;
    }
}

// =============================================
// 2. GET ALL USERS (Service Role)
// =============================================
export async function getAllUsers() {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        return data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// =============================================
// 3. GET USER COUNT
// =============================================
export async function getUserCount() {
    try {
        const users = await getAllUsers();
        return users.length;
    } catch (error) {
        console.error('Error getting user count:', error);
        return 0;
    }
}

// =============================================
// 4. PRODUCT FUNCTIONS
// =============================================
export async function addProduct(productData) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabaseAdmin
        .from('products')
        .insert([productData])
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function updateProduct(id, updates) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabaseAdmin
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function deleteProduct(id) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// =============================================
// 5. CATEGORY FUNCTIONS
// =============================================
export async function addCategory(categoryData) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert([categoryData])
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function updateCategory(id, updates) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabaseAdmin
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function deleteCategory(id) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// =============================================
// 6. ORDER FUNCTIONS
// =============================================
export async function getAllOrders() {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

export async function updateOrderStatus(orderId, status) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { error } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', orderId);
    
    if (error) throw error;
    return true;
}