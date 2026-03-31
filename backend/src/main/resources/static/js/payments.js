// payments.js

// Initialize payments module
document.addEventListener('DOMContentLoaded', function () {
    initializePayments();
    loadPaymentHistory();
    loadDiscountHistory();
    loadDiscountConfiguration();
    updatePaymentStats();
    switchHistoryTab('payments');
    setupEventListeners();
});

// Storage keys
const STORAGE_KEYS = {
    PAYMENTS: 'payments',
    DISCOUNT_CONFIG: 'discountConfig'
};

let discountProductCatalogCache = [];
let discountProductCatalogLoaded = false;
let editingDiscountId = null;

// Safe alert helpers so core flows work even if SweetAlert2 fails to load.
function safeFire(title, text, icon = 'info') {
    if (typeof Swal !== 'undefined' && Swal && typeof Swal.fire === 'function') {
        return Swal.fire(title, text, icon);
    }
    window.alert(`${title}: ${text}`);
    return Promise.resolve();
}

function safeConfirm(options) {
    if (typeof Swal !== 'undefined' && Swal && typeof Swal.fire === 'function') {
        return Swal.fire(options);
    }
    const confirmed = window.confirm(options.text || options.title || 'Are you sure?');
    return Promise.resolve({ isConfirmed: confirmed });
}

// Get default discount configuration
function getDefaultDiscountConfig() {
    return {
        loyalty: {
            enabled: true,
            percent: 5,
            minPurchase: 0
        },
        bulk: {
            enabled: false,
            threshold: 10000,
            percent: 10
        },
        promo: {
            name: '',
            startDate: '',
            endDate: '',
            percent: 0,
            applicableTo: 'All'
        },
        manual: {
            allowedRoles: ['Manager', 'Admin'],
            maxPercent: 15,
            reasonRequired: true
        }
    };
}

// Initialize payments data structure
function initializePayments() {
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.DISCOUNT_CONFIG)) {
        localStorage.setItem(STORAGE_KEYS.DISCOUNT_CONFIG, JSON.stringify(getDefaultDiscountConfig()));
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search and filter listeners
    document.getElementById('searchPayment')?.addEventListener('input', filterPayments);
    document.getElementById('filterPaymentMethod')?.addEventListener('change', filterPayments);
    document.getElementById('filterPaymentStatus')?.addEventListener('change', filterPayments);
    document.getElementById('filterDateFrom')?.addEventListener('change', filterPayments);
    document.getElementById('filterDateTo')?.addEventListener('change', filterPayments);

    // Discount configuration modal listeners
    initializeDiscountConfigUI();
}

