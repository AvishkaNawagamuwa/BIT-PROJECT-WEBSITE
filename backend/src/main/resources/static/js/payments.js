// payments.js

// Initialize payments module
document.addEventListener('DOMContentLoaded', function () {
    initializePayments();
    loadPaymentHistory();
    loadDiscountConfiguration();
    updatePaymentStats();
    setupEventListeners();
});

// Storage keys
const STORAGE_KEYS = {
    PAYMENTS: 'payments',
    DISCOUNT_CONFIG: 'discountConfig'
};

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
    document.getElementById('searchPayment').addEventListener('input', filterPayments);
    document.getElementById('filterPaymentMethod').addEventListener('change', filterPayments);
    document.getElementById('filterPaymentStatus').addEventListener('change', filterPayments);
    document.getElementById('filterDateFrom').addEventListener('change', filterPayments);
    document.getElementById('filterDateTo').addEventListener('change', filterPayments);
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

    // Loyalty
    document.getElementById('loyaltyEnabled').checked = config.loyalty.enabled;
    document.getElementById('loyaltyPercent').value = config.loyalty.percent;
    document.getElementById('loyaltyMinPurchase').value = config.loyalty.minPurchase;

    // Bulk
    document.getElementById('bulkEnabled').checked = config.bulk.enabled;
    document.getElementById('bulkThreshold').value = config.bulk.threshold;
    document.getElementById('bulkPercent').value = config.bulk.percent;

    // Promo
    document.getElementById('promoName').value = config.promo.name;
    document.getElementById('promoStartDate').value = config.promo.startDate;
    document.getElementById('promoEndDate').value = config.promo.endDate;
    document.getElementById('promoPercent').value = config.promo.percent;
    document.getElementById('promoApplicableTo').value = config.promo.applicableTo;

    // Manual
    document.getElementById('manualMaxPercent').value = config.manual.maxPercent;
    document.getElementById('manualReasonRequired').checked = config.manual.reasonRequired;
}

// Save discount configuration
function saveDiscountConfig() {
    const config = {
        loyalty: {
            enabled: document.getElementById('loyaltyEnabled').checked,
            percent: parseFloat(document.getElementById('loyaltyPercent').value),
            minPurchase: parseFloat(document.getElementById('loyaltyMinPurchase').value)
        },
        bulk: {
            enabled: document.getElementById('bulkEnabled').checked,
            threshold: parseFloat(document.getElementById('bulkThreshold').value),
            percent: parseFloat(document.getElementById('bulkPercent').value)
        },
        promo: {
            name: document.getElementById('promoName').value,
            startDate: document.getElementById('promoStartDate').value,
            endDate: document.getElementById('promoEndDate').value,
            percent: parseFloat(document.getElementById('promoPercent').value),
            applicableTo: document.getElementById('promoApplicableTo').value
        },
        manual: {
            allowedRoles: Array.from(document.getElementById('manualAllowedRoles').selectedOptions).map(o => o.value),
            maxPercent: parseFloat(document.getElementById('manualMaxPercent').value),
            reasonRequired: document.getElementById('manualReasonRequired').checked
        }
    };

    localStorage.setItem(STORAGE_KEYS.DISCOUNT_CONFIG, JSON.stringify(config));

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalDiscountConfig'));
    modal.hide();

    Swal.fire('Success', 'Discount configuration saved successfully', 'success');
}

// Reset discount configuration
function resetDiscountConfig() {
    Swal.fire({
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
            Swal.fire('Reset!', 'Discount configuration has been reset to default.', 'success');
        }
    });
}
