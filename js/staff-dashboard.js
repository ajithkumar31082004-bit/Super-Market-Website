// Staff Operations & Fulfillment Dashboard Controller
document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Guard: Only Staff or Admin
    const user = typeof auth !== 'undefined' ? auth.getUser() : JSON.parse(localStorage.getItem('currentUser'));
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
        alert('Access restricted to store staff and administrators only.');
        window.location.href = 'login.html';
        return;
    }

    // 2. Initialize Staff UI
    initStaffProfile(user);
    initShiftTimer();
    initTabNavigation();
    initFulfillmentPipeline();
    initInventoryManager();
    initCounterPOS();
});

// 1. Staff Profile & Shift Controls
let shiftSeconds = 3600 * 2 + 14 * 60; // default 2h 14m simulated
let shiftTimerInterval = null;
let isOnBreak = false;

function initStaffProfile(user) {
    const staffNameEls = document.querySelectorAll('.staff-name');
    const staffIdEls = document.querySelectorAll('.staff-id');
    const staffRoleEls = document.querySelectorAll('.staff-role');

    const name = user.name || 'Store Associate';
    const id = user.staffId || 'STF-' + (user.id || '204');
    const role = user.role === 'admin' ? 'Store Manager (Admin)' : 'Fulfillment Associate';

    staffNameEls.forEach(el => el.textContent = name);
    staffIdEls.forEach(el => el.textContent = id);
    staffRoleEls.forEach(el => el.textContent = role);
}

function initShiftTimer() {
    const timerEl = document.getElementById('shiftTimerDisplay');
    const breakBtn = document.getElementById('toggleBreakBtn');
    const statusBadge = document.getElementById('staffStatusBadge');

    function updateDisplay() {
        if (!timerEl) return;
        const hours = String(Math.floor(shiftSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((shiftSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(shiftSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    shiftTimerInterval = setInterval(() => {
        if (!isOnBreak) {
            shiftSeconds++;
            updateDisplay();
        }
    }, 1000);
    updateDisplay();

    if (breakBtn) {
        breakBtn.addEventListener('click', () => {
            isOnBreak = !isOnBreak;
            if (isOnBreak) {
                breakBtn.innerHTML = '<i class="fas fa-play mr-1.5"></i> Resume Shift';
                breakBtn.classList.replace('bg-amber-100', 'bg-green-100');
                breakBtn.classList.replace('text-amber-800', 'text-green-800');
                if (statusBadge) {
                    statusBadge.textContent = 'On Break';
                    statusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 text-white';
                }
            } else {
                breakBtn.innerHTML = '<i class="fas fa-pause mr-1.5"></i> Take Break';
                breakBtn.classList.replace('bg-green-100', 'bg-amber-100');
                breakBtn.classList.replace('text-green-800', 'text-amber-800');
                if (statusBadge) {
                    statusBadge.textContent = 'Active On Duty';
                    statusBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500 text-white';
                }
            }
        });
    }
}

// 2. Tab Navigation
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.staff-tab-btn');
    const tabPanes = document.querySelectorAll('.staff-tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabButtons.forEach(b => {
                b.classList.remove('bg-green-600', 'text-white', 'shadow-md');
                b.classList.add('text-gray-600', 'hover:bg-gray-100');
            });
            btn.classList.add('bg-green-600', 'text-white', 'shadow-md');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-100');

            tabPanes.forEach(pane => {
                if (pane.id === `tab-${target}`) {
                    pane.classList.remove('hidden');
                } else {
                    pane.classList.add('hidden');
                }
            });
        });
    });
}

// 3. Order Fulfillment Pipeline
let activeFulfillmentFilter = 'all';

function getStaffOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
        // Seed default store orders if empty
        orders = [
            {
                orderId: 'ORD-8921',
                orderDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                status: 'Processing',
                packingStage: 'New',
                customerInfo: { firstName: 'Priya', lastName: 'Raman', phone: '9840123456', street: '12 Anna Nagar, Chennai' },
                orderSummary: {
                    items: [
                        { name: 'Organic Himachal Apples', quantity: 2, price: 120 },
                        { name: 'Fresh Farm Cow Milk', quantity: 3, price: 60 },
                        { name: 'Whole Wheat Brown Bread', quantity: 1, price: 40 }
                    ],
                    total: 460
                }
            },
            {
                orderId: 'ORD-8922',
                orderDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                status: 'Processing',
                packingStage: 'Packing',
                customerInfo: { firstName: 'Karthik', lastName: 'Subbaraj', phone: '9790654321', street: '45 Besant Nagar Beach Rd, Chennai' },
                orderSummary: {
                    items: [
                        { name: 'Fresh Farm Tomatoes', quantity: 2, price: 35 },
                        { name: 'Fresh Potatoes', quantity: 3, price: 30 },
                        { name: 'Organic Bananas', quantity: 1, price: 50 }
                    ],
                    total: 210
                }
            },
            {
                orderId: 'ORD-8919',
                orderDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                status: 'Processing',
                packingStage: 'Ready for Dispatch',
                customerInfo: { firstName: 'Ananya', lastName: 'Deshmukh', phone: '9444112233', street: '88 T. Nagar Commercial St, Chennai' },
                orderSummary: {
                    items: [
                        { name: 'Organic Mango Juice', quantity: 2, price: 85 },
                        { name: 'Salted Crunchy Cashews', quantity: 1, price: 220 }
                    ],
                    total: 390
                }
            },
            {
                orderId: 'ORD-8910',
                orderDate: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
                status: 'Delivered',
                packingStage: 'Completed',
                customerInfo: { firstName: 'Siddharth', lastName: 'Menon', phone: '9962001122', street: '5 Velachery Main Rd, Chennai' },
                orderSummary: {
                    items: [
                        { name: 'Farm Fresh Eggs (6pk)', quantity: 2, price: 65 }
                    ],
                    total: 130
                }
            }
        ];
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    return orders;
}

