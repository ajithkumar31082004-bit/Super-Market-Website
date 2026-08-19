// Products Module - Full Featured with Stock Badges, Quick View Modal, Reviews, & Filtering
class Products {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentFilter = {
            category: 'All',
            search: '',
            minPrice: 0,
            maxPrice: 1000,
            rating: 0,
            inStockOnly: false,
            sortBy: 'popular'
        };
        this.loadProducts();
    }

    // Load products from JSON or backend API
    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.products = data.products || [];
            this.categories = data.categories || this.extractCategories();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getSampleProducts();
            this.categories = this.extractCategories();
            return this.products;
        }
    }

    // Get all products
    async getAllProducts() {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products;
    }

    // Get product by ID
    async getProductById(id) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products.find(product => product.id == id);
    }

    // Get products by category
    async getProductsByCategory(category) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        if (!category || category === 'All') return this.products;
        return this.products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }

    // Get featured products
    async getFeaturedProducts(limit = 8) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products
            .filter(product => product.featured)
            .slice(0, limit);
    }

    // Get products on sale
    async getProductsOnSale(limit = 8) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        return this.products
            .filter(product => product.discount > 0)
            .slice(0, limit);
    }

    // Search products
    async searchProducts(query) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        if (!query || !query.trim()) return this.products;
        
        const searchTerm = query.toLowerCase().trim();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            product.category.toLowerCase().includes(searchTerm) ||
            (product.tags && product.tags.some(t => t.toLowerCase().includes(searchTerm)))
        );
    }

    // AI Smart Search using Gemini or backend
    async aiSmartSearch(query) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }

        try {
            const response = await fetch('/api/ai/smart-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, products: this.products })
            });
            const data = await response.json();
            if (data.success && Array.isArray(data.matchedIds) && data.matchedIds.length > 0) {
                return this.products.filter(p => data.matchedIds.includes(p.id));
            }
        } catch (error) {
            console.warn('AI Smart Search fallback to standard search:', error);
        }

        return this.searchProducts(query);
    }

    // Filter and sort products
    async applyFilters(filterOptions = {}) {
        this.currentFilter = { ...this.currentFilter, ...filterOptions };
        let result = await this.getAllProducts();

        // 1. Search filter
        if (this.currentFilter.search && this.currentFilter.search.trim()) {
            const term = this.currentFilter.search.toLowerCase().trim();
            result = result.filter(p => 
                p.name.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                p.category.toLowerCase().includes(term) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
            );
        }

        // 2. Category filter
        if (this.currentFilter.category && this.currentFilter.category !== 'All') {
            result = result.filter(p => p.category.toLowerCase() === this.currentFilter.category.toLowerCase());
        }

        // 3. Price filter
        if (this.currentFilter.maxPrice !== undefined) {
            result = result.filter(p => p.price <= this.currentFilter.maxPrice);
        }

        // 4. Rating filter
        if (this.currentFilter.rating && this.currentFilter.rating > 0) {
            result = result.filter(p => (p.rating || 0) >= this.currentFilter.rating);
        }

        // 5. In Stock Only
        if (this.currentFilter.inStockOnly) {
            result = result.filter(p => (p.stock || 0) > 0);
        }

        // 6. Sorting
        return this.sortProducts(result, this.currentFilter.sortBy);
    }

    // Sort products
    sortProducts(products, sortBy = 'popular') {
        const sorted = [...products];
        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'discount':
                return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            default: // popular
                return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
    }

    // Helper: generate stock badge HTML
    getStockBadge(stock) {
        if (stock === 0) {
            return `<span class="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
            </span>`;
        } else if (stock <= 10) {
            return `<span class="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Only ${stock} Left!
            </span>`;
        } else {
            return `<span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock (${stock})
            </span>`;
        }
    }

    // Render products on shop page or any container
    async renderProducts(containerId, productsToRender = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let productsList = productsToRender;
        if (!productsList) {
            productsList = await this.getAllProducts();
        }
        
        container.innerHTML = '';
        
        if (productsList.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <div class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">No matching products found</h3>
                    <p class="text-gray-500 text-sm mb-6">Try clearing some filters or searching for something else.</p>
                    <button onclick="resetAllFilters()" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition">
                        Reset Filters
                    </button>
                </div>
            `;
            return;
        }
        
        productsList.forEach(product => {
            const isOutOfStock = (product.stock || 0) === 0;
            const productCard = document.createElement('div');
            productCard.className = `product-card group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`;
            
            productCard.innerHTML = `
                <div class="relative overflow-hidden bg-gray-50 aspect-square">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';">
                    
                    <!-- Badges -->
                    <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        ${product.discount ? `
                            <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                                -${product.discount}% OFF
                            </span>
                        ` : ''}
                        ${product.featured ? `
                            <span class="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                <i class="fas fa-star text-[10px]"></i> Featured
                            </span>
                        ` : ''}
                    </div>

                    <!-- Quick View Overlay Action Button -->
                    <button onclick="openProductQuickView(${product.id})" 
                            class="quick-view-btn absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 hover:text-green-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-2 border border-gray-200 z-10 transition">
                        <i class="fas fa-eye text-green-600"></i> Quick View
                    </button>

                    <!-- Wishlist Button -->
                    <button onclick="toggleProductWishlist(${product.id}, this)" 
                            class="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-md transition z-10"
                            title="Add to Wishlist">
                        <i class="fas fa-heart text-sm"></i>
                    </button>
                </div>

                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-xs font-semibold text-green-700 uppercase tracking-wider">${product.category}</span>
                            ${this.getStockBadge(product.stock || 0)}
                        </div>

                        <h3 class="font-bold text-gray-800 text-base mb-1 group-hover:text-green-600 transition cursor-pointer" onclick="openProductQuickView(${product.id})">
                            ${product.name}
                        </h3>

                        <p class="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">${product.description || ''}</p>
                    </div>

                    <div>
                        <!-- Rating -->
                        <div class="flex items-center gap-2 mb-3">
                            <div class="flex text-amber-400 text-xs">
                                ${Array.from({length: 5}).map((_, i) => `
                                    <i class="fas fa-star ${i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-gray-200'}"></i>
                                `).join('')}
                            </div>
                            <span class="text-xs font-medium text-gray-500">(${product.rating || 4.5} · ${product.reviews || 12} reviews)</span>
                        </div>

                        <!-- Pricing & Action -->
                        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-xl font-extrabold text-gray-900">₹${product.price}</span>
                                    ${product.originalPrice ? `
                                        <span class="text-xs text-gray-400 line-through">₹${product.originalPrice}</span>
                                    ` : ''}
                                </div>
                                <span class="text-[11px] text-gray-400">per ${product.unit || 'unit'}</span>
                            </div>

                            ${isOutOfStock ? `
                                <button disabled class="bg-gray-100 text-gray-400 px-3.5 py-2 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1.5">
                                    <i class="fas fa-ban"></i> Out of Stock
                                </button>
                            ` : `
                                <button onclick="addToCart(${product.id})" 
                                        class="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                                    <i class="fas fa-plus"></i> Add
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });
    }

    // Get sample products (fallback)
    getSampleProducts() {
        return [
            {
                id: 1,
                name: 'Organic Himachal Apples',
                category: 'Fruits',
                price: 120,
                originalPrice: 140,
                discount: 14,
                stock: 45,
                unit: 'kg',
                rating: 4.5,
                reviews: 124,
                description: 'Crisp and juicy organic apples directly from Himachal Pradesh orchards.',
                image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
                featured: true
            }
        ];
    }
}

// Global products instance
const products = new Products();

// Add to Cart helper
async function addToCart(productId, qty = 1) {
    if (typeof cart !== 'undefined' && cart.addItem) {
        await cart.addItem(productId, qty);
    } else {
        // Fallback cart storage
        let storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const p = await products.getProductById(productId);
        if (!p) return;
        const existing = storedCart.find(item => item.id == productId);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + qty;
        } else {
            storedCart.push({ ...p, quantity: qty });
        }
        localStorage.setItem('cart', JSON.stringify(storedCart));
        if (typeof updateCartCount === 'function') updateCartCount();
        if (typeof showNotification === 'function') {
            showNotification(`Added ${p.name} to cart!`, 'success');
        } else {
            alert(`Added ${p.name} to cart!`);
        }
    }
}

// Toggle Wishlist helper
function toggleProductWishlist(productId, btnElement) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        if (btnElement) {
            btnElement.classList.remove('text-red-500');
            btnElement.classList.add('text-gray-400');
        }
        if (typeof showNotification === 'function') showNotification('Removed from Wishlist', 'info');
    } else {
        wishlist.push(productId);
        if (btnElement) {
            btnElement.classList.add('text-red-500');
            btnElement.classList.remove('text-gray-400');
        }
        if (typeof showNotification === 'function') showNotification('Added to Wishlist! ❤️', 'success');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Quick View / Product Detail Modal
let currentQuickViewQty = 1;
let currentQuickViewProductId = null;

async function openProductQuickView(productId) {
    const product = await products.getProductById(productId);
    if (!product) return;

    currentQuickViewProductId = productId;
    currentQuickViewQty = 1;

    let modal = document.getElementById('productQuickViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productQuickViewModal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300';
        document.body.appendChild(modal);
    }

    const isOutOfStock = (product.stock || 0) === 0;

    modal.innerHTML = `
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
            <!-- Close Button -->
            <button onclick="closeProductQuickView()" class="absolute top-4 right-4 z-20 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition">
                <i class="fas fa-times text-lg"></i>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2">
                <!-- Product Image Section -->
                <div class="bg-gray-50 p-6 flex flex-col justify-center items-center relative">
                    <img id="quickViewMainImg" src="${product.image}" alt="${product.name}" class="w-full h-72 object-cover rounded-2xl shadow-sm" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';">
                    ${product.discount ? `
                        <div class="absolute top-8 left-8 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                            -${product.discount}% OFF
                        </div>
                    ` : ''}
                </div>

                <!-- Product Details Section -->
                <div class="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">${product.category}</span>
                            ${products.getStockBadge(product.stock || 0)}
                        </div>

                        <h2 class="text-2xl font-black text-gray-900 mb-2">${product.name}</h2>

                        <!-- Rating summary -->
                        <div class="flex items-center gap-2 mb-4">
                            <div class="flex text-amber-400 text-sm">
                                ${Array.from({length: 5}).map((_, i) => `
                                    <i class="fas fa-star ${i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-gray-200'}"></i>
                                `).join('')}
                            </div>
                            <span class="text-sm font-semibold text-gray-700">${product.rating || 4.5}</span>
                            <span class="text-xs text-gray-400">(${product.reviews || 10} verified reviews)</span>
                        </div>

                        <!-- Price -->
                        <div class="flex items-baseline gap-2 mb-4">
                            <span class="text-3xl font-black text-gray-900">₹${product.price}</span>
                            ${product.originalPrice ? `
                                <span class="text-sm text-gray-400 line-through">₹${product.originalPrice}</span>
                                <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Save ₹${product.originalPrice - product.price}</span>
                            ` : ''}
                            <span class="text-xs text-gray-500">/ ${product.unit || 'unit'}</span>
                        </div>

                        <p class="text-gray-600 text-sm mb-6 leading-relaxed">${product.description || 'Premium quality fresh groceries sourced responsibly with doorstep fast delivery.'}</p>

                        <!-- Key Highlights -->
                        <div class="grid grid-cols-2 gap-2 mb-6">
                            <div class="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2 text-xs text-gray-600">
                                <i class="fas fa-leaf text-green-600"></i> 100% Fresh & Authentic
                            </div>
                            <div class="bg-gray-50 p-2.5 rounded-xl flex items-center gap-2 text-xs text-gray-600">
                                <i class="fas fa-truck-fast text-green-600"></i> Express 30m Delivery
                            </div>
                        </div>
                    </div>

                    <!-- Quantity & Action Buttons -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <span class="text-xs font-bold text-gray-700">Quantity:</span>
                            <div class="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                                <button onclick="adjustQuickViewQty(-1)" class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold">-</button>
                                <span id="quickViewQtyVal" class="w-10 text-center font-bold text-sm text-gray-800">1</span>
                                <button onclick="adjustQuickViewQty(1)" class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold">+</button>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            ${isOutOfStock ? `
                                <button disabled class="flex-1 bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed">
                                    Item Currently Out of Stock
                                </button>
                            ` : `
                                <button onclick="submitQuickViewAddToCart()" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-green-600/30 active:scale-95 transition flex items-center justify-center gap-2">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                            `}
                            <button onclick="toggleProductWishlist(${product.id}); closeProductQuickView();" class="px-4 py-3.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-500 rounded-2xl font-bold transition flex items-center justify-center" title="Wishlist">
                                <i class="fas fa-heart text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customer Reviews Section -->
            <div class="border-t border-gray-100 p-6 md:p-8 bg-gray-50/50 rounded-b-3xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <i class="fas fa-star text-amber-400"></i> Customer Reviews & Ratings
                    </h3>
                    <button onclick="toggleReviewForm()" class="text-xs font-bold text-green-700 hover:underline flex items-center gap-1">
                        <i class="fas fa-pen"></i> Write a Review
                    </button>
                </div>

                <!-- Write Review Form (hidden by default) -->
                <div id="quickViewReviewForm" class="hidden bg-white p-4 rounded-2xl border border-gray-200 mb-4 space-y-3">
                    <h4 class="text-sm font-bold text-gray-800">Share your experience with this item:</h4>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 font-semibold">Your Rating:</span>
                        <div class="flex gap-1 text-lg text-gray-300 cursor-pointer" id="ratingStarPicker">
                            <i class="fas fa-star hover:text-amber-400 transition" onclick="setQuickViewRating(1)"></i>
                            <i class="fas fa-star hover:text-amber-400 transition" onclick="setQuickViewRating(2)"></i>
                            <i class="fas fa-star hover:text-amber-400 transition" onclick="setQuickViewRating(3)"></i>
                            <i class="fas fa-star hover:text-amber-400 transition" onclick="setQuickViewRating(4)"></i>
                            <i class="fas fa-star hover:text-amber-400 transition" onclick="setQuickViewRating(5)"></i>
                        </div>
                        <input type="hidden" id="selectedStarRating" value="5">
                    </div>
                    <textarea id="reviewCommentInput" rows="2" placeholder="Write a short review..." class="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"></textarea>
                    <div class="flex justify-end gap-2">
                        <button onclick="toggleReviewForm()" class="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                        <button onclick="submitProductReview(${product.id})" class="text-xs bg-green-600 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-green-700">Submit Review</button>
                    </div>
                </div>

                <!-- Reviews Feed -->
                <div id="productReviewsContainer" class="space-y-2.5">
                    <div class="bg-white p-3.5 rounded-xl border border-gray-100">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-gray-800">Priya Sharma <span class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-normal">Verified Buyer</span></span>
                            <div class="flex text-amber-400 text-xs">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-600">Super fresh and delivered promptly in pristine packaging!</p>
                    </div>
                    <div class="bg-white p-3.5 rounded-xl border border-gray-100">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs font-bold text-gray-800">Rahul Verma <span class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-normal">Verified Buyer</span></span>
                            <div class="flex text-amber-400 text-xs">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                        <p class="text-xs text-gray-600">Great quality and authentic taste. Ordering regularly now.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeProductQuickView() {
    const modal = document.getElementById('productQuickViewModal');
    if (modal) modal.classList.add('hidden');
}

function adjustQuickViewQty(delta) {
    currentQuickViewQty = Math.max(1, currentQuickViewQty + delta);
    const qtyVal = document.getElementById('quickViewQtyVal');
    if (qtyVal) qtyVal.innerText = currentQuickViewQty;
}

async function submitQuickViewAddToCart() {
    if (!currentQuickViewProductId) return;
    await addToCart(currentQuickViewProductId, currentQuickViewQty);
    closeProductQuickView();
}

function toggleReviewForm() {
    const form = document.getElementById('quickViewReviewForm');
    if (form) form.classList.toggle('hidden');
}

function setQuickViewRating(val) {
    const ratingInput = document.getElementById('selectedStarRating');
    if (ratingInput) ratingInput.value = val;
    const stars = document.querySelectorAll('#ratingStarPicker i');
    stars.forEach((star, index) => {
        if (index < val) {
            star.className = 'fas fa-star text-amber-400';
        } else {
            star.className = 'fas fa-star text-gray-300';
        }
    });
}

async function submitProductReview(productId) {
    const rating = document.getElementById('selectedStarRating')?.value || 5;
    const comment = document.getElementById('reviewCommentInput')?.value || '';
    if (!comment.trim()) {
        alert('Please enter your review comments.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userName = user.name || 'Verified Customer';

    try {
        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, userName, rating, comment })
        });
    } catch (e) {
        console.warn('Backend review sync skipped:', e);
    }

    // Add directly to feed
    const container = document.getElementById('productReviewsContainer');
    if (container) {
        const reviewEl = document.createElement('div');
        reviewEl.className = 'bg-white p-3.5 rounded-xl border border-green-200 animate-in fade-in';
        reviewEl.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-gray-800">${userName} <span class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-normal">Just now</span></span>
                <div class="flex text-amber-400 text-xs">
                    ${Array.from({length: 5}).map((_, i) => `<i class="fas fa-star ${i < rating ? 'text-amber-400' : 'text-gray-300'}"></i>`).join('')}
                </div>
            </div>
            <p class="text-xs text-gray-700">${comment.trim()}</p>
        `;
        container.prepend(reviewEl);
    }

    toggleReviewForm();
    alert('Thank you for submitting your review!');
}

// Global filter reset helper
function resetAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const priceRange = document.getElementById('priceRange');
    const sortSelect = document.getElementById('sortSelect');
    const inStockToggle = document.getElementById('inStockFilter');
    const ratingFilters = document.querySelectorAll('.rating-filter-checkbox');

    if (searchInput) searchInput.value = '';
    if (priceRange) {
        priceRange.value = 1000;
        const priceVal = document.getElementById('priceValue');
        if (priceVal) priceVal.innerText = '₹1000';
    }
    if (sortSelect) sortSelect.value = 'popular';
    if (inStockToggle) inStockToggle.checked = false;
    ratingFilters.forEach(rf => rf.checked = false);

    // Reset active category buttons
    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
        if (btn.dataset.category === 'All') {
            btn.className = 'cat-pill-btn w-full text-left px-3 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white flex justify-between items-center transition';
        } else {
            btn.className = 'cat-pill-btn w-full text-left px-3 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 flex justify-between items-center transition';
        }
    });

    if (typeof applyFilters === 'function') applyFilters();
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Products;
}