// Load payment history
function loadPaymentHistory() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    const tableBody = document.getElementById('paymentsTableBody');

    if (payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No payment records found. Process payments from POS or Orders module.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    tableBody.innerHTML = payments.map(payment => {
        const statusBadge = getStatusBadge(payment.status);
        const methodBadge = getMethodBadge(payment.method);

        return `
            <tr>
                <td class="fw-bold">${payment.id}</td>
                <td>${payment.orderCode}</td>
                <td>${payment.customerName || 'Walk-in'}</td>
                <td>${formatDateTime(payment.date)}</td>
                <td>${methodBadge}</td>
                <td class="text-end fw-bold">Rs. ${parseFloat(payment.amount).toFixed(2)}</td>
                <td class="text-end text-success">Rs. ${parseFloat(payment.discount || 0).toFixed(2)}</td>
                <td>${statusBadge}</td>
                <td>${payment.transactionRef || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPaymentDetails('${payment.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load discount history from database
function loadDiscountHistory() {
    const tableBody = document.getElementById('discountsTableBody');
    if (!tableBody) return;

    fetch('/api/discounts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(payload => {
            const discounts = Array.isArray(payload?.data) ? payload.data : [];

            if (discounts.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center text-muted">
                            <i class="fas fa-inbox fa-3x mb-3"></i>
                            <p>No discounts found. Save a discount from Discount Config to see it here.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = discounts.map(discount => {
                const value = parseFloat(discount.discountValue || 0).toFixed(2);
                const isPercent = discount.discountType === 'PERCENTAGE';
                const statusBadge = discount.isActive
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-secondary">Inactive</span>';
                const deactivateDisabled = discount.isActive ? '' : 'disabled';
                const deactivateTitle = discount.isActive
                    ? 'Deactivate this discount'
                    : 'Already inactive';

                return `
                    <tr>
                        <td class="fw-bold">${discount.discountId || '-'}</td>
                        <td>${discount.discountCode || '-'}</td>
                        <td>${discount.discountName || '-'}</td>
                        <td>${discount.discountCategory || '-'}</td>
                        <td>${discount.discountType || '-'}</td>
                        <td class="text-end fw-bold">${isPercent ? `${value}%` : `Rs. ${value}`}</td>
                        <td>${formatDiscountDateRange(discount.startDate, discount.endDate)}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <div class="btn-group btn-group-sm" role="group">
                                <button type="button" class="btn btn-outline-primary" title="View"
                                    onclick="viewDiscountDetails(${discount.discountId})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button type="button" class="btn btn-outline-warning" title="Edit"
                                    onclick="editDiscount(${discount.discountId})">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button type="button" class="btn btn-outline-danger" title="Delete"
                                    onclick="deleteDiscount(${discount.discountId}, '${escapeHtml(discount.discountCode || '')}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button type="button" class="btn btn-outline-secondary" title="${deactivateTitle}" ${deactivateDisabled}
                                    onclick="deactivateDiscount(${discount.discountId}, '${escapeHtml(discount.discountCode || '')}', ${discount.isActive ? 'true' : 'false'})">
                                    <i class="fas fa-ban"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        })
        .catch(error => {
            console.error('Failed to load discounts:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-danger">
                        <i class="fas fa-triangle-exclamation me-2"></i>
                        Failed to load discounts from database.
                    </td>
                </tr>
            `;
        });
}

function formatDiscountDateRange(startDate, endDate) {
    if (!startDate && !endDate) return '-';
    if (!startDate) return `Until ${endDate}`;
    if (!endDate) return `From ${startDate}`;
    return startDate === endDate ? startDate : `${startDate} to ${endDate}`;
}

function resetDiscountEditMode() {
    editingDiscountId = null;

    const modalLabel = document.getElementById('modalDiscountConfigLabel');
    if (modalLabel) {
        modalLabel.innerHTML = '<i class="fas fa-percent me-2"></i>Discount Configuration';
    }

    const saveButton = document.getElementById('discountConfigSaveButton');
    if (saveButton) {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Discount';
    }
}

function setDiscountEditMode(discountId) {
    editingDiscountId = discountId;

    const modalLabel = document.getElementById('modalDiscountConfigLabel');
    if (modalLabel) {
        modalLabel.innerHTML = `<i class="fas fa-pen-to-square me-2"></i>Edit Discount #${discountId}`;
    }

    const saveButton = document.getElementById('discountConfigSaveButton');
    if (saveButton) {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Update Discount';
    }
}

function parseDiscountApplicableIds(applicableIds) {
    if (!applicableIds) return [];
    if (Array.isArray(applicableIds)) {
        return applicableIds.map(v => String(v));
    }

    try {
        const parsed = JSON.parse(applicableIds);
        return Array.isArray(parsed) ? parsed.map(v => String(v)) : [];
    } catch (error) {
        console.warn('Unable to parse applicableIds JSON:', applicableIds);
        return [];
    }
}

async function populateDiscountFormForEdit(discount) {
    const category = ['SEASONAL', 'DAILY'].includes(discount.discountCategory)
        ? discount.discountCategory
        : 'SEASONAL';
    const isFixed = discount.discountType === 'FIXED_AMOUNT';
    const applyAllProducts = discount.applicableTo === 'ALL_PRODUCTS';
    const selectedProducts = parseDiscountApplicableIds(discount.applicableIds);

    document.getElementById('discountCategory').value = category;
    document.getElementById('discountName').value = discount.discountName || '';
    document.getElementById('discountEnabled').checked = !!discount.isActive;

    document.getElementById('discountTypeFixed').checked = isFixed;
    document.getElementById('discountTypePercentage').checked = !isFixed;
    document.getElementById('discountValueConfig').value = parseFloat(discount.discountValue || 0);

    document.getElementById('applyAllProductsConfig').checked = applyAllProducts;
    document.getElementById('brandFilterConfig').value = 'ALL';
    document.getElementById('categoryFilterConfig').value = 'ALL';
    document.getElementById('productSearchConfig').value = '';

    document.getElementById('minPurchaseConfig').value = parseFloat(discount.minPurchaseAmount || 0);
    document.getElementById('customerTypeConfig').value = discount.customerTypeCondition === 'LOYALTY_ONLY'
        ? 'LOYALTY_CUSTOMERS_ONLY'
        : 'ALL_CUSTOMERS';
    document.getElementById('bulkThresholdConfig').value = discount.bulkThresholdQuantity || 0;

    document.getElementById('startDateConfig').value = discount.startDate || '';
    document.getElementById('endDateConfig').value = discount.endDate || '';
    document.getElementById('dailyDateConfig').value = category === 'DAILY' ? (discount.startDate || '') : '';
    document.getElementById('dailyStartTimeConfig').value = '';
    document.getElementById('dailyEndTimeConfig').value = '';

    await loadDiscountProductCatalogFromApi();
    populateBrandFilter();
    populateCategoryFilter();
    renderApplicableProducts();
    setProductCheckboxValues(selectedProducts);
    updateDiscountConfigDynamicState();
    clearDiscountValidationErrors();
}

function viewDiscountDetails(discountId) {
    fetch(`/api/discounts/${discountId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(payload => {
            const discount = payload?.data;
            if (!discount) {
                throw new Error('Discount data not found');
            }

            const value = parseFloat(discount.discountValue || 0).toFixed(2);
            const formattedValue = discount.discountType === 'PERCENTAGE' ? `${value}%` : `Rs. ${value}`;

            if (typeof Swal !== 'undefined' && Swal && typeof Swal.fire === 'function') {
                return Swal.fire({
                    title: `Discount Details (#${discount.discountId})`,
                    html: `
                        <table class="table table-sm text-start mb-0">
                            <tr><th>Code</th><td>${escapeHtml(discount.discountCode || '-')}</td></tr>
                            <tr><th>Name</th><td>${escapeHtml(discount.discountName || '-')}</td></tr>
                            <tr><th>Category</th><td>${escapeHtml(discount.discountCategory || '-')}</td></tr>
                            <tr><th>Type</th><td>${escapeHtml(discount.discountType || '-')}</td></tr>
                            <tr><th>Value</th><td>${formattedValue}</td></tr>
                            <tr><th>Date Range</th><td>${formatDiscountDateRange(discount.startDate, discount.endDate)}</td></tr>
                            <tr><th>Status</th><td>${discount.isActive ? 'Active' : 'Inactive'}</td></tr>
                        </table>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Close'
                });
            }

            window.alert(
                `Discount #${discount.discountId}\n`
                + `Code: ${discount.discountCode || '-'}\n`
                + `Name: ${discount.discountName || '-'}\n`
                + `Category: ${discount.discountCategory || '-'}\n`
                + `Type: ${discount.discountType || '-'}\n`
                + `Value: ${formattedValue}\n`
                + `Date Range: ${formatDiscountDateRange(discount.startDate, discount.endDate)}\n`
                + `Status: ${discount.isActive ? 'Active' : 'Inactive'}`
            );
        })
        .catch(error => {
            console.error('Error loading discount details:', error);
            safeFire('Error', 'Failed to load discount details.', 'error');
        });
}

function editDiscount(discountId) {
    fetch(`/api/discounts/${discountId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(async payload => {
            const discount = payload?.data;
            if (!discount) {
                throw new Error('Discount data not found');
            }

            setDiscountEditMode(discountId);
            await populateDiscountFormForEdit(discount);

            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDiscountConfig'));
            modal.show();
        })
        .catch(error => {
            console.error('Error loading discount for edit:', error);
            safeFire('Error', 'Failed to open discount for editing.', 'error');
        });
}

function deleteDiscount(discountId, discountCode) {
    safeConfirm({
        title: 'Delete Discount?',
        text: `This will permanently delete discount ${discountCode || `#${discountId}`}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (!result.isConfirmed) return;

        fetch(`/api/discounts/${discountId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                safeFire('Deleted', 'Discount deleted successfully.', 'success');
                loadDiscountHistory();
            })
            .catch(error => {
                console.error('Error deleting discount:', error);
                safeFire('Delete Failed', 'Could not delete the discount.', 'error');
            });
    });
}

function deactivateDiscount(discountId, discountCode, isActive) {
    if (!isActive) {
        safeFire('Info', 'This discount is already inactive.', 'info');
        return;
    }

    const confirmPromise = (typeof Swal !== 'undefined' && Swal && typeof Swal.fire === 'function')
        ? Swal.fire({
            title: 'Deactivate Discount?',
            html: `This discount <strong>${escapeHtml(discountCode || `#${discountId}`)}</strong> will be marked inactive.`,
            icon: 'warning',
            width: 430,
            showCancelButton: true,
            confirmButtonText: 'Yes, Deactivate',
            cancelButtonText: 'Keep Active',
            reverseButtons: true
        })
        : safeConfirm({
            title: 'Deactivate Discount?',
            text: `Discount ${discountCode || `#${discountId}`} will be set to inactive.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Deactivate',
            cancelButtonText: 'Cancel'
        });

    confirmPromise.then(result => {
        if (!result.isConfirmed) return;

        fetch(`/api/discounts/${discountId}/deactivate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                safeFire('Updated', 'Discount deactivated successfully.', 'success');
                loadDiscountHistory();
            })
            .catch(error => {
                console.error('Error deactivating discount:', error);
                safeFire('Update Failed', 'Could not deactivate the discount.', 'error');
            });
    });
}

// Switch table tab between payment and discount history
function switchHistoryTab(tabName) {
    const paymentsWrap = document.getElementById('paymentsTableWrap');
    const discountsWrap = document.getElementById('discountsTableWrap');
    const paymentsTab = document.getElementById('historyTabPayments');
    const discountsTab = document.getElementById('historyTabDiscounts');
    const exportButton = document.getElementById('exportPaymentsButton');

    if (!paymentsWrap || !discountsWrap || !paymentsTab || !discountsTab || !exportButton) {
        return;
    }

    const showPayments = tabName !== 'discounts';
    paymentsWrap.style.display = showPayments ? '' : 'none';
    discountsWrap.style.display = showPayments ? 'none' : '';

    paymentsTab.classList.toggle('active', showPayments);
    discountsTab.classList.toggle('active', !showPayments);
    exportButton.style.display = showPayments ? '' : 'none';

    if (!showPayments) {
        loadDiscountHistory();
    }
}

// Filter payments
function filterPayments() {
    const searchTerm = document.getElementById('searchPayment').value.toLowerCase();
    const methodFilter = document.getElementById('filterPaymentMethod').value;
    const statusFilter = document.getElementById('filterPaymentStatus').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');

    // Apply filters
    payments = payments.filter(payment => {
        const matchesSearch = !searchTerm ||
            payment.orderCode.toLowerCase().includes(searchTerm) ||
            (payment.customerName && payment.customerName.toLowerCase().includes(searchTerm)) ||
            payment.id.toLowerCase().includes(searchTerm);

        const matchesMethod = !methodFilter || payment.method === methodFilter;
        const matchesStatus = !statusFilter || payment.status === statusFilter;

        const paymentDate = new Date(payment.date).toDateString();
        const matchesDateFrom = !dateFrom || new Date(paymentDate) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(paymentDate) <= new Date(dateTo);

        return matchesSearch && matchesMethod && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Render filtered results
    const tableBody = document.getElementById('paymentsTableBody');

    if (payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <p>No payments found matching your filters.</p>
                </td>
            </tr>
        `;
        return;
    }

    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    tableBody.innerHTML = payments.map(payment => {
        const statusBadge = getStatusBadge(payment.status);
        const methodBadge = getMethodBadge(payment.method);

        return `
            <tr>
                <td class="fw-bold">${payment.id}</td>
                <td>${payment.orderCode}</td>
                <td>${payment.customerName || 'Walk-in'}</td>
                <td>${formatDateTime(payment.date)}</td>
                <td>${methodBadge}</td>
                <td class="text-end fw-bold">Rs. ${parseFloat(payment.amount).toFixed(2)}</td>
                <td class="text-end text-success">Rs. ${parseFloat(payment.discount || 0).toFixed(2)}</td>
                <td>${statusBadge}</td>
                <td>${payment.transactionRef || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPaymentDetails('${payment.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Clear filters
function clearPaymentFilters() {
    document.getElementById('searchPayment').value = '';
    document.getElementById('filterPaymentMethod').value = '';
    document.getElementById('filterPaymentStatus').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    loadPaymentHistory();
}

// Update payment statistics
function updatePaymentStats() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    const today = new Date().toDateString();

    // Filter today's completed payments
    const todayPayments = payments.filter(p =>
        new Date(p.date).toDateString() === today && p.status === 'Completed'
    );

    // Calculate totals
    const totalPayments = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const cashPayments = todayPayments
        .filter(p => p.method === 'Cash')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const cardPayments = todayPayments
        .filter(p => p.method === 'Card')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Calculate credit outstanding (from customers)
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const creditOutstanding = customers.reduce((sum, c) => sum + (parseFloat(c.outstandingBalance) || 0), 0);

    // Update UI
    document.getElementById('totalPayments').textContent = `Rs. ${totalPayments.toFixed(2)}`;
    document.getElementById('cashPayments').textContent = `Rs. ${cashPayments.toFixed(2)}`;
    document.getElementById('cardPayments').textContent = `Rs. ${cardPayments.toFixed(2)}`;
    document.getElementById('creditOutstanding').textContent = `Rs. ${creditOutstanding.toFixed(2)}`;
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'Completed': '<span class="badge bg-success">Completed</span>',
        'Pending': '<span class="badge bg-warning">Pending</span>',
        'Failed': '<span class="badge bg-danger">Failed</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Get method badge HTML
function getMethodBadge(method) {
    const badges = {
        'Cash': '<span class="badge bg-success"><i class="fas fa-money-bill-wave me-1"></i>Cash</span>',
        'Card': '<span class="badge bg-primary"><i class="fas fa-credit-card me-1"></i>Card</span>',
        'Online': '<span class="badge bg-info"><i class="fas fa-globe me-1"></i>Online</span>',
        'Loyalty': '<span class="badge bg-warning"><i class="fas fa-gift me-1"></i>Loyalty</span>',
        'Credit': '<span class="badge bg-danger"><i class="fas fa-file-invoice me-1"></i>Credit</span>',
        'Split': '<span class="badge bg-secondary"><i class="fas fa-random me-1"></i>Split</span>'
    };
    return badges[method] || '<span class="badge bg-secondary">Unknown</span>';
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Handle discount type change
function handleDiscountTypeChange() {
    const discountType = document.getElementById('discountType').value;
    const discountValue = document.getElementById('discountValue');
    const discountReasonSection = document.getElementById('discountReasonSection');
    const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOUNT_CONFIG));

    if (discountType === 'None') {
        discountValue.value = 0;
        discountValue.disabled = true;
        discountReasonSection.style.display = 'none';
    } else if (discountType === 'Loyalty') {
        discountValue.value = config.loyalty.percent;
        discountValue.disabled = true;
        discountReasonSection.style.display = 'none';
    } else if (discountType === 'Bulk') {
        discountValue.value = config.bulk.percent;
        discountValue.disabled = true;
        discountReasonSection.style.display = 'none';
    } else if (discountType === 'Manual') {
        discountValue.value = 0;
        discountValue.disabled = false;
        discountReasonSection.style.display = 'block';
    }

    calculateNewTotal();
}

// Calculate new total after discount
function calculateNewTotal() {
    const grandTotal = parseFloat(document.getElementById('paymentGrandTotal').value.replace('Rs. ', '')) || 0;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;

    let newTotal = grandTotal - discountValue;
    document.getElementById('newGrandTotal').textContent = `Rs. ${newTotal.toFixed(2)}`;
}

// Handle payment method change
function handlePaymentMethodChange() {
    // Hide all sections
    document.querySelectorAll('.payment-method-section').forEach(section => {
        section.style.display = 'none';
    });

    // Get selected method
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Show relevant section
    const sections = {
        'Cash': 'cashPaymentSection',
        'Card': 'cardPaymentSection',
        'Online': 'onlinePaymentSection',
        'Loyalty': 'loyaltyPaymentSection',
        'Credit': 'creditPaymentSection',
        'Split': 'splitPaymentSection'
    };

    if (sections[selectedMethod]) {
        document.getElementById(sections[selectedMethod]).style.display = 'block';
    }
}

// Calculate change for cash payment
function calculateChange() {
    const newTotal = parseFloat(document.getElementById('newGrandTotal').textContent.replace('Rs. ', '')) || 0;
    const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
    const change = tendered - newTotal;

    document.getElementById('changeAmount').value = change >= 0 ? `Rs. ${change.toFixed(2)}` : 'Insufficient';
}

// Calculate loyalty payment
function calculateLoyaltyPayment() {
    const pointsToRedeem = parseFloat(document.getElementById('pointsToRedeem').value) || 0;
    const redemptionValue = pointsToRedeem; // 100 points = Rs. 100
    const newTotal = parseFloat(document.getElementById('newGrandTotal').textContent.replace('Rs. ', '')) || 0;
    const remaining = newTotal - redemptionValue;

    document.getElementById('remainingAmount').value = `Rs. ${Math.max(0, remaining).toFixed(2)}`;
}

// Calculate split payment total
function calculateSplitTotal() {
    const amount1 = parseFloat(document.getElementById('splitAmount1').value) || 0;
    const amount2 = parseFloat(document.getElementById('splitAmount2').value) || 0;
    const total = amount1 + amount2;

    document.getElementById('splitTotalPaid').textContent = `Rs. ${total.toFixed(2)}`;
}

// Process payment
function processPayment() {
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;
    const newTotal = parseFloat(document.getElementById('newGrandTotal').textContent.replace('Rs. ', '')) || 0;

    // Validate based on payment method
    if (method === 'Cash') {
        const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
        if (tendered < newTotal) {
            Swal.fire('Error', 'Amount tendered is less than total amount', 'error');
            return;
        }
    } else if (method === 'Card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const transactionRef = document.getElementById('cardTransactionRef').value;
        if (!cardNumber || !transactionRef) {
            Swal.fire('Error', 'Please enter card details and transaction reference', 'error');
            return;
        }
    } else if (method === 'Online') {
        const gateway = document.getElementById('paymentGateway').value;
        const transactionId = document.getElementById('onlineTransactionId').value;
        if (!gateway || !transactionId) {
            Swal.fire('Error', 'Please select payment gateway and enter transaction ID', 'error');
            return;
        }
    } else if (method === 'Loyalty') {
        const pointsToRedeem = parseFloat(document.getElementById('pointsToRedeem').value) || 0;
        const available = parseFloat(document.getElementById('availableLoyaltyPoints').value) || 0;
        if (pointsToRedeem > available) {
            Swal.fire('Error', 'Insufficient loyalty points', 'error');
            return;
        }
        if (pointsToRedeem > newTotal) {
            Swal.fire('Error', 'Points to redeem exceed total amount', 'error');
            return;
        }
    } else if (method === 'Credit') {
        const confirmed = document.getElementById('confirmCreditTerms').checked;
        const availableCredit = parseFloat(document.getElementById('availableCredit').value.replace('Rs. ', '')) || 0;
        if (!confirmed) {
            Swal.fire('Error', 'Please confirm credit terms acceptance', 'error');
            return;
        }
        if (newTotal > availableCredit) {
            Swal.fire('Error', 'Amount exceeds available credit limit', 'error');
            return;
        }
    } else if (method === 'Split') {
        const splitTotal = parseFloat(document.getElementById('splitTotalPaid').textContent.replace('Rs. ', '')) || 0;
        if (Math.abs(splitTotal - newTotal) > 0.01) {
            Swal.fire('Error', 'Split payment total must equal grand total', 'error');
            return;
        }
    }

    // Create payment record
    const payment = {
        id: 'PAY' + Date.now(),
        orderCode: document.getElementById('paymentOrderCode').value,
        customerName: document.getElementById('paymentCustomer').value,
        date: new Date().toISOString(),
        method: method,
        amount: newTotal,
        discount: parseFloat(document.getElementById('discountValue').value) || 0,
        status: 'Completed',
        transactionRef: getTransactionReference(method)
    };

    // Save payment
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    payments.push(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPaymentForm'));
    modal.hide();

    Swal.fire({
        icon: 'success',
        title: 'Payment Processed',
        text: `Payment ID: ${payment.id}`,
        confirmButtonText: 'Print Receipt'
    }).then((result) => {
        if (result.isConfirmed) {
            printReceipt(payment);
        }
    });

    loadPaymentHistory();
    updatePaymentStats();
}

// Get transaction reference based on method
function getTransactionReference(method) {
    if (method === 'Card') {
        return document.getElementById('cardTransactionRef').value;
    } else if (method === 'Online') {
        return document.getElementById('onlineTransactionId').value;
    } else {
        return 'N/A';
    }
}

// View payment details
function viewPaymentDetails(paymentId) {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    const payment = payments.find(p => p.id === paymentId);

    if (!payment) {
        Swal.fire('Error', 'Payment not found', 'error');
        return;
    }

    const detailsContent = document.getElementById('paymentDetailsContent');
    detailsContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Payment Information</h6>
                <table class="table table-sm">
                    <tr><th>Payment ID:</th><td>${payment.id}</td></tr>
                    <tr><th>Order Code:</th><td>${payment.orderCode}</td></tr>
                    <tr><th>Customer:</th><td>${payment.customerName || 'Walk-in'}</td></tr>
                    <tr><th>Date:</th><td>${formatDateTime(payment.date)}</td></tr>
                    <tr><th>Status:</th><td>${getStatusBadge(payment.status)}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Transaction Details</h6>
                <table class="table table-sm">
                    <tr><th>Payment Method:</th><td>${getMethodBadge(payment.method)}</td></tr>
                    <tr><th>Amount:</th><td class="fw-bold">Rs. ${parseFloat(payment.amount).toFixed(2)}</td></tr>
                    <tr><th>Discount:</th><td class="text-success">Rs. ${parseFloat(payment.discount || 0).toFixed(2)}</td></tr>
                    <tr><th>Transaction Ref:</th><td>${payment.transactionRef || 'N/A'}</td></tr>
                </table>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalPaymentDetails'));
    modal.show();
}

// Print receipt
function printReceipt(payment) {
    if (!payment) {
        Swal.fire('Error', 'No payment data to print', 'error');
        return;
    }

    const receiptWindow = window.open('', '', 'width=400,height=600');
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${payment.id}</title>
            <style>
                body { font-family: monospace; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; font-weight: bold; margin-top: 10px; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>SAMPATH GROCERY STORE</h2>
                <p>PAYMENT RECEIPT</p>
            </div>
            <div class="row"><span>Payment ID:</span><span>${payment.id}</span></div>
            <div class="row"><span>Order Code:</span><span>${payment.orderCode}</span></div>
            <div class="row"><span>Customer:</span><span>${payment.customerName || 'Walk-in'}</span></div>
            <div class="row"><span>Date:</span><span>${formatDateTime(payment.date)}</span></div>
            <div class="row"><span>Method:</span><span>${payment.method}</span></div>
            <div class="row"><span>Discount:</span><span>Rs. ${parseFloat(payment.discount || 0).toFixed(2)}</span></div>
            <div class="total">
                <div class="row"><span>TOTAL PAID:</span><span>Rs. ${parseFloat(payment.amount).toFixed(2)}</span></div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
}

// Export payment data
function exportPaymentData() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');

    if (payments.length === 0) {
        Swal.fire('Info', 'No payment data to export', 'info');
        return;
    }

    // Create CSV content
    let csvContent = 'Payment ID,Order Code,Customer,Date,Method,Amount,Discount,Status,Transaction Ref\n';

    payments.forEach(payment => {
        csvContent += `${payment.id},${payment.orderCode},"${payment.customerName || 'Walk-in'}",${payment.date},${payment.method},${payment.amount},${payment.discount || 0},${payment.status},${payment.transactionRef || 'N/A'}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payment_History_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Swal.fire('Success', 'Payment data exported successfully', 'success');
}

// Load discount configuration
function loadDiscountConfiguration() {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOUNT_CONFIG)) || getDefaultDiscountConfig();

    const advanced = config.advanced || {};
    const allowedCategories = ['SEASONAL', 'DAILY'];
    const fallbackCategory = 'SEASONAL';
    const selectedCategory = allowedCategories.includes(advanced.category) ? advanced.category : fallbackCategory;
    const selectedType = advanced.type || 'PERCENTAGE';
    const applyAllProducts = advanced.applyAllProducts !== undefined
        ? advanced.applyAllProducts
        : (config.promo.applicableTo === 'All');

    document.getElementById('discountCategory').value = selectedCategory;
    document.getElementById('discountName').value = advanced.name || config.promo.name || '';
    document.getElementById('discountEnabled').checked = advanced.enabled !== undefined
        ? advanced.enabled
        : (config.loyalty.enabled || config.bulk.enabled || true);

    if (selectedType === 'FIXED') {
        document.getElementById('discountTypeFixed').checked = true;
    } else {
        document.getElementById('discountTypePercentage').checked = true;
    }

    document.getElementById('discountValueConfig').value = advanced.value !== undefined
        ? advanced.value
        : config.promo.percent;

    document.getElementById('applyAllProductsConfig').checked = applyAllProducts;
    document.getElementById('productSearchConfig').value = advanced.productSearch || '';

    document.getElementById('minPurchaseConfig').value = advanced.minPurchase !== undefined
        ? advanced.minPurchase
        : config.loyalty.minPurchase;
    document.getElementById('customerTypeConfig').value = advanced.customerType || 'ALL_CUSTOMERS';
    document.getElementById('bulkThresholdConfig').value = advanced.bulkThreshold !== undefined
        ? advanced.bulkThreshold
        : config.bulk.threshold;

    document.getElementById('startDateConfig').value = advanced.startDate || config.promo.startDate || '';
    document.getElementById('endDateConfig').value = advanced.endDate || config.promo.endDate || '';
    document.getElementById('dailyDateConfig').value = advanced.dailyDate || config.promo.startDate || '';
    document.getElementById('dailyStartTimeConfig').value = advanced.dailyStartTime || advanced.dailyTime || '';
    document.getElementById('dailyEndTimeConfig').value = advanced.dailyEndTime || '';

    // Load DB-backed product list first, then apply saved UI selections.
    loadDiscountProductCatalogFromApi().then(() => {
        populateBrandFilter();
        populateCategoryFilter();
        document.getElementById('brandFilterConfig').value = advanced.brandFilter || 'ALL';
        document.getElementById('categoryFilterConfig').value = advanced.categoryFilter || 'ALL';
        renderApplicableProducts();
        setProductCheckboxValues(advanced.targets || []);
        updateDiscountConfigDynamicState();
    });

    updateDiscountConfigDynamicState();
}

// Save discount configuration
function saveDiscountConfig() {
    if (!validateDiscountConfigForm()) {
        safeFire('Validation Error', 'Please correct the highlighted fields.', 'warning');
        return;
    }

    const category = document.getElementById('discountCategory').value;
    const discountType = document.querySelector('input[name="discountTypeConfig"]:checked').value;
    const discountValue = parseFloat(document.getElementById('discountValueConfig').value) || 0;
    const applyAllProducts = document.getElementById('applyAllProductsConfig').checked;
    const brandFilter = document.getElementById('brandFilterConfig').value;
    const categoryFilter = document.getElementById('categoryFilterConfig').value;
    const productSearch = document.getElementById('productSearchConfig').value.trim();
    const targetValues = getSelectedDiscountProductValues();
    const startDateValue = document.getElementById('startDateConfig').value;
    const endDateValue = document.getElementById('endDateConfig').value;
    const dailyDateValue = document.getElementById('dailyDateConfig').value;
    const dailyStartTimeValue = document.getElementById('dailyStartTimeConfig').value;
    const dailyEndTimeValue = document.getElementById('dailyEndTimeConfig').value;

    const existingConfig = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISCOUNT_CONFIG)) || getDefaultDiscountConfig();

    const config = {
        loyalty: existingConfig.loyalty || getDefaultDiscountConfig().loyalty,
        bulk: {
            enabled: category === 'BULK' ? document.getElementById('discountEnabled').checked : false,
            threshold: parseFloat(document.getElementById('bulkThresholdConfig').value) || 10000,
            percent: category === 'BULK' && discountType === 'PERCENTAGE' ? discountValue : 10
        },
        promo: {
            name: document.getElementById('discountName').value.trim(),
            startDate: category === 'DAILY' ? dailyDateValue : startDateValue,
            endDate: category === 'DAILY' ? dailyDateValue : endDateValue,
            percent: discountType === 'PERCENTAGE' ? discountValue : 0,
            applicableTo: applyAllProducts ? 'All' : 'Products'
        },
        manual: {
            allowedRoles: ['Manager', 'Admin'],
            maxPercent: 15,
            reasonRequired: true
        },
        advanced: {
            category: category,
            name: document.getElementById('discountName').value.trim(),
            enabled: document.getElementById('discountEnabled').checked,
            type: discountType,
            value: discountValue,
            applyAllProducts: applyAllProducts,
            brandFilter: brandFilter,
            categoryFilter: categoryFilter,
            productSearch: productSearch,
            targets: targetValues,
            minPurchase: parseFloat(document.getElementById('minPurchaseConfig').value) || 0,
            customerType: document.getElementById('customerTypeConfig').value,
            bulkThreshold: parseFloat(document.getElementById('bulkThresholdConfig').value) || 0,
            startDate: category === 'DAILY' ? dailyDateValue : startDateValue,
            endDate: category === 'DAILY' ? dailyDateValue : endDateValue,
            dailyDate: category === 'DAILY' ? dailyDateValue : '',
            dailyStartTime: category === 'DAILY' ? dailyStartTimeValue : '',
            dailyEndTime: category === 'DAILY' ? dailyEndTimeValue : ''
        }
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.DISCOUNT_CONFIG, JSON.stringify(config));

    // Prepare API request body for database save
    const discountName = document.getElementById('discountName').value.trim();
    const discountCode = generateUniqueDiscountCode(discountName);

    // Get tomorrow's date for default if dates are empty (to satisfy @FutureOrPresent validation)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get date values (HTML5 date input returns YYYY-MM-DD format)
    let finalStartDate = category === 'DAILY' ? (dailyDateValue || tomorrowStr) : (startDateValue || tomorrowStr);
    let finalEndDate = category === 'DAILY' ? (dailyDateValue || tomorrowStr) : (endDateValue || tomorrowStr);

    // Ensure end date is not before start date
    if (new Date(finalEndDate) < new Date(finalStartDate)) {
        finalEndDate = finalStartDate;
    }

    // Prepare applicable IDs
    let applicableIds = '[]';
    if (!applyAllProducts && targetValues && targetValues.length > 0) {
        applicableIds = JSON.stringify(targetValues);
    }

    const normalizedDiscountType = discountType === 'FIXED' || discountType === 'FIXED_AMOUNT'
        ? 'FIXED_AMOUNT'
        : 'PERCENTAGE';

    const baseRequest = {
        discountName: discountName,
        discountCategory: category,
        discountType: normalizedDiscountType,
        discountValue: parseFloat(discountValue),
        minPurchaseAmount: parseFloat(document.getElementById('minPurchaseConfig').value) || 0,
        maxDiscountAmount: parseFloat(discountValue) || 1,  // Must be > 0
        applicableTo: applyAllProducts ? 'ALL_PRODUCTS' : 'SPECIFIC_PRODUCTS',
        applicableIds: applicableIds,
        startDate: finalStartDate,
        endDate: finalEndDate,
        customerTypeCondition: 'ANY',
        bulkThresholdQuantity: 0,
        priorityLevel: 0,
        usageLimit: 1000,
        usagePerCustomer: 1,
        isActive: document.getElementById('discountEnabled').checked
    };

    const isEditMode = Number.isInteger(editingDiscountId) && editingDiscountId > 0;
    const apiUrl = isEditMode ? `/api/discounts/${editingDiscountId}` : '/api/discounts';
    const apiMethod = isEditMode ? 'PUT' : 'POST';
    const requestBody = isEditMode
        ? baseRequest
        : {
            discountCode: discountCode,
            ...baseRequest
        };

    console.log('Discount payload:', JSON.stringify(requestBody, null, 2));

    // Save to database via API
    fetch(apiUrl, {
        method: apiMethod,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            console.log('API Response Status:', response.status);
            return response.text().then(text => {
                try {
                    const data = JSON.parse(text);
                    return {
                        status: response.status,
                        ok: response.ok,
                        body: data
                    };
                } catch (e) {
                    return {
                        status: response.status,
                        ok: response.ok,
                        body: { error: text }
                    };
                }
            });
        })
        .then(result => {
            console.log('Full API Response:', JSON.stringify(result, null, 2));

            if (!result.ok) {
                let errorMsg = result.body?.message || 'Unknown error';
                const validationData = result.body?.data;
                if (validationData && typeof validationData === 'object' && !Array.isArray(validationData)) {
                    const fieldErrors = Object.entries(validationData)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join('; ');
                    if (fieldErrors) {
                        errorMsg = `${errorMsg} - ${fieldErrors}`;
                    }
                } else if (result.body?.error) {
                    errorMsg = `${errorMsg} - ${result.body.error}`;
                }
                throw new Error(`API Error (${result.status}): ${errorMsg}`);
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalDiscountConfig'));
            if (modal) modal.hide();
            safeFire('Success', isEditMode
                ? 'Discount updated successfully'
                : 'Discount saved to database successfully', 'success');
            resetDiscountEditMode();
            loadDiscountConfiguration(); // Reload to clear form
            loadDiscountHistory();
            switchHistoryTab('discounts');
        })
        .catch(error => {
            console.error('Error saving discount:', error);
            safeFire('Database Save Error', 'Error: ' + error.message, 'error');
        });
}

// Generate unique discount code from name
function generateUniqueDiscountCode(discountName) {
    const timestamp = new Date().getTime();
    const namePrefix = discountName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'D');
    return namePrefix + timestamp.toString().slice(-6);
}

// Reset discount configuration
function resetDiscountConfig() {
    safeConfirm({
        title: 'Reset Configuration?',
        text: 'This will reset all discount settings to default values.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem(STORAGE_KEYS.DISCOUNT_CONFIG, JSON.stringify(getDefaultDiscountConfig()));
            loadDiscountConfiguration();
            safeFire('Reset!', 'Discount configuration has been reset to default.', 'success');
        }
    });
}

