// Admin Module
class Admin {
    constructor() {
        this.orders = this.loadOrders();
        this.products = [];
        this.customers = [];
        this.loadData();
    }

    // Load data from localStorage
    loadData() {
        this.orders = this.loadOrders();
        this.customers = this.loadCustomers();
    }

    // Load orders
    loadOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Load customers
    loadCustomers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // Get dashboard stats
    getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(order => 
            order.date && order.date.split('T')[0] === today
        );
        
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        
        return {
            totalOrders: this.orders.length,
            totalRevenue: totalRevenue,
            totalCustomers: this.customers.length,
            todayOrders: todayOrders.length,
            todayRevenue: todayRevenue,
            averageOrderValue: this.orders.length > 0 ? totalRevenue / this.orders.length : 0
        };
    }

    // Get recent orders
    getRecentOrders(limit = 10) {
        return this.orders
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Get order by ID
    getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId);
    }

    // Update order status
    updateOrderStatus(orderId, status) {
        const order = this.getOrderById(orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
            return order;
        }
        return null;
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Get sales data for chart
    getSalesData(days = 30) {
        const salesData = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayOrders = this.orders.filter(order => 
                order.date && order.date.split('T')[0] === dateStr
            );
            
            const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
            
            salesData.push({
                date: dateStr,
                orders: dayOrders.length,
                revenue: dayRevenue
            });
        }
        
        return salesData;
    }

    // Get top products
    getTopProducts(limit = 5) {
        const productSales = {};
        
        this.orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        id: item.id,
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        });
        
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    // Get customer stats
    getCustomerStats() {
        const now = new Date();
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const newCustomers = this.customers.filter(customer => 
            new Date(customer.joinDate) > lastMonth
        );
        
        const activeCustomers = this.customers.filter(customer => {
            const customerOrders = this.orders.filter(order => 
                order.customerInfo && order.customerInfo.email === customer.email
            );
            return customerOrders.length > 0;
        });
        
        return {
            total: this.customers.length,
            newThisMonth: newCustomers.length,
            active: activeCustomers.length,
            inactive: this.customers.length - activeCustomers.length
        };
    }

    // Get revenue by category
    getRevenueByCategory() {
        const categoryRevenue = {};
        
        this.orders.forEach(order => {
            order.items.forEach(item => {
                const category = item.category || 'Uncategorized';
                if (!categoryRevenue[category]) {
                    categoryRevenue[category] = 0;
                }
                categoryRevenue[category] += item.price * item.quantity;
            });
        });
        
        return Object.entries(categoryRevenue).map(([category, revenue]) => ({
            category,
            revenue
        })).sort((a, b) => b.revenue - a.revenue);
    }

    // Export data to CSV
    exportToCSV(data, filename) {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Generate report
    generateReport(type, startDate, endDate) {
        const filteredOrders = this.orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
        
        switch(type) {
            case 'sales':
                return this.generateSalesReport(filteredOrders);
            case 'products':
                return this.generateProductsReport(filteredOrders);
            case 'customers':
                return this.generateCustomersReport(filteredOrders);
            default:
                return null;
        }
    }

    // Generate sales report
    generateSalesReport(orders) {
        const report = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            averageOrderValue: orders.length > 0 ? 
                orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
            ordersByStatus: {},
            dailyRevenue: {},
            topProducts: this.getTopProductsFromOrders(orders, 10)
        };
        
        // Count orders by status
        orders.forEach(order => {
            report.ordersByStatus[order.status] = (report.ordersByStatus[order.status] || 0) + 1;
        });
        
        // Group revenue by day
        orders.forEach(order => {
            const date = order.date.split('T')[0];
            report.dailyRevenue[date] = (report.dailyRevenue[date] || 0) + order.total;
        });
        
        return report;
    }

    // Get top products from orders
    getTopProductsFromOrders(orders, limit) {
        const productSales = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        id: item.id,
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        });
        
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    // Generate products report
    generateProductsReport(orders) {
        const products = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!products[item.id]) {
                    products[item.id] = {
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        totalSold: 0,
                        totalRevenue: 0,
                        avgPrice: item.price
                    };
                }
                products[item.id].totalSold += item.quantity;
                products[item.id].totalRevenue += item.price * item.quantity;
            });
        });
        
        return Object.values(products);
    }

    // Generate customers report
    generateCustomersReport(orders) {
        const customers = {};
        
        orders.forEach(order => {
            const email = order.customerInfo?.email;
            if (!email) return;
            
            if (!customers[email]) {
                customers[email] = {
                    email: email,
                    name: order.customerInfo?.firstName + ' ' + order.customerInfo?.lastName,
                    totalOrders: 0,
                    totalSpent: 0,
                    firstOrder: order.date,
                    lastOrder: order.date
                };
            }
            
            customers[email].totalOrders += 1;
            customers[email].totalSpent += order.total;
            customers[email].lastOrder = order.date;
        });
        
        return Object.values(customers);
    }
}

// Create global admin instance
const admin = new Admin();

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Admin;
}