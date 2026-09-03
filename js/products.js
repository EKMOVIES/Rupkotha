// js/products.js

import { supabase, DEFAULT_IMAGE } from './config.js';
import { getUserCart, updateUserCart, getCartCount, getCartItemsDB } from './cart.js';

// =============================================
// 1. LOAD CATEGORIES
// =============================================
export async function loadCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error loading categories:', error);
        return [];
    }
    return data;
}

// =============================================
// 2. GET CATEGORIES WITH PRODUCT COUNT
// =============================================
export async function getCategoriesWithCount() {
    try {
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (catError) throw catError;

        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('category');

        if (prodError) throw prodError;

        const countMap = {};
        products.forEach(p => {
            countMap[p.category] = (countMap[p.category] || 0) + 1;
        });

        return categories.map(cat => ({
            ...cat,
            count: countMap[cat.name] || 0
        }));

    } catch (error) {
        console.error('Error getting categories with count:', error);
        return [];
    }
}

// =============================================
// 3. LOAD FEATURED PRODUCTS
// =============================================
export async function loadFeaturedProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Error loading featured products:', error);
        return [];
    }
    return data;
}

// =============================================
// 4. LOAD ALL PRODUCTS
// =============================================
export async function loadAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading products:', error);
        return [];
    }
    return data;
}

// =============================================
// 5. GET PRODUCTS BY CATEGORY
// =============================================
export async function getProductsByCategory(categoryName) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryName)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading products by category:', error);
        return [];
    }
    return data;
}

// =============================================
// 6. GET SINGLE PRODUCT
// =============================================
export async function getProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error loading product:', error);
        return null;
    }
    return data;
}

// =============================================
// 7. GET PRODUCT IMAGE (with fallback)
// =============================================
export function getProductImage(product) {
    if (!product) return DEFAULT_IMAGE;
    const url = product.image_url;
    if (!url || url === '' || url.includes('via.placeholder.com') || url.includes('beauty.jpg')) {
        return DEFAULT_IMAGE;
    }
    return url;
}

// =============================================
// 8. RENDER PRODUCTS
// =============================================
export function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 3rem; display: block; margin-bottom: 16px;"></i>
                <p>কোনো প্রোডাক্ট পাওয়া যায়নি</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const imageUrl = getProductImage(product);
        return `
            <div class="product-card">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="product-image" 
                     loading="lazy"
                     onerror="this.src='${DEFAULT_IMAGE}'; this.onerror=null;" />
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">৳${product.price.toFixed(2)}</p>
                    <div class="product-actions">
                        <button class="btn-primary" onclick="window.addToCart('${product.id}')">
                            <i class="fas fa-shopping-bag"></i> অ্যাড
                        </button>
                        <button class="btn-outline-light" onclick="window.viewProduct('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================
// 9. UPDATE CART BADGE (DB সংযুক্ত)
// =============================================
export async function updateCartBadge() {
    const count = await getCartCount();
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// =============================================
// 10. ADD TO CART (DB সংযুক্ত)
// =============================================
export async function addToCart(productId, quantity = 1) {
    if (quantity < 1) quantity = 1;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // Fallback to localStorage
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(item => item.id === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({ id: productId, quantity });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showToast('✅ প্রোডাক্ট কার্টে যোগ করা হয়েছে! (স্থানীয়)', 'success');
            return;
        }

        // Logged in: use database
        const { data: cartData } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

        let items = cartData?.items || [];

        const existing = items.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({ id: productId, quantity });
        }

        await supabase
            .from('carts')
            .update({ items, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        updateCartBadge();
        showToast('✅ প্রোডাক্ট কার্টে যোগ করা হয়েছে!', 'success');

    } catch (error) {
        console.error('Error adding to cart:', error);
        // Fallback to localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showToast('✅ প্রোডাক্ট কার্টে যোগ করা হয়েছে! (স্থানীয়)', 'success');
    }
}

// =============================================
// 11. GET CART ITEMS (DB সংযুক্ত)
// =============================================
export async function getCartItems() {
    return await getCartItemsDB();
}

// =============================================
// 12. VIEW PRODUCT
// =============================================
export function viewProduct(id) {
    if (!id) {
        showToast('প্রোডাক্ট আইডি পাওয়া যায়নি!', 'error');
        return;
    }
    window.location.href = `product-details.html?id=${id}`;
}

// =============================================
// 13. REMOVE FROM CART (DB সংযুক্ত)
// =============================================
export async function removeFromCart(productId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // localStorage fallback
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showToast('🗑️ প্রোডাক্ট রিমুভ করা হয়েছে', 'info');
            return;
        }

        const { data: cartData } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

        let items = cartData?.items || [];
        items = items.filter(item => item.id !== productId);

        await supabase
            .from('carts')
            .update({ items, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        updateCartBadge();
        showToast('🗑️ প্রোডাক্ট রিমুভ করা হয়েছে', 'info');

    } catch (error) {
        console.error('Error removing from cart:', error);
        // Fallback
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showToast('🗑️ প্রোডাক্ট রিমুভ করা হয়েছে', 'info');
    }
}

// =============================================
// 14. CLEAR CART (DB সংযুক্ত)
// =============================================
export async function clearCart() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            localStorage.removeItem('cart');
            updateCartBadge();
            showToast('🛒 কার্ট খালি করা হয়েছে', 'info');
            return;
        }

        await supabase
            .from('carts')
            .update({ items: [], updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        updateCartBadge();
        showToast('🛒 কার্ট খালি করা হয়েছে', 'info');

    } catch (error) {
        console.error('Error clearing cart:', error);
        localStorage.removeItem('cart');
        updateCartBadge();
        showToast('🛒 কার্ট খালি করা হয়েছে', 'info');
    }
}

// =============================================
// 15. TOAST NOTIFICATION
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

    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }

    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// =============================================
// 16. MAKE FUNCTIONS GLOBALLY AVAILABLE
// =============================================
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;