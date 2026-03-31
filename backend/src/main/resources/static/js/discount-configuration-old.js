/**
 * Discount Configuration JavaScript
 * Handles all frontend interactions for discount management
 */

// Global state
let discounts = [];
let currentEditingId = null;

// API Base URL
const API_BASE_URL = '/api/discounts';

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('Discount Configuration page loaded');
    
    // Load all discounts
    loadDiscounts();
    
    // Event listeners
    document.getElementById('toggleFormBtn').addEventListener('click', showCreateForm);
    document.getElementById('closeFormBtn').addEventListener('click', hideForm);
    document.getElementById('cancelFormBtn').addEventListener('click', hideForm);
    document.getElementById('discountForm').addEventListener('submit', handleFormSubmit);
    
    // Filter listeners
    document.getElementById('searchInput').addEventListener('keyup', filterDiscounts);
    document.getElementById('categoryFilter').addEventListener('change', filterDiscounts);
    document.getElementById('statusFilter').addEventListener('change', filterDiscounts);
    
    // Form field change listeners
    document.getElementById('discountType').addEventListener('change', updateDiscountValueUnit);
    document.getElementById('applicableTo').addEventListener('change', toggleProductSelection);
    document.getElementById('discountCategory').addEventListener('change', updateCategorySpecificFields);
    document.getElementById('discountCode').addEventListener('blur', function() {
        if (!this.value) {
            this.value = generateDiscountCode();
        }
    });
    
    // Set today's date for start date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
});

// ========== LOAD DATA ==========

async function loadDiscounts() {
    try {
        const response = await fetch(`${API_BASE_URL}`);
        if (response.ok) {
            discounts = await response.json();
            if (discounts.data) {
                discounts = discounts.data;
            }
            displayDiscounts(discounts);
        } else {
            showToast('Failed to load discounts', 'error');
        }
    } catch (error) {
        console.error('Error loading discounts:', error);
        showToast('Error loading discounts', 'error');
    }
}

// ========== DISPLAY DISCOUNTS ==========

function displayDiscounts(discountsToDisplay) {
    const container = document.getElementById('discountsList');
    
    if (discountsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">No discounts found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = discountsToDisplay.map(discount => createDiscountCard(discount)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit-discount').forEach(btn => {
        btn.addEventListener('click', function() {
            editDiscount(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.btn-delete-discount').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteDiscount(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.btn-toggle-discount').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleDiscountStatus(this.dataset.id);
        });
    });
}

