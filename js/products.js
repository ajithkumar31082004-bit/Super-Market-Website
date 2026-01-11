// Products Module
class Products {
    constructor() {
        this.products = [];
        this.categories = [];
        this.loadProducts();
    }

    // Load products from JSON file
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
        return this.products.filter(product => product.category === category);
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
        
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // Filter products
    async filterProducts(filters) {
        if (this.products.length === 0) {
            await this.loadProducts();
        }
        
        let filtered = [...this.products];
        
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }
        
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(product => product.price >= filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(product => product.price <= filters.maxPrice);
        }
        
        if (filters.rating) {
            filtered = filtered.filter(product => product.rating >= filters.rating);
        }
        
        if (filters.inStock) {
            filtered = filtered.filter(product => product.stock > 0);
        }
        
        if (filters.featured) {
            filtered = filtered.filter(product => product.featured);
        }
        
        return filtered;
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
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default: // popular
                return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
    }

    // Get all categories
    async getCategories() {
        if (this.categories.length === 0) {
            await this.loadProducts();
        }
        return this.categories;
    }

    // Extract categories from products
    extractCategories() {
        const categories = [...new Set(this.products.map(p => p.category))];
        return categories.map(category => ({
            name: category,
            count: this.products.filter(p => p.category === category).length,
            image: this.getCategoryImage(category)
        }));
    }

    // Get category image
    getCategoryImage(category) {
        const categoryImages = {
            'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
            'Vegetables': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
            'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
            'Beverages': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
            'Snacks': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
            'Meat': 'https://images.unsplash.com/photo-1604503468508-5e5e7d5b5b1a?w=400',
            'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
            'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            'Pulses': 'https://images.unsplash.com/photo-1596040033221-a1f4f8a7c8a6?w=400',
            'Seafood': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
            'Cooking': 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=400',
            'Groceries': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
        };
        
        return categoryImages[category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
    }

    // Update product stock
    updateStock(productId, quantity) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            product.stock -= quantity;
            // In real app, update in database
            return true;
        }
        return false;
    }

    // Get similar products
    async getSimilarProducts(productId, limit = 4) {
        const product = await this.getProductById(productId);
        if (!product) return [];
        
        return this.products
            .filter(p => p.id != productId && p.category === product.category)
            .slice(0, limit);
    }

    // Get sample products (fallback)
    getSampleProducts() {
        return [
            {
                id: 1,
                name: 'Organic Apples',
                category: 'Fruits',
                price: 120,
                originalPrice: 140,
                discount: 14,
                stock: 45,
                rating: 4.5,
                description: 'Fresh organic apples from Himachal Pradesh orchards, rich in vitamins and antioxidants.',
                image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
                featured: true,
                popularity: 95,
                unit: 'kg'
            },
            {
                id: 2,
                name: 'Fresh Cow Milk',
                category: 'Dairy',
                price: 60,
                stock: 120,
                rating: 4.7,
                description: 'Pure pasteurized cow milk, rich in calcium and vitamins.',
                image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
                featured: true,
                popularity: 92,
                unit: 'liter'
            },
            {
                id: 3,
                name: 'Brown Bread',
                category: 'Bakery',
                price: 40,
                stock: 75,
                rating: 4.3,
                description: 'Whole wheat brown bread, perfect for sandwiches and toast.',
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
                featured: true,
                popularity: 88,
                unit: 'pack'
            }
        ];
    }

    // Render products on shop page
    async renderProducts(containerId, productsToRender = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<div class="text-center py-8"><div class="spinner"></div><p>Loading products...</p></div>';
        
        let products = productsToRender;
        if (!products) {
            products = await this.getAllProducts();
        }
        
        container.innerHTML = '';
        
        if (products.length === 0) {
            container.innerHTML = '<div class="text-center py-12 text-gray-500">No products found</div>';
            return;
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition';
            productCard.innerHTML = `
                <div class="relative">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="w-full h-48 object-cover">
                    ${product.discount ? `
                        <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm">
                            -${product.discount}% OFF
                        </div>
                    ` : ''}
                    ${product.featured ? `
                        <div class="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                            <i class="fas fa-star mr-1"></i>Featured
                        </div>
                    ` : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                    <p class="text-gray-600 text-sm mb-3 truncate">${product.description || ''}</p>
                    <div class="flex items-center mb-3">
                        ${Array.from({length: 5}).map((_, i) => `
                            <i class="fas fa-star ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} text-sm"></i>
                        `).join('')}
                        <span class="text-sm text-gray-500 ml-2">(${product.reviews || 0})</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex items-center">
                                <span class="text-green-600 font-bold text-xl">₹${product.price}</span>
                                ${product.originalPrice ? `
                                    <span class="text-gray-500 line-through text-sm ml-2">₹${product.originalPrice}</span>
                                ` : ''}
                            </div>
                            <div class="text-sm text-gray-500">${product.unit || 'piece'}</div>
                        </div>
                        <button onclick="addToCart(${product.id})" 
                                class="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-200">
                            <i class="fas fa-cart-plus mr-2"></i>Add
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });
    }
}

// Create global products instance
const products = new Products();

// Global addToCart function for inline onclick
async function addToCart(productId) {
    await cart.addItem(productId, 1);
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Products;
}