function initializeDiscountConfigUI() {
    const modal = document.getElementById('modalDiscountConfig');
    if (!modal) return;

    modal.addEventListener('shown.bs.modal', () => {
        loadDiscountProductCatalogFromApi().then(() => {
            populateBrandFilter();
            populateCategoryFilter();
            renderApplicableProducts();
        });
        if (editingDiscountId === null) {
            loadDiscountConfiguration();
        }
        clearDiscountValidationErrors();
    });

    modal.addEventListener('hidden.bs.modal', () => {
        if (editingDiscountId !== null) {
            resetDiscountEditMode();
            loadDiscountConfiguration();
        }
    });

    document.getElementById('discountCategory')?.addEventListener('change', updateDiscountConfigDynamicState);
    document.getElementById('applyAllProductsConfig')?.addEventListener('change', updateDiscountConfigDynamicState);
    document.getElementById('brandFilterConfig')?.addEventListener('change', renderApplicableProducts);
    document.getElementById('categoryFilterConfig')?.addEventListener('change', renderApplicableProducts);
    document.getElementById('productSearchConfig')?.addEventListener('input', renderApplicableProducts);
    document.getElementById('discountTypePercentage')?.addEventListener('change', updateDiscountTypeLabel);
    document.getElementById('discountTypeFixed')?.addEventListener('change', updateDiscountTypeLabel);
}

