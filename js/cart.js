// Cart Module
class Cart {
    constructor() {
        this.items = this.loadCart();
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

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartUI();
    }

    // Add item to cart
    async addItem(productId, quantity = 1) {
        try {
            // Load product data
            const products = await this.loadProducts();
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }

            const existingItem = this.items.find(item => item.id === productId);
            
            if (existingItem) {
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
                    unit: product.unit || 'piece'
                });
            }
            
            this.saveCart();
            this.showNotification(`${product.name} added to cart!`);
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

    // Get cart total (with tax and delivery)
    getTotal() {
        const subtotal = this.getSubtotal();
        const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
        const tax = subtotal * 0.05; // 5% GST
        return subtotal + deliveryFee + tax;
    }

    // Get delivery fee
    getDeliveryFee() {
        const subtotal = this.getSubtotal();
        return subtotal > 500 ? 0 : 40;
    }

    // Get tax amount
    getTax() {
        return this.getSubtotal() * 0.05;
    }

    // Update cart count in UI
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        const count = this.getItemCount();
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'block' : 'none';
            }
        });
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `cart-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Check if cart is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get cart items
    getItems() {
        return this.items;
    }

    // Calculate savings
    getSavings() {
        return this.items.reduce((total, item) => {
            if (item.originalPrice) {
                return total + ((item.originalPrice - item.price) * item.quantity);
            }
            return total;
        }, 0);
    }

    // Update cart UI on page
    updateCartUI() {
        // Update cart page if exists
        if (window.location.pathname.includes('cart.html')) {
            this.loadCartPage();
        }
        
        // Update cart sidebar if exists
        this.updateCartSidebar();
    }

    // Load products data
    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    // Load cart page
    loadCartPage() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const itemCount = document.getElementById('itemCount');
        const subtotalEl = document.getElementById('subtotal');
        const deliveryFeeEl = document.getElementById('deliveryFee');
        const taxEl = document.getElementById('tax');
        const totalAmountEl = document.getElementById('totalAmount');
        
        if (!cartItems) return;
        
        if (this.isEmpty()) {
            if (emptyCart) emptyCart.style.display = 'block';
            cartItems.innerHTML = '<div class="text-center py-12">Cart is empty</div>';
            
            // Update summary
            if (itemCount) itemCount.textContent = '0 items';
            if (subtotalEl) subtotalEl.textContent = '₹0';
            if (deliveryFeeEl) deliveryFeeEl.textContent = '₹0';
            if (taxEl) taxEl.textContent = '₹0';
            if (totalAmountEl) totalAmountEl.textContent = '₹0';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        
        // Clear existing items
        cartItems.innerHTML = '';
        
        let subtotal = 0;
        
        // Render cart items
        this.items.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-start border-b pb-6 mb-6';
            itemDiv.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100'}" 
                     alt="${item.name}" 
                     class="w-24 h-24 object-cover rounded-lg mr-4">
                <div class="flex-grow">
                    <div class="flex justify-between">
                        <div>
                            <h3 class="font-semibold text-lg mb-1">${item.name}</h3>
                            <p class="text-gray-600 text-sm mb-2">${item.description || ''}</p>
                            <div class="text-gray-700">
                                <span class="font-semibold">₹${item.price}</span>
                                ${item.originalPrice ? `
                                    <span class="text-gray-500 line-through text-sm ml-2">₹${item.originalPrice}</span>
                                ` : ''}
                                <span class="text-gray-500 text-sm ml-2">(${item.unit})</span>
                            </div>
                        </div>
                        <button onclick="cart.removeItem(${item.id})" 
                                class="text-red-600 hover:text-red-800 ml-4">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                        <div class="flex items-center border rounded-lg overflow-hidden">
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})" 
                                    class="px-3 py-1 hover:bg-gray-100">-</button>
                            <span class="px-4 py-1 min-w-[40px] text-center">${item.quantity}</span>
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})" 
                                    class="px-3 py-1 hover:bg-gray-100">+</button>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-lg">₹${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
            cartItems.appendChild(itemDiv);
        });
        
        // Update summary
        const deliveryFee = this.getDeliveryFee();
        const tax = this.getTax();
        const total = this.getTotal();
        
        if (itemCount) itemCount.textContent = `${this.items.length} item${this.items.length !== 1 ? 's' : ''}`;
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (deliveryFeeEl) deliveryFeeEl.textContent = `₹${deliveryFee.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
        if (totalAmountEl) totalAmountEl.textContent = `₹${total.toFixed(2)}`;
    }

    // Update cart sidebar
    updateCartSidebar() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartItems = document.getElementById('cartSidebarItems');
        const cartTotal = document.getElementById('cartSidebarTotal');
        
        if (!cartSidebar || !cartItems) return;
        
        if (this.isEmpty()) {
            cartItems.innerHTML = '<div class="text-center py-8 text-gray-500">Your cart is empty</div>';
            if (cartTotal) cartTotal.textContent = '₹0';
            return;
        }
        
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        this.items.forEach(item => {
            subtotal += item.price * item.quantity;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center border-b py-4';
            itemDiv.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/60'}" 
                     alt="${item.name}" 
                     class="w-16 h-16 object-cover rounded mr-3">
                <div class="flex-grow">
                    <h4 class="font-semibold text-sm">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex items-center">
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})" 
                                    class="px-2 text-sm">-</button>
                            <span class="mx-2 text-sm">${item.quantity}</span>
                            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})" 
                                    class="px-2 text-sm">+</button>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-sm">₹${(item.price * item.quantity).toFixed(2)}</span>
                            <button onclick="cart.removeItem(${item.id})" 
                                    class="ml-3 text-red-600 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItems.appendChild(itemDiv);
        });
        
        if (cartTotal) {
            const total = this.getTotal();
            cartTotal.textContent = `₹${total.toFixed(2)}`;
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.isEmpty()) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Save order summary for checkout
        const orderSummary = {
            items: this.items,
            subtotal: this.getSubtotal(),
            deliveryFee: this.getDeliveryFee(),
            tax: this.getTax(),
            total: this.getTotal(),
            date: new Date().toISOString()
        };
        
        localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        window.location.href = 'checkout.html';
    }
}

// Create global cart instance
const cart = new Cart();

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Cart;
}