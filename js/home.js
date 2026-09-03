// js/home.js

import { supabase, supabaseAdmin } from './config.js';

// ============================================
// 1. GET SLIDERS
// ============================================
export async function getSliders() {
    try {
        const { data, error } = await supabase
            .from('sliders')
            .select('*')
            .eq('is_active', true)
            .order('order_number', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching sliders:', error);
        return [];
    }
}

// ============================================
// 2. GET BANNERS
// ============================================
export async function getBanners(position = 'home') {
    try {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .eq('position', position)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

// ============================================
// 3. GET OFFERS
// ============================================
export async function getOffers() {
    try {
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching offers:', error);
        return [];
    }
}

// ============================================
// 4. ADMIN FUNCTIONS
// ============================================
export async function addSlider(data) {
    const { error } = await supabase
        .from('sliders')
        .insert([data]);
    if (error) throw error;
    return true;
}

export async function updateSlider(id, data) {
    const { error } = await supabase
        .from('sliders')
        .update(data)
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function deleteSlider(id) {
    const { error } = await supabase
        .from('sliders')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function addBanner(data) {
    const { error } = await supabase
        .from('banners')
        .insert([data]);
    if (error) throw error;
    return true;
}

export async function updateBanner(id, data) {
    const { error } = await supabase
        .from('banners')
        .update(data)
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function deleteBanner(id) {
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function addOffer(data) {
    const { error } = await supabase
        .from('offers')
        .insert([data]);
    if (error) throw error;
    return true;
}

export async function updateOffer(id, data) {
    const { error } = await supabase
        .from('offers')
        .update(data)
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function deleteOffer(id) {
    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}


// js/home.js - এই ফাংশনগুলো যোগ করুন

// ============================================
// GET HERO CARDS
// ============================================
export async function getHeroCards() {
    try {
        const { data, error } = await supabase
            .from('hero_cards')
            .select('*')
            .eq('is_active', true)
            .order('order_number', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching hero cards:', error);
        return [];
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
export async function addHeroCard(data) {
    const { error } = await supabaseAdmin
        .from('hero_cards')
        .insert([data]);
    if (error) throw error;
    return true;
}

export async function updateHeroCard(id, data) {
    const { error } = await supabaseAdmin
        .from('hero_cards')
        .update(data)
        .eq('id', id);
    if (error) throw error;
    return true;
}

export async function deleteHeroCard(id) {
    const { error } = await supabaseAdmin
        .from('hero_cards')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}