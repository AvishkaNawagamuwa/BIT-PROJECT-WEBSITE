// POS System JavaScript
// Author: Sampath Grocery Store
// Module: Point of Sale System

// Global Variables
let cartItems = [];
let selectedCustomer = null;
let products = [];
let currentDateTime = null;

// Initialize POS System
document.addEventListener('DOMContentLoaded', function () {
    initializePOS();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    loadProducts();
    loadCashierInfo();
});

// Initialize POS
function initializePOS() {
    console.log('POS System Initialized');

    // Set today's date
    const today = new Date().toISOString().split('T')[0];

    // Focus on barcode input
    document.getElementById('barcodeInput').focus();

    // Load held sales if any
    loadHeldSales();
}

// Update Current Date Time
function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('currentDateTime').textContent = dateTimeString;
}

// Setup Event Listeners
function setupEventListeners() {
    // Barcode Input
    document.getElementById('barcodeInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const barcode = this.value.trim();
            if (barcode) {
                addProductByBarcode(barcode);
                this.value = '';
            }
        }
    });

    // Product Search
    document.getElementById('productSearch').addEventListener('input', function () {
        searchProducts(this.value);
    });

    // Walk-in Customer Checkbox
    document.getElementById('walkInCustomer').addEventListener('change', function () {
        const customerSection = document.getElementById('customerSearchSection');
        if (this.checked) {
            customerSection.style.display = 'none';
            selectedCustomer = null;
            document.getElementById('selectedCustomerInfo').style.display = 'none';
        } else {
            customerSection.style.display = 'block';
        }
    });

    // Payment Method Selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function () {
            handlePaymentMethodChange(this.value);
        });
    });

    // Payment Method Cards Click
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', function () {
            const method = this.getAttribute('data-method');
            const radio = document.getElementById('payment' + method.charAt(0).toUpperCase() + method.slice(1));
            if (radio) {
                radio.checked = true;
                handlePaymentMethodChange(method);
            }
        });
    });

    // Amount Tendered for Change Calculation
    document.getElementById('amountTendered').addEventListener('input', calculateChange);

    // Discount Calculation
    document.getElementById('discountValue').addEventListener('input', updateCartSummary);
    document.querySelectorAll('input[name="discountType"]').forEach(radio => {
        radio.addEventListener('change', updateCartSummary);
    });

    // Quick Add Buttons
    document.querySelectorAll('.quick-add-btn').forEach(button => {
        button.addEventListener('click', function () {
            const productName = this.getAttribute('data-product');
            quickAddProduct(productName);
        });
    });
}

// Load Cashier Info
function loadCashierInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.fullName) {
        document.getElementById('cashierName').textContent = loggedInUser.fullName;
    }
}