function createDiscountCard(discount) {
    const categoryClass = `badge-category-${discount.discountCategory.toLowerCase().replace(/_/g, '')}`;
    const isInactive = discount.isActive === false;
    const statusBadge = discount.isActive 
        ? '<span class="badge bg-success">Active</span>' 
        : '<span class="badge bg-danger">Inactive</span>';
    
    const dateRange = `${formatDate(discount.startDate)} to ${formatDate(discount.endDate)}`;
    const todayDate = new Date().toISOString().split('T')[0];
    const isExpired = discount.endDate < todayDate;
    const isUpcoming = discount.startDate > todayDate;
    
    let dateStatus = '';
    if (isExpired) {
        dateStatus = '<span class="badge bg-warning text-dark">Expired</span>';
    } else if (isUpcoming) {
        dateStatus = '<span class="badge bg-info">Upcoming</span>';
    }
    
    const usageInfo = discount.usageLimit 
        ? `${discount.timesUsed}/${discount.usageLimit}` 
        : `${discount.timesUsed}/(Unlimited)`;
    
    const discountValueDisplay = discount.discountType === 'PERCENTAGE' 
        ? `${discount.discountValue}%` 
        : `Rs. ${discount.discountValue}`;
    
    return `
        <div class="discount-card ${isInactive ? 'inactive' : ''}">
            <div class="discount-card-header">
                <div>
                    <div class="discount-card-title">${escapeHtml(discount.discountName)}</div>
                    <div class="discount-card-code">${escapeHtml(discount.discountCode)}</div>
                    <div class="mt-2">
                        <span class="discount-badge ${categoryClass}">${discount.discountCategory}</span>
                        ${statusBadge}
                        ${dateStatus}
                    </div>
                </div>
            </div>
            
            <div class="discount-details">
                <div class="discount-detail">
                    <div class="discount-detail-label">Discount Value</div>
                    <div class="discount-detail-value">${discountValueDisplay}</div>
                </div>
                <div class="discount-detail">
                    <div class="discount-detail-label">Type</div>
                    <div class="discount-detail-value">${discount.applicableTo}</div>
                </div>
                <div class="discount-detail">
                    <div class="discount-detail-label">Min Purchase</div>
                    <div class="discount-detail-value">Rs. ${discount.minPurchaseAmount || 'No minimum'}</div>
                </div>
                <div class="discount-detail">
                    <div class="discount-detail-label">Uses</div>
                    <div class="discount-detail-value">${usageInfo}</div>
                </div>
                <div class="discount-detail">
                    <div class="discount-detail-label">Priority</div>
                    <div class="discount-detail-value">${discount.priorityLevel || 0}</div>
                </div>
                <div class="discount-detail">
                    <div class="discount-detail-label">Duration</div>
                    <div class="discount-detail-value">${dateRange}</div>
                </div>
            </div>
            
            <div class="discount-actions">
                <button class="btn btn-sm btn-custom-primary btn-sm-custom btn-edit-discount" data-id="${discount.discountId}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-info btn-sm-custom btn-toggle-discount" data-id="${discount.discountId}">
                    <i class="fas fa-${discount.isActive ? 'ban' : 'check'}"></i> ${discount.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-sm btn-danger btn-sm-custom btn-delete-discount" data-id="${discount.discountId}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// ========== FORM OPERATIONS ==========

function showCreateForm() {
    resetForm();
    document.getElementById('formTitle').textContent = 'Create New Discount';
    document.getElementById('discountFormSection').style.display = 'block';
    document.getElementById('discountCode').readOnly = false;
    document.getElementById('discountCode').value = generateDiscountCode();
    document.getElementById('toggleFormBtn').style.display = 'none';
    document.getElementById('discountCode').readOnly = false;
    currentEditingId = null;
    
    // Scroll to form
    document.getElementById('discountFormSection').scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    document.getElementById('discountFormSection').style.display = 'none';
    document.getElementById('toggleFormBtn').style.display = 'inline-block';
    resetForm();
    currentEditingId = null;
}

function resetForm() {
    document.getElementById('discountForm').reset();
    document.getElementById('discountCode').value = generateDiscountCode();
    document.getElementById('applicableTo').value = 'ALL_PRODUCTS';
    document.getElementById('customerTypeCondition').value = 'ANY';
    document.getElementById('discountType').value = '';
    document.getElementById('discountCategory').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('priorityLevel').value = '0';
    document.getElementById('usagePerCustomer').value = '1';
    updateDiscountValueUnit();
    toggleProductSelection();
    updateCategorySpecificFields();
    
    // Clear validation errors
    document.querySelectorAll('.validation-error').forEach(el => el.textContent = '');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        discountCode: document.getElementById('discountCode').value,
        discountName: document.getElementById('discountName').value,
        discountCategory: document.getElementById('discountCategory').value,
        discountType: document.getElementById('discountType').value,
        discountValue: parseFloat(document.getElementById('discountValue').value),
        minPurchaseAmount: parseFloat(document.getElementById('minPurchaseAmount').value) || null,
        maxDiscountAmount: parseFloat(document.getElementById('maxDiscountAmount').value) || null,
        applicableTo: document.getElementById('applicableTo').value,
        applicableIds: document.getElementById('applicableIds').value || null,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        customerTypeCondition: document.getElementById('customerTypeCondition').value,
        bulkThresholdQuantity: document.getElementById('discountCategory').value === 'BULK_THRESHOLD'
            ? parseInt(document.getElementById('bulkThresholdQuantity').value) || null
            : null,
        priorityLevel: parseInt(document.getElementById('priorityLevel').value) || 0,
        usageLimit: parseInt(document.getElementById('usageLimit').value) || null,
        usagePerCustomer: parseInt(document.getElementById('usagePerCustomer').value) || 1,
        isActive: document.getElementById('isActive').checked
    };
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    try {
        let response;
        if (currentEditingId) {
            // Update existing discount
            response = await fetch(`${API_BASE_URL}/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new discount
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            const result = await response.json();
            showToast(result.message || (currentEditingId ? 'Discount updated successfully' : 'Discount created successfully'), 'success');
            hideForm();
            await loadDiscounts();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save discount', 'error');
        }
    } catch (error) {
        console.error('Error saving discount:', error);
        showToast('Error saving discount', 'error');
    }
}

