/* Dashboard JavaScript - Sampath Grocery Store */

// Sample data for dashboard
let dashboardData = {
    sales: {
        today: 125000.50,
        yesterday: 98000.75,
        thisMonth: 2500000.00,
        lastMonth: 2200000.00
    },
    inventory: {
        lowStockItems: 12,
        totalProducts: 450,
        outOfStock: 3,
        nearExpiry: 8
    },
    orders: {
        pending: 15,
        processing: 8,
        completed: 342,
        cancelled: 5
    },
    reorders: {
        pending: 5,
        approved: 12,
        rejected: 2
    },
    deliveries: {
        delivered: 98,
        pending: 15,
        failed: 2,
        successRate: 95.7
    }
};

// Sample activity data
let recentActivity = [
    {
        id: 1,
        type: 'order',
        icon: 'fas fa-shopping-cart',
        iconColor: 'text-success',
        message: 'New order #202509001 received from John Silva',
        time: '5 minutes ago',
        link: 'orders.html'
    },
    {
        id: 2,
        type: 'delivery',
        icon: 'fas fa-truck',
        iconColor: 'text-info',
        message: 'Order #202509001 delivered successfully',
        time: '15 minutes ago',
        link: 'deliveries.html'
    },
    {
        id: 3,
        type: 'stock',
        icon: 'fas fa-exclamation-triangle',
        iconColor: 'text-warning',
        message: 'Low stock alert: Rice (Only 5kg remaining)',
        time: '30 minutes ago',
        link: 'inventory.html'
    },
    {
        id: 4,
        type: 'reorder',
        icon: 'fas fa-redo',
        iconColor: 'text-secondary',
        message: 'Reorder request approved for Supplier ABC',
        time: '1 hour ago',
        link: 'suppliers.html'
    },
    {
        id: 5,
        type: 'customer',
        icon: 'fas fa-user-plus',
        iconColor: 'text-primary',
        message: 'New customer registered: Maria Fernando',
        time: '2 hours ago',
        link: 'customers.html'
    },
    {
        id: 6,
        type: 'payment',
        icon: 'fas fa-credit-card',
        iconColor: 'text-success',
        message: 'Payment received for order #202508998',
        time: '3 hours ago',
        link: 'orders.html'
    },
    {
        id: 7,
        type: 'product',
        icon: 'fas fa-plus-circle',
        iconColor: 'text-info',
        message: 'New product added: Organic Vegetables',
        time: '4 hours ago',
        link: 'inventory.html'
    },
    {
        id: 8,
        type: 'report',
        icon: 'fas fa-chart-bar',
        iconColor: 'text-primary',
        message: 'Weekly sales report generated',
        time: '5 hours ago',
        link: 'analytics.html'
    }
];

// Sample top products
let topProducts = [
    { name: 'Rice (1kg)', sales: 245 },
    { name: 'Bread', sales: 198 },
    { name: 'Milk (1L)', sales: 156 },
    { name: 'Sugar (1kg)', sales: 134 },
    { name: 'Tea Leaves', sales: 123 }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    updateStatistics();
    loadRecentActivity();
    updateLastRefresh();

    // Auto-refresh every 5 minutes
    setInterval(() => {
        updateStatistics();
        loadRecentActivity();
        updateLastRefresh();
        showToast('Dashboard updated', 'info', 2000);
    }, 300000);
});

// Initialize dashboard components
function initializeDashboard() {
    // Set current date/time
    updateLastRefresh();

    // Initialize global search
    initializeGlobalSearch();

    // Add click handlers for stats cards
    initializeStatsCardHandlers();

    // Initialize notification system
    initializeNotifications();
}

// Update statistics cards
function updateStatistics() {
    // Today's Sales
    document.getElementById('todaysSales').textContent = formatCurrency(dashboardData.sales.today);

    // Low Stock Count
    document.getElementById('lowStockCount').textContent = dashboardData.inventory.lowStockItems;

    // Pending Orders
    document.getElementById('pendingOrdersCount').textContent = dashboardData.orders.pending;

    // Reorder Requests
    document.getElementById('reorderRequestsCount').textContent = dashboardData.reorders.pending;

    // Delivery Success Rate
    document.getElementById('deliveryRate').textContent = dashboardData.deliveries.successRate + '%';

    // Top Selling Product
    if (topProducts.length > 0) {
        document.getElementById('topProduct').textContent = topProducts[0].name;
    }
}

// Load recent activity feed
function loadRecentActivity() {
    let activityContainer = document.getElementById('activityFeed');
    if (!activityContainer) return;

    activityContainer.innerHTML = '';

    recentActivity.forEach((activity, index) => {
        let activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.style.animationDelay = `${index * 0.1}s`;

        activityItem.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                    <div class="rounded-circle bg-light p-2 text-center" style="width: 40px; height: 40px;">
                        <i class="${activity.icon} ${activity.iconColor}"></i>
                    </div>
                </div>
                <div class="flex-grow-1">
                    <p class="mb-1">${activity.message}</p>
                    <small class="text-muted">${activity.time}</small>
                </div>
                <div class="flex-shrink-0">
                    <button class="btn btn-sm btn-outline-primary" onclick="location.href='${activity.link}'" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;

        activityContainer.appendChild(activityItem);
    });
}

