// Universal Navigation Bar Handler: Mobile Toggle, Active Link Highlighter, and Role-Based Auth UI
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileNavMenu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Highlight current page in navbar
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a, #mobileNavMenu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            link.classList.add('text-green-600', 'font-bold');
            link.classList.remove('text-gray-700');
        }
    });

    // 3. Auth & Role-Based Navigation Visibility
    updateNavbarAuthState();
});

function updateNavbarAuthState() {
    let user = null;
    if (typeof auth !== 'undefined' && auth.getUser) {
        user = auth.getUser();
    } else {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try { user = JSON.parse(stored); } catch (e) { user = null; }
        }
    }

    const adminNavLinks     = document.querySelectorAll('#adminNavLink, .admin-only-link');
    const mobileAdminLinks  = document.querySelectorAll('#mobileAdminLink, .mobile-admin-only-link');
    const dropdownAdminLinks= document.querySelectorAll('#dropdownAdminLink, .dropdown-admin-only-link');
    const staffNavLinks     = document.querySelectorAll('#staffNavLink, #dropdownStaffLink, #mobileStaffLink, .staff-only-link');
    
    const dropdownGuest     = document.getElementById('dropdownGuest');
    const dropdownUser      = document.getElementById('dropdownUser');
    const dropdownUserName  = document.getElementById('dropdownUserName');
    const navUserName       = document.getElementById('navUserName');
    const mobileGuestLinks  = document.getElementById('mobileGuestLinks');
    const mobileUserLinks   = document.getElementById('mobileUserLinks');

    const isAdmin = user && user.role === 'admin';
    const isStaff = user && (user.role === 'staff' || user.role === 'admin');

    // Show/Hide Admin links
    adminNavLinks.forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    mobileAdminLinks.forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    dropdownAdminLinks.forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    // Show/Hide Staff links
    staffNavLinks.forEach(el => {
        if (isStaff) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    if (user) {
        // --- Logged In State ---
        const displayName = user.name || user.email || 'User';

        if (navUserName) {
            navUserName.textContent = displayName;
            navUserName.classList.remove('hidden');
        }

        if (dropdownGuest) dropdownGuest.classList.add('hidden');
        if (dropdownUser) {
            dropdownUser.classList.remove('hidden');
            if (dropdownUserName) dropdownUserName.textContent = displayName;
        }

        if (mobileGuestLinks) mobileGuestLinks.classList.add('hidden');
        if (mobileUserLinks) mobileUserLinks.classList.remove('hidden');
    } else {
        // --- Guest State ---
        if (navUserName) navUserName.classList.add('hidden');
        if (dropdownGuest) dropdownGuest.classList.remove('hidden');
        if (dropdownUser) dropdownUser.classList.add('hidden');
        if (mobileGuestLinks) mobileGuestLinks.classList.remove('hidden');
        if (mobileUserLinks) mobileUserLinks.classList.add('hidden');
    }
}
