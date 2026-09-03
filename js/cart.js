// js/cart.js

import { supabase } from './config.js';

// =============================================
// 1. GET USER CART FROM SUPABASE
// =============================================
export async function getUserCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        let { data, error } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

        // If no cart exists, create one
        if (error && error.code === 'PGRST116') {
            const { data: newCart, error: insertError } = await supabase
                .from('carts')
                .insert([{ user_id: user.id, items: [] }])
                .select('items')
                .single();

            if (insertError) throw insertError;
            return newCart?.items || [];
        }

        if (error) throw error;
        return data?.items || [];

    } catch (error) {
        console.error('Error getting cart:', error);
        return [];
    }
}

// =============================================
// 2. UPDATE USER CART IN SUPABASE
// =============================================
export async function updateUserCart(items) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not logged in');

    const { error } = await supabase
        .from('carts')
        .update({ 
            items: items,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

    if (error) throw error;
    return true;
}

// =============================================
// 3. ADD ITEM TO CART
// =============================================
export async function addToCartDB(productId, quantity = 1) {
    const items = await getUserCart();
    const existing = items.find(item => item.id === productId);

    if (existing) {
        existing.quantity += quantity;
    } else {
        items.push({ id: productId, quantity });
    }

    await updateUserCart(items);
    return items;
}

// =============================================
// 4. REMOVE ITEM FROM CART
// =============================================
export async function removeFromCartDB(productId) {
    let items = await getUserCart();
    items = items.filter(item => item.id !== productId);
    await updateUserCart(items);
    return items;
}

// =============================================
// 5. UPDATE ITEM QUANTITY
// =============================================
export async function updateQuantityDB(productId, quantity) {
    const items = await getUserCart();
    const item = items.find(i => i.id === productId);
    if (item) {
        if (quantity <= 0) {
            return await removeFromCartDB(productId);
        }
        item.quantity = quantity;
        await updateUserCart(items);
    }
    return items;
}

// =============================================
// 6. CLEAR CART
// =============================================
export async function clearCartDB() {
    await updateUserCart([]);
}

// =============================================
// 7. GET CART ITEMS WITH PRODUCT DATA
// =============================================
export async function getCartItemsDB() {
    const cartItems = await getUserCart();
    if (cartItems.length === 0) return [];

    const ids = cartItems.map(item => item.id);
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error('Error loading cart items:', error);
        return [];
    }

    return data.map(product => ({
        ...product,
        quantity: cartItems.find(item => item.id === product.id)?.quantity || 1
    }));
}

// =============================================
// 8. GET CART ITEM COUNT
// =============================================
export async function getCartCount() {
    const items = await getUserCart();
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

// =============================================
// 9. SYNC LOCAL CART TO SUPABASE (migration)
// =============================================
export async function syncLocalCartToDB() {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length === 0) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const dbItems = await getUserCart();
        const merged = [...dbItems];
        localCart.forEach(localItem => {
            const existing = merged.find(item => item.id === localItem.id);
            if (existing) {
                existing.quantity += localItem.quantity;
            } else {
                merged.push(localItem);
            }
        });
        await updateUserCart(merged);
        localStorage.removeItem('cart');
        console.log('✅ Local cart synced to database');
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}