// Update last refresh time
function updateLastRefresh() {
    let lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        let now = new Date();
        lastUpdatedElement.textContent = now.toLocaleString();
    }
}

// Initialize global search functionality
function initializeGlobalSearch() {
    let searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performGlobalSearch(this.value);
        }
    });
}

// Perform global search (placeholder functionality)
function performGlobalSearch(searchTerm) {
    if (!searchTerm.trim()) {
        showToast('Please enter a search term', 'warning');
        return;
    }

    // This would normally search across all modules
    showToast(`Searching for: ${searchTerm}`, 'info');

    // For demo, we'll show some mock results
    setTimeout(() => {
        showToast(`Found 5 results for "${searchTerm}"`, 'success');
    }, 1000);
}

// Initialize stats card click handlers
function initializeStatsCardHandlers() {
    // Add click handlers to stats cards for navigation
    let statsCards = document.querySelectorAll('.stats-card');

    statsCards.forEach((card, index) => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', function () {
            switch (index) {
                case 0: // Today's Sales
                    location.href = 'analytics.html';
                    break;
                case 1: // Low Stock
                    location.href = 'inventory.html';
                    break;
                case 2: // Pending Orders
                    location.href = 'orders.html';
                    break;
                case 3: // Reorder Requests
                    location.href = 'suppliers.html';
                    break;
                case 4: // Delivery Rate
                    location.href = 'deliveries.html';
                    break;
                case 5: // Top Product
                    location.href = 'analytics.html';
                    break;
            }
        });
    });
}

// Initialize notification system
function initializeNotifications() {
    updateNotificationCount();

    // Simulate real-time notifications
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            addNewNotification();
        }
    }, 30000); // Check every 30 seconds
}

// Update notification count
function updateNotificationCount() {
    let notificationBadge = document.getElementById('notificationCount');
    if (notificationBadge) {
        // Count unread notifications (mock data)
        let unreadCount = 3;
        notificationBadge.textContent = unreadCount;

        if (unreadCount === 0) {
            notificationBadge.style.display = 'none';
        } else {
            notificationBadge.style.display = 'block';
        }
    }
}

// Add new notification (simulation)
function addNewNotification() {
    let notifications = [
        'New order received',
        'Stock level critical',
        'Delivery completed',
        'Payment processed',
        'Reorder request pending'
    ];

    let randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    showToast(randomNotification, 'info', 3000);

    // Update notification count
    let currentCount = parseInt(document.getElementById('notificationCount').textContent);
    document.getElementById('notificationCount').textContent = currentCount + 1;
}

// Refresh activity feed
function refreshActivity() {
    showLoading('activityFeed');

    // Simulate API call delay
    setTimeout(() => {
        // Add a new activity item
        let newActivity = {
            id: recentActivity.length + 1,
            type: 'system',
            icon: 'fas fa-sync-alt',
            iconColor: 'text-info',
            message: 'Dashboard refreshed',
            time: 'Just now',
            link: '#'
        };

        recentActivity.unshift(newActivity);

        // Keep only latest 10 items
        if (recentActivity.length > 10) {
            recentActivity = recentActivity.slice(0, 10);
        }

        loadRecentActivity();
        showToast('Activity feed refreshed', 'success');
    }, 1000);
}

// Quick action functions
function createNewOrder() {
    location.href = 'orders.html';
}

function addNewProduct() {
    location.href = 'inventory.html';
}

function manageBulkReorder() {
    location.href = 'suppliers.html';
}

function viewReports() {
    location.href = 'analytics.html';
}

function addNewCustomer() {
    location.href = 'customers.html';
}

function trackDeliveries() {
    location.href = 'deliveries.html';
}

// Utility functions for dashboard
function generateMockSalesData() {
    // This would normally fetch real sales data
    return {
        today: Math.random() * 200000 + 50000,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        percentage: Math.random() * 20 + 5
    };
}

function generateMockInventoryData() {
    // This would normally fetch real inventory data
    return {
        lowStock: Math.floor(Math.random() * 20) + 5,
        outOfStock: Math.floor(Math.random() * 5),
        nearExpiry: Math.floor(Math.random() * 10) + 2
    };
}

// Dashboard keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Alt + D = Dashboard
    if (e.altKey && e.key === 'd') {
        e.preventDefault();
        location.href = 'dashboard.html';
    }

    // Alt + I = Inventory
    if (e.altKey && e.key === 'i') {
        e.preventDefault();
        location.href = 'inventory.html';
    }

    // Alt + O = Orders
    if (e.altKey && e.key === 'o') {
        e.preventDefault();
        location.href = 'orders.html';
    }

    // Alt + C = Customers
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        location.href = 'customers.html';
    }

    // Ctrl + / = Toggle sidebar
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        let sidebar = new bootstrap.Offcanvas(document.getElementById('sidebar'));
        sidebar.toggle();
    }
});

