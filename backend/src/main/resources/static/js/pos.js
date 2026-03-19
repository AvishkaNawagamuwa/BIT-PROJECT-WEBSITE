// POS System JavaScript
// Author: Sampath Grocery Store
// Module: Point of Sale System

// Global Variables
let cartItems = [];
let selectedCustomer = null;
let products = [];
let currentDateTime = null;
let loyaltyPointsAvailable = 0;

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

    // Customer Type Radio Buttons
    document.querySelectorAll('input[name="customerType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            handleCustomerTypeChange(this.value);
        });
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

            // Check if loyalty is disabled
            if (method === 'loyalty' && document.getElementById('paymentLoyalty').disabled) {
                return;
            }

            const radio = document.getElementById('payment' + method.charAt(0).toUpperCase() + method.slice(1));
            if (radio && !radio.disabled) {
                radio.checked = true;
                handlePaymentMethodChange(method);
            }
        });
    });

    // Amount Tendered for Change Calculation
    document.getElementById('amountTendered').addEventListener('input', calculateChange);

    // Loyalty Points Usage
    document.getElementById('loyaltyPointsUsed').addEventListener('input', calculateLoyaltyPayable);

    // Discount Calculation
    document.getElementById('discountValue').addEventListener('input', updateCartSummary);
    document.querySelectorAll('input[name="discountType"]').forEach(radio => {
        radio.addEventListener('change', updateCartSummary);
    });
}

// Load Cashier Info
function loadCashierInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.fullName) {
        document.getElementById('cashierName').textContent = loggedInUser.fullName;
    }
}

// Load Products from Backend API
function loadProducts() {
    // Try to fetch from backend API first
    fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('API Error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                products = data;
                console.log('Loaded products from API:', products.length);
            } else if (data.content && Array.isArray(data.content)) {
                products = data.content;
                console.log('Loaded products from API (pagination):', products.length);
            } else {
                throw new Error('Invalid API response');
            }
            localStorage.setItem('products', JSON.stringify(products));
        })
        .catch(error => {
            console.log('API failed, checking localStorage...');
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                products = JSON.parse(storedProducts);
                console.log('Loaded products from localStorage:', products.length);
            } else {
                // Fallback to sample products
                loadSampleProducts();
            }
        });
}

// Load Sample Products (Fallback)
function loadSampleProducts() {
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
    console.log('Loaded sample products (fallback):', products.length);
}