function updateDiscountConfigDynamicState() {
    const category = document.getElementById('discountCategory').value;
    const applyAllProducts = document.getElementById('applyAllProductsConfig').checked;

    const dateRangeWrap = document.getElementById('dateRangeConfigWrap');
    const dailyScheduleWrap = document.getElementById('dailyScheduleConfigWrap');
    const isDaily = category === 'DAILY';
    dateRangeWrap.style.display = isDaily ? 'none' : '';
    dailyScheduleWrap.style.display = isDaily ? '' : 'none';

    const brandFilter = document.getElementById('brandFilterConfig');
    const categoryFilter = document.getElementById('categoryFilterConfig');
    const searchInput = document.getElementById('productSearchConfig');
    const productList = document.getElementById('productCheckboxList');

    brandFilter.disabled = applyAllProducts;
    categoryFilter.disabled = applyAllProducts;
    searchInput.disabled = applyAllProducts;
    productList.style.opacity = applyAllProducts ? '0.55' : '1';

    if (applyAllProducts) {
        document.querySelectorAll('input[name="applicableProductConfig"]').forEach(cb => {
            cb.checked = false;
        });
    }

    updateDiscountTypeLabel();
}

function updateDiscountTypeLabel() {
    const isFixed = document.getElementById('discountTypeFixed').checked;
    const label = document.getElementById('discountValueConfigLabel');
    label.textContent = isFixed ? 'Discount Value (Rs.)' : 'Discount Value (%)';
}

