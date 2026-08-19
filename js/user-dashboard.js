// User Dashboard Logic for SuperMarket Pro
document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard check: User must be logged in
    const user = typeof auth !== 'undefined' ? auth.getUser() : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Please log in to access your dashboard.');
        window.location.href = 'login.html';
        return;
    }

    // 2. Initialize Dashboard Data
    initUserDashboard(user);
    setupTabNavigation();
    setupProfileForm(user);
    setupAddressManager(user);
    setupLoyaltyAndWallet(user);
    setupWishlist();
    setupSecurityForm(user);
});

// Switch Tabs
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.dash-nav-btn');
    const tabPanes = document.querySelectorAll('.dash-tab-pane');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = btn.getAttribute('data-tab');

            // Update active styles on buttons
            navButtons.forEach(b => {
                b.classList.remove('bg-green-600', 'text-white', 'shadow-md');
                b.classList.add('text-gray-700', 'hover:bg-green-50');
            });
            btn.classList.add('bg-green-600', 'text-white', 'shadow-md');
            btn.classList.remove('text-gray-700', 'hover:bg-green-50');

            // Show selected pane
            tabPanes.forEach(pane => {
                if (pane.id === `tab-${targetTab}`) {
                    pane.classList.remove('hidden');
                } else {
                    pane.classList.add('hidden');
                }
            });

            // Update page title header if present
            const pageTitleEl = document.getElementById('dashCurrentTabTitle');
            if (pageTitleEl) {
                pageTitleEl.textContent = btn.innerText.trim();
            }
        });
    });
}

