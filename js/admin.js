// js/admin.js
import { supabase } from './config.js';

// চেক করুন বর্তমান ইউজার অ্যাডমিন কিনা
export async function isAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // ইউজারের মেটাডাটা থেকে রোল চেক করুন
    return user.user_metadata?.role === 'admin';
}

// প্রোডাক্ট যোগ করার ফাংশন
export async function addProduct(productData) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
    
    if (error) throw error;
    return data[0];
}

// প্রোডাক্ট আপডেট করার ফাংশন
export async function updateProduct(id, updates) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

// প্রোডাক্ট ডিলিট করার ফাংশন
export async function deleteProduct(id) {
    const admin = await isAdmin();
    if (!admin) throw new Error('অ্যাডমিন অনুমতি প্রয়োজন!');

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}