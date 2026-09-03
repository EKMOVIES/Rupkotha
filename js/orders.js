// js/orders.js

import { supabase, supabaseAdmin } from './config.js';

// =============================================
// 1. PLACE ORDER (সম্পূর্ণ ফিক্সড)
// =============================================
export async function placeOrder({ userId, items, total, shippingInfo, paymentMethod }) {
    console.log('📦 placeOrder started with:', { 
        userId, 
        itemsCount: items?.length || 0, 
        total, 
        shippingInfo, 
        paymentMethod 
    });

    try {
        // ✅ ভ্যালিডেশন
        if (!userId) {
            console.error('❌ No userId provided');
            throw new Error('ইউজার আইডি প্রয়োজন!');
        }
        
        if (!items || items.length === 0) {
            console.error('❌ No items in cart');
            throw new Error('কার্ট খালি!');
        }
        
        if (!shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
            console.error('❌ Missing shipping info:', shippingInfo);
            throw new Error('ডেলিভারি তথ্য পূরণ করুন!');
        }

        // ✅ অর্ডার নম্বর জেনারেট করুন (সরল)
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `ORD-${timestamp}-${random}`;
        console.log('✅ Generated order number:', orderNumber);

        // ✅ অর্ডার ডেটা তৈরি করুন
        const orderData = {
            user_id: userId,
            order_number: orderNumber,
            total: parseFloat(total.toFixed(2)),
            shipping_name: shippingInfo.name.trim(),
            shipping_phone: shippingInfo.phone.trim(),
            shipping_address: shippingInfo.address.trim(),
            shipping_city: shippingInfo.city?.trim() || 'ঢাকা',
            shipping_postal: shippingInfo.postal?.trim() || '',
            payment_method: paymentMethod || 'cash',
            status: 'pending'
        };

        console.log('📤 Order data being sent:', orderData);

        // ✅ অর্ডার ইনসার্ট করুন
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (orderError) {
            console.error('❌ Order insert error:', orderError);
            console.error('❌ Error details:', {
                code: orderError.code,
                message: orderError.message,
                details: orderError.details,
                hint: orderError.hint
            });
            throw new Error(`অর্ডার তৈরি করতে ব্যর্থ: ${orderError.message}`);
        }

        console.log('✅ Order created:', order);

        // ✅ অর্ডার আইটেম তৈরি করুন
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_price: parseFloat(item.price.toFixed(2)),
            quantity: parseInt(item.quantity) || 1
        }));

        console.log('📤 Order items being sent:', orderItems);

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('❌ Order items insert error:', itemsError);
            // রোলব্যাক: অর্ডার ডিলিট করুন
            await supabase.from('orders').delete().eq('id', order.id);
            throw new Error(`অর্ডার আইটেম তৈরি করতে ব্যর্থ: ${itemsError.message}`);
        }

        console.log('✅ Order items created successfully');
        return order;

    } catch (error) {
        console.error('❌ placeOrder error:', error);
        throw error;
    }
}

// =============================================
// 2. GET USER ORDERS
// =============================================
export async function getOrders(userId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting orders:', error);
        return [];
    }
}

// =============================================
// 3. GET ORDER ITEMS
// =============================================
export async function getOrderItems(orderId) {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting order items:', error);
        return [];
    }
}

// =============================================
// 4. GET ALL ORDERS (ADMIN ONLY)
// =============================================
export async function getAllOrders() {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting all orders:', error);
        return [];
    }
}

// =============================================
// 5. UPDATE ORDER STATUS (ADMIN ONLY)
// =============================================
export async function updateOrderStatus(orderId, status) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}