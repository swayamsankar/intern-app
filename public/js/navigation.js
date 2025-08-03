// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current page from URL
    const currentPath = window.location.pathname;
    
    // Update active navigation link (desktop)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/') ||
            (currentPath.includes('/register') && href === '/register') ||
            (currentPath.includes('/admin') && href === '/admin')) {
            link.classList.add('active');
        }
    });
    
    // Update active mobile navigation button
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    mobileNavBtns.forEach(btn => {
        btn.classList.remove('active');
        
        const href = btn.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/') ||
            (currentPath === '/index.html' && href === '/') ||
            (currentPath.includes('/register') && href === '/register.html') ||
            (currentPath.includes('/admin') && href === '/admin.html')) {
            btn.classList.add('active');
        }
    });
    
    // Handle navigation clicks (desktop)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            window.location.href = href;
        });
    });
    
    // Handle mobile navigation clicks
    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add touch feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            const href = this.getAttribute('href');
            window.location.href = href;
        });
        
        // Add touch feedback for better mobile UX
        btn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function(e) {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Create mobile bottom navigation if it doesn't exist
    createMobileBottomNav();
    
    // Handle mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('show');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (mobileMenu.classList.contains('show')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('show');
                mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }
});

// Function to create mobile bottom navigation
function createMobileBottomNav() {
    // Check if mobile nav already exists
    if (document.querySelector('.mobile-bottom-nav')) {
        return;
    }
    
    // Get current page for active state
    const currentPath = window.location.pathname;
    
    // Create mobile bottom navigation
    const mobileNav = document.createElement('nav');
    mobileNav.className = 'mobile-bottom-nav';
    
    // Navigation items
    const navItems = [
        {
            href: '/index.html',
            icon: 'home',
            label: 'Home',
            active: currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('index.html')
        },
        {
            href: '/register.html',
            icon: 'apply',
            label: 'Apply Now',
            active: currentPath.includes('/register')
        },
        {
            href: '/admin.html',
            icon: 'admin',
            label: 'Admin',
            active: currentPath.includes('/admin')
        }
    ];
    
    // Create navigation buttons
    navItems.forEach(item => {
        const btn = document.createElement('a');
        btn.href = item.href;
        btn.className = `mobile-nav-btn ${item.active ? 'active' : ''}`;
        
        btn.innerHTML = `
            <div class="mobile-nav-icon ${item.icon}"></div>
            <span class="mobile-nav-label">${item.label}</span>
        `;
        
        // Add click handler
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add touch feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
                window.location.href = this.href;
            }, 150);
        });
        
        mobileNav.appendChild(btn);
    });
    
    // Add to document body
    document.body.appendChild(mobileNav);
}

// Utility functions for common functionality
const utils = {
    // Show loading state
    showLoading: function(element) {
        if (element) {
            element.classList.add('loading');
        }
    },
    
    // Hide loading state
    hideLoading: function(element) {
        if (element) {
            element.classList.remove('loading');
        }
    },
    
    // Show element
    show: function(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // Hide element
    hide: function(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    },
    
    // Capitalize first letter
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make utils available globally
window.utils = utils;