// Authentication Module
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Load current user from localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.isLoggedIn() && this.currentUser.role === 'admin';
    }

    // Login user
    login(email, password) {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check for admin
        if (email === 'admin@supermarket.com' && password === 'admin123') {
            this.currentUser = {
                email: email,
                name: 'Admin',
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }
        
        // Check regular users
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: 'user',
                phone: user.phone
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }

    // Register new user
    register(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'User with this email already exists' };
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            ...userData,
            role: 'user',
            joinDate: new Date().toISOString(),
            orders: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        this.currentUser = {
            id: newUser.id,
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`,
            role: 'user',
            phone: newUser.phone
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return { success: true, user: this.currentUser };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Get current user
    getUser() {
        return this.currentUser;
    }

    // Update user profile
    updateProfile(updates) {
        if (!this.currentUser) return false;
        
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update in users array if exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        return true;
    }

    // Check authentication on page load
    checkAuth(requiredRole = null) {
        if (!this.isLoggedIn()) {
            // Redirect to login if not logged in
            if (window.location.pathname !== '/login.html') {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        if (requiredRole && this.currentUser.role !== requiredRole) {
            // Redirect to home if doesn't have required role
            if (window.location.pathname !== '/index.html') {
                window.location.href = 'index.html';
            }
            return false;
        }
        
        return true;
    }
}

// Create global auth instance
const auth = new Auth();

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = Auth;
}