// Load Products from LocalStorage
function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        console.log('Loaded products:', products.length);
    } else {
        // Sample Products for Demo
        products = [
            {
                id: 1,
                barcode: '1001',
                name: 'White Bread',
                category: 'Bakery',
                unitPrice: 120.00,
                stockQuantity: 50,
                batch: 'B001',
                expiryDate: '2025-12-31'
            },
            {
                id: 2,
                barcode: '1002',
                name: 'Fresh Milk 1L',
                category: 'Dairy',
                unitPrice: 350.00,
                stockQuantity: 30,
                batch: 'B002',
                expiryDate: '2025-12-25'
            },
            {
                id: 3,
                barcode: '1003',
                name: 'Farm Eggs (12pcs)',
                category: 'Dairy',
                unitPrice: 450.00,
                stockQuantity: 40,
                batch: 'B003',
                expiryDate: '2025-12-28'
            },
            {
                id: 4,
                barcode: '1004',
                name: 'Basmati Rice 5kg',
                category: 'Grains',
                unitPrice: 1800.00,
                stockQuantity: 25,
                batch: 'B004',
                expiryDate: '2026-06-30'
            },
            {
                id: 5,
                barcode: '1005',
                name: 'Mineral Water 1.5L',
                category: 'Beverages',
                unitPrice: 80.00,
                stockQuantity: 100,
                batch: 'B005',
                expiryDate: '2026-12-31'
            },
            {
                id: 6,
                barcode: '1006',
                name: 'White Sugar 1kg',
                category: 'Groceries',
                unitPrice: 200.00,
                stockQuantity: 60,
                batch: 'B006',
                expiryDate: '2026-03-31'
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Add Product by Barcode
function addProductByBarcode(barcode) {
    const product = products.find(p => p.barcode === barcode);

    if (product) {
        if (product.stockQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Out of Stock',
                text: `${product.name} is currently out of stock!`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        addToCart(product);

        // Success sound/feedback
        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: `${product.name} added to cart`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: `No product found with barcode: ${barcode}`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }

    // Refocus on barcode input
    setTimeout(() => {
        document.getElementById('barcodeInput').focus();
    }, 100);
}

// Search Products
function searchProducts(query) {
    const resultsDiv = document.getElementById('productSearchResults');

    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        resultsDiv.innerHTML = '<div class="text-muted p-2">No products found</div>';
        return;
    }

    let html = '';
    filtered.forEach(product => {
        html += `
            <div class="product-search-result" onclick='addToCart(${JSON.stringify(product)})'>
                <strong>${product.name}</strong>
                <br>
                <small class="text-muted">${product.category} - Rs. ${product.unitPrice.toFixed(2)}</small>
                <span class="badge bg-info float-end">Stock: ${product.stockQuantity}</span>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

// Quick Add Product
function quickAddProduct(productName) {
    const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

    if (product) {
        if (product.stockQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Out of Stock',
                text: `${product.name} is currently out of stock!`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        addToCart(product);

        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: `${product.name} added to cart`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    }
}

// Add to Cart
function addToCart(product) {
    // Check if product already in cart
    const existingItem = cartItems.find(item => item.id === product.id);

    if (existingItem) {
        // Check stock
        if (existingItem.quantity >= product.stockQuantity) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Limit',
                text: `Cannot add more. Only ${product.stockQuantity} available in stock.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
        existingItem.quantity++;
        existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    } else {
        cartItems.push({
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            batch: product.batch || 'N/A',
            unitPrice: product.unitPrice,
            quantity: 1,
            subtotal: product.unitPrice,
            stockQuantity: product.stockQuantity
        });
    }

    updateCartDisplay();
    updateCartSummary();
}

// Update Cart Display
function updateCartDisplay() {
    const tbody = document.getElementById('cartTableBody');

    if (cartItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3 d-block"></i>
                    <h5>Cart is empty</h5>
                    <p>Start scanning products or use quick add buttons</p>
                </td>
            </tr>
        `;
        document.getElementById('cartItemCount').textContent = '0 items';
        return;
    }

    let html = '';
    cartItems.forEach((item, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td><span class="badge bg-secondary">${item.batch}</span></td>
                <td>Rs. ${item.unitPrice.toFixed(2)}</td>
                <td>
                    <div class="qty-control">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${index}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control form-control-sm" value="${item.quantity}" 
                            min="1" max="${item.stockQuantity}" 
                            onchange="setQuantity(${index}, this.value)">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${index}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td><strong>Rs. ${item.subtotal.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById('cartItemCount').textContent = `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`;
}

// Update Quantity
function updateQuantity(index, change) {
    const item = cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }

    if (newQuantity > item.stockQuantity) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock Limit',
            text: `Only ${item.stockQuantity} available in stock.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    item.quantity = newQuantity;
    item.subtotal = item.quantity * item.unitPrice;

    updateCartDisplay();
    updateCartSummary();
}

// Set Quantity
function setQuantity(index, value) {
    const item = cartItems[index];
    const newQuantity = parseInt(value);

    if (isNaN(newQuantity) || newQuantity <= 0) {
        removeFromCart(index);
        return;
    }

    if (newQuantity > item.stockQuantity) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock Limit',
            text: `Only ${item.stockQuantity} available in stock.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        updateCartDisplay();
        return;
    }

    item.quantity = newQuantity;
    item.subtotal = item.quantity * item.unitPrice;

    updateCartDisplay();
    updateCartSummary();
}

// Remove from Cart
function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartDisplay();
    updateCartSummary();
}

// Update Cart Summary
function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate Discount
    const discountType = document.querySelector('input[name="discountType"]:checked').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;

    let discountAmount = 0;
    if (discountType === 'percent') {
        discountAmount = (subtotal * discountValue) / 100;
    } else {
        discountAmount = discountValue;
    }

    const grandTotal = subtotal - discountAmount;

    document.getElementById('cartSubtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = discountAmount.toFixed(2);
    document.getElementById('cartGrandTotal').textContent = `Rs. ${grandTotal.toFixed(2)}`;

    // Update change if cash payment
    if (document.getElementById('paymentCash').checked) {
        calculateChange();
    }
}

// Calculate Change
function calculateChange() {
    const grandTotalText = document.getElementById('cartGrandTotal').textContent;
    const grandTotal = parseFloat(grandTotalText.replace('Rs. ', '').replace(',', ''));
    const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;

    if (tendered >= grandTotal && grandTotal > 0) {
        const change = tendered - grandTotal;
        document.getElementById('changeValue').textContent = change.toFixed(2);
        document.getElementById('changeAmount').style.display = 'block';
    } else {
        document.getElementById('changeAmount').style.display = 'none';
    }
}

// Handle Payment Method Change
function handlePaymentMethodChange(method) {
    // Update card styling
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`.payment-method-card[data-method="${method}"]`).classList.add('active');

    // Show/hide relevant sections
    document.getElementById('cashPaymentSection').style.display = method === 'cash' ? 'block' : 'none';
    document.getElementById('cardPaymentSection').style.display = method === 'card' ? 'block' : 'none';
}

// Clear Cart
function clearCart() {
    if (cartItems.length === 0) {
        return;
    }

    Swal.fire({
        title: 'Clear Cart?',
        text: 'Are you sure you want to clear all items from the cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            cartItems = [];
            updateCartDisplay();
            updateCartSummary();
            document.getElementById('barcodeInput').focus();

            Swal.fire({
                icon: 'success',
                title: 'Cart Cleared',
                text: 'All items removed from cart',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        }
    });
}

// Hold Sale
function holdSale() {
    if (cartItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Cart',
            text: 'Cannot hold an empty cart!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    Swal.fire({
        title: 'Hold Sale',
        input: 'text',
        inputLabel: 'Sale Reference (optional)',
        inputPlaceholder: 'Enter reference name or note',
        showCancelButton: true,
        confirmButtonText: 'Hold',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            const reference = result.value || 'Unnamed';

            // Save to held sales
            const heldSales = JSON.parse(localStorage.getItem('heldSales') || '[]');
            heldSales.push({
                id: Date.now(),
                reference: reference,
                items: [...cartItems],
                customer: selectedCustomer,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('heldSales', JSON.stringify(heldSales));

            // Clear current cart
            cartItems = [];
            updateCartDisplay();
            updateCartSummary();

            Swal.fire({
                icon: 'success',
                title: 'Sale Held',
                text: `Sale saved as "${reference}"`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        }
    });
}

// Load Held Sales
function loadHeldSales() {
    // This would typically show a list of held sales to retrieve
    console.log('Held sales feature ready');
}

// Search Customer
function searchCustomer() {
    const searchValue = document.getElementById('customerSearchInput').value.trim();

    if (!searchValue) {
        Swal.fire({
            icon: 'warning',
            title: 'Search Required',
            text: 'Please enter phone number or name to search',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    // Load customers from localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const found = customers.find(c =>
        c.phone.includes(searchValue) ||
        c.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (found) {
        selectCustomer(found);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: 'No customer found with that phone or name',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Select Customer
function selectCustomer(customer) {
    selectedCustomer = customer;

    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerPhone').textContent = customer.phone;
    document.getElementById('loyaltyPoints').textContent = customer.loyaltyPoints || 0;

    if (customer.membershipType === 'Loyalty') {
        document.getElementById('loyaltyBadge').style.display = 'inline-block';
    } else {
        document.getElementById('loyaltyBadge').style.display = 'none';
    }

    document.getElementById('selectedCustomerInfo').style.display = 'block';
}

// Clear Customer
function clearCustomer() {
    selectedCustomer = null;
    document.getElementById('selectedCustomerInfo').style.display = 'none';
    document.getElementById('customerSearchInput').value = '';
}

// Save Quick Customer
function saveQuickCustomer() {
    const name = document.getElementById('newCustomerName').value.trim();
    const phone = document.getElementById('newCustomerPhone').value.trim();
    const email = document.getElementById('newCustomerEmail').value.trim();

    if (!name || !phone) {
        Swal.fire({
            icon: 'error',
            title: 'Required Fields',
            text: 'Name and Phone are required!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    // Create customer object
    const newCustomer = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email,
        membershipType: 'Regular',
        loyaltyPoints: 0,
        createdDate: new Date().toISOString()
    };

    // Save to localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));

    // Select the customer
    selectCustomer(newCustomer);

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    modal.hide();

    // Clear form
    document.getElementById('quickAddCustomerForm').reset();

    Swal.fire({
        icon: 'success',
        title: 'Customer Added',
        text: `${name} added successfully!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
    });
}

// Process Payment
function processPayment() {
    if (cartItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Cart',
            text: 'Please add items to cart before processing payment!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const grandTotalText = document.getElementById('cartGrandTotal').textContent;
    const grandTotal = parseFloat(grandTotalText.replace('Rs. ', '').replace(',', ''));

    // Validation based on payment method
    if (paymentMethod === 'cash') {
        const tendered = parseFloat(document.getElementById('amountTendered').value) || 0;
        if (tendered < grandTotal) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Amount',
                text: 'Amount tendered is less than grand total!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
    } else if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const transactionRef = document.getElementById('transactionRef').value.trim();
        if (!cardNumber || !transactionRef) {
            Swal.fire({
                icon: 'error',
                title: 'Card Details Required',
                text: 'Please enter card number and transaction reference!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
    } else if (paymentMethod === 'credit') {
        if (!selectedCustomer) {
            Swal.fire({
                icon: 'error',
                title: 'Customer Required',
                text: 'Please select a customer for credit payment!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
    }

    // Confirm Payment
    Swal.fire({
        title: 'Process Payment?',
        html: `
            <div class="text-start">
                <p><strong>Grand Total:</strong> Rs. ${grandTotal.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
                <p><strong>Items:</strong> ${cartItems.length}</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Process Payment!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            completePayment(paymentMethod, grandTotal);
        }
    });
}

// Complete Payment
function completePayment(paymentMethod, grandTotal) {
    // Create Order Object
    const orderCode = 'POS-' + Date.now();
    const order = {
        orderCode: orderCode,
        orderDate: new Date().toISOString(),
        orderType: 'IN_STORE',
        customer: selectedCustomer || { name: 'Walk-in Customer', phone: 'N/A' },
        items: [...cartItems],
        subtotal: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
        discount: parseFloat(document.getElementById('discountAmount').textContent),
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'credit' ? 'Pending' : 'Paid',
        orderStatus: 'Completed',
        cashier: document.getElementById('cashierName').textContent,
        createdAt: new Date().toISOString()
    };

    // Save to orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update product stock
    cartItems.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
            products[productIndex].stockQuantity -= item.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Success Message
    Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        html: `
            <div class="text-start">
                <p><strong>Order Code:</strong> ${orderCode}</p>
                <p><strong>Amount:</strong> Rs. ${grandTotal.toFixed(2)}</p>
                <p><strong>Payment:</strong> ${paymentMethod.toUpperCase()}</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-print"></i> Print Receipt',
        cancelButtonText: 'New Sale',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#28a745'
    }).then((result) => {
        if (result.isConfirmed) {
            printReceipt(order);
        }

        // Reset for new sale
        resetPOS();
    });
}

// Print Receipt
function printReceipt(order) {
    let receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderCode}</title>
            <style>
                body { font-family: 'Courier New', monospace; width: 300px; margin: 20px auto; }
                h2 { text-align: center; margin: 10px 0; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>SAMPATH GROCERY STORE</h2>
                <p>123 Main Street, Colombo<br>Tel: 011-1234567</p>
                <p>Date: ${new Date(order.orderDate).toLocaleString()}</p>
                <p>Order: ${order.orderCode}</p>
                <p>Cashier: ${order.cashier}</p>
            </div>
            
            <div class="items">
    `;

    order.items.forEach(item => {
        receiptHTML += `
            <div class="item">
                <span>${item.name} (x${item.quantity})</span>
                <span>Rs. ${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });

    receiptHTML += `
            </div>
            
            <div class="total">
                <div class="item">
                    <span>Subtotal:</span>
                    <span>Rs. ${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                    <span>Discount:</span>
                    <span>-Rs. ${order.discount.toFixed(2)}</span>
                </div>
                <div class="item" style="font-size: 18px;">
                    <span>GRAND TOTAL:</span>
                    <span>Rs. ${order.grandTotal.toFixed(2)}</span>
                </div>
                <div class="item">
                    <span>Payment:</span>
                    <span>${order.paymentMethod.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank You for Your Purchase!</p>
                <p>Visit Again Soon</p>
            </div>
        </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
}

// Reset POS for New Sale
function resetPOS() {
    cartItems = [];
    selectedCustomer = null;

    // Reset UI
    updateCartDisplay();
    updateCartSummary();
    document.getElementById('barcodeInput').value = '';
    document.getElementById('productSearch').value = '';
    document.getElementById('productSearchResults').innerHTML = '';
    document.getElementById('discountValue').value = '0';
    document.getElementById('amountTendered').value = '';
    document.getElementById('changeAmount').style.display = 'none';
    document.getElementById('cardNumber').value = '';
    document.getElementById('transactionRef').value = '';
    document.getElementById('walkInCustomer').checked = true;
    document.getElementById('customerSearchSection').style.display = 'none';
    document.getElementById('selectedCustomerInfo').style.display = 'none';
    document.getElementById('paymentCash').checked = true;
    handlePaymentMethodChange('cash');

    // Focus on barcode
    document.getElementById('barcodeInput').focus();
}