function validateDiscountConfigForm() {
    clearDiscountValidationErrors();

    let isValid = true;
    const nameInput = document.getElementById('discountName');
    const valueInput = document.getElementById('discountValueConfig');
    const startDateInput = document.getElementById('startDateConfig');
    const endDateInput = document.getElementById('endDateConfig');
    const dailyDateInput = document.getElementById('dailyDateConfig');
    const dailyStartTimeInput = document.getElementById('dailyStartTimeConfig');
    const dailyEndTimeInput = document.getElementById('dailyEndTimeConfig');
    const category = document.getElementById('discountCategory').value;
    const isDaily = category === 'DAILY';
    const applyAllProductsInput = document.getElementById('applyAllProductsConfig');
    const productList = document.getElementById('productCheckboxList');
    const isPercentage = document.getElementById('discountTypePercentage').checked;

    if (!nameInput.value.trim()) {
        setDiscountFieldError(nameInput, 'discountNameError', 'Discount name is required.');
        isValid = false;
    }

    const value = parseFloat(valueInput.value);
    if (Number.isNaN(value) || value <= 0) {
        setDiscountFieldError(valueInput, 'discountValueConfigError', 'Discount value must be greater than 0.');
        isValid = false;
    } else if (isPercentage && value > 100) {
        setDiscountFieldError(valueInput, 'discountValueConfigError', 'Percentage cannot be greater than 100.');
        isValid = false;
    }

    if (isDaily) {
        if (!dailyDateInput.value) {
            setDiscountFieldError(dailyDateInput, 'dailyDateConfigError', 'Date is required for Daily discounts.');
            isValid = false;
        }

        if (!dailyStartTimeInput.value) {
            setDiscountFieldError(dailyStartTimeInput, 'dailyStartTimeConfigError', 'Start time is required for Daily discounts.');
            isValid = false;
        }

        if (!dailyEndTimeInput.value) {
            setDiscountFieldError(dailyEndTimeInput, 'dailyEndTimeConfigError', 'End time is required for Daily discounts.');
            isValid = false;
        }

        if (dailyStartTimeInput.value && dailyEndTimeInput.value && dailyEndTimeInput.value <= dailyStartTimeInput.value) {
            setDiscountFieldError(dailyEndTimeInput, 'dailyEndTimeConfigError', 'End time must be after start time.');
            isValid = false;
        }
    } else {
        if (!startDateInput.value) {
            setDiscountFieldError(startDateInput, 'startDateConfigError', 'Start date is required.');
            isValid = false;
        }

        if (!endDateInput.value) {
            setDiscountFieldError(endDateInput, 'endDateConfigError', 'End date is required.');
            isValid = false;
        }

        if (startDateInput.value && endDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
            setDiscountFieldError(endDateInput, 'endDateConfigError', 'End date must be on or after start date.');
            isValid = false;
        }
    }

    if (!applyAllProductsInput.checked && getSelectedDiscountProductValues().length === 0) {
        productList.classList.add('is-invalid');
        const productError = document.getElementById('productCheckboxListError');
        if (productError) {
            productError.textContent = 'Select at least one product when not applying to all products.';
        }
        isValid = false;
    }

    return isValid;
}