async function editDiscount(discountId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${discountId}`);
        if (response.ok) {
            const result = await response.json();
            const discount = result.data;
            
            // Populate form
            document.getElementById('discountCode').value = discount.discountCode;
            document.getElementById('discountCode').readOnly = true;
            document.getElementById('discountName').value = discount.discountName;
            document.getElementById('discountCategory').value = discount.discountCategory;
            document.getElementById('discountType').value = discount.discountType;
            document.getElementById('discountValue').value = discount.discountValue;
            document.getElementById('minPurchaseAmount').value = discount.minPurchaseAmount || '';
            document.getElementById('maxDiscountAmount').value = discount.maxDiscountAmount || '';
            document.getElementById('applicableTo').value = discount.applicableTo;
            document.getElementById('applicableIds').value = discount.applicableIds || '';
            document.getElementById('startDate').value = discount.startDate;
            document.getElementById('endDate').value = discount.endDate;
            document.getElementById('customerTypeCondition').value = discount.customerTypeCondition;
            document.getElementById('bulkThresholdQuantity').value = discount.bulkThresholdQuantity || '';
            document.getElementById('priorityLevel').value = discount.priorityLevel || 0;
            document.getElementById('usageLimit').value = discount.usageLimit || '';
            document.getElementById('usagePerCustomer').value = discount.usagePerCustomer || 1;
            document.getElementById('isActive').checked = discount.isActive;
            
            currentEditingId = discountId;
            document.getElementById('formTitle').textContent = 'Edit Discount';
            document.getElementById('discountFormSection').style.display = 'block';
            document.getElementById('toggleFormBtn').style.display = 'none';
            
            updateDiscountValueUnit();
            toggleProductSelection();
            updateCategorySpecificFields();
            
            // Scroll to form
            document.getElementById('discountFormSection').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading discount:', error);
        showToast('Error loading discount details', 'error');
    }
}

async function deleteDiscount(discountId) {
    if (confirm('Are you sure you want to delete this discount?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/${discountId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showToast('Discount deleted successfully', 'success');
                await loadDiscounts();
            } else {
                showToast('Failed to delete discount', 'error');
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
            showToast('Error deleting discount', 'error');
        }
    }
}

async function toggleDiscountStatus(discountId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${discountId}/toggle-status`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showToast('Discount status updated', 'success');
            await loadDiscounts();
        } else {
            showToast('Failed to update discount status', 'error');
        }
    } catch (error) {
        console.error('Error toggling discount status:', error);
        showToast('Error updating discount', 'error');
    }
}

// ========== FORM INTERACTIONS ==========

function updateDiscountValueUnit() {
    const discountType = document.getElementById('discountType').value;
    const unit = discountType === 'PERCENTAGE' ? '%' : 'Rs.';
    document.getElementById('discountValueUnit').textContent = unit;
}

function toggleProductSelection() {
    const applicableTo = document.getElementById('applicableTo').value;
    const group = document.getElementById('applicableIdsGroup');
    const textarea = document.getElementById('applicableIds');
    
    if (applicableTo === 'ALL_PRODUCTS') {
        group.style.display = 'none';
        textarea.value = '';
    } else {
        group.style.display = 'block';
        if (applicableTo === 'CATEGORY') {
            document.getElementById('applicableIdsHint').textContent = 'Enter category IDs as JSON array: [1,2,3]';
        } else {
            document.getElementById('applicableIdsHint').textContent = 'Enter product IDs as JSON array: [1,2,3]';
        }
    }
}

function updateCategorySpecificFields() {
    const category = document.getElementById('discountCategory').value;
    const bulkGroup = document.getElementById('bulkThresholdGroup');
    
    if (category === 'BULK_THRESHOLD') {
        bulkGroup.style.display = 'block';
    } else {
        bulkGroup.style.display = 'none';
    }
}

// ========== FILTERING ==========

function filterDiscounts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = discounts.filter(d => {
        const matchesSearch = d.discountCode.toLowerCase().includes(searchTerm) ||
                            d.discountName.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || d.discountCategory === categoryFilter;
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'active' && d.isActive === true) ||
                            (statusFilter === 'inactive' && d.isActive === false);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    displayDiscounts(filtered);
}

// ========== VALIDATION ==========

function validateForm(data) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.validation-error').forEach(el => el.textContent = '');
    
    // Validate required fields
    if (!data.discountCode) {
        document.getElementById('discountCodeError').textContent = 'Discount code is required';
        isValid = false;
    }
    if (!data.discountName) {
        document.getElementById('discountNameError').textContent = 'Discount name is required';
        isValid = false;
    }
    if (!data.discountCategory) {
        document.getElementById('discountCategoryError').textContent = 'Discount category is required';
        isValid = false;
    }
    if (!data.discountType) {
        document.getElementById('discountTypeError').textContent = 'Discount type is required';
        isValid = false;
    }
    if (!data.discountValue || data.discountValue <= 0) {
        document.getElementById('discountValueError').textContent = 'Discount value must be greater than 0';
        isValid = false;
    }
    if (!data.startDate) {
        document.getElementById('startDateError').textContent = 'Start date is required';
        isValid = false;
    }
    if (!data.endDate) {
        document.getElementById('endDateError').textContent = 'End date is required';
        isValid = false;
    }
    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
        document.getElementById('endDateError').textContent = 'End date must be after start date';
        isValid = false;
    }
    
    return isValid;
}

// ========== UTILITY FUNCTIONS ==========

function generateDiscountCode() {
    const prefix = 'DSC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`.substr(0, 50);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function showToast(message, type = 'info') {
    const toastHTML = `
        <div class="alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.innerHTML = toastHTML;
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
