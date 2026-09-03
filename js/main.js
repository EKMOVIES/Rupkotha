// js/main.js

import { supabase } from './config.js';
import { checkAuth, updateAuthUI, setupDropdown, setupLogout } from './auth.js';
import { 
    loadFeaturedProducts, 
    renderProducts, 
    updateCartBadge, 
    addToCart,
    getCategoriesWithCount,
    getProductImage
} from './products.js';
import { syncLocalCartToDB, getCartItemsDB } from './cart.js';
import { getSliders, getBanners, getOffers } from './home.js';

// =============================================
// 1. INITIALIZE APP
// =============================================
async function init() {
    try {
        const user = await checkAuth();
        updateAuthUI(user);
        
        if (user) {
            await syncLocalCartToDB();
        }
        
        await updateCartBadge();
        setupDropdown();
        setupLogout();
        
        // Load sliders with grid layout
        if (document.getElementById('sliderWrapper')) {
            await loadSliders();
        }
        
        // Load offers
        if (document.getElementById('offersGrid')) {
            await loadOffers();
        }
        
        // Load banners
        if (document.getElementById('bannerContainer')) {
            await loadBanners();
        }
        
        // Load categories & category products (হোমপেজে)
        if (document.getElementById('categoryFilter')) {
            await renderCategories();
        }
        
        // Load featured products
        if (document.getElementById('featuredGrid')) {
            await renderFeaturedProducts();
        }
        
        setupEventListeners(user);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('অ্যাপ লোড করতে সমস্যা হয়েছে!', 'error');
    }
}

// =============================================
// 2. RENDER CATEGORIES WITH PRODUCTS (হোমপেজে)
// =============================================
// =============================================
// RENDER CATEGORIES WITH PRODUCTS (হোমপেজে)
// =============================================
async function renderCategories() {
    const filterContainer = document.getElementById('categoryFilter');
    const productsContainer = document.getElementById('categoryProductsContainer');
    if (!filterContainer || !productsContainer) return;

    try {
        const categories = await getCategoriesWithCount();

        if (!categories || categories.length === 0) {
            filterContainer.innerHTML = `<p style="color:var(--text-secondary);">কোনো ক্যাটাগরি নেই</p>`;
            return;
        }

        // ✅ 'সব' বাটন যোগ করুন
        filterContainer.innerHTML = `
            <button class="cat-btn active" data-category="all" onclick="window.loadCategoryProducts('all')">
                <i class="fas fa-th-large"></i> সব (${categories.reduce((sum, cat) => sum + cat.count, 0)})
            </button>
        `;

        // ক্যাটাগরি বাটন যোগ করুন
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.dataset.category = cat.name;
            btn.innerHTML = `<i class="${cat.icon || 'fas fa-palette'}"></i> ${cat.name} (${cat.count})`;
            btn.onclick = () => window.loadCategoryProducts(cat.name);
            filterContainer.appendChild(btn);
        });

        // ✅ ডিফল্ট: সব প্রোডাক্ট লোড করুন
        await loadCategoryProducts('all');

        // Active state handler
        filterContainer.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filterContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

    } catch (error) {
        console.error('Error rendering categories:', error);
        filterContainer.innerHTML = `<p style="color:#EF4444;">ক্যাটাগরি লোড করতে ব্যর্থ!</p>`;
    }
}

