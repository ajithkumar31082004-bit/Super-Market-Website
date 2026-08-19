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

    // Login user (API first, fallback to localStorage)
    async login(email, password) {
        // 1. Try Backend REST API first
        try {
            const apiHost = window.location.hostname || 'localhost';
            const response = await fetch(`http://${apiHost}:5000/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role || 'user'
                };
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                return { success: true, user: this.currentUser };
            } else if (data.message && data.message !== 'Invalid Credentials') {
                return { success: false, message: data.message };
            }
        } catch (apiErr) {
            console.warn('[Auth API Warning] Backend server offline, checking local credentials:', apiErr.message);
        }

        // 2. Check for default admin login
        if (email === 'admin@supermarket.com' && password === 'admin123') {
            this.currentUser = {
                id: 1,
                email: email,
                name: 'Admin User',
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        // 2.1 Check for default staff login
        if (email === 'staff@supermarket.com' && password === 'staff123') {
            this.currentUser = {
                id: 2,
                email: email,
                name: 'Rahul Sharma (Associate)',
                role: 'staff',
                staffId: 'STF-204',
                phone: '9876543210'
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        // 3. Check regular users stored in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = {
                id: user.id || Date.now(),
                email: user.email,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email.split('@')[0],
                role: user.role || 'user',
                phone: user.phone || ''
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        return { success: false, message: 'Invalid email or password. If new, please Sign Up first!' };
    }

    // Register new user (API first, fallback to localStorage)
    async register(userData) {
        const name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Valued Customer';
        
        // 1. Try Backend REST API first
        try {
            const apiHost = window.location.hostname || 'localhost';
            const response = await fetch(`http://${apiHost}:5000/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email: userData.email,
                    password: userData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentUser = {
                    id: data.user?.id || Date.now(),
                    email: userData.email,
                    name: name,
                    role: 'user'
                };
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                return { success: true, user: this.currentUser };
            } else if (data.message) {
                return { success: false, message: data.message };
            } else if (data.errors && data.errors.length > 0) {
                return { success: false, message: data.errors[0].msg };
            }
        } catch (apiErr) {
            console.warn('[Auth Register API Warning] Backend server offline, saving locally:', apiErr.message);
        }

        // 2. Fallback to localStorage if API is unreachable
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'User with this email already exists!' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            role: 'user',
            joinDate: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = {
            id: newUser.id,
            email: newUser.email,
            name: name,
            role: 'user'
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