function setDiscountFieldError(field, errorId, message) {
    field.classList.add('is-invalid');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearDiscountValidationErrors() {
    const fields = [
        'discountCategory',
        'discountName',
        'discountValueConfig',
        'startDateConfig',
        'endDateConfig',
        'dailyDateConfig',
        'dailyStartTimeConfig',
        'dailyEndTimeConfig',
        'productCheckboxList'
    ];

    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.classList.remove('is-invalid');
    });

    const errors = [
        'discountCategoryError',
        'discountNameError',
        'discountValueConfigError',
        'startDateConfigError',
        'endDateConfigError',
        'dailyDateConfigError',
        'dailyStartTimeConfigError',
        'dailyEndTimeConfigError',
        'productCheckboxListError'
    ];

    errors.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

function getDiscountProductCatalog() {
    if (discountProductCatalogLoaded && discountProductCatalogCache.length > 0) {
        return discountProductCatalogCache;
    }

    return [];
}

async function loadDiscountProductCatalogFromApi() {
    if (discountProductCatalogLoaded && discountProductCatalogCache.length > 0) {
        return discountProductCatalogCache;
    }

    try {
        const response = await fetch('/api/products?isActive=true');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const products = Array.isArray(payload?.data) ? payload.data : [];

        discountProductCatalogCache = products.map((p, index) => ({
            id: p.productId || p.id || `P${index + 1}`,
            name: p.productName || p.name || `Product ${index + 1}`,
            brand: p.brandName || p.brand || 'Unbranded',
            category: p.categoryName || p.category || 'Uncategorized'
        }));

        discountProductCatalogLoaded = true;
    } catch (error) {
        console.error('Failed to load products from /api/products:', error);

        // Fallback to local cache only if API fails.
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        discountProductCatalogCache = Array.isArray(localProducts)
            ? localProducts.map((p, index) => ({
                id: p.productId || p.id || `P${index + 1}`,
                name: p.productName || p.name || `Product ${index + 1}`,
                brand: p.brandName || p.brand || 'Unbranded',
                category: p.categoryName || p.category || 'Uncategorized'
            }))
            : [];
        discountProductCatalogLoaded = true;
    }

    return discountProductCatalogCache;
}