// Add Product by Barcode
// NEW: Uses batch barcode API to get product and pricing information
function addProductByBarcode(barcode) {
    console.log('🔍 Scanning barcode from product_batch:', barcode);

    // Try to fetch from batch barcode endpoint first (new method)
    fetch(`/api/batches/barcode/${barcode}/pricing`)
        .then(response => {
            console.log('API Response Status:', response.status);
            if (!response.ok) {
                throw new Error('Barcode not found in batches');
            }
            return response.json();
        })
        .then(data => {
            console.log('Batch API Response:', data);

            if (data.success && data.data) {
                // Map batch pricing response to our cart format
                const batchData = data.data;
                const product = {
                    id: batchData.productId,
                    batchId: batchData.batchId,
                    barcode: batchData.barcode,
                    name: batchData.productName,
                    category: batchData.category || 'Mixed',
                    unitPrice: batchData.sellingPrice ? parseFloat(batchData.sellingPrice) : 0,
                    purchasePrice: batchData.purchasePrice ? parseFloat(batchData.purchasePrice) : 0,
                    mrp: batchData.mrp ? parseFloat(batchData.mrp) : 0,
                    stockQuantity: batchData.stockQuantity || 0,
                    batchCode: batchData.batchCode,
                    expiryDate: batchData.expiryDate || 'N/A',
                    supplierName: batchData.supplierName || 'N/A',
                    productCode: batchData.productCode || ''
                };

                console.log('✅ Product found from barcode batch:', product);
                handleProductFound(product);
            } else {
                console.log('❌ Invalid response format from batch API');
                showProductNotFound(barcode);
            }
        })
        .catch(error => {
            console.error('❌ Batch API Error:', error);

            // Fallback: Try old product barcode endpoint for backward compatibility
            console.log('⚠️ Falling back to product barcode endpoint...');
            fetch(`/api/products/barcode/${barcode}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Product not found');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Product API Response:', data);

                    if (data.success && data.data) {
                        const apiProduct = data.data;
                        const product = {
                            id: apiProduct.productId,
                            barcode: apiProduct.barcode,
                            name: apiProduct.productName,
                            category: apiProduct.categoryName || 'Uncategorized',
                            unitPrice: apiProduct.sellingPrice ? parseFloat(apiProduct.sellingPrice) : 0,
                            stockQuantity: apiProduct.totalStock || 0,
                            batch: apiProduct.brandName || 'N/A',
                            expiryDate: apiProduct.expiryDate || 'N/A',
                            unitName: apiProduct.unitName || 'Unit'
                        };

                        console.log('✅ Product found from product endpoint:', product);
                        handleProductFound(product);
                    } else {
                        showProductNotFound(barcode);
                    }
                })
                .catch(fallbackError => {
                    console.error('❌ Fallback Product API Error:', fallbackError);
                    showProductNotFound(barcode);
                });
        });
}

// Handle Product Found
function handleProductFound(product) {
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
    } else {
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

    // Clear input and refocus
    document.getElementById('barcodeInput').value = '';
    setTimeout(() => {
        document.getElementById('barcodeInput').focus();
    }, 100);
}

// Show Product Not Found
function showProductNotFound(barcode) {
    Swal.fire({
        icon: 'error',
        title: 'Not Found',
        text: `No product found with barcode: ${barcode}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    document.getElementById('barcodeInput').value = '';
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
    // Check if product already in cart (by batch to handle multiple batches)
    const existingItem = cartItems.find(item => item.batchId === product.batchId);

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
            batchId: product.batchId,                    // ✅ IMPORTANT for API
            barcode: product.barcode,                    // ✅ IMPORTANT for stock deduction
            name: product.name,
            productCode: product.productCode || '',
            batchCode: product.batchCode || 'N/A',
            unitPrice: product.unitPrice,
            purchasePrice: product.purchasePrice || 0,
            mrp: product.mrp || 0,
            quantity: 1,
            subtotal: product.unitPrice,
            stockQuantity: product.stockQuantity,
            expiryDate: product.expiryDate || 'N/A'
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
                <td>
                    <strong>${item.name}</strong>
                    <br><small class="text-muted">Batch: ${item.batchCode}</small>
                </td>
                <td>
                    <span class="badge bg-info">${item.barcode}</span>
                    <br><small>${item.expiryDate !== 'N/A' ? 'Exp: ' + item.expiryDate : ''}</small>
                </td>
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
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})" title="Remove item">
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

// Search Customer by Phone Number
async function searchCustomer() {
    const searchValue = document.getElementById('customerSearchInput').value.trim();

    if (!searchValue) {
        Swal.fire({
            icon: 'warning',
            title: 'Search Required',
            text: 'Please enter phone number or card number to search',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    try {
        // Call backend API to search customers
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchValue)}`);
        const data = await response.json();

        if (response.ok && data.data && data.data.length > 0) {
            const customer = data.data[0];

            // Transform API response to match selectCustomer format
            const formattedCustomer = {
                id: customer.id,
                name: customer.fullName,
                phone: customer.phone,
                loyaltyCardNumber: customer.loyaltyCardNumber,
                loyaltyPoints: customer.loyaltyPoints || 0
            };

            selectCustomer(formattedCustomer);

            // Display loyalty points
            document.getElementById('availableLoyaltyPoints').textContent = formattedCustomer.loyaltyPoints;
            document.getElementById('maxLoyaltyPoints').textContent = formattedCustomer.loyaltyPoints;
            document.getElementById('paymentLoyalty').disabled = formattedCustomer.loyaltyPoints === 0;
            loyaltyPointsAvailable = formattedCustomer.loyaltyPoints;

            Swal.fire({
                icon: 'success',
                title: 'Customer Found',
                text: `Welcome ${formattedCustomer.name}!\nLoyalty Points: ${formattedCustomer.loyaltyPoints}`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Not Found',
                text: 'No customer found with that phone/card number',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    } catch (error) {
        console.error('❌ Customer Search Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Search Failed',
            text: 'Error searching customer: ' + error.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
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

// Handle Customer Type Change
function handleCustomerTypeChange(type) {
    const registeredSection = document.getElementById('registeredCustomerSection');

    if (type === 'registered') {
        registeredSection.style.display = 'block';
    } else {
        registeredSection.style.display = 'none';
        selectedCustomer = null;
        loyaltyPointsAvailable = 0;
        document.getElementById('selectedCustomerInfo').style.display = 'none';
        document.getElementById('customerSearchInput').value = '';

        // Disable loyalty payment method
        document.getElementById('paymentLoyalty').disabled = true;
        document.querySelector('.payment-method-card[data-method="loyalty"]').style.opacity = '0.5';
        document.querySelector('.payment-method-card[data-method="loyalty"]').style.pointerEvents = 'none';

        // Update loyalty points section
        document.getElementById('loyaltyPointsSection').style.display = 'none';
        document.getElementById('loyaltyPointsUsed').value = '0';
    }
}

// Handle Payment Method Change
function handlePaymentMethodChange(method) {
    // Update card styling
    document.querySelectorAll('.payment-method-card').forEach(card => {
        const input = card.querySelector('input');
        if (!input.disabled) {
            card.classList.remove('active');
        }
    });

    const activeCard = document.querySelector(`.payment-method-card[data-method="${method}"]`);
    const activeInput = activeCard.querySelector('input');
    if (!activeInput.disabled) {
        activeCard.classList.add('active');
    }

    // Show/hide relevant sections
    document.getElementById('cashPaymentSection').style.display = method === 'cash' ? 'block' : 'none';
    document.getElementById('cardPaymentSection').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('creditPaymentSection').style.display = method === 'credit' ? 'block' : 'none';

    // Loyalty: no additional fields needed
    if (method === 'loyalty') {
        document.getElementById('loyaltyPointsSection').style.display = 'block';
    } else {
        document.getElementById('loyaltyPointsSection').style.display = 'none';
    }
}

// Calculate Loyalty Payable Amount
function calculateLoyaltyPayable() {
    const grandTotalText = document.getElementById('cartGrandTotal').textContent;
    const grandTotal = parseFloat(grandTotalText.replace('Rs. ', '').replace(',', ''));
    const pointsUsed = parseInt(document.getElementById('loyaltyPointsUsed').value) || 0;
    const maxPoints = parseInt(document.getElementById('maxLoyaltyPoints').textContent) || 0;

    // Validate points
    if (pointsUsed > maxPoints) {
        document.getElementById('loyaltyPointsUsed').value = maxPoints;
        return;
    }

    // Calculate payable
    const payable = Math.max(0, grandTotal - pointsUsed);
    document.getElementById('payableAmount').textContent = payable.toFixed(2);

    // If points cover total, auto-select loyalty
    if (payable === 0 && pointsUsed > 0) {
        document.getElementById('paymentLoyalty').checked = true;
        handlePaymentMethodChange('loyalty');
    }
}

// Search Customer
function searchCustomer() {
    const searchInput = document.getElementById('customerSearchInput');
    const searchValue = searchInput.value.trim();

    if (!searchValue) {
        Swal.fire({
            icon: 'warning',
            title: 'Search Required',
            text: 'Please enter phone number or card number to search',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    // Search customer from backend API
    fetch(`/api/customers/search?q=${encodeURIComponent(searchValue)}`)
        .then(response => {
            if (!response.ok) throw new Error('Search failed');
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data); // DEBUG
            if (data.success && data.data && data.data.length > 0) {
                const customer = data.data[0]; // Get first result
                console.log('Customer Object:', customer); // DEBUG

                // Handle different field name possibilities
                let customerName = customer.firstName && customer.lastName ?
                    (customer.firstName + ' ' + customer.lastName) :
                    (customer.fullName || customer.full_name || 'Customer');

                selectCustomer({
                    id: customer.id,
                    code: customer.customerCode,
                    name: customerName,
                    phone: customer.phone,
                    loyaltyPoints: customer.loyaltyPoints || 0,
                    email: customer.email
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Customer Found',
                    text: `Welcome ${customerName}! Loyalty Points: ${customer.loyaltyPoints || 0}`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Not Found',
                    text: 'No customer found with that phone/card number',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        })
        .catch(error => {
            console.error('Customer search error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: 'Failed to search customer. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        });
}

// Select Customer
function selectCustomer(customer) {
    selectedCustomer = customer;
    loyaltyPointsAvailable = customer.loyaltyPoints || 0;

    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerPhone').textContent = customer.phone;
    document.getElementById('availableLoyaltyPoints').textContent = loyaltyPointsAvailable;
    document.getElementById('maxLoyaltyPoints').textContent = loyaltyPointsAvailable;
    document.getElementById('loyaltyPointsUsed').value = '0';

    // Enable loyalty payment method only if customer has loyalty points
    const hasLoyalty = loyaltyPointsAvailable > 0;
    document.getElementById('paymentLoyalty').disabled = !hasLoyalty;
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.opacity = hasLoyalty ? '1' : '0.5';
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.pointerEvents = hasLoyalty ? 'auto' : 'none';

    document.getElementById('selectedCustomerInfo').style.display = 'block';
    document.getElementById('loyaltyPointsSection').style.display = 'block';
}

// Clear Customer
function clearCustomer() {
    selectedCustomer = null;
    loyaltyPointsAvailable = 0;
    document.getElementById('selectedCustomerInfo').style.display = 'none';
    document.getElementById('customerSearchInput').value = '';
    document.getElementById('loyaltyPointsSection').style.display = 'none';
    document.getElementById('loyaltyPointsUsed').value = '0';

    // Disable loyalty payment method
    document.getElementById('paymentLoyalty').disabled = true;
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.opacity = '0.5';
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.pointerEvents = 'none';

    // Switch to cash payment
    document.getElementById('paymentCash').checked = true;
    handlePaymentMethodChange('cash');
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
        loyaltyCardNumber: 'LC-' + Date.now().toString().slice(-6),
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
    let payableAmount = grandTotal;
    let pointsUsed = 0;

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
                text: 'Please select a registered customer for credit payment!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        const dueDate = document.getElementById('creditDueDate').value;
        if (!dueDate) {
            Swal.fire({
                icon: 'error',
                title: 'Due Date Required',
                text: 'Please set a due date for credit payment!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
    } else if (paymentMethod === 'loyalty') {
        if (!selectedCustomer || loyaltyPointsAvailable === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Loyalty Not Available',
                text: 'Selected customer does not have loyalty points!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        pointsUsed = parseInt(document.getElementById('loyaltyPointsUsed').value) || 0;
        if (pointsUsed <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Points Required',
                text: 'Please enter loyalty points to use!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        if (pointsUsed > loyaltyPointsAvailable) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Points',
                text: `Available points: ${loyaltyPointsAvailable}`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        payableAmount = Math.max(0, grandTotal - pointsUsed);
    }

    // Confirm Payment
    const summaryHtml = `
        <div class="text-start">
            <p><strong>Method:</strong> ${paymentMethod.toUpperCase()}</p>
            <p><strong>Subtotal:</strong> Rs. ${cartItems.reduce((s, i) => s + i.subtotal, 0).toFixed(2)}</p>
            <p><strong>Grand Total:</strong> Rs. ${grandTotal.toFixed(2)}</p>
            ${paymentMethod === 'loyalty' ? `<p><strong>Points Used:</strong> ${pointsUsed}</p><p><strong>Payable:</strong> Rs. ${payableAmount.toFixed(2)}</p>` : ''}
            <p><strong>Items:</strong> ${cartItems.length}</p>
        </div>
    `;

    Swal.fire({
        title: 'Process Payment?',
        html: summaryHtml,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Process Payment!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            completePayment(paymentMethod, grandTotal, payableAmount, pointsUsed);
        }
    });
}

// Complete Payment - NEW VERSION with Database Integration
function completePayment(paymentMethod, grandTotal, payableAmount, pointsUsed) {
    console.log('💳 Processing Payment via Backend API...');

    // Show loading
    Swal.fire({
        title: 'Processing Payment...',
        html: 'Saving order and payment to database...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Step 1: Create Order via API
    const orderRequest = {
        customerId: selectedCustomer ? selectedCustomer.id : null,
        orderType: 'WALK_IN',
        items: cartItems.map(item => ({
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.unitPrice // From batch pricing
        })),
        taxAmount: 0,
        deliveryCharge: 0,
        loyaltyPointsUsed: pointsUsed > 0 ? pointsUsed : null,
        notes: `Payment method: ${paymentMethod.toUpperCase()}`
    };

    console.log('📝 Creating order request:', orderRequest);

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Order created:', data);

            if (!data.success || !data.data || !data.data.orderId) {
                throw new Error('Invalid order response');
            }

            const orderId = data.data.orderId;
            const orderCode = data.data.orderCode;
            const orderObj = data.data;

            // Step 2: Create Payment via API
            return createPaymentInDatabase(orderId, paymentMethod, payableAmount || grandTotal, pointsUsed, orderObj);
        })
        .then(paymentResult => {
            console.log('✅ Payment created:', paymentResult);

            // Step 3: Deduct Stock for each item using batch barcode
            return deductStockForAllItems(cartItems, paymentResult.orderId, paymentResult.orderCode);
        })
        .then(deductionResult => {
            console.log('✅ Stock deducted:', deductionResult);

            // Step 4: Show Success and Print Receipt
            Swal.close();
            showPaymentSuccessMessage(deductionResult.orderCode, deductionResult.orderData, paymentMethod, pointsUsed, payableAmount, grandTotal);
        })
        .catch(error => {
            console.error('❌ Payment Processing Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed!',
                text: error.message || 'An error occurred while processing payment. Please try again.',
                confirmButtonColor: '#dc3545'
            }).then(() => {
                // Reset for retry
                document.getElementById('barcodeInput').focus();
            });
        });
}

// Helper: Create Payment in Database
function createPaymentInDatabase(orderId, paymentMethod, amount, pointsUsed, orderData) {
    return new Promise((resolve, reject) => {
        // Map payment method to methodId
        const methodIdMap = {
            'cash': 1,
            'card': 2,
            'credit': 3,
            'loyalty': 4
        };

        const methodId = methodIdMap[paymentMethod] || 1;
        let transactionRef = null;
        let referenceNumber = null;

        // Add method-specific details
        if (paymentMethod === 'card') {
            transactionRef = document.getElementById('transactionRef').value;
            referenceNumber = document.getElementById('cardNumber').value;
        } else if (paymentMethod === 'credit') {
            referenceNumber = document.getElementById('creditDueDate').value;
        }

        const paymentRequest = {
            orderId: orderId,
            methodId: methodId,
            amount: amount,
            transactionId: transactionRef,
            referenceNumber: referenceNumber,
            notes: `Payment method: ${paymentMethod.toUpperCase()}, Items: ${cartItems.length}`
        };

        console.log('💰 Creating payment request:', paymentRequest);

        fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentRequest)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Payment API Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.success || !data.data || !data.data.paymentId) {
                    throw new Error('Invalid payment response');
                }

                // Mark payment as completed
                return markPaymentCompleted(data.data.paymentId, orderId, orderData);
            })
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Helper: Mark Payment as Completed
function markPaymentCompleted(paymentId, orderId, orderData) {
    return new Promise((resolve, reject) => {
        console.log('✔️ Marking payment as COMPLETED...');

        fetch(`/api/payments/${paymentId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Complete Payment API Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error('Failed to mark payment as completed');
                }

                resolve({
                    paymentId: paymentId,
                    orderId: orderId,
                    orderCode: orderData.orderCode,
                    orderData: orderData,
                    status: 'COMPLETED'
                });
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Helper: Deduct Stock for All Items
function deductStockForAllItems(items, orderId, orderCode) {
    return new Promise((resolve, reject) => {
        console.log('📦 Deducting stock for', items.length, 'items...');

        // Create array of deduction promises
        const deductionPromises = items.map(item => {
            return new Promise((resolveItem, rejectItem) => {
                if (!item.barcode) {
                    console.warn('⚠️ Item missing barcode:', item);
                    rejectItem(new Error(`Item ${item.name} missing barcode`));
                    return;
                }

                const deductionRequest = {
                    quantity: item.quantity,
                    referenceNumber: orderCode,
                    reason: 'SALE'
                };

                console.log(`📉 Deducting ${item.quantity} units of barcode ${item.barcode}`);

                fetch(`/api/batches/barcode/${item.barcode}/deduct-stock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deductionRequest)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Stock Deduction Error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('✅ Stock deducted for barcode:', item.barcode, data);
                        resolveItem(data);
                    })
                    .catch(error => {
                        console.error('❌ Failed to deduct stock:', error);
                        rejectItem(error);
                    });
            });
        });

        // Execute all deductions in parallel
        Promise.all(deductionPromises)
            .then(results => {
                console.log('✅ All stock deductions completed:', results);
                resolve({
                    orderId: orderId,
                    orderCode: orderCode,
                    orderData: items[0].__orderData || { items: items },
                    deductions: results
                });
            })
            .catch(error => {
                console.error('❌ Stock deduction failed:', error);
                reject(error);
            });
    });
}

// Helper: Show Payment Success Message
function showPaymentSuccessMessage(orderCode, orderData, paymentMethod, pointsUsed, payableAmount, grandTotal) {
    Swal.fire({
        icon: 'success',
        title: 'Payment Successful! ✅',
        html: `
            <div class="text-start">
                <p><strong>Order:</strong> ${orderCode}</p>
                <p><strong>Amount Paid:</strong> Rs. ${(payableAmount || grandTotal).toFixed(2)}</p>
                <p><strong>Method:</strong> ${paymentMethod.toUpperCase()}</p>
                ${pointsUsed > 0 ? `<p><strong>Loyalty Points Used:</strong> ${pointsUsed}</p>` : ''}
                <p style="color: green;"><strong>✔️ Saved to Database</strong></p>
                <p style="color: green;"><strong>✔️ Stock Updated</strong></p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-print"></i> Print Receipt',
        cancelButtonText: 'New Sale',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#28a745'
    }).then((result) => {
        if (result.isConfirmed) {
            printReceipt(orderData);
        }

        // Reset for new sale
        resetPOS();
    });
}

// Print Receipt - Updated for API Response
function printReceipt(orderData) {
    console.log('🖨️ Printing receipt for order:', orderData);

    // Handle both old and new format
    const orderCode = orderData.orderCode || orderData?.orderCode;
    const orderDate = orderData.createdAt || orderData?.createdAt || new Date().toISOString();
    const items = orderData.items || [];
    const subtotal = orderData.subtotal || items.reduce((sum, item) => sum + (item.subtotal || item.lineTotal || 0), 0);
    const discountAmount = orderData.discountAmount || parseFloat(document.getElementById('discountAmount')?.textContent || 0);
    const grandTotal = orderData.grandTotal || subtotal - discountAmount;

    let receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${orderCode}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    width: 350px; 
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .receipt {
                    background-color: white;
                    padding: 20px;
                    border: 1px solid #ddd;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h2 { 
                    text-align: center; 
                    margin: 5px 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                h3 {
                    text-align: center;
                    font-size: 12px;
                    margin: 2px 0;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #000; 
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .header p {
                    margin: 2px 0;
                    font-size: 11px;
                }
                .items-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    font-weight: bold;
                    border-bottom: 1px solid #999;
                    padding: 5px 0;
                    font-size: 11px;
                }
                .item { 
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    margin: 3px 0;
                    font-size: 11px;
                }
                .total { 
                    border-top: 2px solid #000; 
                    padding-top: 10px; 
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                    font-size: 11px;
                }
                .grand-total {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 1px solid #000;
                    padding-top: 5px;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 15px; 
                    border-top: 2px solid #000; 
                    padding-top: 10px;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>SAMPATH GROCERY STORE</h2>
                    <h3>🏪 Point of Sale Receipt</h3>
                    <p>123 Main Street, Colombo</p>
                    <p>Tel: 011-1234567</p>
                    <p>═════════════════════════════</p>
                    <p>Date: ${new Date(orderDate).toLocaleString()}</p>
                    <p>Order: <strong>${orderCode}</strong></p>
                    <p>Cashier: ${document.getElementById('cashierName')?.textContent || 'Admin'}</p>
                </div>
                
                <div class="items-header">
                    <span>ITEM</span>
                    <span>QTY</span>
                    <span>AMOUNT</span>
                </div>
    `;

    // Add items
    if (items && items.length > 0) {
        items.forEach(item => {
            const itemName = item.name || item.productName || 'Unknown';
            const itemQty = item.quantity || 1;
            const itemPrice = item.subtotal || item.lineTotal || (item.unitPrice * item.quantity) || 0;

            receiptHTML += `
                <div class="item">
                    <span>${itemName}</span>
                    <span>${itemQty}</span>
                    <span>Rs. ${itemPrice.toFixed(2)}</span>
                </div>
            `;
        });
    }

    receiptHTML += `
                <div style="border-bottom: 1px solid #999; margin: 5px 0;"></div>
                
                <div class="total">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>Rs. ${subtotal.toFixed(2)}</span>
                    </div>
    `;

    if (discountAmount > 0) {
        receiptHTML += `
                    <div class="total-row">
                        <span>Discount:</span>
                        <span>-Rs. ${discountAmount.toFixed(2)}</span>
                    </div>
        `;
    }

    receiptHTML += `
                    <div class="grand-total">
                        <span>TOTAL:</span>
                        <span>Rs. ${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="text-align: center; font-size: 11px; margin: 10px 0;">
                    <p>💳 <strong>Payment Method: CASH</strong></p>
                    <p>✅ <strong>STATUS: PAID</strong></p>
                </div>
                
                <div class="footer">
                    <p>Thank You for Your Purchase!</p>
                    <p>═════════════════════════════</p>
                    <p>Visit Again Soon 🙏</p>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Trigger print dialog
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Reset POS for New Sale
function resetPOS() {
    cartItems = [];
    selectedCustomer = null;
    loyaltyPointsAvailable = 0;

    // Reset UI
    updateCartDisplay();
    updateCartSummary();
    document.getElementById('barcodeInput').value = '';
    document.getElementById('discountValue').value = '0';
    document.getElementById('amountTendered').value = '';
    document.getElementById('changeAmount').style.display = 'none';
    document.getElementById('cardNumber').value = '';
    document.getElementById('transactionRef').value = '';
    document.getElementById('creditDueDate').value = '';
    document.getElementById('loyaltyPointsUsed').value = '0';

    // Reset customer type to walk-in
    document.getElementById('walkinCustomer').checked = true;
    document.getElementById('registeredCustomerSection').style.display = 'none';
    document.getElementById('selectedCustomerInfo').style.display = 'none';
    document.getElementById('loyaltyPointsSection').style.display = 'none';

    // Disable loyalty payment method
    document.getElementById('paymentLoyalty').disabled = true;
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.opacity = '0.5';
    document.querySelector('.payment-method-card[data-method="loyalty"]').style.pointerEvents = 'none';

    // Reset to cash payment
    document.getElementById('paymentCash').checked = true;
    handlePaymentMethodChange('cash');

    // Focus on barcode
    document.getElementById('barcodeInput').focus();
}