// =============================================
// LOAD CATEGORY PRODUCTS (হোমপেজে)
// =============================================
window.loadCategoryProducts = async function(categoryName) {
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;

    try {
        let query = supabase.from('products').select('*');
        
        // ✅ 'all' হলে সব প্রোডাক্ট, নাহলে ক্যাটাগরি অনুযায়ী
        if (categoryName !== 'all') {
            query = query.eq('category', categoryName);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false }).limit(8);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="category-products-section">
                    <div class="no-products">
                        <i class="fas fa-box-open" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                        <p>${categoryName === 'all' ? 'কোনো প্রোডাক্ট নেই' : `"${categoryName}" ক্যাটাগরিতে কোনো প্রোডাক্ট নেই`}</p>
                    </div>
                </div>
            `;
            return;
        }

        const title = categoryName === 'all' ? 'সব প্রোডাক্ট' : categoryName;

        container.innerHTML = `
            <div class="category-products-section">
                <div class="section-title">
                    <span>${title}</span>
                    <span class="count">(${data.length} টি প্রোডাক্ট)</span>
                    <a href="products.html${categoryName !== 'all' ? `?category=${encodeURIComponent(categoryName)}` : ''}" 
                       style="font-size:14px;color:var(--primary);text-decoration:none;font-family:'Inter',sans-serif;margin-left:auto;">
                        সব দেখুন →
                    </a>
                </div>
                <div class="product-grid">
                    ${data.map(product => {
                        const imageUrl = getProductImage(product);
                        return `
                            <div class="product-card">
                                <img src="${imageUrl}" 
                                     alt="${product.name}" 
                                     onerror="this.src='https://res.cloudinary.com/demo/image/upload/sample.jpg'; this.onerror=null;" />
                                <div class="info">
                                    <h4>${product.name}</h4>
                                    <p class="price">৳${product.price.toFixed(2)}</p>
                                    <button class="add-btn" onclick="window.addToCart('${product.id}')">
                                        <i class="fas fa-shopping-bag"></i> অ্যাড
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // ✅ অটো-স্ক্রল (শুধু ক্যাটাগরি ক্লিক করলে)
        if (categoryName !== 'all') {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (error) {
        console.error('Error loading category products:', error);
        container.innerHTML = `
            <div class="category-products-section">
                <div class="no-products" style="color:#EF4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                    <p>প্রোডাক্ট লোড করতে ব্যর্থ!</p>
                </div>
            </div>
        `;
    }
};

// =============================================
// 4. RENDER FEATURED PRODUCTS
// =============================================
async function renderFeaturedProducts() {
    const container = document.getElementById('featuredGrid');
    if (!container) return;

    try {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; display: block; margin-bottom: 12px;"></i>
                <p>ফিচার্ড প্রোডাক্ট লোড হচ্ছে...</p>
            </div>
        `;

        const products = await loadFeaturedProducts();

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: var(--text-secondary);">
                    <i class="fas fa-box-open" style="font-size: 2rem; display: block; margin-bottom: 12px;"></i>
                    <p>কোনো ফিচার্ড প্রোডাক্ট নেই</p>
                </div>
            `;
            return;
        }

        renderProducts(products, 'featuredGrid');

    } catch (error) {
        console.error('Error rendering featured products:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 12px;"></i>
                <p>ফিচার্ড প্রোডাক্ট লোড করতে ব্যর্থ!</p>
                <small style="color: var(--text-secondary);">${error.message}</small>
            </div>
        `;
    }
}

// =============================================
// 5. LOAD SLIDERS (Grid Layout)
// =============================================
async function loadSliders() {
    const wrapper = document.getElementById('sliderWrapper');
    const dots = document.getElementById('sliderDots');
    const container = document.getElementById('sliderContainer');
    if (!wrapper) return;

    try {
        const sliders = await getSliders();
        if (!sliders || sliders.length === 0) {
            wrapper.innerHTML = `
                <div style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1A1A2E,#16213E);">
                    <div style="text-align:center;padding:20px;">
                        <h1 style="font-size:2.5rem;color:#8B5CF6;font-family:'Playfair Display',serif;">রূপকথা</h1>
                        <p style="color:var(--text-secondary);">আপনার সৌন্দর্যের গল্প শুরু হোক</p>
                    </div>
                </div>
            `;
            dots.innerHTML = '';
            return;
        }

        wrapper.innerHTML = sliders.map(slider => `
            <div style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1A1A2E,#16213E);position:relative;padding:20px;">
                ${slider.image_url ? `<img src="${slider.image_url}" alt="${slider.title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3;" onerror="this.style.display='none';" />` : ''}
                <div style="position:relative;z-index:2;text-align:center;max-width:600px;">
                    <h1 style="font-size:2.5rem;font-family:'Playfair Display',serif;color:white;margin-bottom:8px;">${slider.title}</h1>
                    ${slider.subtitle ? `<p style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:16px;">${slider.subtitle}</p>` : ''}
                    ${slider.button_text && slider.button_link ? `
                        <a href="${slider.button_link}" class="btn-primary" style="padding:12px 32px;font-size:1rem;">
                            ${slider.button_text} <i class="fas fa-arrow-right"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');

        dots.innerHTML = sliders.map((_, i) => `
            <span onclick="window.goToSlide(${i})" style="width:12px;height:12px;border-radius:50%;background:${i === 0 ? '#8B5CF6' : 'rgba(255,255,255,0.3)'};cursor:pointer;transition:all 0.3s ease;"></span>
        `).join('');

        // Slider functions
        let currentSlide = 0;
        const totalSlides = sliders.length;

        function goToSlide(index) {
            currentSlide = index;
            wrapper.style.transform = `translateX(-${index * 100}%)`;
            document.querySelectorAll('#sliderDots span').forEach((dot, i) => {
                dot.style.background = i === index ? '#8B5CF6' : 'rgba(255,255,255,0.3)';
            });
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % totalSlides);
        }

        function prevSlide() {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }

        window.goToSlide = goToSlide;
        window.nextSlide = nextSlide;
        window.prevSlide = prevSlide;

        // Auto-play with pause on hover
        if (window.sliderInterval) clearInterval(window.sliderInterval);
        window.sliderInterval = setInterval(nextSlide, 5000);

        if (container) {
            container.addEventListener('mouseenter', () => {
                clearInterval(window.sliderInterval);
            });
            container.addEventListener('mouseleave', () => {
                window.sliderInterval = setInterval(nextSlide, 5000);
            });
        }

    } catch (error) {
        console.error('Error loading sliders:', error);
        wrapper.innerHTML = `
            <div style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1A1A2E,#16213E);">
                <div style="text-align:center;padding:20px;">
                    <h1 style="font-size:2.5rem;color:#8B5CF6;font-family:'Playfair Display',serif;">রূপকথা</h1>
                    <p style="color:var(--text-secondary);">আপনার সৌন্দর্যের গল্প শুরু হোক</p>
                </div>
            </div>
        `;
        dots.innerHTML = '';
    }
}

// =============================================
// 6. LOAD OFFERS
// =============================================
async function loadOffers() {
    const container = document.getElementById('offersGrid');
    if (!container) return;

    try {
        const offers = await getOffers();
        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;grid-column:1/-1;color:var(--text-secondary);">
                    <i class="fas fa-tags" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                    <p>কোনো অফার নেই</p>
                </div>
            `;
            return;
        }

        container.innerHTML = offers.map(offer => `
            <div style="background:var(--dark-card);border:1px solid var(--dark-border);border-radius:var(--radius);padding:24px;text-align:center;transition:all 0.3s ease;">
                ${offer.image_url ? `<img src="${offer.image_url}" alt="${offer.title}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:16px;" onerror="this.style.display='none';" />` : ''}
                <span style="display:inline-block;background:linear-gradient(135deg,#EF4444,#DC2626);color:white;padding:4px 16px;border-radius:50px;font-size:14px;font-weight:600;margin-bottom:12px;">
                    ${offer.discount_percent}% অফ!
                </span>
                <h3 style="margin-bottom:8px;">${offer.title}</h3>
                <p style="color:var(--text-secondary);font-size:14px;">${offer.description || ''}</p>
                ${offer.expires_at ? `<p style="color:var(--text-secondary);font-size:12px;margin-top:8px;">⏳ ${new Date(offer.expires_at).toLocaleDateString('bn-BD')} পর্যন্ত</p>` : ''}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading offers:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;grid-column:1/-1;color:#EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                <p>অফার লোড করতে ব্যর্থ!</p>
            </div>
        `;
    }
}

// =============================================
// 7. LOAD BANNERS (Animated Full-Width)
// =============================================
async function loadBanners() {
    const container = document.getElementById('bannerContainer');
    if (!container) return;

    try {
        const banners = await getBanners('home');
        if (!banners || banners.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                    <p>কোনো ব্যানার নেই</p>
                </div>
            `;
            return;
        }

        container.innerHTML = banners.map((banner, index) => {
            const isEven = index % 2 === 0;
            const delay = index * 0.15;
            
            return `
                <div class="banner-item" style="
                    display: flex;
                    flex-direction: ${isEven ? 'row' : 'row-reverse'};
                    align-items: center;
                    gap: 40px;
                    background: linear-gradient(135deg, #1A1A2E, #16213E);
                    border-radius: var(--radius);
                    overflow: hidden;
                    border: 1px solid var(--dark-border);
                    min-height: 250px;
                    opacity: 0;
                    transform: translateY(30px);
                    animation: bannerFadeIn 0.8s ease forwards;
                    animation-delay: ${delay}s;
                ">
                    <div style="flex:1;min-height:200px;background:var(--dark-card);position:relative;overflow:hidden;">
                        ${banner.image_url ? `
                            <img src="${banner.image_url}" 
                                 alt="${banner.title}" 
                                 style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease;"
                                 onmouseover="this.style.transform='scale(1.05)'"
                                 onmouseout="this.style.transform='scale(1)'"
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);\\'><i class=\\'fas fa-image\\' style=\\'font-size:3rem;\\'></i></div>'"
                            />
                        ` : `
                            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">
                                <i class="fas fa-image" style="font-size:3rem;"></i>
                            </div>
                        `}
                    </div>
                    <div style="flex:1;padding:30px 40px 30px ${isEven ? '0' : '40px'};text-align:${isEven ? 'left' : 'right'};">
                        <span style="display:inline-block;background:rgba(139,92,246,0.15);color:var(--primary);padding:4px 16px;border-radius:50px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;opacity:0;animation:slideUp 0.6s ease forwards;animation-delay:${delay + 0.2}s;">
                            ${banner.subtitle || 'বিশেষ অফার'}
                        </span>
                        <h3 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:12px;opacity:0;animation:slideUp 0.6s ease forwards;animation-delay:${delay + 0.3}s;">
                            ${banner.title}
                        </h3>
                        <p style="color:var(--text-secondary);font-size:1rem;line-height:1.6;margin-bottom:20px;max-width:90%;margin-${isEven ? 'right' : 'left'}:auto;opacity:0;animation:slideUp 0.6s ease forwards;animation-delay:${delay + 0.4}s;">
                            ${banner.description || 'আমাদের বিশেষ অফারটি মিস করবেন না!'}
                        </p>
                        ${banner.button_text && banner.button_link ? `
                            <a href="${banner.button_link}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;border-radius:50px;text-decoration:none;font-weight:600;transition:all 0.3s ease;opacity:0;animation:slideUp 0.6s ease forwards;animation-delay:${delay + 0.5}s;"
                               onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(139,92,246,0.4)'"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                ${banner.button_text} <i class="fas fa-arrow-right"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading banners:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
                <p>ব্যানার লোড করতে ব্যর্থ!</p>
            </div>
        `;
    }
}

// =============================================
// 8. SETUP EVENT LISTENERS
// =============================================
function setupEventListeners(user) {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input[type="email"]');
            const email = input?.value.trim();
            
            if (!email) {
                showToast('দয়া করে একটি ইমেইল দিন!', 'error');
                return;
            }
            
            try {
                const { error } = await supabase
                    .from('subscribers')
                    .insert({ email });
                
                if (error) {
                    if (error.code === '23505') {
                        showToast('এই ইমেইল ইতিমধ্যে সাবস্ক্রাইব করা আছে!', 'error');
                    } else {
                        throw error;
                    }
                    return;
                }
                
                showToast('🎉 সাবস্ক্রাইব করার জন্য ধন্যবাদ!', 'success');
                e.target.reset();
                
            } catch (error) {
                console.error('Newsletter error:', error);
                showToast('সাবস্ক্রাইব করতে ব্যর্থ! আবার চেষ্টা করুন।', 'error');
            }
        });
    }
    
    const cartNav = document.getElementById('cartNav');
    if (cartNav) {
        cartNav.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const cart = await getCartItemsDB();
                if (!cart || cart.length === 0) {
                    showToast('🛒 কার্ট খালি! প্রোডাক্ট যোগ করুন', 'error');
                } else {
                    window.location.href = 'cart.html';
                }
            } catch (error) {
                console.error('Error checking cart:', error);
                showToast('কার্ট চেক করতে সমস্যা!', 'error');
            }
        });
    }
}

// =============================================
// 9. TOAST NOTIFICATION
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
// 10. EXPORT TOAST
// =============================================
export { showToast };

// =============================================
// 11. MAKE FUNCTIONS GLOBALLY AVAILABLE
// =============================================
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.showToast = showToast;

// =============================================
// 12. START APP
// =============================================
document.addEventListener('DOMContentLoaded', init);