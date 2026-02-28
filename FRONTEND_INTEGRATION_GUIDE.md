# Frontend Integration Guide - Phase 4 & 5
## Sampath Grocery System - Customer & Order Management

This guide provides exact API endpoints, request/response formats, and JavaScript integration examples for connecting your existing HTML/JS frontend to the newly implemented backend APIs.

---

## Table of Contents
1. [API Base Configuration](#api-base-configuration)
2. [Customer Management APIs](#customer-management-apis)
3. [Order Management APIs](#order-management-apis)
4. [Cart Management APIs](#cart-management-apis)
5. [Payment Management APIs](#payment-management-apis)
6. [Invoice Management APIs](#invoice-management-apis)
7. [Discount Management APIs](#discount-management-apis)
8. [Error Handling](#error-handling)
9. [UI Page Mapping](#ui-page-mapping)

---

## API Base Configuration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Authentication Headers (JWT)
```javascript
function getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
```

### Standard API Response Format
All APIs return data in this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## Customer Management APIs

### 1. Create Customer
**Endpoint:** `POST /api/customers`  
**UI Page:** `customers.html` - "Add New Customer" form

**JavaScript Example:**
```javascript
async function createCustomer() {
    const formData = {
        fullName: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value,
        city: document.getElementById('customerCity').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            loadCustomersTable(); // Reload table
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error creating customer:', error);
        Swal.fire('Error', 'Failed to create customer', 'error');
    }
}
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "0771234567",
  "email": "john@example.com",
  "address": "123 Main Street",
  "city": "Colombo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": 1,
    "customerCode": "CUST-00001",
    "fullName": "John Doe",
    "phone": "0771234567",
    "email": "john@example.com",
    "address": "123 Main Street",
    "city": "Colombo",
    "loyaltyPoints": 0,
    "loyaltyTier": "BRONZE",
    "totalPurchaseAmount": 0.00,
    "createdAt": "2024-01-15T10:30:00"
  },
  "message": "Customer created successfully"
}
```

---

### 2. Get All Customers
**Endpoint:** `GET /api/customers`  
**UI Page:** `customers.html` - Display in main table

**JavaScript Example:**
```javascript
async function loadCustomersTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const customers = result.data;
            renderCustomersTable(customers);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';

    customers.forEach(customer => {
        const row = `
            <tr>
                <td>${customer.customerCode}</td>
                <td>${customer.fullName}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.city}</td>
                <td>
                    <span class="badge bg-${getTierBadgeColor(customer.loyaltyTier)}">
                        ${customer.loyaltyTier}
                    </span>
                </td>
                <td>${customer.loyaltyPoints} pts</td>
                <td>Rs. ${customer.totalPurchaseAmount.toFixed(2)}</td>
                <td>
                    <button onclick="editCustomer(${customer.customerId})" class="btn btn-sm btn-primary">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button onclick="viewProfile(${customer.customerId})" class="btn btn-sm btn-info">
                        <i class="bi bi-person"></i> Profile
                    </button>
                    <button onclick="deleteCustomer(${customer.customerId})" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function getTierBadgeColor(tier) {
    const colors = {
        'BRONZE': 'warning',
        'SILVER': 'secondary',
        'GOLD': 'primary',
        'PLATINUM': 'success'
    };
    return colors[tier] || 'secondary';
}
```

---

### 3. Search Customers
**Endpoint:** `GET /api/customers/search?q={searchTerm}`  
**UI Page:** `customers.html` - Search box

**JavaScript Example:**
```javascript
async function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value;

    try {
        const response = await fetch(`${API_BASE_URL}/customers/search?q=${searchTerm}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            renderCustomersTable(result.data);
        }
    } catch (error) {
        console.error('Error searching customers:', error);
    }
}

// Attach to search input
document.getElementById('customerSearch').addEventListener('input', searchCustomers);
```

---

### 4. Update Customer
**Endpoint:** `PUT /api/customers/{id}`  
**UI Page:** `customers.html` - Edit modal

**JavaScript Example:**
```javascript
async function updateCustomer(customerId) {
    const formData = {
        fullName: document.getElementById('editCustomerName').value,
        phone: document.getElementById('editCustomerPhone').value,
        email: document.getElementById('editCustomerEmail').value,
        address: document.getElementById('editCustomerAddress').value,
        city: document.getElementById('editCustomerCity').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            $('#editCustomerModal').modal('hide');
            loadCustomersTable();
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating customer:', error);
    }
}
```

---

### 5. Get Customer Profile
**Endpoint:** `GET /api/customers/{id}/profile`  
**UI Page:** `customers.html` - Profile modal/section

**JavaScript Example:**
```javascript
async function viewProfile(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}/profile`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const profile = result.data;
            displayProfileModal(profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayProfileModal(profile) {
    document.getElementById('profileDateOfBirth').value = profile.dateOfBirth || '';
    document.getElementById('profileGender').value = profile.gender || '';
    document.getElementById('profileOccupation').value = profile.occupation || '';
    document.getElementById('profileContactMethod').value = profile.preferredContactMethod || '';
    document.getElementById('profileNotes').value = profile.notes || '';
    
    $('#customerProfileModal').modal('show');
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profileId": 1,
    "customerId": 1,
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "occupation": "Engineer",
    "preferredContactMethod": "EMAIL",
    "notes": "Prefers organic products",
    "preferences": {
      "newsletter": true,
      "smsAlerts": false
    }
  }
}
```

---

### 6. Redeem Loyalty Points
**Endpoint:** `POST /api/customers/{id}/loyalty/redeem`  
**UI Page:** `customers.html` OR `pos.html` - Loyalty redemption

**JavaScript Example:**
```javascript
async function redeemLoyaltyPoints(customerId, pointsToRedeem) {
    const requestBody = {
        pointsToRedeem: pointsToRedeem
    };

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}/loyalty/redeem`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            const redemption = result.data;
            Swal.fire({
                title: 'Points Redeemed!',
                html: `
                    <p>Points Redeemed: ${redemption.pointsRedeemed}</p>
                    <p>Discount Amount: Rs. ${redemption.discountAmount.toFixed(2)}</p>
                    <p>Remaining Points: ${redemption.remainingPoints}</p>
                `,
                icon: 'success'
            });
            return redemption;
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error redeeming points:', error);
    }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pointsRedeemed": 50,
    "discountAmount": 500.00,
    "remainingPoints": 150
  },
  "message": "Loyalty points redeemed successfully"
}
```

---

## Order Management APIs

### 7. Create Order (POS or Online)
**Endpoint:** `POST /api/orders`  
**UI Pages:** `pos.html` (POS orders) OR `orders.html` (Online orders)

**JavaScript Example for POS:**
```javascript
async function createPOSOrder() {
    // Get cart items from your POS cart array
    const cartItems = getPOSCartItems(); // Your existing function
    
    const orderData = {
        orderType: "WALK_IN",
        customerId: selectedCustomerId || null,
        items: cartItems.map(item => ({
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercentage: item.discountPercentage || 0
        })),
        taxAmount: calculateTax(),
        deliveryCharge: 0,
        loyaltyPointsUsed: getLoyaltyPointsToUse(),
        discountCode: document.getElementById('discountCode').value || null,
        notes: document.getElementById('orderNotes').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (result.success) {
            const order = result.data;
            Swal.fire('Success', `Order ${order.orderCode} created successfully!`, 'success');
            
            // Generate invoice
            await generateInvoice(order.orderId);
            
            // Clear POS cart
            clearPOSCart();
            
            // Print receipt (optional)
            printReceipt(order);
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        Swal.fire('Error', 'Failed to create order', 'error');
    }
}
```

**Request Body:**
```json
{
  "orderType": "WALK_IN",
  "customerId": 5,
  "items": [
    {
      "batchId": 10,
      "quantity": 2,
      "unitPrice": 150.00,
      "discountPercentage": 5
    },
    {
      "batchId": 15,
      "quantity": 1,
      "unitPrice": 500.00
    }
  ],
  "taxAmount": 25.00,
  "deliveryCharge": 0,
  "loyaltyPointsUsed": 10,
  "discountCode": "SAVE10",
  "notes": "Customer requested fast checkout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 100,
    "orderCode": "ORD-00100",
    "customerId": 5,
    "customerName": "John Doe",
    "orderType": "WALK_IN",
    "status": "PENDING",
    "statusId": 1,
    "items": [
      {
        "orderItemId": 200,
        "batchId": 10,
        "productName": "Basmati Rice 5kg",
        "quantity": 2,
        "unitPrice": 150.00,
        "discountPercentage": 5.00,
        "discountAmount": 15.00,
        "lineTotal": 285.00
      }
    ],
    "subtotal": 800.00,
    "discountAmount": 80.00,
    "taxAmount": 25.00,
    "deliveryCharge": 0,
    "loyaltyPointsUsed": 10,
    "loyaltyDiscountAmount": 100.00,
    "grandTotal": 645.00,
    "loyaltyPointsEarned": 6,
    "notes": "Customer requested fast checkout",
    "createdAt": "2024-01-15T10:45:00",
    "createdBy": "cashier1"
  },
  "message": "Order created successfully"
}
```

---

### 8. Get Order by ID
**Endpoint:** `GET /api/orders/{id}`  
**UI Page:** `orders.html` - View order details

**JavaScript Example:**
```javascript
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const order = result.data;
            displayOrderDetailsModal(order);
        }
    } catch (error) {
        console.error('Error loading order:', error);
    }
}

function displayOrderDetailsModal(order) {
    document.getElementById('orderCode').textContent = order.orderCode;
    document.getElementById('orderStatus').textContent = order.status;
    document.getElementById('orderCustomer').textContent = order.customerName || 'Walk-in';
    document.getElementById('orderTotal').textContent = `Rs. ${order.grandTotal.toFixed(2)}`;
    
    // Render order items table
    const itemsTableBody = document.getElementById('orderItemsTableBody');
    itemsTableBody.innerHTML = '';
    
    order.items.forEach(item => {
        const row = `
            <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.unitPrice.toFixed(2)}</td>
                <td>Rs. ${item.lineTotal.toFixed(2)}</td>
            </tr>
        `;
        itemsTableBody.innerHTML += row;
    });
    
    $('#orderDetailsModal').modal('show');
}
```

---

### 9. Get Orders by Customer
**Endpoint:** `GET /api/orders/customer/{customerId}`  
**UI Page:** `customers.html` - Customer order history

**JavaScript Example:**
```javascript
async function loadCustomerOrders(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/customer/${customerId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            renderCustomerOrdersTable(result.data);
        }
    } catch (error) {
        console.error('Error loading customer orders:', error);
    }
}
```

---

### 10. Update Order Status
**Endpoint:** `PUT /api/orders/{id}/status`  
**UI Page:** `orders.html` - Status dropdown/buttons

**JavaScript Example:**
```javascript
async function updateOrderStatus(orderId, newStatusId, notes) {
    const requestBody = {
        statusId: newStatusId,
        notes: notes || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            loadOrdersTable();
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// Example: Mark order as completed
async function completeOrder(orderId) {
    await updateOrderStatus(orderId, 3, 'Order completed and delivered'); // Status ID 3 = COMPLETED
}
```

---

## Cart Management APIs

### 11. Get or Create User Cart
**Endpoint:** `GET /api/cart/user/{userId}`  
**UI Page:** Online ordering page (if you have one)

**JavaScript Example:**
```javascript
async function loadUserCart(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/user/${userId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const cart = result.data;
            renderCart(cart);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function renderCart(cart) {
    document.getElementById('cartTotal').textContent = `Rs. ${cart.total.toFixed(2)}`;
    
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    
    cart.items.forEach(item => {
        const itemHtml = `
            <div class="cart-item" data-item-id="${item.cartItemId}">
                <div class="item-name">${item.productName}</div>
                <div class="item-quantity">
                    <button onclick="decreaseQuantity(${item.cartItemId})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.cartItemId})">+</button>
                </div>
                <div class="item-price">Rs. ${item.lineTotal.toFixed(2)}</div>
                <button onclick="removeFromCart(${item.cartItemId})" class="btn-remove">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        cartItemsDiv.innerHTML += itemHtml;
    });
}
```

---

### 12. Add Item to Cart
**Endpoint:** `POST /api/cart/{cartId}/items`  
**UI Page:** Online product browsing

**JavaScript Example:**
```javascript
async function addToCart(cartId, batchId, quantity) {
    const requestBody = {
        batchId: batchId,
        quantity: quantity
    };

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', 'Item added to cart', 'success');
            renderCart(result.data);
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}
```

---

### 13. Update Cart Item Quantity
**Endpoint:** `PUT /api/cart/items/{itemId}`  
**UI Page:** Cart view

**JavaScript Example:**
```javascript
async function updateCartItemQuantity(cartItemId, newQuantity) {
    const requestBody = {
        quantity: newQuantity
    };

    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            renderCart(result.data);
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

function increaseQuantity(cartItemId) {
    const currentQty = getCurrentQuantity(cartItemId); // Your function
    updateCartItemQuantity(cartItemId, currentQty + 1);
}

function decreaseQuantity(cartItemId) {
    const currentQty = getCurrentQuantity(cartItemId);
    if (currentQty > 1) {
        updateCartItemQuantity(cartItemId, currentQty - 1);
    }
}
```

---

### 14. Remove Item from Cart
**Endpoint:** `DELETE /api/cart/items/{itemId}`  
**UI Page:** Cart view

**JavaScript Example:**
```javascript
async function removeFromCart(cartItemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            renderCart(result.data);
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}
```

---

## Payment Management APIs

### 15. Create Payment
**Endpoint:** `POST /api/payments`  
**UI Page:** `pos.html` OR `payments.html`

**JavaScript Example:**
```javascript
async function createPayment(orderId, paymentMethodId, amount, transactionId) {
    const requestBody = {
        orderId: orderId,
        paymentMethodId: paymentMethodId,
        amount: amount,
        transactionId: transactionId || null,
        notes: document.getElementById('paymentNotes').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            // Complete payment immediately if cash
            if (paymentMethodId === 1) { // Cash payment
                await completePayment(result.data.paymentId);
            }
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    } catch (error) {
        console.error('Error creating payment:', error);
    }
}
```

**Request Body:**
```json
{
  "orderId": 100,
  "paymentMethodId": 1,
  "amount": 645.00,
  "transactionId": null,
  "notes": "Cash payment"
}
```

---

### 16. Complete Payment
**Endpoint:** `PUT /api/payments/{id}/complete`  
**UI Page:** `payments.html`

**JavaScript Example:**
```javascript
async function completePayment(paymentId, transactionId) {
    const url = transactionId 
        ? `${API_BASE_URL}/payments/${paymentId}/complete?transactionId=${transactionId}`
        : `${API_BASE_URL}/payments/${paymentId}/complete`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', 'Payment completed', 'success');
            loadPaymentsTable();
        }
    } catch (error) {
        console.error('Error completing payment:', error);
    }
}
```

---

### 17. Get Payments by Order
**Endpoint:** `GET /api/payments/order/{orderId}`  
**UI Page:** `orders.html` - Payment history section

**JavaScript Example:**
```javascript
async function loadOrderPayments(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/order/${orderId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            renderPaymentsTable(result.data);
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}
```

---

## Invoice Management APIs

### 18. Generate Invoice
**Endpoint:** `POST /api/invoices/generate/{orderId}`  
**UI Page:** `pos.html` OR `orders.html` - After order creation

**JavaScript Example:**
```javascript
async function generateInvoice(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/invoices/generate/${orderId}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const invoice = result.data;
            Swal.fire('Success', `Invoice ${invoice.invoiceNumber} generated`, 'success');
            return invoice;
        }
    } catch (error) {
        console.error('Error generating invoice:', error);
    }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": 50,
    "invoiceNumber": "INV-00050",
    "orderId": 100,
    "orderCode": "ORD-00100",
    "customerId": 5,
    "customerName": "John Doe",
    "totalAmount": 645.00,
    "paidAmount": 645.00,
    "balance": 0.00,
    "status": "PAID",
    "issueDate": "2024-01-15",
    "dueDate": "2024-02-14",
    "paymentDate": "2024-01-15",
    "createdAt": "2024-01-15T10:45:00"
  },
  "message": "Invoice generated successfully"
}
```

---

### 19. Get Invoice by Order ID
**Endpoint:** `GET /api/invoices/order/{orderId}`  
**UI Page:** `orders.html` - Invoice button

**JavaScript Example:**
```javascript
async function viewInvoice(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/invoices/order/${orderId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const invoice = result.data;
            displayInvoiceModal(invoice);
        }
    } catch (error) {
        console.error('Error loading invoice:', error);
    }
}

function displayInvoiceModal(invoice) {
    document.getElementById('invoiceNumber').textContent = invoice.invoiceNumber;
    document.getElementById('invoiceDate').textContent = invoice.issueDate;
    document.getElementById('invoiceCustomer').textContent = invoice.customerName;
    document.getElementById('invoiceTotal').textContent = `Rs. ${invoice.totalAmount.toFixed(2)}`;
    document.getElementById('invoicePaid').textContent = `Rs. ${invoice.paidAmount.toFixed(2)}`;
    document.getElementById('invoiceBalance').textContent = `Rs. ${invoice.balance.toFixed(2)}`;
    document.getElementById('invoiceStatus').textContent = invoice.status;
    
    $('#invoiceModal').modal('show');
}
```

---

### 20. Mark Invoice as Paid
**Endpoint:** `PUT /api/invoices/{id}/mark-paid`  
**UI Page:** `payments.html` OR invoice view

**JavaScript Example:**
```javascript
async function markInvoiceAsPaid(invoiceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/mark-paid`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Success', result.message, 'success');
            loadInvoicesTable();
        }
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
    }
}
```

---

## Discount Management APIs

### 21. Validate Discount Code
**Endpoint:** `POST /api/discounts/validate`  
**UI Page:** `pos.html` - Discount code input

**JavaScript Example:**
```javascript
async function validateDiscountCode() {
    const discountCode = document.getElementById('discountCodeInput').value;
    const orderAmount = calculateOrderTotal(); // Your existing function

    const requestBody = {
        discountCode: discountCode,
        orderAmount: orderAmount
    };

    try {
        const response = await fetch(`${API_BASE_URL}/discounts/validate`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.success) {
            const validation = result.data;
            
            if (validation.valid) {
                Swal.fire({
                    title: 'Discount Applied!',
                    html: `
                        <p>Discount: ${validation.discountType}</p>
                        <p>You save: Rs. ${validation.discountAmount.toFixed(2)}</p>
                    `,
                    icon: 'success'
                });
                applyDiscountToOrder(validation);
            } else {
                Swal.fire('Invalid', validation.message, 'warning');
            }
        }
    } catch (error) {
        console.error('Error validating discount:', error);
    }
}
```

**Request Body:**
```json
{
  "discountCode": "SAVE10",
  "orderAmount": 1000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discountCode": "SAVE10",
    "valid": true,
    "message": "Discount code is valid",
    "discountType": "PERCENTAGE",
    "discountValue": 10.00,
    "discountAmount": 100.00,
    "maxDiscountAmount": 500.00,
    "minimumOrderAmount": 500.00
  }
}
```

---

### 22. Get Active Discounts
**Endpoint:** `GET /api/discounts/active`  
**UI Page:** `pos.html` - Display available discounts

**JavaScript Example:**
```javascript
async function loadActiveDiscounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/discounts/active`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            displayActiveDiscounts(result.data);
        }
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

function displayActiveDiscounts(discounts) {
    const discountsDiv = document.getElementById('activeDiscounts');
    discountsDiv.innerHTML = '';
    
    discounts.forEach(discount => {
        const badge = `
            <span class="badge bg-success m-1" onclick="applyDiscount('${discount.discountCode}')">
                ${discount.discountCode} - ${discount.discountName}
            </span>
        `;
        discountsDiv.innerHTML += badge;
    });
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violation
- `500 Internal Server Error` - Server error

### Global Error Handler
```javascript
async function apiCall(url, options) {
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            // Handle HTTP errors
            if (response.status === 401) {
                // Unauthorized - redirect to login
                window.location.href = '/login.html';
                return;
            }
            
            if (response.status === 403) {
                Swal.fire('Access Denied', 'You do not have permission for this action', 'error');
                return;
            }
            
            // Other errors
            Swal.fire('Error', result.message || 'An error occurred', 'error');
            return null;
        }
        
        return result;
        
    } catch (error) {
        console.error('API call failed:', error);
        Swal.fire('Error', 'Network error. Please check your connection.', 'error');
        return null;
    }
}
```

---

## UI Page Mapping

### Page: `customers.html`
**APIs Used:**
- GET `/api/customers` - Load customers table
- GET `/api/customers/search?q=` - Search customers
- POST `/api/customers` - Create new customer
- PUT `/api/customers/{id}` - Update customer
- DELETE `/api/customers/{id}` - Delete customer
- GET `/api/customers/{id}/profile` - View customer profile
- PUT `/api/customers/{id}/profile` - Update customer profile
- POST `/api/customers/{id}/loyalty/redeem` - Redeem loyalty points
- GET `/api/orders/customer/{id}` - View customer order history

**Key UI Elements:**
- `#customersTableBody` - Main customers table
- `#customerSearch` - Search input
- `#addCustomerModal` - Add customer modal
- `#editCustomerModal` - Edit customer modal
- `#customerProfileModal` - Profile modal

---

### Page: `pos.html`
**APIs Used:**
- POST `/api/orders` - Create POS order
- GET `/api/customers/search?q=` - Search customer by phone
- POST `/api/discounts/validate` - Validate discount code
- POST `/api/customers/{id}/loyalty/redeem` - Redeem loyalty points
- POST `/api/payments` - Create payment
- POST `/api/invoices/generate/{orderId}` - Generate invoice

**Key UI Elements:**
- `#posCartItems` - Cart items display
- `#customerSearch` - Customer search
- `#discountCodeInput` - Discount code input
- `#loyaltyPointsInput` - Loyalty points to redeem
- `#paymentMethodSelect` - Payment method dropdown
- `#checkoutButton` - Checkout button

---

### Page: `orders.html`
**APIs Used:**
- GET `/api/orders` - Load all orders
- GET `/api/orders/{id}` - View order details
- GET `/api/orders/customer/{customerId}` - Customer orders
- PUT `/api/orders/{id}/status` - Update order status
- GET `/api/payments/order/{orderId}` - Order payments
- GET `/api/invoices/order/{orderId}` - Order invoice

**Key UI Elements:**
- `#ordersTableBody` - Orders table
- `#orderDetailsModal` - Order details modal
- `#orderStatusSelect` - Status dropdown

---

### Page: `payments.html`
**APIs Used:**
- POST `/api/payments` - Create payment
- GET `/api/payments/order/{orderId}` - Get order payments
- PUT `/api/payments/{id}/complete` - Complete payment
- PUT `/api/payments/{id}/fail` - Fail payment
- PUT `/api/payments/{id}/refund` - Refund payment

**Key UI Elements:**
- `#paymentsTableBody` - Payments table
- `#createPaymentModal` - Create payment modal

---

## Complete Integration Example

### POS Checkout Flow
```javascript
// Complete POS checkout with all features
async function completePOSCheckout() {
    // 1. Get cart data
    const cartItems = getPOSCartItems();
    
    // 2. Validate discount code if provided
    const discountCode = document.getElementById('discountCodeInput').value;
    let validatedDiscount = null;
    
    if (discountCode) {
        validatedDiscount = await validateDiscountCode();
        if (!validatedDiscount || !validatedDiscount.valid) {
            return; // Stop if discount is invalid
        }
    }
    
    // 3. Redeem loyalty points if customer selected
    const customerId = getSelectedCustomerId();
    const loyaltyPoints = parseInt(document.getElementById('loyaltyPointsInput').value) || 0;
    let loyaltyRedemption = null;
    
    if (customerId && loyaltyPoints > 0) {
        loyaltyRedemption = await redeemLoyaltyPoints(customerId, loyaltyPoints);
        if (!loyaltyRedemption) {
            return; // Stop if redemption fails
        }
    }
    
    // 4. Create order
    const orderData = {
        orderType: "WALK_IN",
        customerId: customerId,
        items: cartItems,
        taxAmount: calculateTax(),
        deliveryCharge: 0,
        loyaltyPointsUsed: loyaltyPoints,
        discountCode: discountCode,
        notes: document.getElementById('orderNotes').value
    };
    
    const orderResult = await createOrder(orderData);
    if (!orderResult) return;
    
    const order = orderResult.data;
    
    // 5. Create payment
    const paymentMethodId = parseInt(document.getElementById('paymentMethodSelect').value);
    const paymentResult = await createPayment(
        order.orderId,
        paymentMethodId,
        order.grandTotal,
        null // transactionId for cash
    );
    
    if (!paymentResult) return;
    
    // 6. Complete payment (if cash)
    if (paymentMethodId === 1) {
        await completePayment(paymentResult.data.paymentId);
    }
    
    // 7. Generate invoice
    const invoice = await generateInvoice(order.orderId);
    
    // 8. Show success and print
    Swal.fire({
        title: 'Order Complete!',
        html: `
            <p>Order: ${order.orderCode}</p>
            <p>Invoice: ${invoice.invoiceNumber}</p>
            <p>Total: Rs. ${order.grandTotal.toFixed(2)}</p>
            <p>Loyalty Points Earned: ${order.loyaltyPointsEarned}</p>
        `,
        icon: 'success'
    }).then(() => {
        printReceipt(order, invoice);
        clearPOSCart();
    });
}
```

---

## Notes for Developers

1. **JWT Token**: All APIs require JWT token in Authorization header. Store token in `localStorage` after login.

2. **Error Messages**: Display all error messages from `result.message` to users using SweetAlert2 or your preferred method.

3. **Loading States**: Show loading spinners during API calls for better UX.

4. **Optimistic Updates**: For better UX, update UI immediately and rollback if API fails.

5. **Data Validation**: Validate all user inputs before sending to API (client-side validation).

6. **Security**: Never store sensitive data in localStorage. Only store JWT token.

7. **API Testing**: Use Postman or curl to test APIs before frontend integration.

---

## Postman Collection Example

Import this JSON into Postman for testing:

```json
{
  "info": {
    "name": "Sampath Grocery - Phase 4 & 5 APIs",
    "_postman_id": "12345",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Customer",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"John Doe\",\n  \"phone\": \"0771234567\",\n  \"email\": \"john@example.com\",\n  \"address\": \"123 Main Street\",\n  \"city\": \"Colombo\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/customers",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "customers"]
        }
      }
    }
  ]
}
```

---

## Support & Next Steps

### Next Implementation Tasks:
1. Add JWT authentication to controllers (replace hardcoded `createdBy`)
2. Add role-based access control using `@PreAuthorize` annotations
3. Seed database with lookup tables (OrderStatus, PaymentMethod)
4. Test all endpoints with Postman
5. Integrate frontend pages one by one following this guide

### Database Seeding Required:
```sql
-- Insert OrderStatus lookup data
INSERT INTO order_status (status_name, description, display_order, is_active) VALUES
('PENDING', 'Order pending confirmation', 1, TRUE),
('CONFIRMED', 'Order confirmed', 2, TRUE),
('COMPLETED', 'Order completed', 3, TRUE),
('CANCELLED', 'Order cancelled', 4, TRUE);

-- Insert PaymentMethod lookup data
INSERT INTO payment_method (method_name, description, is_active) VALUES
('Cash', 'Cash payment', TRUE),
('Card', 'Credit/Debit card', TRUE),
('Mobile Payment', 'Mobile wallet (eZ Cash, FriMi)', TRUE),
('Bank Transfer', 'Bank transfer', TRUE);
```

---

**End of Frontend Integration Guide**
