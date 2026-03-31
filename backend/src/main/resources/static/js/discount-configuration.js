/**
 * Modern Discount Configuration - JavaScript Handler
 * Handles all interactions for the discount configuration modal
 */

// Constants
const API_BASE = '/api/discounts';
const DISCOUNT_TYPES = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED_AMOUNT: 'FIXED_AMOUNT',
    BUY_X_GET_Y: 'BUY_X_GET_Y'
};

const APPLICABLE_TO = {
    ALL_PRODUCTS: 'ALL_PRODUCTS',
    CATEGORY: 'CATEGORY',
    SPECIFIC_PRODUCTS: 'SPECIFIC_PRODUCTS',
    PRODUCT_SET: 'PRODUCT_SET'
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    setDefaultDates();
    updatePreview();
});

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    // Form changes
    document.getElementById('discountName').addEventListener('input', updatePreview);
    document.getElementById('discountCategory').addEventListener('change', handleCategoryChange);
    document.getElementById('discountValue').addEventListener('input', updatePreview);
    document.getElementById('isActive').addEventListener('change', updatePreview);
    document.getElementById('startDate').addEventListener('change', updatePreview);
    document.getElementById('endDate').addEventListener('change', updatePreview);
    document.getElementById('priorityLevel').addEventListener('input', updatePreview);

    // Discount type changes
    document.querySelectorAll('input[name="discountType"]').forEach(radio => {
        radio.addEventListener('change', handleDiscountTypeChange);
    });

    // Applicability changes
    document.getElementById('applicableTo').addEventListener('change', handleApplicabilityChange);

    // Save button
    document.getElementById('saveDiscountBtn').addEventListener('click', handleFormSubmit);

    // Modal close
    document.getElementById('discountModal')?.addEventListener('hidden.bs.modal', resetForm);
}

// ========== FORM HANDLERS ==========
function handleDiscountTypeChange(event) {
    const type = event.target.value;
    const valueLabel = document.getElementById('valueLabel');
    
    switch(type) {
        case DISCOUNT_TYPES.PERCENTAGE:
            valueLabel.textContent = 'Discount Value (%)';
            document.getElementById('discountValue').max = '100';
            break;
        case DISCOUNT_TYPES.FIXED_AMOUNT:
            valueLabel.textContent = 'Discount Value (Rs.)';
            document.getElementById('discountValue').max = '';
            break;
        case DISCOUNT_TYPES.BUY_X_GET_Y:
            valueLabel.textContent = 'Quantity (Get X)';
            document.getElementById('discountValue').max = '';
            break;
    }
    
    updatePreview();
}

function handleCategoryChange(event) {
    const category = event.target.value;
    const bulkThresholdGroup = document.getElementById('bulkThresholdGroup');
    
    // Show bulk threshold only for BULK_THRESHOLD category
    if (category === 'BULK_THRESHOLD') {
        bulkThresholdGroup.style.display = 'block';
    } else {
        bulkThresholdGroup.style.display = 'none';
    }
    
    updatePreview();
}

function handleApplicabilityChange(event) {
    const applicableTo = event.target.value;
    const productsGroup = document.getElementById('productsSelectionGroup');
    
    if (applicableTo && applicableTo !== 'ALL_PRODUCTS') {
        productsGroup.style.display = 'block';
        // Load products/categories if needed
    } else {
        productsGroup.style.display = 'none';
    }
}

// ========== FORM SUBMISSION ==========
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showToast('Please fix the errors before saving', 'danger');
        return;
    }

    const formData = collectFormData();
    
    try {
        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showToast('Discount saved successfully!', 'success');
            resetForm();
            const modal = bootstrap.Modal.getInstance(document.getElementById('discountModal'));
            modal?.hide();
            // Reload discounts list if needed
            loadDiscounts?.();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save discount', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while saving', 'danger');
    }
}

// ========== FORM VALIDATION ==========
function validateForm() {
    const form = document.getElementById('discountForm');
    const errors = [];

    // Discount name validation
    const name = document.getElementById('discountName').value.trim();
    if (!name) {
        errors.push('Discount name is required');
        document.getElementById('discountName').classList.add('is-invalid');
    } else {
        document.getElementById('discountName').classList.remove('is-invalid');
    }

    // Category validation
    const category = document.getElementById('discountCategory').value;
    if (!category) {
        errors.push('Category is required');
        document.getElementById('discountCategory').classList.add('is-invalid');
    } else {
        document.getElementById('discountCategory').classList.remove('is-invalid');
    }

    // Discount value validation
    const value = parseFloat(document.getElementById('discountValue').value);
    const type = document.querySelector('input[name="discountType"]:checked').value;
    
    if (isNaN(value) || value <= 0) {
        errors.push('Discount value must be greater than 0');
        document.getElementById('discountValue').classList.add('is-invalid');
    } else {
        if (type === DISCOUNT_TYPES.PERCENTAGE && value > 100) {
            errors.push('Percentage cannot exceed 100%');
            document.getElementById('discountValue').classList.add('is-invalid');
        } else {
            document.getElementById('discountValue').classList.remove('is-invalid');
        }
    }

    // Date validation
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!document.getElementById('startDate').value) {
        errors.push('Start date is required');
        document.getElementById('startDate').classList.add('is-invalid');
    } else {
        document.getElementById('startDate').classList.remove('is-invalid');
    }

    if (!document.getElementById('endDate').value) {
        errors.push('End date is required');
        document.getElementById('endDate').classList.add('is-invalid');
    } else if (endDate <= startDate) {
        errors.push('End date must be after start date');
        document.getElementById('endDate').classList.add('is-invalid');
    } else {
        document.getElementById('endDate').classList.remove('is-invalid');
    }

    if (errors.length > 0) {
        console.warn('Validation errors:', errors);
    }

    return errors.length === 0;
}

