// Dashboard Module
class Dashboard {
    constructor() {
        this.charts = {};
        this.initCharts();
    }

    // Initialize charts
    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }
        
        this.setupRevenueChart();
        this.setupCategoryChart();
        this.setupSalesChart();
    }

    // Setup revenue chart
    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const adminData = new Admin();
        const salesData = adminData.getSalesData(7);
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.map(d => d.date),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: salesData.map(d => d.revenue),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Setup category chart
    setupCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        const adminData = new Admin();
        const categoryData = adminData.getRevenueByCategory();
        
        const colors = [
            '#16a34a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
            '#10b981', '#6366f1', '#ec4899', '#f97316', '#84cc16'
        ];
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.map(d => d.category),
                datasets: [{
                    data: categoryData.map(d => d.revenue),
                    backgroundColor: colors.slice(0, categoryData.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ₹${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Setup sales chart
    setupSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        const adminData = new Admin();
        const stats = adminData.getDashboardStats();
        const recentOrders = adminData.getRecentOrders(5);
        
        // If there's a sales chart element
        if (ctx.tagName === 'CANVAS') {
            this.charts.sales = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: recentOrders.map(o => o.id),
                    datasets: [{
                        label: 'Order Amount (₹)',
                        data: recentOrders.map(o => o.total),
                        backgroundColor: '#16a34a'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Update dashboard stats
    updateStats() {
        const adminData = new Admin();
        const stats = adminData.getDashboardStats();
        
        // Update DOM elements if they exist
        const elements = {
            'totalRevenue': '₹' + stats.totalRevenue.toFixed(2),
            'todaySales': '₹' + stats.todayRevenue.toFixed(2),
            'totalOrders': stats.totalOrders,
            'totalCustomers': stats.totalCustomers,
            'todayOrders': stats.todayOrders,
            'avgOrderValue': '₹' + stats.averageOrderValue.toFixed(2)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Refresh dashboard
    refresh() {
        this.updateStats();
        
        // Update charts if they exist
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
            this.setupRevenueChart();
        }
        
        if (this.charts.category) {
            this.charts.category.destroy();
            this.setupCategoryChart();
        }
        
        if (this.charts.sales) {
            this.charts.sales.destroy();
            this.setupSalesChart();
        }
    }

    // Load recent orders table
    loadRecentOrdersTable() {
        const table = document.getElementById('recentOrdersTable');
        if (!table) return;
        
        const adminData = new Admin();
        const recentOrders = adminData.getRecentOrders(10);
        
        table.innerHTML = '';
        
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <td class="p-4">
                    <a href="#" class="text-green-600 hover:text-green-700 font-semibold">
                        ${order.id}
                    </a>
                </td>
                <td class="p-4">
                    ${order.customerInfo?.firstName || 'Customer'} ${order.customerInfo?.lastName || ''}
                </td>
                <td class="p-4">₹${order.total.toFixed(2)}</td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${order.status || 'Processing'}
                    </span>
                </td>
                <td class="p-4">
                    ${new Date(order.date).toLocaleDateString()}
                </td>
            `;
            table.appendChild(row);
        });
    }

    // Load top products
    loadTopProducts() {
        const container = document.getElementById('topProducts');
        if (!container) return;
        
        const adminData = new Admin();
        const topProducts = adminData.getTopProducts(5);
        
        container.innerHTML = '';
        
        topProducts.forEach((product, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 border-b';
            div.innerHTML = `
                <div class="flex items-center">
                    <span class="text-gray-500 mr-4">${index + 1}</span>
                    <div>
                        <div class="font-semibold">${product.name}</div>
                        <div class="text-sm text-gray-600">${product.quantity} sold</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-semibold">₹${product.revenue.toFixed(2)}</div>
                    <div class="text-sm text-gray-600">Revenue</div>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

// Create global dashboard instance
const dashboard = new Dashboard();

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    dashboard.updateStats();
    dashboard.loadRecentOrdersTable();
    dashboard.loadTopProducts();
});

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Dashboard;
}