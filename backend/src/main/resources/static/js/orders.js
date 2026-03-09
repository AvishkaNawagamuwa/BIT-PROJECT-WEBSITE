// Order Management JavaScript - Backend Integration

// Global Variables
let orders = [];
let customers = [];
let productBatches = [];
let orderStatuses = [];
let editingOrderId = null;

// API Base URLs
const API_BASE_URL = '/api/orders';
const CUSTOMERS_API_URL = '/api/customers';
const BATCHES_API_URL = '/api/batches';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadOrders();
    loadCustomers();
    loadProductBatches();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchOrder');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }

    // Customer selection change
    const customerSelect = document.getElementById('customer');
    if (customerSelect) {
        customerSelect.addEventListener('change', onCustomerSelection);
    }

    // Order type change
    const orderTypeSelect = document.getElementById('orderType');
    if (orderTypeSelect) {
        orderTypeSelect.addEventListener('change', () => {
            // Can add logic based on order type
        });
    }

    // Loyalty points change
    const loyaltyPointsInput = document.getElementById('loyaltyPointsUsed');
    if (loyaltyPointsInput) {
        loyaltyPointsInput.addEventListener('input', calculateOrderTotal);
    }

    // Calculation triggers
    const discountAmountInput = document.getElementById('discountAmount');
    const taxAmountInput = document.getElementById('taxAmount');
    const deliveryChargeInput = document.getElementById('deliveryCharge');

    if (discountAmountInput) discountAmountInput.addEventListener('input', calculateOrderTotal);
    if (taxAmountInput) taxAmountInput.addEventListener('input', calculateOrderTotal);
    if (deliveryChargeInput) deliveryChargeInput.addEventListener('input', calculateOrderTotal);
}

// Load all orders from backend
async function loadOrders() {
    try {
        showLoadingSpinner();
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const apiResponse = await response.json();
        orders = apiResponse.data || [];

        displayOrders();
        updateStatistics();
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error loading orders:', error);
        hideLoadingSpinner();
        showToast('Failed to load orders. Please try again.', 'error');
    }
}

// Load customers for dropdown
async function loadCustomers() {
    try {
        const response = await fetch(CUSTOMERS_API_URL);
        if (!response.ok) throw new Error('Failed to load customers');

        const apiResponse = await response.json();
        customers = apiResponse.data || [];

        populateCustomerDropdown();

    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load product batches for dropdown
async function loadProductBatches() {
    try {
        const response = await fetch(BATCHES_API_URL);
        if (!response.ok) throw new Error('Failed to load product batches');

        const apiResponse = await response.json();
        productBatches = apiResponse.data || [];

    } catch (error) {
        console.error('Error loading product batches:', error);
        showToast('Failed to load products. Please refresh the page.', 'warning');
    }
}

// Populate customer dropdown
function populateCustomerDropdown() {
    const customerSelect = document.getElementById('customer');
    if (!customerSelect) return;

    customerSelect.innerHTML = '<option value="">Walk-in Customer (Optional)</option>';

    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.customerId;
        option.textContent = `${customer.fullName} - ${customer.phone}`;
        option.setAttribute('data-loyalty-points', customer.loyaltyPoints || 0);
        customerSelect.appendChild(option);
    });
}

// Handle customer selection
function onCustomerSelection() {
    const customerSelect = document.getElementById('customer');
    const selectedOption = customerSelect.options[customerSelect.selectedIndex];

    if (selectedOption && selectedOption.value) {
        const loyaltyPoints = selectedOption.getAttribute('data-loyalty-points') || 0;
        document.getElementById('availableLoyaltyPoints').textContent = loyaltyPoints;

        // Reset loyalty points used if it exceeds available
        const loyaltyPointsUsed = document.getElementById('loyaltyPointsUsed');
        if (loyaltyPointsUsed && parseInt(loyaltyPointsUsed.value) > parseInt(loyaltyPoints)) {
            loyaltyPointsUsed.value = 0;
        }
    } else {
        document.getElementById('availableLoyaltyPoints').textContent = '0';
        document.getElementById('loyaltyPointsUsed').value = '0';
    }

    calculateOrderTotal();
}

