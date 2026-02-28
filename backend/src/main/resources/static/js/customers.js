// Customer Management JavaScript - Backend Integration

// Global Variables
let customers = [];
let editingCustomerId = null;

// API Base URL
const API_BASE_URL = '/api/customers';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadCustomers();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchCustomer').addEventListener('input', filterCustomers);

    // City filter - will be populated after customers load
    const cityFilter = document.getElementById('filterCity');
    if (cityFilter) {
        cityFilter.addEventListener('change', filterCustomers);
    }

    // Loyalty tier filter
    const loyaltyTierFilter = document.getElementById('filterLoyaltyTier');
    if (loyaltyTierFilter) {
        loyaltyTierFilter.addEventListener('change', filterCustomers);
    }

    // Phone validation
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('blur', validatePhone);
    }

    // Email validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', validateEmail);
    }
}

// Load all customers from backend
async function loadCustomers() {
    try {
        showLoadingSpinner();
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error('Failed to load customers');
        }

        const apiResponse = await response.json();
        customers = apiResponse.data || [];

        displayCustomers();
        updateStatistics();
        populateCityFilter();
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error loading customers:', error);
        hideLoadingSpinner();
        showToast('Failed to load customers. Please try again.', 'error');
    }
}

// Display customers in table
function displayCustomers(customersToDisplay = customers) {
    const tableBody = document.getElementById('customersTableBody');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (customersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <p>No customers found</p>
                </td>
            </tr>
        `;
        return;
    }

    customersToDisplay.forEach((customer) => {
        const row = document.createElement('tr');

        const statusBadge = customer.isActive
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Inactive</span>';

        const loyaltyCard = customer.loyaltyCardNumber || '-';

        row.innerHTML = `
            <td>${customer.customerCode || '-'}</td>
            <td>
                <div class="fw-bold">${customer.fullName}</div>
            </td>
            <td>${customer.phone}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.city || '-'}</td>
            <td><small>${loyaltyCard}</small></td>
            <td>
                <span class="badge bg-warning text-dark">${customer.loyaltyPoints || 0}</span>
                <br><small class="text-muted">${customer.loyaltyTier || 'BRONZE'}</small>
            </td>
            <td>${customer.totalOrders || 0}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="viewCustomer(${customer.customerId})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-warning btn-sm me-1" onclick="editCustomer(${customer.customerId})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteCustomer(${customer.customerId}, '${customer.fullName}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const loyaltyMembers = customers.filter(c => c.loyaltyCardNumber).length;
    const totalPurchases = customers.reduce((sum, c) => sum + (parseFloat(c.totalPurchases) || 0), 0);

    // Calculate birthdays this month from profiles
    const currentMonth = new Date().getMonth();
    let birthdaysThisMonth = 0;
    // This will be enhanced when we integrate customer profiles

    const totalCustomersEl = document.getElementById('totalCustomers');
    const loyaltyMembersEl = document.getElementById('loyaltyMembers');
    const birthdaysEl = document.getElementById('birthdaysThisMonth');
    const outstandingEl = document.getElementById('outstandingBalance');

    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (loyaltyMembersEl) loyaltyMembersEl.textContent = loyaltyMembers;
    if (birthdaysEl) birthdaysEl.textContent = birthdaysThisMonth;
    if (outstandingEl) outstandingEl.textContent = 'Rs. 0'; // TODO: Calculate from orders
}

// Populate city filter dropdown
function populateCityFilter() {
    const cities = [...new Set(customers.map(c => c.city).filter(city => city))];
    const filterCity = document.getElementById('filterCity');

    if (!filterCity) return;

    filterCity.innerHTML = '<option value="">All Cities</option>';
    cities.forEach(city => {
        filterCity.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

// Filter customers
function filterCustomers() {
    const searchTerm = document.getElementById('searchCustomer').value.toLowerCase();
    const cityFilter = document.getElementById('filterCity')?.value || '';
    const loyaltyTierFilter = document.getElementById('filterLoyaltyTier')?.value || '';

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm ||
            (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm)) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            (customer.customerCode && customer.customerCode.toLowerCase().includes(searchTerm));

        const matchesCity = !cityFilter || customer.city === cityFilter;

        const matchesLoyaltyTier = !loyaltyTierFilter || customer.loyaltyTier === loyaltyTierFilter;

        return matchesSearch && matchesCity && matchesLoyaltyTier;
    });

    displayCustomers(filteredCustomers);
}

