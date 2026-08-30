import { supabase } from './config.js';

// Load categories
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

// Load featured products
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

// Load all products
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

// Add to cart
export function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast('প্রোডাক্ট কার্টে যোগ করা হয়েছে!', 'success');
}

// Update cart badge
export function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = total;
}

// Render products to grid
export function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">কোনো প্রোডাক্ট পাওয়া যায়নি</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}" class="product-image" />
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
    `).join('');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions available globally
window.addToCart = addToCart;
window.viewProduct = (id) => {
    console.log('View product:', id);
    showToast('প্রোডাক্ট ডিটেইলস শীঘ্রই আসছে!', 'info');
};