// Display orders in table
function displayOrders(ordersToDisplay = orders) {
    const tableBody = document.getElementById('ordersTableBody');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (ordersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToDisplay.forEach((order, index) => {
        const row = document.createElement('tr');

        const customerName = order.customerName || 'Walk-in';
        const statusBadge = getOrderStatusBadge(order.status);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${order.orderCode}</strong></td>
            <td>${customerName}</td>
            <td><span class="badge bg-info">${order.orderType}</span></td>
            <td>${order.items ? order.items.length : 0}</td>
            <td class="fw-bold text-success">Rs. ${formatNumber(order.grandTotal)}</td>
            <td>${statusBadge}</td>
            <td><small>${formatDateTime(order.createdAt)}</small></td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="viewOrder(${order.orderId})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-warning btn-sm me-1" onclick="updateOrderStatus(${order.orderId})" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Get order status badge
function getOrderStatusBadge(status) {
    const statusMap = {
        'PENDING': 'warning',
        'CONFIRMED': 'info',
        'PROCESSING': 'primary',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
    };

    const badgeClass = statusMap[status] || 'secondary';
    return `<span class="badge bg-${badgeClass}">${status}</span>`;
}

// Update statistics
function updateStatistics() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;

    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = orders
        .filter(o => o.createdAt && o.createdAt.startsWith(today))
        .reduce((sum, o) => sum + (parseFloat(o.grandTotal) || 0), 0);

    const pendingOrdersEl = document.getElementById('pendingOrders');
    const processingOrdersEl = document.getElementById('processingOrders');
    const completedOrdersEl = document.getElementById('completedOrders');
    const todayRevenueEl = document.getElementById('todayRevenue');

    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (processingOrdersEl) processingOrdersEl.textContent = processingOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = totalOrders;
    if (todayRevenueEl) todayRevenueEl.textContent = 'Rs. ' + formatNumber(todayRevenue);
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('searchOrder')?.value.toLowerCase() || '';

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !searchTerm ||
            (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm)) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm));

        return matchesSearch;
    });

    displayOrders(filteredOrders);
}

// Clear filters
function clearOrderFilters() {
    const searchInput = document.getElementById('searchOrder');
    if (searchInput) searchInput.value = '';

    displayOrders();
}

// Add order item row
function addOrderItem() {
    const tbody = document.getElementById('orderItemsBody');
    if (!tbody) return;

    const itemIndex = tbody.children.length;
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>
            <select class="form-select form-select-sm" id="batch_${itemIndex}" onchange="updateItemDetails(${itemIndex})">
                <option value="">Select Product Batch</option>
                ${productBatches.map(batch =>
        `<option value="${batch.batchId}" 
                             data-price="${batch.sellingPrice}" 
                             data-stock="${batch.stockQuantity}"
                             data-product-name="${batch.productName}">
                        ${batch.productName} - Batch: ${batch.batchCode} (Stock: ${batch.stockQuantity})
                    </option>`
    ).join('')}
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-end" id="price_${itemIndex}" readonly step="0.01">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" id="quantity_${itemIndex}" 
                   min="1" value="1" onchange="updateItemTotal(${itemIndex})">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" id="discount_${itemIndex}" 
                   min="0" max="100" value="0" step="0.01" onchange="updateItemTotal(${itemIndex})">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-end" id="total_${itemIndex}" readonly step="0.01">
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOrderItem(${itemIndex})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);
}

// Update item details when batch is selected
function updateItemDetails(itemIndex) {
    const batchSelect = document.getElementById(`batch_${itemIndex}`);
    const priceInput = document.getElementById(`price_${itemIndex}`);
    const quantityInput = document.getElementById(`quantity_${itemIndex}`);

    if (batchSelect && batchSelect.value) {
        const selectedOption = batchSelect.options[batchSelect.selectedIndex];
        const price = selectedOption.getAttribute('data-price');
        const stock = selectedOption.getAttribute('data-stock');

        if (priceInput) priceInput.value = price;
        if (quantityInput) {
            quantityInput.max = stock;
            if (parseInt(quantityInput.value) > parseInt(stock)) {
                quantityInput.value = stock;
            }
        }

        updateItemTotal(itemIndex);
    } else {
        if (priceInput) priceInput.value = '';
        if (quantityInput) quantityInput.max = '';
        updateItemTotal(itemIndex);
    }
}

