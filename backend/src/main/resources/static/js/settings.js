// Settings Management System JavaScript

// Settings data storage
let systemSettings = JSON.parse(localStorage.getItem('systemSettings')) || getDefaultSettings();
let systemUsers = JSON.parse(localStorage.getItem('systemUsers')) || getDefaultUsers();

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize background blur effect
    initializeBlurEffect();

    // Initialize settings system
    initializeSettings();

    // Set up event listeners
    setupEventListeners();

    console.log('Settings Management System initialized');
});

// Initialize blur effect for modals (if any future modals are added)
function initializeBlurEffect() {
    // Placeholder for modal blur effects
    // Can be extended when modals are added to settings
}

// Initialize settings system
function initializeSettings() {
    // Load all settings into forms
    loadGeneralSettings();
    loadUserManagement();
    loadNotificationSettings();
    loadSecuritySettings();
    loadBackupSettings();

    // Update data storage info
    updateStorageInfo();
}

// Set up event listeners
function setupEventListeners() {
    // Settings tab navigation
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            switchSettingsTab(this.dataset.tab);
        });
    });

    // Auto-save settings on change
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('change', function () {
            // Auto-save after a delay
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(saveCurrentTabSettings, 1000);
        });
    });

    // File input for data import
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
}

// Switch settings tab
function switchSettingsTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));

    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Load general settings
function loadGeneralSettings() {
    const general = systemSettings.general || {};

    document.getElementById('storeName').value = general.storeName || 'Sampath Grocery Store';
    document.getElementById('storeAddress').value = general.storeAddress || '123 Main Street, Kandy 20000, Sri Lanka';
    document.getElementById('storePhone').value = general.storePhone || '+94 81 222 3333';
    document.getElementById('storeEmail').value = general.storeEmail || 'info@sampathgrocery.lk';
    document.getElementById('businessHours').value = general.businessHours || 'Monday - Sunday: 6:00 AM - 10:00 PM';
    document.getElementById('currency').value = general.currency || 'LKR';
    document.getElementById('timezone').value = general.timezone || 'Asia/Colombo';
    document.getElementById('dateFormat').value = general.dateFormat || 'DD/MM/YYYY';
    document.getElementById('autoBackup').checked = general.autoBackup !== false;
    document.getElementById('lowStockAlerts').checked = general.lowStockAlerts !== false;
}

// Load user management
function loadUserManagement() {
    displayUsers();
}