// Populate Dashboard Overview
function initUserDashboard(user) {
    const userNameEls = document.querySelectorAll('.user-display-name');
    const userEmailEls = document.querySelectorAll('.user-display-email');
    const userInitialsEls = document.querySelectorAll('.user-avatar-initials');

    const displayName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0]);
    const email = user.email || '';
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    userNameEls.forEach(el => el.textContent = displayName);
    userEmailEls.forEach(el => el.textContent = email);
    userInitialsEls.forEach(el => el.textContent = initials);

    // Calculate user stats
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.customerInfo && o.customerInfo.email === email);
    const totalOrdersCount = userOrders.length || orders.length; // fallback to general orders if simulated

    const totalOrdersEl = document.getElementById('statTotalOrders');
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrdersCount;

    // Wishlist Count
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [
        { id: 1, name: 'Organic Apples', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', category: 'Fruits', stock: 'In Stock' },
        { id: 2, name: 'Fresh Cow Milk', price: 60, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300', category: 'Dairy', stock: 'In Stock' }
    ];
    if (!localStorage.getItem('wishlist')) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    const wishlistCountEl = document.getElementById('statWishlistCount');
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;

    // Render Recent Activity / Orders
    renderOverviewOrders(userOrders.length > 0 ? userOrders : orders);
}

// Render Recent Orders in Overview
function renderOverviewOrders(ordersList) {
    const container = document.getElementById('overviewRecentOrders');
    if (!container) return;

    if (!ordersList || ordersList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-shopping-bag text-4xl mb-2 text-gray-300"></i>
                <p>No orders yet. Start your fresh shopping today!</p>
                <a href="shop.html" class="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Browse Shop</a>
            </div>
        `;
        return;
    }

    const recent = ordersList.slice(-3).reverse();
    container.innerHTML = recent.map(order => `
        <div class="p-4 bg-gray-50 hover:bg-green-50/50 rounded-xl border border-gray-100 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold">
                    <i class="fas fa-box"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-900">${order.orderId || 'ORD-' + Math.floor(Math.random()*10000)}</h4>
                    <p class="text-xs text-gray-500">${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</p>
                </div>
            </div>
            <div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }">${order.status || 'In Transit'}</span>
            </div>
            <div class="text-right">
                <div class="font-bold text-gray-900">₹${order.orderSummary ? order.orderSummary.total : (order.total || 340)}</div>
                <p class="text-xs text-gray-500">${order.orderSummary?.items?.length || 3} items</p>
            </div>
            <div>
                <a href="billing.html?order=${order.orderId || ''}" class="px-3 py-1.5 bg-white border border-gray-200 hover:border-green-500 text-gray-700 hover:text-green-600 rounded-lg text-xs font-semibold inline-flex items-center shadow-sm">
                    <i class="fas fa-file-invoice mr-1.5"></i> Invoice
                </a>
            </div>
        </div>
    `).join('');
}

// Profile Edit Form
function setupProfileForm(user) {
    const form = document.getElementById('profileEditForm');
    if (!form) return;

    // Fill form
    const firstNameInput = document.getElementById('profileFirstName');
    const lastNameInput = document.getElementById('profileLastName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');

    const nameParts = (user.name || '').split(' ');
    if (firstNameInput) firstNameInput.value = user.firstName || nameParts[0] || '';
    if (lastNameInput) lastNameInput.value = user.lastName || nameParts.slice(1).join(' ') || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const phone = phoneInput.value.trim();
        const fullName = `${firstName} ${lastName}`.trim();

        user.firstName = firstName;
        user.lastName = lastName;
        user.name = fullName;
        user.phone = phone;

        // Persist
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (typeof auth !== 'undefined' && auth.updateProfile) {
            auth.updateProfile({ name: fullName, phone, firstName, lastName });
        }

        // Show feedback
        const msgEl = document.getElementById('profileSaveMsg');
        if (msgEl) {
            msgEl.classList.remove('hidden');
            setTimeout(() => msgEl.classList.add('hidden'), 3000);
        }

        initUserDashboard(user);
        if (typeof updateNavbarAuthState === 'function') updateNavbarAuthState();
    });
}

// Address Management
function setupAddressManager(user) {
    let addresses = JSON.parse(localStorage.getItem('userAddresses')) || [
        {
            id: 1,
            type: 'Home',
            name: user.name || 'Valued Customer',
            street: 'Flat 402, Green Valley Apartments, 12th Cross Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600028',
            phone: user.phone || '9876543210',
            isDefault: true
        },
        {
            id: 2,
            type: 'Work',
            name: user.name || 'Valued Customer',
            street: 'Tech Park Tower B, 3rd Floor, IT Highway',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600113',
            phone: user.phone || '9876543210',
            isDefault: false
        }
    ];

    function saveAndRenderAddresses() {
        localStorage.setItem('userAddresses', JSON.stringify(addresses));
        const container = document.getElementById('addressesGrid');
        if (!container) return;

        container.innerHTML = addresses.map(addr => `
            <div class="p-5 bg-white border ${addr.isDefault ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'} rounded-2xl relative shadow-sm hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-md ${
                        addr.type === 'Home' ? 'bg-green-100 text-green-700' :
                        addr.type === 'Work' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                    }">
                        <i class="fas ${addr.type === 'Home' ? 'fa-home' : addr.type === 'Work' ? 'fa-briefcase' : 'fa-map-marker-alt'} mr-1"></i>
                        ${addr.type}
                    </span>
                    ${addr.isDefault ? '<span class="text-xs bg-green-600 text-white font-semibold px-2 py-0.5 rounded-full">Default</span>' : ''}
                </div>
                <h4 class="font-bold text-gray-900">${addr.name}</h4>
                <p class="text-sm text-gray-600 mt-1 leading-relaxed">${addr.street}, ${addr.city}, ${addr.state} - <span class="font-semibold">${addr.pincode}</span></p>
                <p class="text-xs text-gray-500 mt-2"><i class="fas fa-phone mr-1.5"></i>${addr.phone}</p>
                
                <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                    ${!addr.isDefault ? `
                        <button onclick="setDefaultAddress(${addr.id})" class="text-green-600 hover:text-green-700 font-semibold text-xs">
                            Set as Default
                        </button>
                    ` : '<span class="text-xs text-gray-400">Primary Delivery</span>'}
                    <button onclick="deleteAddress(${addr.id})" class="text-red-500 hover:text-red-700 text-xs font-semibold">
                        <i class="fas fa-trash-alt mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.setDefaultAddress = function(id) {
        addresses.forEach(a => a.isDefault = (a.id === id));
        saveAndRenderAddresses();
    };

    window.deleteAddress = function(id) {
        if (confirm('Are you sure you want to delete this address?')) {
            addresses = addresses.filter(a => a.id !== id);
            saveAndRenderAddresses();
        }
    };

    // Add Address Form Modal
    const addModal = document.getElementById('addAddressModal');
    const openBtn = document.getElementById('openAddAddressBtn');
    const closeBtn = document.getElementById('closeAddAddressBtn');
    const form = document.getElementById('addAddressForm');

    if (openBtn && addModal) {
        openBtn.addEventListener('click', () => addModal.classList.remove('hidden'));
    }
    if (closeBtn && addModal) {
        closeBtn.addEventListener('click', () => addModal.classList.add('hidden'));
    }
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newAddr = {
                id: Date.now(),
                type: document.getElementById('addrType').value,
                name: document.getElementById('addrName').value.trim() || user.name,
                street: document.getElementById('addrStreet').value.trim(),
                city: document.getElementById('addrCity').value.trim(),
                state: document.getElementById('addrState').value.trim(),
                pincode: document.getElementById('addrPincode').value.trim(),
                phone: document.getElementById('addrPhone').value.trim() || user.phone,
                isDefault: document.getElementById('addrDefault').checked
            };

            if (newAddr.isDefault) {
                addresses.forEach(a => a.isDefault = false);
            }
            addresses.push(newAddr);
            saveAndRenderAddresses();
            form.reset();
            addModal.classList.add('hidden');
        });
    }

    saveAndRenderAddresses();
}