// Export dashboard data (for reports)
function exportDashboardData() {
    let data = {
        exportDate: new Date().toISOString(),
        statistics: dashboardData,
        recentActivity: recentActivity,
        topProducts: topProducts
    };

    let dataStr = JSON.stringify(data, null, 2);
    let dataBlob = new Blob([dataStr], { type: 'application/json' });

    let link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Dashboard data exported successfully', 'success');
}

// Print dashboard
function printDashboard() {
    window.print();
}

// Initialize dashboard modules when page loads
window.addEventListener('load', function () {
    // Add any additional initialization here
    console.log('Sampath Grocery Store Dashboard Loaded');

    // Show welcome message for first-time users
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            showToast('Welcome to Sampath Grocery Store Dashboard!', 'success', 5000);
            localStorage.setItem('welcomeShown', 'true');
        }, 1000);
    }
});

// Popup Management Functions
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    const mainWrapper = document.querySelector('.main-wrapper');

    if (popup && mainWrapper) {
        // Add blur effect to background
        mainWrapper.classList.add('blurred');

        // Show popup with animation
        popup.style.display = 'flex';
        setTimeout(() => {
            popup.classList.add('active');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    const mainWrapper = document.querySelector('.main-wrapper');

    if (popup && mainWrapper) {
        // Remove active class for exit animation
        popup.classList.remove('active');

        // Remove blur effect from background
        mainWrapper.classList.remove('blurred');

        // Hide popup after animation
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);

        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
}

// Close popup when clicking outside
document.addEventListener('click', function (event) {
    const popupOverlays = document.querySelectorAll('.popup-overlay.active');

    popupOverlays.forEach(popup => {
        if (event.target === popup) {
            const popupId = popup.getAttribute('id');
            closePopup(popupId);
        }
    });
});

// Close popup with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const activePopup = document.querySelector('.popup-overlay.active');
        if (activePopup) {
            const popupId = activePopup.getAttribute('id');
            closePopup(popupId);
        }
    }
});

// Notification Popup Functions
function showNotificationPopup() {
    showPopup('notificationPopup');

    // Mark notifications as viewed (remove badges)
    setTimeout(() => {
        const badges = document.querySelectorAll('#notificationPopup .notification-badge');
        badges.forEach(badge => {
            badge.style.display = 'none';
        });

        // Update notification count
        const notificationCount = document.getElementById('notificationCount');
        if (notificationCount) {
            notificationCount.textContent = '0';
            notificationCount.style.display = 'none';
        }
    }, 500);
}

function handleNotificationClick(notificationType) {
    closePopup('notificationPopup');

    // Handle different notification types
    switch (notificationType) {
        case 'low-stock':
            showToast('Redirecting to Inventory Management...', 'info');
            setTimeout(() => {
                window.location.href = 'inventory.html';
            }, 1000);
            break;
        case 'new-order':
            showToast('Redirecting to Order Management...', 'info');
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1000);
            break;
        case 'delivery-completed':
            showToast('Delivery details loaded', 'success');
            break;
        case 'supplier-update':
            showToast('Redirecting to Suppliers...', 'info');
            setTimeout(() => {
                window.location.href = 'suppliers.html';
            }, 1000);
            break;
        case 'payment-received':
            showToast('Payment details loaded', 'success');
            break;
        case 'inventory-update':
            showToast('Redirecting to Inventory Management...', 'info');
            setTimeout(() => {
                window.location.href = 'inventory.html';
            }, 1000);
            break;
        default:
            showToast('Notification clicked', 'info');
    }
}

// Profile Popup Functions
function showProfilePopup() {
    showPopup('profilePopup');
}

function handleProfileAction(action) {
    closePopup('profilePopup');

    // Handle different profile actions
    switch (action) {
        case 'profile':
            showToast('Loading profile details...', 'info');
            break;
        case 'edit-profile':
            showToast('Opening profile editor...', 'info');
            break;
        case 'settings':
            showToast('Redirecting to settings...', 'info');
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 1000);
            break;
        case 'security':
            showToast('Opening security settings...', 'info');
            break;
        case 'help':
            showToast('Opening help documentation...', 'info');
            break;
        case 'about':
            showToast('System Version: 1.0.0 | Built by Sampath Grocery Team', 'info', 3000);
            break;
        case 'logout':
            if (confirm('Are you sure you want to logout?')) {
                showToast('Logging out...', 'info');
                setTimeout(() => {
                    // Simulate logout redirect
                    window.location.href = 'login.html';
                }, 1000);
            }
            break;
        default:
            showToast('Profile action: ' + action, 'info');
    }
}

// Test SweetAlert2 functionality
function testSweetAlert() {
    console.log('Testing SweetAlert2...');

    // Test if SweetAlert2 is loaded
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 (Swal) is not loaded!');
        alert('SweetAlert2 is not loaded! Check browser console for errors.');
        return;
    }

    console.log('SweetAlert2 is loaded, testing basic alert...');

    // Test direct Swal.fire
    Swal.fire({
        title: 'SweetAlert2 Working! 🎉',
        text: 'SweetAlert2 is properly integrated and functioning.',
        icon: 'success',
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#38ce3c'
    });
}