// Clear filters
function clearCustomerFilters() {
    document.getElementById('searchCustomer').value = '';
    const cityFilter = document.getElementById('filterCity');
    const loyaltyTierFilter = document.getElementById('filterLoyaltyTier');

    if (cityFilter) cityFilter.value = '';
    if (loyaltyTierFilter) loyaltyTierFilter.value = '';

    displayCustomers();
}

// Submit customer form (Create)
async function submitCustomerForm() {
    if (!validateCustomerForm()) {
        return;
    }

    const customerData = getCustomerFormData();
    const profileData = getProfileFormData();

    try {
        showButtonLoading('btnSubmitCustomer');

        // Create customer
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create customer');
        }

        const result = await response.json();
        const newCustomer = result.data;

        // Update profile if we have additional data
        if (profileData.dateOfBirth || profileData.gender || profileData.notes) {
            await updateCustomerProfile(newCustomer.customerId, profileData);
        }

        hideButtonLoading('btnSubmitCustomer');
        showToast('Customer created successfully!', 'success');

        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCustomerForm'));
        modal.hide();
        clearCustomerForm();
        loadCustomers();

    } catch (error) {
        console.error('Error creating customer:', error);
        hideButtonLoading('btnSubmitCustomer');
        showToast(error.message || 'Failed to create customer', 'error');
    }
}

// Update customer
async function updateCustomer() {
    if (!validateCustomerForm() || !editingCustomerId) {
        return;
    }

    const customerData = getCustomerFormData();
    const profileData = getProfileFormData();

    try {
        showButtonLoading('btnUpdateCustomer');

        // Update customer
        const response = await fetch(`${API_BASE_URL}/${editingCustomerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update customer');
        }

        // Update profile
        if (profileData.dateOfBirth || profileData.gender || profileData.notes) {
            await updateCustomerProfile(editingCustomerId, profileData);
        }

        hideButtonLoading('btnUpdateCustomer');
        showToast('Customer updated successfully!', 'success');

        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCustomerForm'));
        modal.hide();
        clearCustomerForm();
        loadCustomers();
        editingCustomerId = null;

    } catch (error) {
        console.error('Error updating customer:', error);
        hideButtonLoading('btnUpdateCustomer');
        showToast(error.message || 'Failed to update customer', 'error');
    }
}

// Update customer profile
async function updateCustomerProfile(customerId, profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${customerId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            console.warn('Failed to update customer profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// View customer details
async function viewCustomer(customerId) {
    // TODO: Implement customer profile view modal
    showToast('Customer profile view coming soon!', 'info');
}

// Edit customer
async function editCustomer(customerId) {
    try {
        showLoadingSpinner();

        // Fetch customer details
        const response = await fetch(`${API_BASE_URL}/${customerId}`);
        if (!response.ok) {
            throw new Error('Failed to load customer details');
        }

        const result = await response.json();
        const customer = result.data;

        // Fetch customer profile
        let profile = null;
        try {
            const profileResponse = await fetch(`${API_BASE_URL}/${customerId}/profile`);
            if (profileResponse.ok) {
                const profileResult = await profileResponse.json();
                profile = profileResult.data;
            }
        } catch (profileError) {
            console.warn('No profile found for customer');
        }

        hideLoadingSpinner();

        // Populate form
        editingCustomerId = customerId;
        document.getElementById('customerId').value = customerId;
        document.getElementById('fullName').value = customer.fullName || '';
        document.getElementById('phone').value = customer.phone || '';
        document.getElementById('alternatePhone').value = customer.alternatePhone || '';
        document.getElementById('email').value = customer.email || '';
        document.getElementById('address').value = customer.address || '';
        document.getElementById('city').value = customer.city || '';
        document.getElementById('isActive').value = customer.isActive ? 'true' : 'false';

        // Readonly fields
        document.getElementById('loyaltyCardNumber').value = customer.loyaltyCardNumber || '';
        document.getElementById('loyaltyPoints').value = customer.loyaltyPoints || 0;
        document.getElementById('loyaltyTier').value = customer.loyaltyTier || 'BRONZE';
        document.getElementById('totalPurchases').value = customer.totalPurchases || 0;
        document.getElementById('totalOrders').value = customer.totalOrders || 0;

        // Profile data
        if (profile) {
            document.getElementById('gender').value = profile.gender || '';
            document.getElementById('dateOfBirth').value = profile.dateOfBirth || '';
            document.getElementById('preferredContactMethod').value = profile.preferredContactMethod || 'PHONE';
            document.getElementById('notes').value = profile.notes || '';
        }

        // Show update button, hide submit button
        document.getElementById('btnSubmitCustomer').style.display = 'none';
        document.getElementById('btnUpdateCustomer').style.display = 'inline-block';

        // Change modal title
        document.getElementById('modalCustomerFormLabel').innerHTML =
            '<i class="fas fa-edit me-2"></i>Edit Customer';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('modalCustomerForm'));
        modal.show();

    } catch (error) {
        console.error('Error loading customer for edit:', error);
        hideLoadingSpinner();
        showToast('Failed to load customer details', 'error');
    }
}

// Delete customer
async function deleteCustomer(customerId, customerName) {
    const confirmed = await Swal.fire({
        title: 'Delete Customer?',
        text: `Are you sure you want to delete "${customerName}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!confirmed.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${customerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete customer');
        }

        showToast('Customer deleted successfully!', 'success');
        loadCustomers();

    } catch (error) {
        console.error('Error deleting customer:', error);
        showToast(error.message || 'Failed to delete customer', 'error');
    }
}