// Update item total
function updateItemTotal(itemIndex) {
    const priceInput = document.getElementById(`price_${itemIndex}`);
    const quantityInput = document.getElementById(`quantity_${itemIndex}`);
    const discountInput = document.getElementById(`discount_${itemIndex}`);
    const totalInput = document.getElementById(`total_${itemIndex}`);

    if (!priceInput || !quantityInput || !totalInput) return;

    const price = parseFloat(priceInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 0;
    const discountPercent = parseFloat(discountInput?.value) || 0;

    const subtotal = price * quantity;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    totalInput.value = total.toFixed(2);
    calculateOrderTotal();
}

// Remove order item
function removeOrderItem(itemIndex) {
    const row = document.getElementById(`batch_${itemIndex}`)?.closest('tr');
    if (row) {
        row.remove();
        calculateOrderTotal();
    }
}

// Calculate order total
function calculateOrderTotal() {
    let subtotal = 0;
    const tbody = document.getElementById('orderItemsBody');

    if (tbody) {
        for (let i = 0; i < tbody.children.length; i++) {
            const totalInput = document.getElementById(`total_${i}`);
            if (totalInput && totalInput.value) {
                subtotal += parseFloat(totalInput.value) || 0;
            }
        }
    }

    const discountAmount = parseFloat(document.getElementById('discountAmount')?.value) || 0;
    const taxAmount = parseFloat(document.getElementById('taxAmount')?.value) || 0;
    const deliveryCharge = parseFloat(document.getElementById('deliveryCharge')?.value) || 0;

    // Calculate loyalty discount (Rs. 1 per point)
    const loyaltyPointsUsed = parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0;
    const loyaltyDiscount = loyaltyPointsUsed * 1; // 1 point = Rs. 1

    const grandTotal = subtotal - discountAmount + taxAmount + deliveryCharge - loyaltyDiscount;

    // Update display
    const subtotalDisplay = document.getElementById('subtotalDisplay');
    const loyaltyDiscountDisplay = document.getElementById('loyaltyDiscountDisplay');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');

    if (subtotalDisplay) subtotalDisplay.textContent = 'Rs. ' + formatNumber(subtotal);
    if (loyaltyDiscountDisplay) loyaltyDiscountDisplay.textContent = '- Rs. ' + formatNumber(loyaltyDiscount);
    if (grandTotalDisplay) grandTotalDisplay.textContent = 'Rs. ' + formatNumber(grandTotal);
}

// Submit order form (Create)
async function submitOrderForm() {
    if (!validateOrderForm()) {
        return;
    }

    const orderData = getOrderFormData();

    try {
        showButtonLoading('btnSubmitOrder');

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
        }

        const result = await response.json();

        hideButtonLoading('btnSubmitOrder');
        showToast(`Order created successfully! Order Code: ${result.data.orderCode}`, 'success');

        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalOrderForm'));
        if (modal) modal.hide();

        clearOrderForm();
        loadOrders();

    } catch (error) {
        console.error('Error creating order:', error);
        hideButtonLoading('btnSubmitOrder');
        showToast(error.message || 'Failed to create order', 'error');
    }
}

// Get order form data
function getOrderFormData() {
    const customerSelect = document.getElementById('customer');
    const customerId = customerSelect?.value || null;

    const items = [];
    const tbody = document.getElementById('orderItemsBody');

    for (let i = 0; i < tbody.children.length; i++) {
        const batchSelect = document.getElementById(`batch_${i}`);
        const quantityInput = document.getElementById(`quantity_${i}`);
        const priceInput = document.getElementById(`price_${i}`);
        const discountInput = document.getElementById(`discount_${i}`);

        if (batchSelect && batchSelect.value && quantityInput && quantityInput.value) {
            items.push({
                batchId: parseInt(batchSelect.value),
                quantity: parseInt(quantityInput.value),
                unitPrice: parseFloat(priceInput.value),
                discountPercentage: parseFloat(discountInput?.value) || 0
            });
        }
    }

    return {
        customerId: customerId ? parseInt(customerId) : null,
        orderType: document.getElementById('orderType')?.value || 'WALK_IN',
        items: items,
        taxAmount: parseFloat(document.getElementById('taxAmount')?.value) || 0,
        deliveryCharge: parseFloat(document.getElementById('deliveryCharge')?.value) || 0,
        loyaltyPointsUsed: parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0,
        discountCode: document.getElementById('discountCode')?.value || null,
        notes: document.getElementById('notes')?.value || null
    };
}