// Loyalty Points and SuperWallet
function setupLoyaltyAndWallet(user) {
    let points = parseInt(localStorage.getItem('superPoints') || '450');
    const walletBalanceEl = document.getElementById('superWalletBalance');
    const pointsTotalEl = document.getElementById('superPointsTotal');
    const rewardProgressBar = document.getElementById('loyaltyProgressBar');

    function updatePointsUI() {
        localStorage.setItem('superPoints', points);
        const walletValue = (points * 0.1).toFixed(2); // 10 points = ₹1
        if (walletBalanceEl) walletBalanceEl.textContent = `₹${walletValue}`;
        if (pointsTotalEl) pointsTotalEl.textContent = `${points} pts`;
        if (rewardProgressBar) {
            const percent = Math.min(100, (points / 1000) * 100);
            rewardProgressBar.style.width = `${percent}%`;
        }
    }

    window.redeemCoupon = function(requiredPoints, couponCode, discountAmt) {
        if (points < requiredPoints) {
            alert(`You need ${requiredPoints} SuperPoints to redeem this voucher!`);
            return;
        }
        points -= requiredPoints;
        updatePointsUI();
        alert(`🎉 Success! Coupon "${couponCode}" (₹${discountAmt} OFF) has been added to your account for next checkout!`);
    };

    updatePointsUI();
}

// Wishlist Functionality
function setupWishlist() {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const container = document.getElementById('wishlistItemsGrid');
    if (!container) return;

    function renderWishlist() {
        if (wishlist.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <i class="fas fa-heart-broken text-4xl mb-3 text-gray-300"></i>
                    <p class="text-base font-medium">Your Wishlist is empty</p>
                    <p class="text-sm text-gray-400 mb-4">Save fresh items you love for easy ordering later.</p>
                    <a href="shop.html" class="inline-block px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-sm">
                        Explore Fresh Groceries
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = wishlist.map(item => `
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div class="relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-44 object-cover">
                    <button onclick="removeFromWishlist(${item.id})" class="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition shadow">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                    <span class="absolute bottom-2.5 left-2.5 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                        ${item.category}
                    </span>
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-gray-900 mb-1">${item.name}</h4>
                        <div class="text-green-600 font-extrabold text-lg">₹${item.price}</div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                        <button onclick="moveToCartFromWishlist(${item.id})" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition shadow-sm">
                            <i class="fas fa-cart-plus"></i>
                            <span>Move to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.removeFromWishlist = function(id) {
        wishlist = wishlist.filter(item => item.id !== id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        renderWishlist();
        const countEl = document.getElementById('statWishlistCount');
        if (countEl) countEl.textContent = wishlist.length;
    };

    window.moveToCartFromWishlist = function(id) {
        const item = wishlist.find(i => i.id === id);
        if (item) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existing = cart.find(c => c.id === item.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ ...item, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            if (typeof updateCartCount === 'function') updateCartCount();
            alert(`${item.name} added to your cart!`);
        }
    };

    renderWishlist();
}

// Security / Password Update
function setupSecurityForm(user) {
    const form = document.getElementById('securityForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPass = document.getElementById('currPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        if (newPass.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        if (newPass !== confirmPass) {
            alert('New passwords do not match!');
            return;
        }

        // Update in localStorage users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const targetUser = users.find(u => u.email === user.email);
        if (targetUser) {
            targetUser.password = newPass;
            localStorage.setItem('users', JSON.stringify(users));
        }

        const msgEl = document.getElementById('securitySaveMsg');
        if (msgEl) {
            msgEl.classList.remove('hidden');
            setTimeout(() => msgEl.classList.add('hidden'), 3000);
        }
        form.reset();
    });
}
