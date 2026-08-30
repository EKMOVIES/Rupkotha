import { supabase } from './config.js';
import { checkAuth, updateAuthUI } from './auth.js';
import { loadCategories, loadFeaturedProducts, renderProducts, updateCartBadge, addToCart } from './products.js';

// Make addToCart available globally
window.addToCart = addToCart;

// Initialize App
async function init() {
    try {
        // Check authentication
        const user = await checkAuth();
        updateAuthUI(user);
        
        // Update cart badge
        updateCartBadge();
        
        // Load categories
        const categories = await loadCategories();
        renderCategories(categories);
        
        // Load featured products
        const featuredProducts = await loadFeaturedProducts();
        renderProducts(featuredProducts, 'featuredGrid');
        
        // Setup event listeners
        setupEventListeners(user);
        
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Render categories
function renderCategories(categories) {
    const container = document.getElementById('categoryGrid');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">কোনো ক্যাটাগরি পাওয়া যায়নি</p>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <a href="products.html?category=${cat.id}" class="category-card">
            <i class="${cat.icon || 'fas fa-palette'}"></i>
            <h3>${cat.name}</h3>
            <p>${cat.count || 0} টি প্রোডাক্ট</p>
        </a>
    `).join('');
}

// Setup event listeners
function setupEventListeners(user) {
    // Nav toggle for mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // User dropdown
    const userBtn = document.getElementById('userBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.reload();
        });
    }
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            if (email) {
                try {
                    const { error } = await supabase
                        .from('subscribers')
                        .insert({ email });
                    
                    if (error) throw error;
                    
                    showToast('সাবস্ক্রাইব করার জন্য ধন্যবাদ! 💜', 'success');
                    e.target.reset();
                } catch (error) {
                    showToast('আবার চেষ্টা করুন', 'error');
                }
            }
        });
    }
    
    // Cart nav click
    const cartNav = document.getElementById('cartNav');
    if (cartNav) {
        cartNav.addEventListener('click', (e) => {
            e.preventDefault();
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                showToast('কার্ট খালি! প্রোডাক্ট যোগ করুন', 'error');
            } else {
                window.location.href = 'cart.html';
            }
        });
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for use in other modules
export { showToast };