// Display users in table
function displayUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;

    if (systemUsers.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = systemUsers.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                        <i class="fas fa-user-circle fa-2x text-primary"></i>
                    </div>
                    <div>
                        <strong>${user.name}</strong>
                        <br><small class="text-muted">Created: ${formatDate(user.createdAt)}</small>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td>
                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="toggleUserStatus('${user.id}')" 
                            title="${user.status === 'active' ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')" 
                            title="Delete" ${user.role === 'admin' ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load notification settings
function loadNotificationSettings() {
    const notifications = systemSettings.notifications || {};

    document.getElementById('emailNewOrders').checked = notifications.emailNewOrders !== false;
    document.getElementById('emailLowStock').checked = notifications.emailLowStock !== false;
    document.getElementById('emailDailyReports').checked = notifications.emailDailyReports === true;
    document.getElementById('emailPaymentAlerts').checked = notifications.emailPaymentAlerts !== false;
    document.getElementById('notificationEmail').value = notifications.notificationEmail || 'admin@sampathgrocery.lk';

    document.getElementById('smsOrderConfirm').checked = notifications.smsOrderConfirm !== false;
    document.getElementById('smsDeliveryUpdate').checked = notifications.smsDeliveryUpdate !== false;
    document.getElementById('smsPromotions').checked = notifications.smsPromotions === true;
    document.getElementById('smsProvider').value = notifications.smsProvider || 'dialog';
    document.getElementById('smsApiKey').value = notifications.smsApiKey || '';
}

// Load security settings
function loadSecuritySettings() {
    const security = systemSettings.security || {};

    document.getElementById('minPasswordLength').value = security.minPasswordLength || 8;
    document.getElementById('requireUppercase').checked = security.requireUppercase !== false;
    document.getElementById('requireNumbers').checked = security.requireNumbers !== false;
    document.getElementById('requireSpecialChars').checked = security.requireSpecialChars === true;
    document.getElementById('passwordExpiry').value = security.passwordExpiry || 90;

    document.getElementById('sessionTimeout').value = security.sessionTimeout || 30;
    document.getElementById('twoFactorAuth').checked = security.twoFactorAuth === true;
    document.getElementById('loginLogging').checked = security.loginLogging !== false;
    document.getElementById('maxLoginAttempts').value = security.maxLoginAttempts || 5;
    document.getElementById('lockoutDuration').value = security.lockoutDuration || 15;
}

// Load backup settings
function loadBackupSettings() {
    const backup = systemSettings.backup || {};

    document.getElementById('autoBackupEnabled').checked = backup.autoBackupEnabled !== false;
    document.getElementById('backupFrequency').value = backup.backupFrequency || 'daily';
    document.getElementById('backupTime').value = backup.backupTime || '02:00';
    document.getElementById('retentionPeriod').value = backup.retentionPeriod || 30;
}

// Add new user
function addUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;

    if (!name || !email || !role || !password) {
        showAlert('Error', 'Please fill in all required fields!', 'error');
        return;
    }

    // Check if email already exists
    if (systemUsers.some(user => user.email === email)) {
        showAlert('Error', 'A user with this email already exists!', 'error');
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        return;
    }

    const newUser = {
        id: generateUserId(),
        name: name,
        email: email,
        role: role,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null
    };

    systemUsers.push(newUser);
    saveUsers();

    // Clear form
    document.getElementById('addUserForm').reset();

    // Refresh users list
    displayUsers();

    showAlert('Success', 'User added successfully!', 'success');
}

// Edit user
function editUser(userId) {
    const user = systemUsers.find(u => u.id === userId);
    if (!user) return;

    Swal.fire({
        title: 'Edit User',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" id="editUserName" class="form-control" value="${user.name}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" id="editUserEmail" class="form-control" value="${user.email}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select id="editUserRole" class="form-select">
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="cashier" ${user.role === 'cashier' ? 'selected' : ''}>Cashier</option>
                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                    </select>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        preConfirm: () => {
            const name = document.getElementById('editUserName').value.trim();
            const email = document.getElementById('editUserEmail').value.trim();
            const role = document.getElementById('editUserRole').value;

            if (!name || !email || !role) {
                Swal.showValidationMessage('Please fill in all fields');
                return false;
            }

            return { name, email, role };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            user.name = result.value.name;
            user.email = result.value.email;
            user.role = result.value.role;

            saveUsers();
            displayUsers();
            showAlert('Success', 'User updated successfully!', 'success');
        }
    });
}

// Toggle user status
function toggleUserStatus(userId) {
    const user = systemUsers.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'admin') {
        showAlert('Error', 'Cannot deactivate administrator account!', 'error');
        return;
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    saveUsers();
    displayUsers();

    showAlert('Success', `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
}

// Delete user
function deleteUser(userId) {
    const user = systemUsers.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'admin') {
        showAlert('Error', 'Cannot delete administrator account!', 'error');
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: `This will permanently delete the user "${user.name}".`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete!'
    }).then((result) => {
        if (result.isConfirmed) {
            const userIndex = systemUsers.findIndex(u => u.id === userId);
            systemUsers.splice(userIndex, 1);
            saveUsers();
            displayUsers();
            showAlert('Success', 'User deleted successfully!', 'success');
        }
    });
}

// Save current tab settings
function saveCurrentTabSettings() {
    const activeTab = document.querySelector('.settings-tab.active').dataset.tab;

    switch (activeTab) {
        case 'general':
            saveGeneralSettings();
            break;
        case 'notifications':
            saveNotificationSettings();
            break;
        case 'security':
            saveSecuritySettings();
            break;
        case 'backup':
            saveBackupSettings();
            break;
    }
}

// Save all settings
function saveAllSettings() {
    saveGeneralSettings();
    saveNotificationSettings();
    saveSecuritySettings();
    saveBackupSettings();

    showAlert('Success', 'All settings saved successfully!', 'success');
}

// Save general settings
function saveGeneralSettings() {
    systemSettings.general = {
        storeName: document.getElementById('storeName').value,
        storeAddress: document.getElementById('storeAddress').value,
        storePhone: document.getElementById('storePhone').value,
        storeEmail: document.getElementById('storeEmail').value,
        businessHours: document.getElementById('businessHours').value,
        currency: document.getElementById('currency').value,
        timezone: document.getElementById('timezone').value,
        dateFormat: document.getElementById('dateFormat').value,
        autoBackup: document.getElementById('autoBackup').checked,
        lowStockAlerts: document.getElementById('lowStockAlerts').checked
    };

    saveSettings();
}

// Save notification settings
function saveNotificationSettings() {
    systemSettings.notifications = {
        emailNewOrders: document.getElementById('emailNewOrders').checked,
        emailLowStock: document.getElementById('emailLowStock').checked,
        emailDailyReports: document.getElementById('emailDailyReports').checked,
        emailPaymentAlerts: document.getElementById('emailPaymentAlerts').checked,
        notificationEmail: document.getElementById('notificationEmail').value,
        smsOrderConfirm: document.getElementById('smsOrderConfirm').checked,
        smsDeliveryUpdate: document.getElementById('smsDeliveryUpdate').checked,
        smsPromotions: document.getElementById('smsPromotions').checked,
        smsProvider: document.getElementById('smsProvider').value,
        smsApiKey: document.getElementById('smsApiKey').value
    };

    saveSettings();
}

// Save security settings
function saveSecuritySettings() {
    systemSettings.security = {
        minPasswordLength: parseInt(document.getElementById('minPasswordLength').value),
        requireUppercase: document.getElementById('requireUppercase').checked,
        requireNumbers: document.getElementById('requireNumbers').checked,
        requireSpecialChars: document.getElementById('requireSpecialChars').checked,
        passwordExpiry: parseInt(document.getElementById('passwordExpiry').value),
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        loginLogging: document.getElementById('loginLogging').checked,
        maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
        lockoutDuration: parseInt(document.getElementById('lockoutDuration').value)
    };

    saveSettings();
}

// Save backup settings
function saveBackupSettings() {
    systemSettings.backup = {
        autoBackupEnabled: document.getElementById('autoBackupEnabled').checked,
        backupFrequency: document.getElementById('backupFrequency').value,
        backupTime: document.getElementById('backupTime').value,
        retentionPeriod: parseInt(document.getElementById('retentionPeriod').value)
    };

    saveSettings();
}

// Backup and Data Management Functions

// Create backup
function createBackup() {
    showAlert('Info', 'Creating backup...', 'info');

    const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
            inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            customers: JSON.parse(localStorage.getItem('customers') || '[]'),
            suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
            deliveries: JSON.parse(localStorage.getItem('deliveries') || '[]'),
            settings: systemSettings,
            users: systemUsers
        }
    };

    // Create downloadable backup file
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sampath-grocery-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    setTimeout(() => {
        showAlert('Success', 'Backup created and downloaded successfully!', 'success');
    }, 1000);
}

// Restore backup
function restoreBackup() {
    Swal.fire({
        title: 'Restore Backup',
        text: 'This will replace all current data. Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, restore!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('fileInput').click();
        }
    });
}

// Export data
function exportData() {
    const exportData = {
        inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
        deliveries: JSON.parse(localStorage.getItem('deliveries') || '[]')
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sampath-grocery-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showAlert('Success', 'Data exported successfully!', 'success');
}

// Import data
function importData() {
    document.getElementById('fileInput').click();
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.data) {
                // This is a backup file
                restoreFromBackup(data);
            } else {
                // This is an export file
                importFromExport(data);
            }
        } catch (error) {
            showAlert('Error', 'Invalid file format!', 'error');
        }
    };
    reader.readAsText(file);
}

// Restore from backup
function restoreFromBackup(backupData) {
    try {
        const data = backupData.data;

        localStorage.setItem('inventory', JSON.stringify(data.inventory || []));
        localStorage.setItem('orders', JSON.stringify(data.orders || []));
        localStorage.setItem('customers', JSON.stringify(data.customers || []));
        localStorage.setItem('suppliers', JSON.stringify(data.suppliers || []));
        localStorage.setItem('deliveries', JSON.stringify(data.deliveries || []));

        if (data.settings) {
            systemSettings = data.settings;
            saveSettings();
        }

        if (data.users) {
            systemUsers = data.users;
            saveUsers();
        }

        showAlert('Success', 'Backup restored successfully! Please refresh the page.', 'success');
    } catch (error) {
        showAlert('Error', 'Failed to restore backup!', 'error');
    }
}

// Import from export
function importFromExport(exportData) {
    try {
        if (exportData.inventory) localStorage.setItem('inventory', JSON.stringify(exportData.inventory));
        if (exportData.orders) localStorage.setItem('orders', JSON.stringify(exportData.orders));
        if (exportData.customers) localStorage.setItem('customers', JSON.stringify(exportData.customers));
        if (exportData.suppliers) localStorage.setItem('suppliers', JSON.stringify(exportData.suppliers));
        if (exportData.deliveries) localStorage.setItem('deliveries', JSON.stringify(exportData.deliveries));

        showAlert('Success', 'Data imported successfully!', 'success');
    } catch (error) {
        showAlert('Error', 'Failed to import data!', 'error');
    }
}

// Clear old data
function clearOldData() {
    Swal.fire({
        title: 'Clear Old Data',
        text: 'This will delete all data older than 90 days. Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, clear!'
    }).then((result) => {
        if (result.isConfirmed) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            // Clear old orders
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const recentOrders = orders.filter(order => new Date(order.date) > cutoffDate);
            localStorage.setItem('orders', JSON.stringify(recentOrders));

            // Clear old deliveries
            const deliveries = JSON.parse(localStorage.getItem('deliveries') || '[]');
            const recentDeliveries = deliveries.filter(delivery => new Date(delivery.dispatchTime) > cutoffDate);
            localStorage.setItem('deliveries', JSON.stringify(recentDeliveries));

            updateStorageInfo();
            showAlert('Success', 'Old data cleared successfully!', 'success');
        }
    });
}

// Reset all data
function resetAllData() {
    Swal.fire({
        title: 'Reset All Data',
        text: 'This will delete ALL data permanently. Are you absolutely sure?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, reset everything!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Confirm again
            Swal.fire({
                title: 'Final Confirmation',
                text: 'Type "RESET" to confirm:',
                input: 'text',
                inputPlaceholder: 'Type RESET',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                preConfirm: (value) => {
                    if (value !== 'RESET') {
                        Swal.showValidationMessage('Please type "RESET" to confirm');
                        return false;
                    }
                    return true;
                }
            }).then((confirmResult) => {
                if (confirmResult.isConfirmed) {
                    // Clear all localStorage data
                    localStorage.removeItem('inventory');
                    localStorage.removeItem('orders');
                    localStorage.removeItem('customers');
                    localStorage.removeItem('suppliers');
                    localStorage.removeItem('deliveries');
                    localStorage.removeItem('systemSettings');
                    localStorage.removeItem('systemUsers');

                    // Reset to defaults
                    systemSettings = getDefaultSettings();
                    systemUsers = getDefaultUsers();
                    saveSettings();
                    saveUsers();

                    updateStorageInfo();
                    showAlert('Success', 'All data has been reset!', 'success');
                }
            });
        }
    });
}

// Update storage info
function updateStorageInfo() {
    const getSize = (key) => {
        const data = localStorage.getItem(key) || '';
        return new Blob([data]).size;
    };

    const inventorySize = getSize('inventory');
    const ordersSize = getSize('orders');
    const customersSize = getSize('customers');
    const totalSize = inventorySize + ordersSize + customersSize +
        getSize('suppliers') + getSize('deliveries') +
        getSize('systemSettings') + getSize('systemUsers');

    document.getElementById('inventorySize').textContent = formatBytes(inventorySize);
    document.getElementById('ordersSize').textContent = formatBytes(ordersSize);
    document.getElementById('customersSize').textContent = formatBytes(customersSize);
    document.getElementById('totalSize').textContent = formatBytes(totalSize);
}

// Helper functions

function validatePassword(password) {
    const minLength = parseInt(document.getElementById('minPasswordLength').value);
    const requireUppercase = document.getElementById('requireUppercase').checked;
    const requireNumbers = document.getElementById('requireNumbers').checked;
    const requireSpecialChars = document.getElementById('requireSpecialChars').checked;

    if (password.length < minLength) {
        showAlert('Error', `Password must be at least ${minLength} characters long!`, 'error');
        return false;
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        showAlert('Error', 'Password must contain at least one uppercase letter!', 'error');
        return false;
    }

    if (requireNumbers && !/\d/.test(password)) {
        showAlert('Error', 'Password must contain at least one number!', 'error');
        return false;
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showAlert('Error', 'Password must contain at least one special character!', 'error');
        return false;
    }

    return true;
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function getRoleBadgeClass(role) {
    const classes = {
        'admin': 'bg-danger',
        'manager': 'bg-warning',
        'cashier': 'bg-info',
        'staff': 'bg-secondary'
    };
    return classes[role] || 'bg-secondary';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDefaultSettings() {
    return {
        general: {
            storeName: 'Sampath Grocery Store',
            storeAddress: '123 Main Street, Kandy 20000, Sri Lanka',
            storePhone: '+94 81 222 3333',
            storeEmail: 'info@sampathgrocery.lk',
            businessHours: 'Monday - Sunday: 6:00 AM - 10:00 PM',
            currency: 'LKR',
            timezone: 'Asia/Colombo',
            dateFormat: 'DD/MM/YYYY',
            autoBackup: true,
            lowStockAlerts: true
        },
        notifications: {
            emailNewOrders: true,
            emailLowStock: true,
            emailDailyReports: false,
            emailPaymentAlerts: true,
            notificationEmail: 'admin@sampathgrocery.lk',
            smsOrderConfirm: true,
            smsDeliveryUpdate: true,
            smsPromotions: false,
            smsProvider: 'dialog',
            smsApiKey: ''
        },
        security: {
            minPasswordLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            passwordExpiry: 90,
            sessionTimeout: 30,
            twoFactorAuth: false,
            loginLogging: true,
            maxLoginAttempts: 5,
            lockoutDuration: 15
        },
        backup: {
            autoBackupEnabled: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            retentionPeriod: 30
        }
    };
}

function getDefaultUsers() {
    return [
        {
            id: 'user_admin_001',
            name: 'System Administrator',
            email: 'admin@sampathgrocery.lk',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null
        }
    ];
}

function saveSettings() {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
}

function saveUsers() {
    localStorage.setItem('systemUsers', JSON.stringify(systemUsers));
}

// Show alert using SweetAlert2
function showAlert(title, message, type) {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        confirmButtonColor: '#22C55E'
    });
}