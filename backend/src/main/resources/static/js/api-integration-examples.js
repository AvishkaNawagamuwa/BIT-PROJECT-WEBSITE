/**
 * ========================================================
 * API Integration Examples - How to Use in Your Pages
 * ========================================================
 * 
 * This file shows practical examples of integrating the
 * Simple API service into your grocery system pages.
 */

// ============================================
// Example 1: Basic GET Request
// ============================================

async function loadProducts() {
    try {
        showLoading('Loading products...');

        // Replace with your actual endpoint when implemented
        const response = await apiRequest('/products', {
            method: 'GET'
        });

        hideLoading();

        if (response && response.data) {
            displayProducts(response.data);
            showSuccess('Products loaded successfully!');
        }
    } catch (error) {
        hideLoading();
        showError('Failed to load products: ' + error.message);
        console.error('Error:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = products.map(product => `
        <div class="card">
            <h5>${product.name}</h5>
            <p>Price: $${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// ============================================
// Example 2: POST Request with FormData
// ============================================

async function createCustomer() {
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    // Validate
    if (!formData.firstName || !formData.lastName) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        showLoading('Creating customer...');

        const response = await apiRequest('/customers', {
            method: 'POST',
            body: formData
        });

        hideLoading();

        if (response && response.success) {
            showSuccess('Customer created successfully!');
            document.getElementById('customerForm').reset();
            loadCustomers(); // Reload list
        }
    } catch (error) {
        hideLoading();
        showError('Failed to create customer: ' + error.message);
    }
}

// ============================================
// Example 3: PUT Request (Update)
// ============================================

async function updateProduct(productId) {
    const updatedData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQty').value)
    };

    try {
        showLoading('Updating product...');

        const response = await apiRequest(`/products/${productId}`, {
            method: 'PUT',
            body: updatedData
        });

        hideLoading();

        if (response && response.success) {
            showSuccess('Product updated successfully!');
            loadProducts(); // Reload list
        }
    } catch (error) {
        hideLoading();
        showError('Failed to update product: ' + error.message);
    }
}

// ============================================
// Example 4: DELETE Request
// ============================================

async function deleteProduct(productId) {
    // Confirm before delete
    const confirmed = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (!confirmed.isConfirmed) {
        return;
    }

    try {
        showLoading('Deleting product...');

        const response = await apiRequest(`/products/${productId}`, {
            method: 'DELETE'
        });

        hideLoading();

        if (response && response.success) {
            showSuccess('Product deleted successfully!');
            loadProducts(); // Reload list
        }
    } catch (error) {
        hideLoading();
        showError('Failed to delete product: ' + error.message);
    }
}

// ============================================
// Example 5: Search/Filter with Query Parameters
// ============================================

async function searchProducts(searchTerm) {
    try {
        showLoading('Searching...');

        // URL encode search term
        const encodedTerm = encodeURIComponent(searchTerm);

        const response = await apiRequest(`/products/search?q=${encodedTerm}`, {
            method: 'GET'
        });

        hideLoading();

        if (response && response.data) {
            displayProducts(response.data);
        }
    } catch (error) {
        hideLoading();
        showError('Search failed: ' + error.message);
    }
}

// ============================================
// Example 6: Load Data on Page Load
// ============================================

// Add to your HTML page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');

    // Check backend connection first
    try {
        const health = await SimpleAPI.checkHealth();
        console.log('✅ Backend connected:', health);

        // Load initial data
        await loadProducts();
        await loadCategories();

    } catch (error) {
        showError('Cannot connect to backend. Please check if server is running.');
        console.error('Connection error:', error);
    }
});

// ============================================
// Example 7: Form Submission Handler
// ============================================

// HTML Form:
/*
<form id="productForm" onsubmit="handleProductSubmit(event)">
    <input type="text" id="productName" required>
    <input type="number" id="productPrice" required>
    <button type="submit">Save Product</button>
</form>
*/