// Get customer form data
function getCustomerFormData() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        alternatePhone: document.getElementById('alternatePhone').value.trim() || null,
        email: document.getElementById('email').value.trim() || null,
        address: document.getElementById('address').value.trim() || null,
        city: document.getElementById('city').value.trim() || null,
        isActive: document.getElementById('isActive').value === 'true'
    };
}

// Get profile form data
function getProfileFormData() {
    const gender = document.getElementById('gender').value;
    const preferredContactMethod = document.getElementById('preferredContactMethod').value;

    return {
        dateOfBirth: document.getElementById('dateOfBirth').value || null,
        gender: gender || null,
        preferredContactMethod: preferredContactMethod || 'PHONE',
        notes: document.getElementById('notes').value.trim() || null
    };
}

// Validate customer form
function validateCustomerForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName) {
        showToast('Full name is required', 'error');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!phone) {
        showToast('Phone number is required', 'error');
        document.getElementById('phone').focus();
        return false;
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        showToast('Phone must be exactly 10 digits', 'error');
        document.getElementById('phone').focus();
        return false;
    }

    // Validate email if provided
    const email = document.getElementById('email').value.trim();
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            document.getElementById('email').focus();
            return false;
        }
    }

    // Validate alternate phone if provided
    const altPhone = document.getElementById('alternatePhone').value.trim();
    if (altPhone && !phoneRegex.test(altPhone)) {
        showToast('Alternate phone must be exactly 10 digits', 'error');
        document.getElementById('alternatePhone').focus();
        return false;
    }

    return true;
}

// Validate phone
function validatePhone() {
    const phone = document.getElementById('phone').value.trim();
    const phoneField = document.getElementById('phone');

    if (phone) {
        const phoneRegex = /^[0-9]{10}$/;
        if (phoneRegex.test(phone)) {
            phoneField.classList.remove('is-invalid');
            phoneField.classList.add('is-valid');
        } else {
            phoneField.classList.remove('is-valid');
            phoneField.classList.add('is-invalid');
        }
    }
}

