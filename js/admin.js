// js/admin.js
import { supabase, supabaseAdmin } from './config.js';

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