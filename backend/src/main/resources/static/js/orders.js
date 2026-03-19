// Order Management with Barcode Scanning - New Implementation

// Global Variables
let orders = [];
let customers = [];
let cartItems = [];
let selectedCustomer = null;
let currentBarcodes = {};
let activeTab = 'WALK_IN'; // Track active tab for orders list

// API Base URLs
const API_BASE_URL = '/api/orders';
const CUSTOMERS_API_URL = '/api/customers';
const BATCHES_API_URL = '/api/batches';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Using SweetAlert2
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    const backgroundMap = {
        'success': '#51cf66',
        'error': '#ff6b6b',
        'warning': '#ffd43b',
        'info': '#4dabf7'
    };

    Toast.fire({
        icon: type,
        title: message,
        background: backgroundMap[type] || backgroundMap['info']
    });
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    if (!num && num !== 0) return '0.00';
    return parseFloat(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Show loading spinner
 */
function showLoadingSpinner() {
    // Can be implemented with a loading overlay if needed
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    // Can be implemented with a loading overlay if needed
}

// ==================== INITIALIZATION ====================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadOrders();
    setupEventListeners();
    loadCustomers();
});

// Setup event listeners
function setupEventListeners() {
    // Search and filter
    const searchInput = document.getElementById('searchOrder');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }

    // Barcode input
    const barcodeInput = document.getElementById('barcodeInput');
    if (barcodeInput) {
        barcodeInput.addEventListener('keypress', handleBarcodeInput);
    }

    // Clear barcode button
    const btnClearBarcode = document.getElementById('btnClearBarcode');
    if (btnClearBarcode) {
        btnClearBarcode.addEventListener('click', () => {
            const barcodeInput = document.getElementById('barcodeInput');
            if (barcodeInput) {
                barcodeInput.value = '';
                barcodeInput.focus();
            }
        });
    }

    // Customer search
    const btnSearchCustomer = document.getElementById('btnSearchCustomer');
    if (btnSearchCustomer) {
        btnSearchCustomer.addEventListener('click', searchCustomers);
    }

    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchCustomers();
            }
        });
    }

    // Fulfillment type change
    const fulfillmentRadios = document.querySelectorAll('input[name="fulfillmentType"]');
    fulfillmentRadios.forEach(radio => {
        radio.addEventListener('change', handleFulfillmentTypeChange);
    });

    // Loyalty points change
    const loyaltyPointsInput = document.getElementById('loyaltyPointsUsed');
    if (loyaltyPointsInput) {
        loyaltyPointsInput.addEventListener('input', calculateOrderTotal);
    }

    // Discount and tax changes
    const discountInput = document.getElementById('discountAmount');
    const taxInput = document.getElementById('taxAmount');
    if (discountInput) discountInput.addEventListener('input', calculateOrderTotal);
    if (taxInput) taxInput.addEventListener('input', calculateOrderTotal);

    // Modal dismiss handler - reset form
    const orderModal = document.getElementById('modalOrderForm');
    if (orderModal) {
        orderModal.addEventListener('hide.bs.modal', function () {
            clearOrderForm();
        });
        // Set focus on barcode input when modal opens
        orderModal.addEventListener('show.bs.modal', function () {
            setTimeout(() => {
                const barcodeInput = document.getElementById('barcodeInput');
                if (barcodeInput) {
                    barcodeInput.focus();
                }
            }, 300);
        });
    }
}

// Handle barcode input (Enter key)
async function handleBarcodeInput(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    const barcodeInput = document.getElementById('barcodeInput');
    const barcode = barcodeInput.value.trim();

    if (!barcode) {
        showToast('Please scan or enter a barcode', 'warning');
        return;
    }

    try {
        // Try to get product by barcode
        const response = await fetch(`${BATCHES_API_URL}/barcode/${barcode}/pricing`);

        if (!response.ok) {
            showToast('Product not found for barcode: ' + barcode, 'error');
            barcodeInput.value = '';
            barcodeInput.focus();
            return;
        }

        const result = await response.json();
        const product = result.data;

        // Add to cart or increase quantity if exists
        addToCart(product);

        // Clear input and focus
        barcodeInput.value = '';
        barcodeInput.focus();

    } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Error retrieving product information', 'error');
        barcodeInput.value = '';
        barcodeInput.focus();
    }
}