async function handleProductSubmit(event) {
    event.preventDefault(); // Prevent page reload

    const formData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value)
    };

    try {
        showLoading('Saving product...');

        const response = await apiRequest('/products', {
            method: 'POST',
            body: formData
        });

        hideLoading();

        if (response && response.success) {
            showSuccess('Product saved!');
            document.getElementById('productForm').reset();
            loadProducts();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ============================================
// Example 8: Real-time Data Refresh
// ============================================

let refreshInterval;

function startAutoRefresh(intervalSeconds = 30) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Set new interval
    refreshInterval = setInterval(async () => {
        console.log('Auto-refreshing data...');
        try {
            await loadProducts();
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, intervalSeconds * 1000);

    console.log(`Auto-refresh started (every ${intervalSeconds} seconds)`);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log('Auto-refresh stopped');
    }
}

// ============================================
// Example 9: Pagination
// ============================================

async function loadProductsWithPagination(page = 1, pageSize = 10) {
    try {
        showLoading('Loading page ' + page + '...');

        const response = await apiRequest(
            `/products?page=${page}&size=${pageSize}`,
            { method: 'GET' }
        );

        hideLoading();

        if (response && response.data) {
            displayProducts(response.data.content);
            displayPagination(response.data.totalPages, page);
        }
    } catch (error) {
        hideLoading();
        showError('Failed to load products: ' + error.message);
    }
}

function displayPagination(totalPages, currentPage) {
    const container = document.getElementById('pagination');
    let html = '<div class="pagination">';

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `
            <button class="page-btn ${activeClass}" 
                    onclick="loadProductsWithPagination(${i})">
                ${i}
            </button>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// Example 10: File Upload (if needed later)
// ============================================

async function uploadProductImage(productId, fileInput) {
    const file = fileInput.files[0];

    if (!file) {
        showError('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        showLoading('Uploading image...');

        // Note: For file upload, don't set Content-Type header
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/products/${productId}/image`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        hideLoading();

        if (response.ok && data.success) {
            showSuccess('Image uploaded successfully!');
            loadProducts();
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        hideLoading();
        showError('Failed to upload image: ' + error.message);
    }
}

// ============================================
// Example 11: Error Handling Best Practices
// ============================================

async function robustApiCall() {
    try {
        showLoading();

        const response = await apiRequest('/endpoint', {
            method: 'GET'
        });

        hideLoading();

        // Check if response has expected structure
        if (!response || !response.data) {
            throw new Error('Invalid response format');
        }

        return response.data;

    } catch (error) {
        hideLoading();

        // Different error types
        if (error.status === 404) {
            showError('Resource not found');
        } else if (error.status === 403) {
            showError('Access denied');
        } else if (error.message.includes('fetch')) {
            showError('Cannot connect to server');
        } else {
            showError('An error occurred: ' + error.message);
        }

        console.error('API Error:', error);
        throw error; // Re-throw if needed
    }
}

// ============================================
// Example 12: Debounced Search
// ============================================

// Prevent too many API calls while typing
let searchTimeout;

function handleSearchInput(searchTerm) {
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Set new timeout
    searchTimeout = setTimeout(() => {
        searchProducts(searchTerm);
    }, 500); // Wait 500ms after user stops typing
}

// HTML: <input type="text" oninput="handleSearchInput(this.value)">

// ============================================
// INTEGRATION TEMPLATE FOR YOUR PAGES
// ============================================

/*
<!DOCTYPE html>
<html>
<head>
    <title>Your Page</title>
    <link rel="stylesheet" href="../assets/bootstrap-5.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="../assets/sweetalert2/sweetalert2.min.css">
</head>
<body>
    <div id="content"></div>
    
    <!-- Load scripts in this order -->
    <script src="../assets/bootstrap-5.3.7/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/sweetalert2/sweetalert2.min.js"></script>
    <script src="../js/simple-api-service.js"></script>
    <script src="../js/your-page-script.js"></script>
</body>
</html>
*/

console.log('📚 API Integration Examples loaded');
console.log('💡 Copy these examples to your page scripts');
