// Cart Module - Complete with Promo Code Engine, Savings Calculator, and Stock Guards
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.appliedCoupon = this.loadCoupon();
        this.init();
    }

    init() {
        this.updateCartCount();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Load applied coupon from localStorage
    loadCoupon() {
        try {
            return JSON.parse(localStorage.getItem('appliedCoupon')) || null;
        } catch (e) {
            return null;
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartUI();
    }

    // Save coupon to localStorage
    saveCoupon(couponData) {
        this.appliedCoupon = couponData;
        if (couponData) {
            localStorage.setItem('appliedCoupon', JSON.stringify(couponData));
        } else {
            localStorage.removeItem('appliedCoupon');
        }
        this.updateCartUI();
    }

    // Add item to cart
    async addItem(productId, quantity = 1) {
        try {
            const productsList = await this.loadProducts();
            const product = productsList.find(p => p.id === productId);
            
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }

            // Check stock limit
            const currentStock = product.stock || 50;
            if (currentStock <= 0) {
                this.showNotification(`${product.name} is out of stock!`, 'error');
                return;
            }

            const existingItem = this.items.find(item => item.id === productId);
            
            if (existingItem) {
                if (existingItem.quantity + quantity > currentStock) {
                    this.showNotification(`Only ${currentStock} units available in stock!`, 'error');
                    return;
                }
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.image,
                    category: product.category,
                    quantity: quantity,
                    description: product.description,
                    unit: product.unit || 'unit'
                });
            }
            
            this.saveCart();
            this.showNotification(`${product.name} added to cart!`, 'success');
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    }

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        return this.items;
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
        return this.items;
    }

    // Clear cart
    clear() {
        this.items = [];
        this.appliedCoupon = null;
        localStorage.removeItem('appliedCoupon');
        this.saveCart();
        return this.items;
    }

    // Get cart item count
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calculate coupon discount
    getCouponDiscount() {
        if (!this.appliedCoupon) return 0;
        const subtotal = this.getSubtotal();
        if (subtotal < (this.appliedCoupon.minOrder || 0)) {
            return 0; // Doesn't meet min requirement
        }
        if (this.appliedCoupon.type === 'percentage') {
            return Math.round((subtotal * this.appliedCoupon.value) / 100);
        } else {
            return Math.min(this.appliedCoupon.value, subtotal);
        }
    }

    // Apply Coupon Code
    async applyCoupon(couponCode) {
        if (!couponCode || !couponCode.trim()) {
            this.showNotification('Please enter a coupon code', 'error');
            return false;
        }

        const code = couponCode.trim().toUpperCase();
        const subtotal = this.getSubtotal();

        // 1. Try Backend API
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, totalAmount: subtotal })
            });
            const data = await res.json();
            if (data.success) {
                this.saveCoupon(data.data);
                this.showNotification(data.message, 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Invalid coupon code', 'error');
                return false;
            }
        } catch (err) {
            // Offline fallback coupons
            const fallbackCoupons = {
                'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 200, description: '10% OFF above ₹200' },
                'FRESH20': { code: 'FRESH20', type: 'percentage', value: 20, minOrder: 500, description: '20% OFF above ₹500' },
                'SAVE50': { code: 'SAVE50', type: 'flat', value: 50, minOrder: 300, description: 'Flat ₹50 OFF above ₹300' },
                'FRUITS15': { code: 'FRUITS15', type: 'percentage', value: 15, minOrder: 250, description: '15% OFF above ₹250' }
            };

            const fallback = fallbackCoupons[code];
            if (fallback) {
                if (subtotal < fallback.minOrder) {
                    this.showNotification(`Minimum order amount of ₹${fallback.minOrder} required for ${code}`, 'error');
                    return false;
                }
                const discount = fallback.type === 'percentage' 
                    ? Math.round((subtotal * fallback.value) / 100) 
                    : Math.min(fallback.value, subtotal);
                this.saveCoupon({ ...fallback, discount });
                this.showNotification(`Coupon ${code} applied successfully!`, 'success');
                return true;
            } else {
                this.showNotification(`Coupon code "${code}" is invalid.`, 'error');
                return false;
            }
        }
    }

    // Remove Coupon
    removeCoupon() {
        this.saveCoupon(null);
        this.showNotification('Coupon removed', 'info');
    }

    // Get delivery fee
    getDeliveryFee() {
        const subtotal = this.getSubtotal();
        return subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    }

    // Get tax amount (5% GST)
    getTax() {
        const subtotal = this.getSubtotal();
        const discount = this.getCouponDiscount();
        const taxableAmount = Math.max(0, subtotal - discount);
        return Math.round(taxableAmount * 0.05);
    }

    // Get final grand total
    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getCouponDiscount();
        const deliveryFee = this.getDeliveryFee();
        const tax = this.getTax();
        return Math.max(0, subtotal - discount + deliveryFee + tax);
    }

    // Update cart count in UI
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        const count = this.getItemCount();
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'inline-flex' : 'none';
            }
        });
    }

    // Show notification popup
    showNotification(message, type = 'success') {
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `cart-notification fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl z-50 text-white font-semibold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom ${
            type === 'success' ? 'bg-emerald-600 shadow-emerald-600/30' : 
            type === 'error' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-blue-600 shadow-blue-600/30'
        }`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-base"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getItems() {
        return this.items;
    }

    // Update cart UI
    updateCartUI() {
        if (window.location.pathname.includes('cart.html')) {
            this.loadCartPage();
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            return [];
        }
    }

    // Render cart items & interactive coupon summary
    loadCartPage() {
        const cartItems = document.getElementById('cartItems');
        const subtotalEl = document.getElementById('subtotal');
        const deliveryFeeEl = document.getElementById('deliveryFee');
        const discountRow = document.getElementById('discountRow');
        const discountAmountEl = document.getElementById('discountAmount');
        const taxEl = document.getElementById('tax');
        const totalAmountEl = document.getElementById('totalAmount');
        const couponSection = document.getElementById('couponSection');
        
        if (!cartItems) return;
        
        if (this.isEmpty()) {
            cartItems.innerHTML = `
                <div class="text-center py-12 bg-white rounded-2xl p-8 border border-gray-100">
                    <div class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i class="fas fa-shopping-basket"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">Your cart is empty</h3>
                    <p class="text-xs text-gray-500 mb-4">Add your daily fresh essentials to get started.</p>
                    <a href="shop.html" class="inline-block bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition">
                        Start Shopping
                    </a>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = '₹0';
            if (deliveryFeeEl) deliveryFeeEl.textContent = '₹0';
            if (taxEl) taxEl.textContent = '₹0';
            if (totalAmountEl) totalAmountEl.textContent = '₹0';
            if (discountRow) discountRow.classList.add('hidden');
            return;
        }
        
        cartItems.innerHTML = '';
        
        // Render items
        this.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm';
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-xl bg-gray-50 flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-800 text-xs truncate">${item.name}</h4>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="font-extrabold text-xs text-gray-900">₹${item.price}</span>
                        <span class="text-[11px] text-gray-400">/ ${item.unit || 'unit'}</span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg">-</button>
                            <span class="w-8 text-center text-xs font-bold text-gray-800">${item.quantity}</span>
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg">+</button>
                        </div>
                        <span class="font-bold text-xs text-green-700">₹${(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                </div>
                <button onclick="cart.removeItem(${item.id})" class="text-gray-300 hover:text-red-500 text-xs p-1 transition" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(itemDiv);
        });
        
        // Update price breakdown
        const subtotal = this.getSubtotal();
        const discount = this.getCouponDiscount();
        const deliveryFee = this.getDeliveryFee();
        const tax = this.getTax();
        const total = this.getTotal();
        
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
        if (deliveryFeeEl) {
            deliveryFeeEl.innerHTML = deliveryFee === 0 
                ? '<span class="text-green-600 font-bold">FREE</span> <span class="line-through text-gray-400 text-xs">₹40</span>' 
                : `₹${deliveryFee}`;
        }
        if (taxEl) taxEl.textContent = `₹${tax}`;
        if (totalAmountEl) totalAmountEl.textContent = `₹${total}`;

        // Update Discount Row & Applied Coupon Badge
        if (discountRow && discountAmountEl) {
            if (discount > 0 && this.appliedCoupon) {
                discountRow.classList.remove('hidden');
                discountAmountEl.innerHTML = `-₹${discount} <span class="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded ml-1">${this.appliedCoupon.code}</span>`;
            } else {
                discountRow.classList.add('hidden');
            }
        }

        // Render Coupon Box UI
        if (couponSection) {
            if (this.appliedCoupon && discount > 0) {
                couponSection.innerHTML = `
                    <div class="bg-green-50 border border-green-200 p-3 rounded-2xl flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-tag text-green-600"></i>
                            <div>
                                <p class="text-xs font-bold text-green-800">Coupon "${this.appliedCoupon.code}" Applied</p>
                                <p class="text-[11px] text-green-600">You saved ₹${discount}!</p>
                            </div>
                        </div>
                        <button onclick="cart.removeCoupon()" class="text-xs font-bold text-red-600 hover:underline">Remove</button>
                    </div>
                `;
            } else {
                couponSection.innerHTML = `
                    <div class="space-y-2">
                        <div class="flex gap-2">
                            <input type="text" id="couponCodeInput" placeholder="Enter coupon (e.g. WELCOME10)" class="flex-1 uppercase text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600">
                            <button onclick="applyEnteredCoupon()" class="bg-gray-800 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
                                Apply
                            </button>
                        </div>
                        <!-- Quick Promo Suggestion Chips -->
                        <div class="flex flex-wrap gap-1.5 text-[10px]">
                            <button onclick="quickApplyCoupon('WELCOME10')" class="bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg border border-green-200 hover:bg-green-100">WELCOME10 (10% OFF)</button>
                            <button onclick="quickApplyCoupon('SAVE50')" class="bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg border border-green-200 hover:bg-green-100">SAVE50 (₹50 OFF)</button>
                            <button onclick="quickApplyCoupon('FRESH20')" class="bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg border border-green-200 hover:bg-green-100">FRESH20 (20% OFF)</button>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Proceed to checkout with discount preservation
    proceedToCheckout() {
        if (this.isEmpty()) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        const orderSummary = {
            items: this.items,
            subtotal: this.getSubtotal(),
            discount: this.getCouponDiscount(),
            couponCode: this.appliedCoupon ? this.appliedCoupon.code : null,
            deliveryFee: this.getDeliveryFee(),
            tax: this.getTax(),
            total: this.getTotal(),
            date: new Date().toISOString()
        };
        
        localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        window.location.href = 'checkout.html';
    }
}

// Global cart instance
const cart = new Cart();

// Helper for UI coupon application
async function applyEnteredCoupon() {
    const input = document.getElementById('couponCodeInput');
    if (!input) return;
    await cart.applyCoupon(input.value);
}

async function quickApplyCoupon(code) {
    await cart.applyCoupon(code);
}

if (typeof module !== 'undefined') {
    module.exports = Cart;
}