// ========== FORM DATA COLLECTION ==========
function collectFormData() {
    return {
        discountCode: generateDiscountCode(),
        discountName: document.getElementById('discountName').value.trim(),
        discountCategory: document.getElementById('discountCategory').value,
        discountType: document.querySelector('input[name="discountType"]:checked').value,
        discountValue: parseFloat(document.getElementById('discountValue').value),
        maxDiscountAmount: parseFloat(document.getElementById('maxDiscountAmount').value) || null,
        applicableTo: document.getElementById('applicableTo').value,
        applicableIds: getSelectedProducts(),
        minPurchaseAmount: parseFloat(document.getElementById('minPurchaseAmount').value) || 0,
        customerTypeCondition: document.getElementById('customerType').value,
        bulkThresholdQuantity: document.getElementById('applicableTo').value === 'BULK_THRESHOLD' ? 
            parseInt(document.getElementById('bulkThreshold').value) : null,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        priorityLevel: parseInt(document.getElementById('priorityLevel').value) || 0,
        usageLimit: parseInt(document.getElementById('usageLimit').value) || null,
        usagePerCustomer: parseInt(document.getElementById('usagePerCustomer').value) || null,
        isActive: document.getElementById('isActive').checked
    };
}

// ========== UTILITY FUNCTIONS ==========
function setDefaultDates() {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);

    document.getElementById('startDate').value = formatDateForInput(today);
    document.getElementById('endDate').value = formatDateForInput(endDate);
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function generateDiscountCode() {
    const name = document.getElementById('discountName').value.trim();
    const timestamp = Date.now().toString(36).toUpperCase();
    const code = (name.substring(0, 3) + timestamp).toUpperCase().substring(0, 10);
    return code;
}

function getSelectedProducts() {
    const items = document.querySelectorAll('.multi-select-item');
    return Array.from(items).map(item => item.dataset.id);
}

function resetForm() {
    document.getElementById('discountForm').reset();
    document.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid');
    });
    setDefaultDates();
    updatePreview();
    document.getElementById('bulkThresholdGroup').style.display = 'none';
    document.getElementById('productsSelectionGroup').style.display = 'none';
}

// ========== PREVIEW UPDATES ==========
function updatePreview() {
    const name = document.getElementById('discountName').value || 'Not set';
    const category = document.getElementById('discountCategory').value || '-';
    const type = document.querySelector('input[name="discountType"]:checked').value;
    const value = document.getElementById('discountValue').value || '-';
    const startDate = formatDateForDisplay(document.getElementById('startDate').value);
    const endDate = formatDateForDisplay(document.getElementById('endDate').value);
    const isActive = document.getElementById('isActive').checked;

    document.getElementById('previewName').textContent = name;
    document.getElementById('previewCategory').textContent = getCategoryLabel(category);
    document.getElementById('previewValue').textContent = 
        type === 'PERCENTAGE' ? `${value}%` : `Rs. ${value}`;
    document.getElementById('previewPeriod').textContent = 
        startDate !== 'N/A' && endDate !== 'N/A' ? `${startDate} to ${endDate}` : '-';
    document.getElementById('previewStatus').textContent = isActive ? 'Active' : 'Inactive';
    document.getElementById('previewStatus').className = isActive ? 'badge bg-success' : 'badge bg-secondary';
}

function getCategoryLabel(value) {
    const labels = {
        'LOYALTY': '🎁 Loyalty',
        'SEASONAL': '🌍 Seasonal',
        'DAILY': '📅 Daily',
        'BULK_THRESHOLD': '📦 Bulk',
        'CUSTOM_PRODUCT': '✨ Custom'
    };
    return labels[value] || '-';
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">
                    ${type === 'success' ? '<i class="bi bi-check-circle"></i>' : 
                      type === 'danger' ? '<i class="bi bi-exclamation-circle"></i>' : 
                      '<i class="bi bi-info-circle"></i>'} Notification
                </strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
    
    // Auto remove after toast is hidden
    document.getElementById(toastId).addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// ========== AUTH & API HELPERS ==========
function getAuthToken() {
    // Get token from localStorage or session
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
}

function loadDiscounts() {
    // Placeholder for loading discounts list
    // Implement based on your existing code
    console.log('Loading discounts...');
}

// Export functions for modal control
window.discountConfig = {
    showModal: () => {
        resetForm();
        const modal = new bootstrap.Modal(document.getElementById('discountModal'));
        modal.show();
    },
    hideModal: () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('discountModal'));
        modal?.hide();
    },
    editDiscount: (discountData) => {
        // Populate form with discount data
        document.getElementById('discountName').value = discountData.discountName;
        document.getElementById('discountCategory').value = discountData.discountCategory;
        document.querySelector(`input[value="${discountData.discountType}"]`).checked = true;
        document.getElementById('discountValue').value = discountData.discountValue;
        // ... populate other fields
        updatePreview();
        window.discountConfig.showModal();
    }
};

// Console log for debugging
console.log('✅ Discount Configuration module loaded successfully');