// Add product to cart
function addToCart(product) {
    const itemKey = `${product.batchId}`;

    // Check if item already exists in cart
    let existingItem = cartItems.find(item => item.batchId === product.batchId);

    if (existingItem) {
        // Increase quantity if in stock
        if (existingItem.quantity < product.stockQuantity) {
            existingItem.quantity++;
        } else {
            showToast(`Cannot add more. Stock available: ${product.stockQuantity}`, 'warning');
        }
    } else {
        // Add new item
        cartItems.push({
            batchId: product.batchId,
            productName: product.productName,
            batchCode: product.batchCode,
            quantity: 1,
            unitPrice: product.sellingPrice,
            stockQuantity: product.stockQuantity,
            expiryDate: product.expiryDate
        });
    }

    renderCartItems();
    calculateOrderTotal();
    showToast(`Added ${product.productName} to cart`, 'success');
}

// Render cart items in table
function renderCartItems() {
    const tbody = document.getElementById('orderItemsBody');
    if (!tbody) return;

    if (cartItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-2x mb-2"></i>
                    <p>Scan items to add to cart</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = cartItems.map((item, index) => {
        const total = item.quantity * item.unitPrice;
        return `
            <tr>
                <td>${item.productName}</td>
                <td class="text-center"><small>${item.batchCode}</small></td>
                <td class="text-end">Rs. ${formatNumber(item.unitPrice)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="mx-2 fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                </td>
                <td class="text-end fw-bold">Rs. ${formatNumber(total)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeCartItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Increase item quantity
function increaseQuantity(index) {
    if (index >= 0 && index < cartItems.length) {
        if (cartItems[index].quantity < cartItems[index].stockQuantity) {
            cartItems[index].quantity++;
            renderCartItems();
            calculateOrderTotal();
        } else {
            showToast('Maximum stock available reached', 'warning');
        }
    }
}

// Decrease item quantity
function decreaseQuantity(index) {
    if (index >= 0 && index < cartItems.length) {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
            renderCartItems();
            calculateOrderTotal();
        } else {
            removeCartItem(index);
        }
    }
}

// Remove item from cart
function removeCartItem(index) {
    if (index >= 0 && index < cartItems.length) {
        const productName = cartItems[index].productName;
        cartItems.splice(index, 1);
        renderCartItems();
        calculateOrderTotal();
        showToast(`${productName} removed from cart`, 'info');
    }
}

// Search customers
async function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch')?.value.trim();

    if (!searchTerm) {
        showToast('Please enter search term', 'warning');
        return;
    }

    try {
        const response = await fetch(`${CUSTOMERS_API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search failed');

        const result = await response.json();
        const searchResults = result.data || [];

        displayCustomerSearchResults(searchResults);

    } catch (error) {
        console.error('Error searching customers:', error);
        showToast('Failed to search customers', 'error');
    }
}

// Display customer search results
function displayCustomerSearchResults(results) {
    const resultsContainer = document.getElementById('customerSearchResults');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-info">No customers found</div>';
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = results.map(customer => `
        <button type="button" class="list-group-item list-group-item-action" 
            onclick="selectCustomerFromSearch(${customer.customerId}, '${customer.fullName}', ${customer.loyaltyPoints || 0})">
            <strong>${customer.fullName}</strong><br>
            <small class="text-muted">NIC: ${customer.nic || 'N/A'} | Phone: ${customer.phone}</small>
        </button>
    `).join('');
    resultsContainer.style.display = 'block';
}

// Select customer from search results
function selectCustomerFromSearch(customerId, fullName, loyaltyPoints) {
    selectedCustomer = {
        customerId: customerId,
        fullName: fullName,
        loyaltyPoints: loyaltyPoints
    };

    // Update selected customer display
    const selectedCustomerDiv = document.getElementById('selectedCustomer');
    if (selectedCustomerDiv) {
        selectedCustomerDiv.innerHTML = `
            <strong>${fullName}</strong><br>
            <small class="text-muted">Loyalty Points: ${loyaltyPoints}</small>
        `;
    }

    // Update hidden customer ID
    document.getElementById('customerId').value = customerId;

    // Update available loyalty points
    document.getElementById('loyaltyPointsDisplay').textContent = loyaltyPoints;
    document.getElementById('availableLoyaltyPoints').textContent = loyaltyPoints;

    // Reset loyalty points used
    const loyaltyPointsUsed = document.getElementById('loyaltyPointsUsed');
    if (loyaltyPointsUsed) loyaltyPointsUsed.value = 0;

    // Hide search results
    document.getElementById('customerSearchResults').style.display = 'none';
    document.getElementById('customerSearch').value = '';

    calculateOrderTotal();
    showToast(`Customer ${fullName} selected`, 'success');
}

// Handle fulfillment type change
function handleFulfillmentTypeChange() {
    const fulfillmentType = document.querySelector('input[name="fulfillmentType"]:checked')?.value;
    const deliverySection = document.getElementById('deliveryAddressSection');

    if (deliverySection) {
        if (fulfillmentType === 'DELIVERY') {
            deliverySection.style.display = 'block';
        } else {
            deliverySection.style.display = 'none';
        }
    }
}

// Save new customer
async function saveNewCustomer() {
    const fullName = document.getElementById('newCustFullName')?.value.trim();
    const nic = document.getElementById('newCustNIC')?.value.trim();
    const phone = document.getElementById('newCustPhone')?.value.trim();
    const email = document.getElementById('newCustEmail')?.value.trim() || null;
    const address = document.getElementById('newCustAddress')?.value.trim() || null;

    // Validation
    if (!fullName || !nic || !phone) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        const response = await fetch(CUSTOMERS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: fullName,
                nic: nic,
                phone: phone,
                email: email,
                address: address
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create customer');
        }

        const result = await response.json();
        const newCustomer = result.data;

        // Select the new customer
        selectCustomerFromSearch(newCustomer.customerId, newCustomer.fullName, 0);

        // Reset and close modal
        document.getElementById('newCustomerForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNewCustomer'));
        if (modal) modal.hide();

        showToast(`Customer ${newCustomer.fullName} registered successfully!`, 'success');

    } catch (error) {
        console.error('Error creating customer:', error);
        showToast(error.message || 'Failed to register customer', 'error');
    }
}

// Calculate order total
function calculateOrderTotal() {
    let subtotal = 0;

    // Calculate subtotal from cart items
    cartItems.forEach(item => {
        subtotal += item.quantity * item.unitPrice;
    });

    const discountAmount = parseFloat(document.getElementById('discountAmount')?.value) || 0;
    const taxAmount = parseFloat(document.getElementById('taxAmount')?.value) || 0;

    // Calculate loyalty discount (Rs. 10 per point)
    const loyaltyPointsUsed = parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0;
    const loyaltyDiscount = loyaltyPointsUsed * 10;

    const grandTotal = subtotal - discountAmount + taxAmount - loyaltyDiscount;

    // Update displays
    document.getElementById('subtotalDisplay').textContent = 'Rs. ' + formatNumber(subtotal);
    document.getElementById('loyaltyDiscountDisplay').textContent = '- Rs. ' + formatNumber(loyaltyDiscount);
    document.getElementById('grandTotalDisplay').textContent = 'Rs. ' + formatNumber(Math.max(0, grandTotal));

    // Validate loyalty points
    const availablePoints = parseInt(document.getElementById('availableLoyaltyPoints')?.textContent) || 0;
    const loyaltyInput = document.getElementById('loyaltyPointsUsed');
    if (loyaltyPointsUsed > availablePoints && loyaltyInput) {
        loyaltyInput.classList.add('is-invalid');
    } else if (loyaltyInput) {
        loyaltyInput.classList.remove('is-invalid');
    }
}

// Get order form data
function getOrderFormData() {
    const fulfillmentType = document.querySelector('input[name="fulfillmentType"]:checked')?.value || 'PICKUP';
    const customerId = document.getElementById('customerId')?.value || null;

    const items = cartItems.map(item => ({
        batchId: item.batchId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: 0
    }));

    const orderData = {
        customerId: customerId ? parseInt(customerId) : null,
        orderType: 'ONLINE',
        fulfillmentType: fulfillmentType,
        items: items,
        taxAmount: parseFloat(document.getElementById('taxAmount')?.value) || 0,
        deliveryCharge: 0,
        loyaltyPointsUsed: parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0
    };

    // Add delivery address if delivery is selected
    if (fulfillmentType === 'DELIVERY') {
        orderData.deliveryAddress = document.getElementById('deliveryAddress')?.value || '';
        orderData.deliveryCity = document.getElementById('deliveryCity')?.value || '';
        orderData.deliveryPhone = document.getElementById('deliveryPhone')?.value || '';
    }

    return orderData;
}

// Validate order form
function validateOrderForm() {
    const fulfillmentType = document.querySelector('input[name="fulfillmentType"]:checked')?.value;

    if (!fulfillmentType) {
        showToast('Please select fulfillment type', 'error');
        return false;
    }

    if (cartItems.length === 0) {
        showToast('Please scan items to add to cart', 'error');
        return false;
    }

    // Validate delivery address if delivery is selected
    if (fulfillmentType === 'DELIVERY') {
        const address = document.getElementById('deliveryAddress')?.value.trim();
        const city = document.getElementById('deliveryCity')?.value.trim();
        const phone = document.getElementById('deliveryPhone')?.value.trim();

        if (!address || !city || !phone) {
            showToast('Please provide complete delivery address', 'error');
            return false;
        }
    }

    // Validate loyalty points
    const loyaltyPointsUsed = parseInt(document.getElementById('loyaltyPointsUsed')?.value) || 0;
    if (loyaltyPointsUsed > 0 && !selectedCustomer) {
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

// Submit order form
async function submitOrderForm() {
    if (!validateOrderForm()) {
        return;
    }

    const orderData = getOrderFormData();

    try {
        const btnSubmit = document.getElementById('btnSubmitOrder');
        if (btnSubmit) btnSubmit.disabled = true;

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }

        const result = await response.json();

        showToast(`Order created successfully! Order Code: ${result.data.orderCode}`, 'success');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalOrderForm'));
        if (modal) modal.hide();

        clearOrderForm();
        loadOrders();

    } catch (error) {
        console.error('Error creating order:', error);
        showToast(error.message || 'Failed to create order', 'error');
    } finally {
        const btnSubmit = document.getElementById('btnSubmitOrder');
        if (btnSubmit) btnSubmit.disabled = false;
    }
}

// Clear order form
function clearOrderForm() {
    cartItems = [];
    selectedCustomer = null;

    // Reset form elements
    document.getElementById('orderForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('customerSearch').value = '';
    document.getElementById('barcodeInput').value = '';
    document.getElementById('customerSearchResults').style.display = 'none';

    // Reset customer display
    const selectedCustomerDiv = document.getElementById('selectedCustomer');
    if (selectedCustomerDiv) {
        selectedCustomerDiv.innerHTML = '<span class="text-muted">No customer selected</span>';
    }

    // Reset fulfillment type
    document.getElementById('fulfillmentPickup').checked = true;
    document.getElementById('deliveryAddressSection').style.display = 'none';

    // Reset loyalty points
    document.getElementById('loyaltyPointsUsed').value = '0';
    document.getElementById('availableLoyaltyPoints').textContent = '0';
    document.getElementById('loyaltyPointsDisplay').textContent = '0';

    // Render cart and calculate totals
    renderCartItems();
    calculateOrderTotal();
}

// Load all orders
async function loadOrders() {
    try {
        showLoadingSpinner();
        const response = await fetch(API_BASE_URL);

        if (!response.ok) throw new Error('Failed to load orders');

        const result = await response.json();
        orders = result.data || [];

        displayOrders();
        updateStatistics();
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error loading orders:', error);
        hideLoadingSpinner();
        showToast('Failed to load orders. Please try again.', 'error');
    }
}

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch(CUSTOMERS_API_URL);
        if (!response.ok) throw new Error('Failed to load customers');

        const result = await response.json();
        customers = result.data || [];

    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Switch between tabs for orders list
function switchTab(orderType) {
    activeTab = orderType;

    // Update tab active states
    document.getElementById('walkInTab')?.classList.toggle('active', orderType === 'WALK_IN');
    document.getElementById('onlineTab')?.classList.toggle('active', orderType === 'ONLINE');

    // Filter and display orders for the selected tab
    displayOrders();
}

// Display orders in table with tab filtering
function displayOrders(ordersToDisplay = orders) {
    // Filter orders based on active tab
    const filteredOrders = (ordersToDisplay === orders)
        ? orders.filter(o => o.orderType === activeTab)
        : ordersToDisplay.filter(o => o.orderType === activeTab);

    if (activeTab === 'WALK_IN') {
        displayWalkInOrders(filteredOrders);
    } else {
        displayOnlineOrders(filteredOrders);
    }
}

// Display Walk-In Orders
function displayWalkInOrders(ordersToDisplay) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (ordersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No walk-in orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToDisplay.forEach((order, index) => {
        const row = document.createElement('tr');
        const customerName = order.customerName || 'Walk-in';
        const statusBadge = getOrderStatusBadge(order.status);
        const isCompleted = order.status === 'COMPLETED' || order.status === 'CANCELLED';
        const isDelivery = order.fulfillmentType === 'DELIVERY';
        // Only show complete button for PICKUP orders that are not completed/cancelled
        const canComplete = !isCompleted && !isDelivery;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${order.orderCode}</strong></td>
            <td>${customerName}</td>
            <td>${order.items ? order.items.length : 0}</td>
            <td class="fw-bold text-success">Rs. ${formatNumber(order.grandTotal)}</td>
            <td>${statusBadge}</td>
            <td><small>${formatDateTime(order.createdAt)}</small></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-info" onclick="viewOrder(${order.orderId})" title="View Details" data-bs-toggle="tooltip">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" onclick="editOrder(${order.orderId})" title="Edit Order" data-bs-toggle="tooltip">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${canComplete ? `<button class="btn btn-outline-success" onclick="completeOrder(${order.orderId})" title="Mark Complete" data-bs-toggle="tooltip">
                        <i class="fas fa-check"></i>
                    </button>` : ''}
                    <button class="btn btn-outline-danger" onclick="deleteOrder(${order.orderId})" title="Delete Order" data-bs-toggle="tooltip">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="downloadOrderBill(${order.orderId})" title="Download Bill" data-bs-toggle="tooltip">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Display Online Orders (with Fulfillment Type)
function displayOnlineOrders(ordersToDisplay) {
    const tableBody = document.getElementById('ordersTableBodyOnline');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (ordersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No online orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToDisplay.forEach((order, index) => {
        const row = document.createElement('tr');
        const customerName = order.customerName || 'Customer';
        const statusBadge = getOrderStatusBadge(order.status);
        const fulfillmentBadge = getFulfillmentTypeBadge(order.fulfillmentType);
        const isCompleted = order.status === 'COMPLETED' || order.status === 'CANCELLED';
        const isDelivery = order.fulfillmentType === 'DELIVERY';
        // Only show complete button for PICKUP orders that are not completed/cancelled
        const canComplete = !isCompleted && !isDelivery;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${order.orderCode}</strong></td>
            <td>${customerName}</td>
            <td>${order.items ? order.items.length : 0}</td>
            <td class="fw-bold text-success">Rs. ${formatNumber(order.grandTotal)}</td>
            <td>${fulfillmentBadge}</td>
            <td>${statusBadge}</td>
            <td><small>${formatDateTime(order.createdAt)}</small></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-info" onclick="viewOrder(${order.orderId})" title="View Details" data-bs-toggle="tooltip">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" onclick="editOrder(${order.orderId})" title="Edit Order" data-bs-toggle="tooltip">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${canComplete ? `<button class="btn btn-outline-success" onclick="completeOrder(${order.orderId})" title="Mark Complete" data-bs-toggle="tooltip">
                        <i class="fas fa-check"></i>
                    </button>` : ''}
                    <button class="btn btn-outline-danger" onclick="deleteOrder(${order.orderId})" title="Delete Order" data-bs-toggle="tooltip">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="downloadOrderBill(${order.orderId})" title="Download Bill" data-bs-toggle="tooltip">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Get fulfillment type badge
function getFulfillmentTypeBadge(fulfillmentType) {
    const badges = {
        'PICKUP': '<span class="badge bg-primary"><i class="fas fa-store me-1"></i>Pickup</span>',
        'DELIVERY': '<span class="badge bg-success"><i class="fas fa-truck me-1"></i>Delivery</span>',
        'BOTH': '<span class="badge bg-secondary"><i class="fas fa-arrows-alt-h me-1"></i>Both</span>'
    };
    return badges[fulfillmentType] || '<span class="badge bg-secondary">N/A</span>';
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('searchOrder')?.value.toLowerCase() || '';

    const filteredOrders = orders.filter(order => {
        return !searchTerm ||
            (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm)) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm));
    });

    displayOrders(filteredOrders);
}

// Clear filters
function clearOrderFilters() {
    const searchInput = document.getElementById('searchOrder');
    if (searchInput) searchInput.value = '';
    displayOrders();
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

    if (document.getElementById('pendingOrders')) {
        document.getElementById('pendingOrders').textContent = pendingOrders;
    }
    if (document.getElementById('processingOrders')) {
        document.getElementById('processingOrders').textContent = processingOrders;
    }
    if (document.getElementById('completedOrders')) {
        document.getElementById('completedOrders').textContent = totalOrders;
    }
    if (document.getElementById('todayRevenue')) {
        document.getElementById('todayRevenue').textContent = 'Rs. ' + formatNumber(todayRevenue);
    }
}

// View order details
async function viewOrder(orderId) {
    try {
        showLoadingSpinner();
        const response = await fetch(`${API_BASE_URL}/${orderId}`);

        if (!response.ok) throw new Error('Failed to load order');

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
                    <p><strong>Fulfillment:</strong> ${order.fulfillmentType || 'N/A'}</p>
                    <p><strong>Created:</strong> ${formatDateTime(order.createdAt)}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary">Customer & Delivery</h6>
                    <p><strong>Customer:</strong> ${order.customerName || 'Walk-in'}</p>
                    ${order.fulfillmentType === 'DELIVERY' ? `
                        <p><strong>Address:</strong> ${order.deliveryAddress || 'N/A'}</p>
                        <p><strong>City:</strong> ${order.deliveryCity || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${order.deliveryPhone || 'N/A'}</p>
                    ` : ''}
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
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td class="text-end">${item.quantity}</td>
                                <td class="text-end">Rs. ${formatNumber(item.unitPrice)}</td>
                                <td class="text-end fw-bold">Rs. ${formatNumber(item.lineTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="row">
                <div class="col-md-8"></div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>Rs. ${formatNumber(order.subtotal)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Discount:</span>
                                <span>Rs. ${formatNumber(order.discountAmount)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Tax:</span>
                                <span>Rs. ${formatNumber(order.taxAmount)}</span>
                            </div>
                            <div class="d-flex justify-content-between text-success fw-bold border-top pt-2">
                                <span>Grand Total:</span>
                                <span>Rs. ${formatNumber(order.grandTotal)}</span>
                            </div>
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

// Update order status (stub for now)
function updateOrderStatus(orderId) {
    showToast('Order status update feature coming soon', 'info');
}

// Update order details (stub for now)
function updateOrderDetails() {
    showToast('Order details update feature coming soon', 'info');
}

// Print order details (stub for now)
function printOrderDetails() {
    window.print();
}

// ==================== NEW ACTION FUNCTIONS ====================

/**
 * Edit order
 */
function editOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
        showToast('Order not found', 'error');
        return;
    }

    // For now, show a preview in modal
    Swal.fire({
        title: 'Edit Order',
        html: `
            <div class="text-start">
                <p><strong>Order Code:</strong> ${order.orderCode}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Customer:</strong> ${order.customerName || 'Walk-in'}</p>
                <p><strong>Grand Total:</strong> Rs. ${formatNumber(order.grandTotal)}</p>
            </div>
            <p class="text-muted mt-3">Full edit functionality coming soon!</p>
        `,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}

/**
 * Complete/Mark order as done
 */
async function completeOrder(orderId) {
    const result = await Swal.fire({
        title: 'Mark Order as Complete?',
        text: 'Are you sure you want to mark this order as completed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Complete It',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        showLoadingSpinner();

        // Status ID mapping
        // PENDING = 1, CONFIRMED = 2, PROCESSING = 3, COMPLETED = 4, CANCELLED = 5
        const response = await fetch(`${API_BASE_URL}/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                statusId: 4,  // COMPLETED status ID
                notes: 'Order completed by staff'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update order status');
        }

        showToast('Order marked as completed ✓', 'success');
        loadOrders(); // Reload orders list
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error completing order:', error);
        hideLoadingSpinner();
        showToast('Failed to complete order: ' + error.message, 'error');
    }
}

/**
 * Delete order
 */
async function deleteOrder(orderId) {
    const result = await Swal.fire({
        title: 'Delete Order?',
        text: 'Are you sure you want to delete this order? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete It',
        confirmButtonColor: '#dc3545',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        showLoadingSpinner();
        const response = await fetch(`${API_BASE_URL}/${orderId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete order');

        showToast('Order deleted successfully', 'success');
        loadOrders(); // Reload orders list
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error deleting order:', error);
        hideLoadingSpinner();
        showToast('Failed to delete order. ' + error.message, 'error');
    }
}

/**
 * Download order bill/invoice
 */
async function downloadOrderBill(orderId) {
    try {
        showLoadingSpinner();
        const response = await fetch(`${API_BASE_URL}/${orderId}`);

        if (!response.ok) throw new Error('Failed to load order');

        const result = await response.json();
        const order = result.data;
        hideLoadingSpinner();

        // Generate bill content
        const billContent = generateBillHTML(order);

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(billContent);
        printWindow.document.close();

        // Trigger print dialog after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 250);

    } catch (error) {
        console.error('Error downloading bill:', error);
        hideLoadingSpinner();
        showToast('Failed to download bill. ' + error.message, 'error');
    }
}

/**
 * Generate HTML bill for printing
 */
function generateBillHTML(order) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const itemsHTML = order.items.map(item => `
        <tr>
            <td>${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">Rs. ${formatNumber(item.unitPrice)}</td>
            <td style="text-align: right;">Rs. ${formatNumber(item.lineTotal)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Invoice - ${order.orderCode}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .invoice-container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #28a745;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #28a745;
                    font-size: 28px;
                }
                .header p {
                    margin: 5px 0;
                    color: #666;
                }
                .invoice-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .invoice-info div {
                    flex: 1;
                }
                .invoice-info strong {
                    display: block;
                    color: #28a745;
                    margin-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th {
                    background-color: #28a745;
                    color: white;
                    padding: 10px;
                    text-align: left;
                    font-weight: bold;
                }
                td {
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .summary {
                    float: right;
                    width: 40%;
                    padding: 15px;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                }
                .summary-row.total {
                    border-top: 2px solid #28a745;
                    padding-top: 10px;
                    font-weight: bold;
                    font-size: 16px;
                    color: #28a745;
                }
                .footer {
                    clear: both;
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 12px;
                }
                .thank-you {
                    text-align: center;
                    font-weight: bold;
                    color: #28a745;
                    margin: 20px 0;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .invoice-container {
                        border: none;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <h1>📋 INVOICE</h1>
                    <p>Sampath Grocery Store</p>
                </div>

                <div class="invoice-info">
                    <div>
                        <strong>Invoice Details</strong>
                        <p>Invoice #: ${order.orderCode}</p>
                        <p>Date: ${currentDate}</p>
                        <p>Order Type: ${order.orderType === 'WALK_IN' ? '🏪 Walk-In' : '🌐 Online'}</p>
                    </div>
                    <div>
                        <strong>Customer</strong>
                        <p>${order.customerName || 'Walk-in Customer'}</p>
                        ${order.fulfillmentType ? `<p>Fulfillment: ${order.fulfillmentType === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}</p>` : ''}
                        ${order.deliveryCity ? `<p>Location: ${order.deliveryCity}</p>` : ''}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <div class="summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>Rs. ${formatNumber(order.subtotal || order.grandTotal)}</span>
                    </div>
                    ${order.taxAmount ? `
                        <div class="summary-row">
                            <span>Tax:</span>
                            <span>Rs. ${formatNumber(order.taxAmount)}</span>
                        </div>
                    ` : ''}
                    ${order.discountAmount ? `
                        <div class="summary-row">
                            <span>Discount:</span>
                            <span>- Rs. ${formatNumber(order.discountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Grand Total:</span>
                        <span>Rs. ${formatNumber(order.grandTotal)}</span>
                    </div>
                </div>

                <div class="thank-you">
                    ✨ Thank You for Your Purchase! ✨
                </div>

                <div class="footer">
                    <p>Sampath Grocery Store | Colombo, Sri Lanka</p>
                    <p>Invoice generated on ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