// Validate order form
function validateOrderForm() {
    const orderType = document.getElementById('orderType')?.value;
    if (!orderType) {
        showToast('Please select order type', 'error');
        return false;
    }

    const tbody = document.getElementById('orderItemsBody');
    if (!tbody || tbody.children.length === 0) {
        showToast('Please add at least one item to the order', 'error');
        return false;
    }

    // Validate each item
    let validItems = 0;
    for (let i = 0; i < tbody.children.length; i++) {
        const batchSelect = document.getElementById(`batch_${i}`);
        const quantityInput = document.getElementById(`quantity_${i}`);

        if (batchSelect && batchSelect.value && quantityInput && quantityInput.value > 0) {
            const selectedOption = batchSelect.options[batchSelect.selectedIndex];
            const stock = parseInt(selectedOption.getAttribute('data-stock'));
            const quantity = parseInt(quantityInput.value);

            if (quantity > stock) {
                showToast(`Insufficient stock for item ${i + 1}. Available: ${stock}`, 'error');
                return false;
            }
            validItems++;
        }
    }

    if (validItems === 0) {
        showToast('Please add valid items with quantities', 'error');
        return false;
    }

    // Validate loyalty points
    const customerId = document.getElementById('customer')?.value;
    const loyaltyPointsUsed = parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0;

    if (loyaltyPointsUsed > 0 && !customerId) {
        showToast('Please select a customer to use loyalty points', 'error');
        return false;
    }

    const availablePoints = parseInt(document.getElementById('availableLoyaltyPoints')?.textContent) || 0;
    if (loyaltyPointsUsed > availablePoints) {
        showToast(`Cannot use more than ${availablePoints} loyalty points`, 'error');
        return false;
    }

    return true;
}