function initFulfillmentPipeline() {
    renderFulfillmentOrders();

    // Filter Buttons
    document.querySelectorAll('.fulfill-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeFulfillmentFilter = btn.getAttribute('data-filter');
            document.querySelectorAll('.fulfill-filter-btn').forEach(b => {
                b.classList.remove('bg-gray-900', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.add('bg-gray-900', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            renderFulfillmentOrders();
        });
    });
}

function renderFulfillmentOrders() {
    const orders = getStaffOrders();
    const container = document.getElementById('fulfillmentOrdersList');
    if (!container) return;

    // Filter
    const filtered = orders.filter(order => {
        const stage = order.packingStage || (order.status === 'Delivered' ? 'Completed' : 'New');
        if (activeFulfillmentFilter === 'all') return true;
        return stage.toLowerCase() === activeFulfillmentFilter.toLowerCase();
    });

    // Update Counts
    const counts = {
        new: orders.filter(o => (o.packingStage || 'New') === 'New' && o.status !== 'Delivered').length,
        packing: orders.filter(o => o.packingStage === 'Packing').length,
        ready: orders.filter(o => o.packingStage === 'Ready for Dispatch').length,
        completed: orders.filter(o => o.status === 'Delivered' || o.packingStage === 'Completed').length
    };

    const countNewEl = document.getElementById('countFulfillNew');
    const countPackingEl = document.getElementById('countFulfillPacking');
    const countReadyEl = document.getElementById('countFulfillReady');
    const countCompletedEl = document.getElementById('countFulfillCompleted');

    if (countNewEl) countNewEl.textContent = counts.new;
    if (countPackingEl) countPackingEl.textContent = counts.packing;
    if (countReadyEl) countReadyEl.textContent = counts.ready;
    if (countCompletedEl) countCompletedEl.textContent = counts.completed;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
                <p class="text-base font-bold text-gray-800">No orders in this stage</p>
                <p class="text-xs text-gray-400">All set! Check other stages or wait for incoming orders.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(order => {
        const stage = order.packingStage || (order.status === 'Delivered' ? 'Completed' : 'New');
        const items = order.orderSummary?.items || [];
        const customerName = `${order.customerInfo?.firstName || 'Customer'} ${order.customerInfo?.lastName || ''}`;

        return `
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                            stage === 'New' ? 'bg-rose-100 text-rose-700' :
                            stage === 'Packing' ? 'bg-amber-100 text-amber-700' :
                            stage === 'Ready for Dispatch' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                        }">
                            <i class="fas ${stage === 'New' ? 'fa-bell' : stage === 'Packing' ? 'fa-box-open' : stage === 'Ready for Dispatch' ? 'fa-truck-fast' : 'fa-check'}"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="font-extrabold text-gray-900 text-base">${order.orderId}</h3>
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    stage === 'New' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                    stage === 'Packing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    stage === 'Ready for Dispatch' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }">${stage}</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-0.5"><i class="fas fa-clock mr-1"></i>${new Date(order.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ${customerName}</p>
                        </div>
                    </div>

                    <!-- Right Quick Actions -->
                    <div class="flex items-center space-x-2 w-full lg:w-auto justify-end">
                        <a href="billing.html?order=${order.orderId}" target="_blank" class="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 flex items-center">
                            <i class="fas fa-print mr-1.5"></i> Slip
                        </a>
                        ${stage === 'New' ? `
                            <button onclick="advanceOrderStatus('${order.orderId}', 'Packing')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center">
                                <i class="fas fa-box-open mr-1.5"></i> Start Packing
                            </button>
                        ` : stage === 'Packing' ? `
                            <button onclick="advanceOrderStatus('${order.orderId}', 'Ready for Dispatch')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center">
                                <i class="fas fa-check mr-1.5"></i> Mark Packed & Ready
                            </button>
                        ` : stage === 'Ready for Dispatch' ? `
                            <button onclick="advanceOrderStatus('${order.orderId}', 'Completed')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center">
                                <i class="fas fa-truck mr-1.5"></i> Dispatch & Deliver
                            </button>
                        ` : `
                            <span class="text-xs text-green-600 font-bold px-3 py-1 bg-green-50 rounded-lg">Fulfillment Complete</span>
                        `}
                    </div>
                </div>

                <!-- Packing Item Checklist -->
                <div class="pt-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Items to Pack (${items.length} items • ₹${order.orderSummary?.total || 0})</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        ${items.map((item, idx) => `
                            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                <div class="flex items-center space-x-2">
                                    <input type="checkbox" ${stage === 'Completed' ? 'checked disabled' : ''} class="rounded text-green-600 focus:ring-green-500 cursor-pointer w-4 h-4">
                                    <span class="font-bold text-gray-800">${item.name}</span>
                                </div>
                                <span class="bg-gray-200 text-gray-800 font-black px-2 py-0.5 rounded-md">x${item.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Customer Delivery Note -->
                <div class="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                    <div>
                        <span class="font-bold text-gray-700"><i class="fas fa-map-marker-alt text-green-600 mr-1"></i> Delivery:</span> ${order.customerInfo?.street || 'Store Pickup'}
                    </div>
                    <div>
                        <span class="font-bold text-gray-700"><i class="fas fa-phone text-green-600 mr-1"></i> Phone:</span> ${order.customerInfo?.phone || 'N/A'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.advanceOrderStatus = function(orderId, nextStage) {
    const orders = getStaffOrders();
    const target = orders.find(o => o.orderId === orderId);
    if (target) {
        target.packingStage = nextStage;
        if (nextStage === 'Completed') {
            target.status = 'Delivered';
        } else {
            target.status = 'Processing';
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        renderFulfillmentOrders();
    }
};

// 4. Inventory Quick Stock Manager
let inventoryItems = [];

async function initInventoryManager() {
    // Load products
    if (typeof products !== 'undefined' && products.getAllProducts) {
        inventoryItems = await products.getAllProducts();
    } else {
        inventoryItems = [
            { id: 1, name: 'Organic Himachal Apples', category: 'Fruits', price: 120, stock: 45, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=120' },
            { id: 2, name: 'Fresh Farm Cow Milk', category: 'Dairy', price: 60, stock: 8, unit: 'liter', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120' },
            { id: 3, name: 'Whole Wheat Brown Bread', category: 'Bakery', price: 40, stock: 5, unit: 'pack', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120' },
            { id: 4, name: 'Fresh Farm Potatoes', category: 'Vegetables', price: 30, stock: 68, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=120' },
            { id: 5, name: 'Fresh Country Eggs (6pk)', category: 'Dairy', price: 65, stock: 18, unit: 'pack', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=120' },
            { id: 6, name: 'Fresh Nagpur Oranges', category: 'Fruits', price: 90, stock: 4, unit: 'kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=120' }
        ];
    }

    renderInventoryTable(inventoryItems);

    const searchInput = document.getElementById('inventorySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = inventoryItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );
            renderInventoryTable(filtered);
        });
    }

    // Filter low stock checkbox
    const lowStockFilter = document.getElementById('filterLowStockOnly');
    if (lowStockFilter) {
        lowStockFilter.addEventListener('change', (e) => {
            if (e.target.checked) {
                renderInventoryTable(inventoryItems.filter(i => (i.stock || 0) <= 10));
            } else {
                renderInventoryTable(inventoryItems);
            }
        });
    }
}

function renderInventoryTable(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    if (items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">No products found</td></tr>`;
        return;
    }

    tableBody.innerHTML = items.map(item => {
        const isLow = (item.stock || 0) <= 10;
        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="p-4 flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded-lg object-cover border">
                    <div>
                        <p class="font-bold text-gray-900 text-sm">${item.name}</p>
                        <p class="text-xs text-gray-400">SKU: SMP-${item.id} • ${item.unit || 'unit'}</p>
                    </div>
                </td>
                <td class="p-4 text-sm font-semibold text-gray-600">${item.category}</td>
                <td class="p-4 text-sm font-extrabold text-green-600">₹${item.price}</td>
                <td class="p-4">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full ${
                        isLow ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'
                    }">
                        ${item.stock} in stock ${isLow ? '(Low!)' : ''}
                    </span>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-1">
                        <button onclick="adjustStock(${item.id}, -1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-md font-bold text-gray-700 flex items-center justify-center text-xs">-</button>
                        <span class="w-8 text-center font-extrabold text-xs text-gray-800">${item.stock}</span>
                        <button onclick="adjustStock(${item.id}, 1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-md font-bold text-gray-700 flex items-center justify-center text-xs">+</button>
                    </div>
                </td>
                <td class="p-4 text-right">
                    <button onclick="openRestockModal(${item.id})" class="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition">
                        <i class="fas fa-plus mr-1"></i> Restock
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.adjustStock = function(id, delta) {
    const item = inventoryItems.find(i => i.id === id);
    if (item) {
        item.stock = Math.max(0, (item.stock || 0) + delta);
        renderInventoryTable(inventoryItems);
    }
};

window.openRestockModal = function(id) {
    const item = inventoryItems.find(i => i.id === id);
    if (!item) return;
    const addQty = prompt(`Enter restock quantity to add for "${item.name}":`, "20");
    if (addQty && !isNaN(addQty)) {
        item.stock = (item.stock || 0) + parseInt(addQty);
        renderInventoryTable(inventoryItems);
        alert(`✅ Stock for "${item.name}" updated to ${item.stock} units!`);
    }
};

// 5. Counter POS (Point of Sale) Express Billing
let posCart = [];

function initCounterPOS() {
    renderPOSProductGrid();
    renderPOSCart();

    const searchInput = document.getElementById('posProductSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = inventoryItems.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
            renderPOSProductGrid(filtered);
        });
    }

    const checkoutBtn = document.getElementById('posCompleteBillBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', completePOSOrder);
    }
}

function renderPOSProductGrid(itemsToRender = inventoryItems) {
    const container = document.getElementById('posProductsGrid');
    if (!container) return;

    container.innerHTML = itemsToRender.map(item => `
        <div onclick="addPOSToCart(${item.id})" class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-green-500 hover:shadow cursor-pointer transition flex flex-col justify-between">
            <div class="flex items-center space-x-2.5">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h4 class="font-bold text-gray-900 text-xs line-clamp-1">${item.name}</h4>
                    <p class="text-[11px] text-gray-400">${item.category}</p>
                </div>
            </div>
            <div class="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span class="font-extrabold text-green-600 text-sm">₹${item.price}</span>
                <span class="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded">+ Add</span>
            </div>
        </div>
    `).join('');
}

window.addPOSToCart = function(id) {
    const item = inventoryItems.find(i => i.id === id);
    if (!item) return;

    const existing = posCart.find(i => i.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        posCart.push({ ...item, quantity: 1 });
    }
    renderPOSCart();
};

function renderPOSCart() {
    const container = document.getElementById('posCartItemsList');
    const subtotalEl = document.getElementById('posSubtotal');
    const totalEl = document.getElementById('posGrandTotal');
    const countEl = document.getElementById('posItemsCount');

    if (!container) return;

    if (posCart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fas fa-cash-register text-3xl mb-2"></i>
                <p class="text-xs">Counter cart is empty.<br>Tap items to add to bill.</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '₹0.00';
        if (totalEl) totalEl.textContent = '₹0.00';
        if (countEl) countEl.textContent = '0';
        return;
    }

    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    if (countEl) countEl.textContent = posCart.reduce((c, i) => c + i.quantity, 0);

    container.innerHTML = posCart.map(item => `
        <div class="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
            <div class="flex-1 pr-2">
                <p class="font-bold text-gray-900 truncate">${item.name}</p>
                <p class="text-[11px] text-gray-500">₹${item.price} each</p>
            </div>
            <div class="flex items-center space-x-1.5">
                <button onclick="updatePOSQty(${item.id}, -1)" class="w-6 h-6 bg-white border rounded font-bold hover:bg-gray-100 flex items-center justify-center">-</button>
                <span class="font-bold text-gray-800 px-1">${item.quantity}</span>
                <button onclick="updatePOSQty(${item.id}, 1)" class="w-6 h-6 bg-white border rounded font-bold hover:bg-gray-100 flex items-center justify-center">+</button>
                <span class="font-extrabold text-green-600 pl-2">₹${item.price * item.quantity}</span>
            </div>
        </div>
    `).join('');
}

window.updatePOSQty = function(id, delta) {
    const item = posCart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            posCart = posCart.filter(i => i.id !== id);
        }
        renderPOSCart();
    }
};

window.clearPOSCart = function() {
    posCart = [];
    renderPOSCart();
};

function completePOSOrder() {
    if (posCart.length === 0) {
        alert('Please add products to create a POS bill.');
        return;
    }

    const customerName = document.getElementById('posCustomerName')?.value.trim() || 'Walk-in Customer';
    const paymentMethod = document.querySelector('input[name="posPaymentMethod"]:checked')?.value || 'Cash';

    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const newOrder = {
        orderId: 'POS-' + Math.floor(100000 + Math.random() * 900000),
        orderDate: new Date().toISOString(),
        status: 'Delivered',
        packingStage: 'Completed',
        paymentMethod: paymentMethod,
        customerInfo: { firstName: customerName, phone: 'Counter POS', street: 'SuperMarket Pro Counter 1' },
        orderSummary: {
            items: [...posCart],
            subtotal: subtotal,
            tax: tax,
            total: total
        }
    };

    // Save order
    const orders = getStaffOrders();
    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Deduct inventory
    posCart.forEach(posItem => {
        const inv = inventoryItems.find(i => i.id === posItem.id);
        if (inv) inv.stock = Math.max(0, (inv.stock || 0) - posItem.quantity);
    });
    renderInventoryTable(inventoryItems);

    alert(`🎉 Sale Complete!\nOrder ID: ${newOrder.orderId}\nTotal: ₹${total.toFixed(2)}\nPayment: ${paymentMethod}`);
    clearPOSCart();
    renderFulfillmentOrders();
}