function populateBrandFilter() {
    const brandFilter = document.getElementById('brandFilterConfig');
    const products = getDiscountProductCatalog();
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

    brandFilter.innerHTML = '<option value="ALL">All Brands</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilterConfig');
    const products = getDiscountProductCatalog();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

    categoryFilter.innerHTML = '<option value="ALL">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderApplicableProducts() {
    const brandFilter = document.getElementById('brandFilterConfig').value;
    const categoryFilter = document.getElementById('categoryFilterConfig').value;
    const searchText = document.getElementById('productSearchConfig').value.trim().toLowerCase();
    const list = document.getElementById('productCheckboxList');
    const selected = new Set(getSelectedDiscountProductValues());

    let products = getDiscountProductCatalog();
    if (brandFilter !== 'ALL') {
        products = products.filter(p => p.brand === brandFilter);
    }
    if (categoryFilter !== 'ALL') {
        products = products.filter(p => p.category === categoryFilter);
    }
    if (searchText) {
        products = products.filter(p => (p.name || '').toLowerCase().includes(searchText));
    }

    if (products.length === 0) {
        list.innerHTML = '<div class="text-muted small p-2">No product data found. Please check product records in database.</div>';
        return;
    }

    list.innerHTML = products.map(p => `
        <label class="product-pick-item" for="applicableProduct_${p.id}">
            <input class="form-check-input mt-0" type="checkbox" name="applicableProductConfig" id="applicableProduct_${p.id}" value="${p.id}" ${selected.has(String(p.id)) ? 'checked' : ''}>
            <span><strong>${escapeHtml(p.name)}</strong> <span class="text-muted">(${escapeHtml(p.brand)} | ${escapeHtml(p.category)})</span></span>
        </label>
    `).join('');
}