// View order details
async function viewOrder(orderId) {
    try {
        showLoadingSpinner();
        const response = await fetch(`${API_BASE_URL}/${orderId}`);

        if (!response.ok) throw new Error('Failed to load order details');

        const result = await response.json();
        const order = result.data;

        hideLoadingSpinner();

        // Display in modal
        const modalBody = document.getElementById('orderDetailsContent');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6 class="text-primary">Order Information</h6>
                    <p><strong>Order Code:</strong> ${order.orderCode}</p>
                    <p><strong>Order Type:</strong> <span class="badge bg-info">${order.orderType}</span></p>
                    <p><strong>Status:</strong> ${getOrderStatusBadge(order.status)}</p>
                    <p><strong>Created:</strong> ${formatDateTime(order.createdAt)}</p>
                    <p><strong>Created By:</strong> ${order.createdBy || 'System'}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary">Customer Information</h6>
                    <p><strong>Customer:</strong> ${order.customerName || 'Walk-in Customer'}</p>
                    ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
                </div>
            </div>
            
            <h6 class="text-primary">Order Items</h6>
            <div class="table-responsive mb-3">
                <table class="table table-sm table-striped">
                    <thead class="table-success">
                        <tr>
                            <th>Product</th>
                            <th class="text-end">Qty</th>
                            <th class="text-end">Unit Price</th>
                            <th class="text-end">Discount</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td class="text-end">${item.quantity}</td>
                                <td class="text-end">Rs. ${formatNumber(item.unitPrice)}</td>
                                <td class="text-end">${item.discountPercentage || 0}%</td>
                                <td class="text-end fw-bold">Rs. ${formatNumber(item.lineTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="row">
                <div class="col-md-6"></div>
                <div class="col-md-6">
                    <div class="card bg-light">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span class="fw-bold">Rs. ${formatNumber(order.subtotal)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Discount:</span>
                                <span>- Rs. ${formatNumber(order.discountAmount || 0)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Tax:</span>
                                <span>Rs. ${formatNumber(order.taxAmount || 0)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Delivery Charge:</span>
                                <span>Rs. ${formatNumber(order.deliveryCharge || 0)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Loyalty Discount (${order.loyaltyPointsUsed || 0} pts):</span>
                                <span class="text-success">- Rs. ${formatNumber(order.loyaltyDiscountAmount || 0)}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <strong>Grand Total:</strong>
                                <strong class="text-success fs-5">Rs. ${formatNumber(order.grandTotal)}</strong>
                            </div>
                            ${order.loyaltyPointsEarned ? `
                                <div class="text-center mt-2">
                                    <small class="text-muted">Earned: ${order.loyaltyPointsEarned} loyalty points</small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('modalOrderDetails'));
        modal.show();

    } catch (error) {
        console.error('Error loading order:', error);
        hideLoadingSpinner();
        showToast('Failed to load order details', 'error');
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    // Show status selection dialog
    const result = await Swal.fire({
        title: 'Update Order Status',
        icon: 'question',
        input: 'select',
        inputOptions: {
            'PENDING': 'Pending',
            'CONFIRMED': 'Confirmed',
            'PROCESSING': 'Processing',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
        },
        inputPlaceholder: 'Select new status',
        showCancelButton: true,
        confirmButtonText: 'Update',
        confirmButtonColor: '#22C55E',
        inputValidator: (value) => {
            if (!value) {
                return 'Please select a status'
            }
        }
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                statusId: getStatusId(result.value),
                notes: null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }

        showToast('Order status updated successfully!', 'success');
        loadOrders();

    } catch (error) {
        console.error('Error updating status:', error);
        showToast(error.message || 'Failed to update status', 'error');
    }
}

// Get status ID from status name (simplified mapping)
function getStatusId(statusName) {
    const statusMap = {
        'PENDING': 1,
        'CONFIRMED': 2,
        'PROCESSING': 3,
        'COMPLETED': 4,
        'CANCELLED': 5
    };
    return statusMap[statusName] || 1;
}

// Apply discount code
function applyDiscountCode() {
    const discountCode = document.getElementById('discountCode')?.value;
    if (!discountCode) {
        showToast('Please enter a discount code', 'warning');
        return;
    }

    // TODO: Implement discount code validation with backend
    showToast('Discount code feature coming soon!', 'info');
}

// Clear order form
function clearOrderForm() {
    const form = document.getElementById('orderForm');
    if (form) form.reset();

    document.getElementById('customer').selectedIndex = 0;
    document.getElementById('orderType').value = 'WALK_IN';
    document.getElementById('availableLoyaltyPoints').textContent = '0';
    document.getElementById('orderItemsBody').innerHTML = '';

    document.getElementById('subtotalDisplay').textContent = 'Rs. 0.00';
    document.getElementById('loyaltyDiscountDisplay').textContent = '- Rs. 0.00';
    document.getElementById('grandTotalDisplay').textContent = 'Rs. 0.00';

    editingOrderId = null;

    // Reset modal title
    document.getElementById('modalOrderFormLabel').innerHTML =
        '<i class="fas fa-shopping-cart me-2"></i>New Order';
}

// Export order data
function exportOrderData() {
    if (orders.length === 0) {
        showToast('No orders to export', 'info');
        return;
    }

    const csv = generateOrdersCSV();
    downloadCSV(csv, `orders_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Orders exported successfully!', 'success');
}

// Generate CSV from orders
function generateOrdersCSV() {
    const headers = ['Order Code', 'Customer', 'Order Type', 'Items', 'Subtotal', 'Tax',
        'Delivery', 'Discount', 'Grand Total', 'Status', 'Created At'];

    let csv = headers.join(',') + '\n';

    orders.forEach(order => {
        const row = [
            order.orderCode,
            `"${order.customerName || 'Walk-in'}"`,
            order.orderType,
            order.items?.length || 0,
            order.subtotal || 0,
            order.taxAmount || 0,
            order.deliveryCharge || 0,
            order.discountAmount || 0,
            order.grandTotal || 0,
            order.status,
            order.createdAt || ''
        ];
        csv += row.join(',') + '\n';
    });

    return csv;
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Bulk status update
function bulkStatusUpdate() {
    showToast('Bulk status update feature coming soon!', 'info');
}

// Print order details
function printOrderDetails() {
    window.print();
}

// Helper: Show loading spinner
function showLoadingSpinner() {
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
        if (buttonId === 'btnSubmitOrder') {
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Create Order';
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

// Helper: Format number with 2 decimals
function formatNumber(num) {
    return parseFloat(num || 0).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Helper: Format date and time
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