// Validate email
function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const emailField = document.getElementById('email');

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            emailField.classList.remove('is-invalid');
            emailField.classList.add('is-valid');
        } else {
            emailField.classList.remove('is-valid');
            emailField.classList.add('is-invalid');
        }
    }
}

// Clear customer form
function clearCustomerForm() {
    const form = document.getElementById('customerForm');
    if (form) {
        form.reset();
    }

    editingCustomerId = null;
    document.getElementById('customerId').value = '';

    // Reset validation classes
    document.querySelectorAll('.form-control, .form-select').forEach(element => {
        element.classList.remove('is-valid', 'is-invalid');
    });

    // Reset readonly fields to default values
    document.getElementById('loyaltyCardNumber').value = '';
    document.getElementById('loyaltyPoints').value = '0';
    document.getElementById('loyaltyTier').value = 'BRONZE';
    document.getElementById('totalPurchases').value = '0';
    document.getElementById('totalOrders').value = '0';

    // Show submit button, hide update button
    document.getElementById('btnSubmitCustomer').style.display = 'inline-block';
    document.getElementById('btnUpdateCustomer').style.display = 'none';

    // Reset modal title
    document.getElementById('modalCustomerFormLabel').innerHTML =
        '<i class="fas fa-user me-2"></i>Customer Information';
}

// Export customer data
function exportCustomerData() {
    if (customers.length === 0) {
        showToast('No customers to export', 'info');
        return;
    }

    const headers = [
        'Customer Code', 'Full Name', 'Phone', 'Alternate Phone', 'Email',
        'Address', 'City', 'Loyalty Card', 'Loyalty Points', 'Loyalty Tier',
        'Total Purchases', 'Total Orders', 'Status', 'Created At'
    ];

    let csv = headers.join(',') + '\n';

    customers.forEach(customer => {
        const row = [
            customer.customerCode || '',
            `"${customer.fullName}"`,
            customer.phone || '',
            customer.alternatePhone || '',
            customer.email || '',
            `"${(customer.address || '').replace(/"/g, '""')}"`,
            customer.city || '',
            customer.loyaltyCardNumber || '',
            customer.loyaltyPoints || 0,
            customer.loyaltyTier || 'BRONZE',
            customer.totalPurchases || 0,
            customer.totalOrders || 0,
            customer.isActive ? 'Active' : 'Inactive',
            customer.createdAt || ''
        ];
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Customer data exported successfully!', 'success');
}

// Send birthday wishes
function sendBirthdayWishes() {
    // TODO: Implement when profile integration is complete
    showToast('Birthday wishes feature coming soon!', 'info');
}

// Bulk loyalty upgrade
function bulkLoyaltyUpgrade() {
    // TODO: Implement bulk operations
    showToast('Bulk loyalty upgrade coming soon!', 'info');
}

// Helper: Show loading spinner
function showLoadingSpinner() {
    // Implement global loading indicator if needed
    console.log('Loading...');
}

// Helper: Hide loading spinner
function hideLoadingSpinner() {
    console.log('Loading complete');
}

// Helper: Show button loading state
function showButtonLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    }
}

// Helper: Hide button loading state
function hideButtonLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.disabled = false;
        if (buttonId === 'btnSubmitCustomer') {
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Add Customer';
        } else if (buttonId === 'btnUpdateCustomer') {
            btn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
        }
    }
}

// Helper: Show alert notification (Centered Modal)
function showToast(message, type = 'info') {
    const iconMap = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const titleMap = {
        success: 'Success!',
        error: 'Error!',
        warning: 'Warning!',
        info: 'Information'
    };

    Swal.fire({
        icon: iconMap[type] || 'info',
        title: titleMap[type] || 'Notification',
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#22C55E',
        timer: 3000,
        timerProgressBar: true
    });
}

// Helper: Format currency
function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount || 0).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