function setProductCheckboxValues(values) {
    const selected = new Set((values || []).map(v => String(v)));
    document.querySelectorAll('input[name="applicableProductConfig"]').forEach(cb => {
        cb.checked = selected.has(String(cb.value));
    });
}

function getSelectedDiscountProductValues() {
    return Array.from(document.querySelectorAll('input[name="applicableProductConfig"]:checked')).map(cb => cb.value);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== LOYALTY CONFIGURATION FUNCTIONS =====

/**
 * Load current loyalty configuration from backend
 */
async function loadLoyaltyConfig() {
    try {
        const response = await fetch('/api/loyalty/config');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const config = await response.json();
        console.log('Loyalty config loaded:', config);

        // Populate form with config data
        document.getElementById('loyaltyEnabled').checked = config.isEnabled !== false;
        document.getElementById('earnRate').value = config.earnRate ? parseFloat(config.earnRate).toFixed(3) : '0.010';
        document.getElementById('minPurchaseAmount').value = config.minPurchaseAmount ? parseFloat(config.minPurchaseAmount).toFixed(2) : '0.00';
        document.getElementById('maxPointsPerTransaction').value = config.maxPointsPerTransaction || '0';
        document.getElementById('pointValue').value = config.pointValue ? parseFloat(config.pointValue).toFixed(2) : '1.00';
        document.getElementById('minRedeemPoints').value = config.minRedeemPoints || '100';

        // Update preview
        updateLoyaltyPreview();
    } catch (error) {
        console.error('Error loading loyalty config:', error);
        // Keep existing form values if load fails
    }
}

/**
 * Save loyalty configuration to backend
 */
async function saveLoyaltyConfig() {
    try {
        // Validate form
        const earnRate = parseFloat(document.getElementById('earnRate').value || 0);
        const pointValue = parseFloat(document.getElementById('pointValue').value || 1);

        if (earnRate < 0 || earnRate > 100) {
            safeFire('Validation Error', 'Earn rate must be between 0 and 100', 'error');
            return;
        }

        if (pointValue <= 0) {
            safeFire('Validation Error', 'Point value must be greater than 0', 'error');
            return;
        }

        const loyaltyConfig = {
            isEnabled: document.getElementById('loyaltyEnabled').checked,
            earnRate: earnRate,
            minPurchaseAmount: parseFloat(document.getElementById('minPurchaseAmount').value || 0),
            maxPointsPerTransaction: parseInt(document.getElementById('maxPointsPerTransaction').value || 0),
            pointValue: pointValue,
            minRedeemPoints: parseInt(document.getElementById('minRedeemPoints').value || 100)
        };

        const response = await fetch('/api/loyalty/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loyaltyConfig)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to save loyalty configuration`);
        }

        const savedConfig = await response.json();
        console.log('Loyalty config saved:', savedConfig);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalLoyaltyConfig'));
        if (modal) modal.hide();

        safeFire('Success', 'Loyalty configuration saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving loyalty config:', error);
        safeFire('Error', 'Failed to save loyalty configuration: ' + error.message, 'error');
    }
}

/**
 * Update loyalty points preview
 */
function updateLoyaltyPreview() {
    const earnRate = parseFloat(document.getElementById('earnRate').value || 0);
    const pointValue = parseFloat(document.getElementById('pointValue').value || 1);
    const maxPoints = parseInt(document.getElementById('maxPointsPerTransaction').value || 0);

    const sampleAmount = 10000;
    let points = Math.floor((sampleAmount * earnRate) / 100);

    if (maxPoints > 0) {
        points = Math.min(points, maxPoints);
    }

    const redemptionValue = points * pointValue;

    document.getElementById('previewPoints').textContent = points;
    document.getElementById('previewRedemption').textContent = `Rs. ${redemptionValue.toFixed(2)}`;
}

/**
 * Initialize loyalty config modal
 */
function initializeLoyaltyConfigModal() {
    const modal = document.getElementById('modalLoyaltyConfig');
    if (!modal) return;

    modal.addEventListener('shown.bs.modal', () => {
        loadLoyaltyConfig();
    });

    // Add event listeners for preview updates
    ['earnRate', 'pointValue', 'maxPointsPerTransaction'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateLoyaltyPreview);
        }
    });
}

// Initialize loyalty config on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeLoyaltyConfigModal();
}, { once: true });
