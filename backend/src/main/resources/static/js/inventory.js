// ============================================
// INVENTORY MANAGEMENT JS - COMPLETE VERSION
// මේකෙන් inventory management එකේ හැම function එකක්ම තියෙනවා
// ============================================

// ============================================
// GLOBAL VARIABLES - හැම තැනම use කරන variables
// ============================================
let products = [];          // Product list - හැම products තියෙනවා මෙතන
let categories = [];        // Category list - categories list එක
let brands = [];            // Brand list - brands list එක
let units = [];             // Units list - unit of measure list එක
let batches = [];          // Batch list - batch details හැම එක
let stockAlerts = [];      // Stock alerts - alerts list එක
let stockMovements = [];   // Movement history - stock movements හැම එක
let suppliers = [];        // Suppliers list - suppliers ලස්ස්න එක

// ============================================
// PAGE LOAD - page එක load වෙද්දී run වෙන functions
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inventory Management Loading...');

    // Load කරන්න ඕන හැම එකක්ම
    loadCategories();
    loadBrands();
    loadUnits();
    loadProducts();
    loadBatches();
    loadAlerts();
    loadSuppliers();
    updateStatistics();

    // Set current date for batch form - batch form එකේ date එක auto දාන එක
    document.getElementById('batchAddedDate').value = getCurrentDate();

    console.log('✅ Inventory Management Loaded Successfully!');
});

// ============================================
// UTILITY FUNCTIONS - Common functions හැම තැනම use කරන්න
// ============================================

// Get current date - අද date එක අරගන්න
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Format currency - rupees format එකට දාන එක (e.g., 1500 -> Rs. 1,500.00)
function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date - date එක nice format එකට (e.g., 2025-12-11 -> 11 Dec 2025)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Calculate days until expiry - expire වෙන්න කොච්චර days තියෙනවද
function getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Generate barcode - auto barcode එකක් generate කරන එක
function generateBarcode() {
    const barcode = 'BC' + Date.now().toString().slice(-10);
    document.getElementById('productBarcode').value = barcode;
    showToast('Barcode generated!', 'success');
}

// Generate batch number - auto batch number generate කරන එක
function generateBatchNumber() {
    const batchNum = 'BATCH' + Date.now().toString().slice(-8);
    document.getElementById('batchNumber').value = batchNum;
    showToast('Batch number generated!', 'success');
}

// Show toast notification - කුඩා notification එකක් පෙන්නන්න
function showToast(message, type = 'info') {
    // Check if Swal is available, else use alert
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        // Fallback to console and alert if Swal is not loaded
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (type === 'error') {
            alert('❌ ' + message);
        } else if (type === 'success') {
            console.info('✅ ' + message);
        }
    }
}

// Read image file as data URL - image file එක base64 URL එකට convert කරන එක
function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// CATEGORY FUNCTIONS - Category වලට අදාල functions
// ============================================

// Load categories - categories load කරන එක (database එකෙන්)
async function loadCategories() {
    try {
        // Backend API එකෙන් categories load කරන එක
        const response = await fetch('/api/categories');
        const result = await response.json();

        if (response.ok && result.success) {
            categories = result.data || [];
        } else {
            console.error('Failed to load categories:', result.message);
            categories = [];
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [];
    }

    // Category dropdowns වලට load කරන එක
    updateCategoryDropdowns();
    updateCategoriesList();
    updateParentCategoryDropdown();
}

// Update category dropdowns - හැම dropdown එකම categories update කරන එක
function updateCategoryDropdowns() {
    const dropdowns = [
        'productCategory',
        'filterCategory',
        'filterBatchCategory'
    ];

    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // පළමුවෙන්ම clear කරන එක
            // Product form එකට "Select Category", filter වලට "All Categories"
            const defaultText = dropdownId === 'productCategory' ? 'Select Category' : 'All Categories';
            dropdown.innerHTML = `<option value="">${defaultText}</option>`;

            // Category එකක් එකක් dropdown එකට add කරන එක
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.categoryId;
                option.textContent = cat.categoryName;
                dropdown.appendChild(option);

                // Add subcategories if any
                if (cat.subcategories && cat.subcategories.length > 0) {
                    cat.subcategories.forEach(sub => {
                        const subOption = document.createElement('option');
                        subOption.value = sub.categoryId;
                        subOption.textContent = '  └─ ' + sub.categoryName;
                        dropdown.appendChild(subOption);
                    });
                }
            });
        }
    });
}

// Update categories list in modal - modal එකේ categories list එක
function updateCategoriesList() {
    const listContainer = document.getElementById('categoriesList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (categories.length === 0) {
        listContainer.innerHTML = '<p class="text-muted">No categories yet</p>';
        return;
    }

    // Category එකක් එකක් පෙන්නන එක
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <strong>${cat.categoryName}</strong>
                <small class="text-muted ms-2">(${cat.productCount || 0} products)</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory(${cat.categoryId})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.categoryId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);

        // Show subcategories if any
        if (cat.subcategories && cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
                const subItem = document.createElement('div');
                subItem.className = 'list-group-item d-flex justify-content-between align-items-center ps-5';
                subItem.style.backgroundColor = '#f8f9fa';
                subItem.innerHTML = `
                    <div>
                        <i class="fas fa-level-up-alt fa-rotate-90 text-muted me-2"></i>
                        <strong>${sub.categoryName}</strong>
                        <small class="text-muted ms-2">(${sub.productCount || 0} products)</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory(${sub.categoryId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${sub.categoryId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                listContainer.appendChild(subItem);
            });
        }
    });
}

// Update parent category dropdown in add category form
function updateParentCategoryDropdown() {
    const dropdown = document.getElementById('newCategoryParent');
    if (!dropdown) return;

    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">-- Main Category --</option>';

    // Add only root/main categories (those without parents)
    categories.forEach(cat => {
        // Only show main categories (no parent) as options for parent selection
        if (!cat.parentCategoryId) {
            const option = document.createElement('option');
            option.value = cat.categoryId;
            option.textContent = cat.categoryName;
            dropdown.appendChild(option);
        }
    });
}

// Add category - අලුත් category එකක් add කරන එක
async function addCategory(event) {
    event.preventDefault();

    const nameInput = document.getElementById('newCategoryName');
    const descriptionInput = document.getElementById('newCategoryDescription');
    const parentInput = document.getElementById('newCategoryParent');

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const parentId = parentInput.value ? parseInt(parentInput.value) : null;

    if (!name) {
        showToast('Please enter category name', 'error');
        return;
    }

    try {
        // API call - backend එකට save කරන්න
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoryName: name,
                description: description || null,
                parentCategoryId: parentId,
                isActive: true
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add category');
        }

        // Success - reload categories
        await loadCategories();

        // UI update කරන එක
        updateCategoryDropdowns();
        updateCategoriesList();
        updateParentCategoryDropdown();

        // Form reset කරන එක
        nameInput.value = '';
        descriptionInput.value = '';
        parentInput.value = '';

        showToast(result.message || 'Category added successfully!', 'success');

    } catch (error) {
        console.error('Error adding category:', error);
        showToast(error.message || 'Failed to add category', 'error');
    }
}

// Edit category - category එකක් edit කරන එක
async function editCategory(id) {
    const category = categories.find(cat => cat.categoryId === id);
    if (!category) return;

    Swal.fire({
        title: 'Edit Category',
        input: 'text',
        inputValue: category.categoryName,
        showCancelButton: true,
        confirmButtonText: 'Update',
        inputValidator: (value) => {
            if (!value) return 'Please enter category name';
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // API call - PUT /api/categories/:id
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        categoryName: result.value,
                        description: category.description,
                        parentCategoryId: category.parentCategoryId,
                        isActive: category.isActive
                    })
                });

                const apiResult = await response.json();

                if (!response.ok) {
                    throw new Error(apiResult.message || 'Failed to update category');
                }

                // Reload categories
                await loadCategories();
                updateCategoryDropdowns();
                updateCategoriesList();
                updateParentCategoryDropdown();

                showToast(apiResult.message || 'Category updated!', 'success');
            } catch (error) {
                console.error('Error updating category:', error);
                showToast(error.message || 'Failed to update category', 'error');
            }
        }
    });
}

// Delete category - category එකක් delete කරන එක
async function deleteCategory(id) {
    const category = categories.find(cat => cat.categoryId === id);
    if (!category) return;

    // Products තියෙනවනම් delete කරන්න බෑ
    if (category.productCount > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot Delete',
            text: `This category has ${category.productCount} products. Please delete or move them first.`
        });
        return;
    }

    Swal.fire({
        title: 'Delete Category?',
        text: `Are you sure you want to delete "${category.categoryName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // API call - DELETE /api/categories/:id
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE'
                });

                const apiResult = await response.json();

                if (!response.ok) {
                    throw new Error(apiResult.message || 'Failed to delete category');
                }

                // Reload categories
                await loadCategories();
                updateCategoryDropdowns();
                updateCategoriesList();
                updateParentCategoryDropdown();

                showToast(apiResult.message || 'Category deleted!', 'success');
            } catch (error) {
                console.error('Error deleting category:', error);
                showToast(error.message || 'Failed to delete category', 'error');
            }
        }
    });
}

// ============================================
// BRAND FUNCTIONS - Brands වලට අදාල functions
// ============================================

// Load brands - brands load කරන එක
async function loadBrands() {
    try {
        const response = await fetch('/api/brands/active');
        const result = await response.json();

        if (response.ok && result.success) {
            brands = result.data;
            updateBrandDropdowns();
            updateBrandsList();
        }
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

// Update brand dropdowns - brand dropdown update කරන එක
function updateBrandDropdowns() {
    const dropdown = document.getElementById('productBrand');
    if (dropdown) {
        dropdown.innerHTML = '<option value="">Select Brand (Optional)</option>';

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.brandId;
            option.textContent = brand.brandName;
            dropdown.appendChild(option);
        });
    }
}

// Update brands list in modal - modal එකේ brands list එක
function updateBrandsList() {
    const listContainer = document.getElementById('brandsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (brands.length === 0) {
        listContainer.innerHTML = '<div class="text-muted text-center py-3">No brands available</div>';
        return;
    }

    brands.forEach(brand => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <strong>${brand.brandName}</strong>
                <small class="text-muted ms-2">(${brand.productCount || 0} products)</small>
                ${brand.description ? `<br><small class="text-muted">${brand.description}</small>` : ''}
            </div>
            <div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBrand(${brand.brandId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// Add brand - brand එකක් add කරන එක
async function addBrand(event) {
    event.preventDefault();

    const nameInput = document.getElementById('newBrandName');
    const descriptionInput = document.getElementById('newBrandDescription');

    const brandName = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!brandName) {
        showToast('Please enter brand name', 'error');
        return;
    }

    try {
        const response = await fetch('/api/brands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                brandName: brandName,
                description: description,
                status: 'ACTIVE'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add brand');
        }

        await loadBrands();
        nameInput.value = '';
        descriptionInput.value = '';
        showToast(result.message || 'Brand added successfully!', 'success');

    } catch (error) {
        console.error('Error adding brand:', error);
        showToast(error.message || 'Failed to add brand', 'error');
    }
}

// Delete brand - brand එකක් delete කරන එක
async function deleteBrand(id) {
    const brand = brands.find(b => b.brandId === id);
    if (!brand) return;

    Swal.fire({
        title: 'Delete Brand?',
        text: `Are you sure you want to delete "${brand.brandName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/brands/${id}`, {
                    method: 'DELETE'
                });

                const apiResult = await response.json();

                if (!response.ok) {
                    throw new Error(apiResult.message || 'Failed to delete brand');
                }

                await loadBrands();
                showToast('Brand deleted successfully!', 'success');

            } catch (error) {
                console.error('Error deleting brand:', error);
                showToast(error.message || 'Cannot delete brand that is in use', 'error');
            }
        }
    });
}

// ============================================
// UNIT FUNCTIONS - Units වලට අදාල functions
// ============================================

// Load units - units load කරන එක
async function loadUnits() {
    try {
        const response = await fetch('/api/units/active');
        const result = await response.json();

        if (response.ok && result.success) {
            units = result.data;
            updateUnitDropdowns();
            updateUnitsList();
        }
    } catch (error) {
        console.error('Error loading units:', error);
    }
}

// Update unit dropdowns - unit dropdown update කරන එක
function updateUnitDropdowns() {
    const dropdown = document.getElementById('productUnit');
    if (dropdown) {
        dropdown.innerHTML = '<option value="">Select Unit</option>';

        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.unitId;
            option.textContent = `${unit.unitName} (${unit.unitCode})`;
            dropdown.appendChild(option);
        });
    }
}

// Update units list in modal - modal එකේ units list එක
function updateUnitsList() {
    const listContainer = document.getElementById('unitsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (units.length === 0) {
        listContainer.innerHTML = '<div class="text-muted text-center py-3">No units available</div>';
        return;
    }

    units.forEach(unit => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <strong>${unit.unitName}</strong>
                <span class="badge bg-primary ms-2">${unit.unitCode}</span>
                <small class="text-muted ms-2">(${unit.productCount || 0} products)</small>
                ${unit.description ? `<br><small class="text-muted">${unit.description}</small>` : ''}
            </div>
            <div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUnit(${unit.unitId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// Add unit - unit එකක් add කරන එක
async function addUnit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('newUnitName');
    const codeInput = document.getElementById('newUnitCode');
    const descriptionInput = document.getElementById('newUnitDescription');

    const unitName = nameInput.value.trim();
    const unitCode = codeInput.value.trim().toUpperCase();
    const description = descriptionInput.value.trim();

    if (!unitName || !unitCode) {
        showToast('Please enter unit name and code', 'error');
        return;
    }

    try {
        const response = await fetch('/api/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                unitName: unitName,
                unitCode: unitCode,
                description: description,
                status: 'ACTIVE'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add unit');
        }

        await loadUnits();
        nameInput.value = '';
        codeInput.value = '';
        descriptionInput.value = '';
        showToast(result.message || 'Unit added successfully!', 'success');

    } catch (error) {
        console.error('Error adding unit:', error);
        showToast(error.message || 'Failed to add unit', 'error');
    }
}

// Delete unit - unit එකක් delete කරන එක
async function deleteUnit(id) {
    const unit = units.find(u => u.unitId === id);
    if (!unit) return;

    Swal.fire({
        title: 'Delete Unit?',
        text: `Are you sure you want to delete "${unit.unitName} (${unit.unitCode})"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/units/${id}`, {
                    method: 'DELETE'
                });

                const apiResult = await response.json();

                if (!response.ok) {
                    throw new Error(apiResult.message || 'Failed to delete unit');
                }

                await loadUnits();
                showToast('Unit deleted successfully!', 'success');

            } catch (error) {
                console.error('Error deleting unit:', error);
                showToast(error.message || 'Cannot delete unit that is in use', 'error');
            }
        }
    });
}

// ============================================
// PRODUCT FUNCTIONS - Products වලට අදාල functions
// ============================================

// Load products - products load කරන එක
async function loadProducts() {
    try {
        // API call - GET /api/productsරන එක
        const response = await fetch('/api/products');
        const result = await response.json();

        if (response.ok && result.success) {
            products = result.data || [];
        } else {
            console.error('Failed to load products:', result.message);
            products = [];
        }
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }

    displayProducts();
}

// Display products - products table එකේ display කරන එක
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h4>No Products Found</h4>
                        <p>Click "Add Product" to create your first product</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // Product එකක් එකක් row එකක් විදිහට දාන එක
    products.forEach(product => {
        // Calculate status from totalStock and needsReorder
        let status = 'in_stock';
        if (product.totalStock === 0) {
            status = 'out_of_stock';
        } else if (product.needsReorder) {
            status = 'low_stock';
        }

        const statusBadge = getStatusBadge(status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" value="${product.productId}">
            </td>
            <td>${product.productId}</td>
            <td>
                ${product.imageUrl ?
                `<img src="${product.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` :
                `<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-image text-muted"></i>
                </div>`
            }
            </td>
            <td>
                <strong>${product.productName}</strong><br>
                <small class="text-muted">${product.productCode || ''} ${product.barcode ? '| ' + product.barcode : ''}</small>
            </td>
            <td>${product.categoryName || 'N/A'}</td>
            <td>${product.barcode || '-'}</td>
            <td>${product.brandName || '-'}</td>
            <td>${product.unitCode || 'N/A'}</td>
            <td><strong>${product.totalStock || 0}</strong></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProduct(${product.productId})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProduct(${product.productId})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get status badge - status එකට color badge එක
function getStatusBadge(status) {
    const badges = {
        'in_stock': '<span class="badge badge-in-stock">In Stock</span>',
        'low_stock': '<span class="badge badge-low-stock">Low Stock</span>',
        'out_of_stock': '<span class="badge badge-out-of-stock">Out of Stock</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Save product - product save කරන එක (add හෝ update)
async function saveProduct(event) {
    event.preventDefault();

    // Form data එක read කරන එක
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const brand = document.getElementById('productBrand').value.trim();
    const unit = document.getElementById('productUnit').value;
    const description = document.getElementById('productDescription').value.trim();
    const reorderPoint = parseInt(document.getElementById('productReorderPoint').value) || 10;
    const reorderQuantity = parseInt(document.getElementById('productReorderQuantity').value) || 50;

    // Validation - හරියට data තියෙනවද check කරන එක
    if (!name || !category || !unit) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Get image URL from file input - image file එක read කරලා base64 URL එක අරගන්න
    let imageUrl = null;
    const imageInput = document.getElementById('productImage');
    if (imageInput.files && imageInput.files[0]) {
        try {
            imageUrl = await readImageAsDataURL(imageInput.files[0]);
        } catch (error) {
            console.error('Error reading image:', error);
            showToast('Failed to read image file', 'warning');
        }
    } else if (productId) {
        // Editing වෙද්දී නව image එකක් නැත්නම්, existing image එක keep කරන එක
        const existingProduct = products.find(p => p.productId === parseInt(productId));
        if (existingProduct && existingProduct.imageUrl) {
            imageUrl = existingProduct.imageUrl;
        }
    }

    try {
        // Product code and barcode auto-generated by backend
        const productData = {
            productName: name,
            categoryId: parseInt(category),
            brandId: brand ? parseInt(brand) : null,
            unitId: parseInt(unit),
            description: description || null,
            imageUrl: imageUrl,
            reorderPoint: reorderPoint,
            reorderQuantity: reorderQuantity,
            isActive: true
        };

        let response;
        if (productId) {
            // Update existing product
            response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Add new product
            response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            console.error('Backend validation error:', result);
            const errorMsg = result.message || result.errors || 'Failed to save product';
            throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
        }

        // Reload products
        await loadProducts();
        displayProducts();
        updateStatistics();

        // Modal close & form reset
        bootstrap.Modal.getInstance(document.getElementById('modalProduct')).hide();
        document.getElementById('formProduct').reset();
        document.getElementById('productId').value = '';
        document.getElementById('imagePreview').innerHTML = '<span>No image selected</span>';
        document.getElementById('imagePreview').classList.add('empty');

        showToast(result.message || 'Product saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving product:', error);
        console.error('Full error details:', error);
        alert('Failed to save product: ' + (error.message || 'Unknown error'));
    }
}

// Edit product - product එකක් edit කරන එක
function editProduct(id) {
    const product = products.find(p => p.productId === id);
    if (!product) return;

    // Form එකට data load කරන එක
    document.getElementById('productId').value = product.productId;
    document.getElementById('productName').value = product.productName;
    document.getElementById('productCategory').value = product.category?.categoryId || '';
    document.getElementById('productBrand').value = product.brandId || '';
    document.getElementById('productUnit').value = product.unitId || '';
    document.getElementById('productReorderPoint').value = product.reorderPoint || 10;
    document.getElementById('productReorderQuantity').value = product.reorderQuantity || 50;
    document.getElementById('productDescription').value = product.description || '';

    // Image preview
    if (product.imageUrl) {
        document.getElementById('imagePreview').innerHTML = `<img src="${product.imageUrl}" alt="Product">`;
        document.getElementById('imagePreview').classList.remove('empty');
    }

    // Modal title change කරන එක
    document.getElementById('productModalTitle').textContent = 'Edit Product';

    // Modal open කරන එක
    new bootstrap.Modal(document.getElementById('modalProduct')).show();
}

// Delete product - product එකක් delete කරන එක
async function deleteProduct(id) {
    const product = products.find(p => p.productId === id);
    if (!product) return;

    // Stock තියෙනවනම් warning එකක් දෙන එක
    if (product.totalStock > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Product has Stock',
            text: `This product has ${product.totalStock} ${product.unitOfMeasure} in stock. Are you sure you want to delete it?`,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete anyway!'
        }).then((result) => {
            if (result.isConfirmed) {
                performDeleteProduct(id);
            }
        });
    } else {
        Swal.fire({
            title: 'Delete Product?',
            text: `Are you sure you want to delete "${product.productName}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                performDeleteProduct(id);
            }
        });
    }
}

// Actually delete කරන function
async function performDeleteProduct(id) {
    try {
        // API call - DELETE /api/products/:id
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete product');
        }

        // Reload products
        await loadProducts();
        displayProducts();
        updateStatistics();

        showToast(result.message || 'Product deleted!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast(error.message || 'Failed to delete product', 'error');
    }
}

// Image preview - upload කරන image එක preview කරන එක
function previewImage(input) {
    const preview = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.remove('empty');
        };

        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '<span>No image selected</span>';
        preview.classList.add('empty');
    }
}

// ============================================
// BATCH FUNCTIONS - Batch inventory වලට අදාල
// ============================================

// Load batches - batches load කරන එක
async function loadBatches() {
    try {
        // Backend API එකෙන් batches load කරන එක
        const response = await fetch('/api/batches');
        const result = await response.json();

        if (response.ok && result.success) {
            batches = result.data || [];
            console.log('Batches loaded:', batches.length);
        } else {
            console.error('Failed to load batches:', result.message);
            batches = [];
        }
    } catch (error) {
        console.error('Error loading batches:', error);
        batches = [];
    }

    displayBatches();
}

// Display batches - batches table එකේ පෙන්නන එක
function displayBatches() {
    const tbody = document.getElementById('batchesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (batches.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-layer-group"></i>
                        <h4>No Batches Found</h4>
                        <p>Click "Add Batch" to add stock</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    batches.forEach(batch => {
        // Calculate profit margin - API එකෙන් එන්නේ නැති නිසා calculate කරමු
        const purchasePrice = parseFloat(batch.purchasePrice) || 0;
        const sellingPrice = parseFloat(batch.sellingPrice) || 0;
        const profitMargin = purchasePrice > 0 ? ((sellingPrice - purchasePrice) / purchasePrice) * 100 : 0;

        const statusBadge = getBatchStatusBadge(batch);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${batch.batchCode || batch.batchNumber || 'N/A'}</strong></td>
            <td>${batch.productName || 'N/A'}</td>
            <td><strong>${batch.stockQuantity || 0} ${batch.unit || ''}</strong></td>
            <td>${formatCurrency(purchasePrice)}</td>
            <td>${formatCurrency(sellingPrice)}</td>
            <td><span class="badge bg-success">${profitMargin.toFixed(2)}%</span></td>
            <td>${formatDate(batch.expiryDate)}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editBatch(${batch.batchId || batch.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning btn-action" onclick="openAdjustStock(${batch.batchId || batch.id})" title="Adjust Stock">
                    <i class="fas fa-adjust"></i>
                </button>
                <button class="btn btn-sm btn-outline-info btn-action" onclick="viewMovementHistory(${batch.batchId || batch.id})" title="History">
                    <i class="fas fa-history"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get batch status badge - batch status badge එක
function getBatchStatusBadge(batch) {
    // Use daysUntilExpiry from API if available, else calculate
    const daysToExpiry = batch.daysUntilExpiry !== undefined ? batch.daysUntilExpiry : getDaysUntilExpiry(batch.expiryDate);

    // Check batch status from API first
    if (batch.status) {
        const statusMap = {
            'EXPIRED': '<span class="badge badge-expired">Expired</span>',
            'EXPIRING_SOON': `<span class="badge badge-expiring">Expiring Soon</span>`,
            'IN_STOCK': '<span class="badge badge-in-stock">In Stock</span>',
            'OUT_OF_STOCK': '<span class="badge badge-out-of-stock">Out of Stock</span>',
            'LOW_STOCK': '<span class="badge badge-low-stock">Low Stock</span>'
        };
        if (statusMap[batch.status]) {
            return statusMap[batch.status];
        }
    }

    // Fallback to calculated status
    // Expired check කරන එක
    if (daysToExpiry !== null && daysToExpiry < 0) {
        return '<span class="badge badge-expired">Expired</span>';
    }

    // Expiring soon check කරන එක
    if (daysToExpiry !== null && daysToExpiry <= 30) {
        return `<span class="badge badge-expiring">Expiring (${daysToExpiry}d)</span>`;
    }

    // Stock status check කරන එක
    if (batch.stockQuantity === 0) {
        return '<span class="badge badge-out-of-stock">Out of Stock</span>';
    } else if (batch.stockQuantity <= 10) { // Low stock threshold
        return '<span class="badge badge-low-stock">Low Stock</span>';
    } else {
        return '<span class="badge badge-in-stock">In Stock</span>';
    }
}

// Load product details for batch form - product select කරද්දී details load කරන එක
function loadProductDetails() {
    const productSelect = document.getElementById('batchProduct');
    const productId = productSelect.value;

    if (!productId) {
        document.getElementById('batchUnit').value = '';
        return;
    }

    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
        document.getElementById('batchUnit').value = product.unit;
    }
}

// Calculate profit margin - profit margin % එක calculate කරන එක
function calculateProfit() {
    const purchasePrice = parseFloat(document.getElementById('batchPurchasePrice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('batchSellingPrice').value) || 0;

    if (purchasePrice === 0) {
        document.getElementById('batchProfitMargin').value = '0%';
        return;
    }

    // Selling price අඩුනම් warning එකක්
    if (sellingPrice < purchasePrice) {
        document.getElementById('batchProfitMargin').value = 'Loss!';
        document.getElementById('batchProfitMargin').style.color = 'red';
        showToast('Warning: Selling price is less than purchase price!', 'warning');
        return;
    }

    const profitMargin = ((sellingPrice - purchasePrice) / purchasePrice) * 100;
    document.getElementById('batchProfitMargin').value = profitMargin.toFixed(2) + '%';
    document.getElementById('batchProfitMargin').style.color = 'green';
}

// Check expiry warning - expiry date check කරලා warning එකක් දෙන එක
function checkExpiryWarning() {
    const expiryDate = document.getElementById('batchExpiryDate').value;
    const warningDiv = document.getElementById('expiryWarning');

    if (!expiryDate) {
        warningDiv.style.display = 'none';
        return;
    }

    const daysToExpiry = getDaysUntilExpiry(expiryDate);

    if (daysToExpiry < 0) {
        warningDiv.innerHTML = '❌ This batch is already expired!';
        warningDiv.style.display = 'block';
    } else if (daysToExpiry <= 30) {
        warningDiv.innerHTML = `⚠️ This batch expires in ${daysToExpiry} days!`;
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
    }
}

// Save batch - batch save කරන එක
function saveBatch(event) {
    event.preventDefault();

    // Form data read කරන එක
    const batchId = document.getElementById('batchId').value;
    const productId = document.getElementById('batchProduct').value;
    const batchNumber = document.getElementById('batchNumber').value.trim();
    const quantity = parseFloat(document.getElementById('batchQuantity').value);
    const reorderPoint = parseFloat(document.getElementById('batchReorderPoint').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('batchPurchasePrice').value);
    const sellingPrice = parseFloat(document.getElementById('batchSellingPrice').value);
    const supplierId = document.getElementById('batchSupplier').value || null;
    const manufactureDate = document.getElementById('batchManufactureDate').value || null;
    const expiryDate = document.getElementById('batchExpiryDate').value || null;

    // Validation
    if (!productId || !batchNumber || !quantity || !purchasePrice || !sellingPrice) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (sellingPrice < purchasePrice) {
        Swal.fire({
            icon: 'warning',
            title: 'Price Warning',
            text: 'Selling price is less than purchase price. Do you want to continue?',
            showCancelButton: true,
            confirmButtonText: 'Yes, continue'
        }).then((result) => {
            if (result.isConfirmed) {
                performSaveBatch();
            }
        });
    } else {
        performSaveBatch();
    }

    function performSaveBatch() {
        const product = products.find(p => p.id === parseInt(productId));
        const profitMargin = ((sellingPrice - purchasePrice) / purchasePrice) * 100;

        const batchData = {
            batchNumber,
            productId: parseInt(productId),
            productName: product.name,
            stockQuantity: quantity,
            unit: product.unit,
            purchasePrice,
            sellingPrice,
            profitMargin,
            reorderPoint,
            supplierId: supplierId ? parseInt(supplierId) : null,
            supplierName: supplierId ? suppliers.find(s => s.id === parseInt(supplierId))?.name : null,
            manufactureDate,
            expiryDate,
            addedDate: getCurrentDate(),
            status: quantity > reorderPoint ? 'in_stock' : 'low_stock'
        };

        if (batchId) {
            // Update existing batch
            // API call - PUT /api/batches/:id
            const index = batches.findIndex(b => b.id === parseInt(batchId));
            batches[index] = { ...batches[index], ...batchData };
            showToast('Batch updated successfully!', 'success');
        } else {
            // Add new batch
            // API call - POST /api/batches
            batchData.id = batches.length + 1;
            batches.push(batchData);

            // Stock movement record එකක් හදන එක
            createStockMovement({
                batchId: batchData.id,
                type: 'purchase',
                quantityChange: quantity,
                quantityBefore: 0,
                quantityAfter: quantity,
                referenceType: 'batch_added',
                referenceId: batchData.id,
                reason: 'New batch added',
                movedBy: 'Admin' // මේක login user එකෙන් ගන්න
            });

            showToast('Batch added successfully!', 'success');
        }

        // UI update කරන එක
        displayBatches();
        updateStatistics();
        loadAlerts();

        // Modal close & form reset
        bootstrap.Modal.getInstance(document.getElementById('modalBatch')).hide();
        document.getElementById('formBatch').reset();
        document.getElementById('batchId').value = '';
    }
}

// Edit batch - batch එකක් edit කරන එක
function editBatch(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;

    // Form එකට data load කරන එක
    document.getElementById('batchId').value = batch.id;
    document.getElementById('batchProduct').value = batch.productId;
    document.getElementById('batchNumber').value = batch.batchNumber;
    document.getElementById('batchQuantity').value = batch.stockQuantity;
    document.getElementById('batchReorderPoint').value = batch.reorderPoint;
    document.getElementById('batchUnit').value = batch.unit;
    document.getElementById('batchPurchasePrice').value = batch.purchasePrice;
    document.getElementById('batchSellingPrice').value = batch.sellingPrice;
    document.getElementById('batchProfitMargin').value = batch.profitMargin.toFixed(2) + '%';
    document.getElementById('batchSupplier').value = batch.supplierId || '';
    document.getElementById('batchManufactureDate').value = batch.manufactureDate || '';
    document.getElementById('batchExpiryDate').value = batch.expiryDate || '';
    document.getElementById('batchAddedDate').value = batch.addedDate;

    // Modal title change කරන එක
    document.getElementById('batchModalTitle').textContent = 'Edit Batch';

    // Modal open කරන එක
    new bootstrap.Modal(document.getElementById('modalBatch')).show();
}

// ============================================
// STOCK ADJUSTMENT - Stock adjust කරන functions
// ============================================

// Open adjust stock modal - stock adjust කරන modal open කරන එක
function openAdjustStock(batchId) {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Batch info පෙන්නන එක
    document.getElementById('adjustBatchId').value = batch.id;
    document.getElementById('adjustBatchNumber').textContent = batch.batchNumber;
    document.getElementById('adjustProductName').textContent = batch.productName;
    document.getElementById('adjustCurrentStock').textContent = `${batch.stockQuantity} ${batch.unit}`;

    // Form reset කරන එක
    document.getElementById('formAdjustStock').reset();

    // Modal open කරන එක
    new bootstrap.Modal(document.getElementById('modalAdjustStock')).show();
}

// Adjust stock - stock adjust කරන main function
function adjustStock(event) {
    event.preventDefault();

    const batchId = parseInt(document.getElementById('adjustBatchId').value);
    const type = document.getElementById('adjustmentType').value;
    const quantity = parseFloat(document.getElementById('adjustmentQuantity').value);
    const reason = document.getElementById('adjustmentReason').value;
    const notes = document.getElementById('adjustmentNotes').value.trim();

    if (!quantity || quantity <= 0) {
        showToast('Please enter valid quantity', 'error');
        return;
    }

    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const currentStock = batch.stockQuantity;
    let newStock;
    let quantityChange;

    if (type === 'add') {
        // Stock add කරන එක
        newStock = currentStock + quantity;
        quantityChange = quantity;
    } else {
        // Stock remove කරන එක
        if (quantity > currentStock) {
            showToast('Cannot remove more than available stock!', 'error');
            return;
        }
        newStock = currentStock - quantity;
        quantityChange = -quantity;
    }

    // Confirmation dialog එකක්
    Swal.fire({
        title: 'Confirm Stock Adjustment',
        html: `
            <p><strong>Current Stock:</strong> ${currentStock} ${batch.unit}</p>
            <p><strong>Change:</strong> ${type === 'add' ? '+' : '-'}${quantity} ${batch.unit}</p>
            <p><strong>New Stock:</strong> ${newStock} ${batch.unit}</p>
            <p><strong>Reason:</strong> ${reason}</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm'
    }).then((result) => {
        if (result.isConfirmed) {
            // API call - POST /api/batches/:id/adjust
            batch.stockQuantity = newStock;

            // Movement record එකක් create කරන එක
            createStockMovement({
                batchId: batch.id,
                type: 'adjustment',
                quantityChange,
                quantityBefore: currentStock,
                quantityAfter: newStock,
                referenceType: 'manual_adjustment',
                referenceId: null,
                reason: reason + (notes ? ` - ${notes}` : ''),
                movedBy: 'Admin'
            });

            // UI update කරන එක
            displayBatches();
            updateStatistics();
            loadAlerts();

            // Modal close කරන එක
            bootstrap.Modal.getInstance(document.getElementById('modalAdjustStock')).hide();

            showToast('Stock adjusted successfully!', 'success');
        }
    });
}

// ============================================
// STOCK MOVEMENT HISTORY - Movement history වලට අදාල
// ============================================

// Create stock movement record - movement record එකක් හදන එක
function createStockMovement(data) {
    const movement = {
        id: stockMovements.length + 1,
        batchId: data.batchId,
        type: data.type, // purchase, sale, adjustment, damage, return
        quantityChange: data.quantityChange,
        quantityBefore: data.quantityBefore,
        quantityAfter: data.quantityAfter,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        reason: data.reason || null,
        movedBy: data.movedBy,
        timestamp: new Date().toISOString()
    };

    stockMovements.push(movement);
    // API call - POST /api/stock-movements
}

// View movement history - batch එකක movement history බලන එක
function viewMovementHistory(batchId) {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Batch info පෙන්නන එක
    document.getElementById('historyBatchNumber').textContent = batch.batchNumber;
    document.getElementById('historyProductName').textContent = batch.productName;
    document.getElementById('historyCurrentStock').textContent = `${batch.stockQuantity} ${batch.unit}`;

    // Movements filter කරන එක (මේ batch එකට අදාල විතරක්)
    const batchMovements = stockMovements.filter(m => m.batchId === batchId);
    document.getElementById('historyTotalMovements').textContent = batchMovements.length;

    // Timeline එකේ පෙන්නන එක
    displayMovementTimeline(batchMovements);

    // Modal open කරන එක
    new bootstrap.Modal(document.getElementById('modalMovementHistory')).show();
}

// Display movement timeline - timeline එකේ movements පෙන්නන එක
function displayMovementTimeline(movements) {
    const timeline = document.getElementById('movementTimeline');
    timeline.innerHTML = '';

    if (movements.length === 0) {
        timeline.innerHTML = '<p class="text-muted">No movement history found</p>';
        return;
    }

    // Latest first - අලුත්ම එක පළමුව
    const sortedMovements = [...movements].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedMovements.forEach(movement => {
        const item = document.createElement('div');
        item.className = `movement-item ${movement.type}`;

        // Movement type icon
        const typeIcons = {
            purchase: '🛒',
            sale: '📦',
            adjustment: '🔧',
            damage: '💔',
            return: '🎁'
        };

        const typeLabels = {
            purchase: 'Purchase',
            sale: 'Sale',
            adjustment: 'Manual Adjustment',
            damage: 'Damage/Loss',
            return: 'Customer Return'
        };

        const changeColor = movement.quantityChange > 0 ? 'success' : 'danger';
        const changeSign = movement.quantityChange > 0 ? '+' : '';

        item.innerHTML = `
            <div class="movement-header">
                <div class="movement-type">
                    ${typeIcons[movement.type]} ${typeLabels[movement.type]}
                </div>
                <div class="movement-date">${formatDate(movement.timestamp)}</div>
            </div>
            <div>
                <strong>Change:</strong> 
                <span class="text-${changeColor}">${changeSign}${movement.quantityChange}</span>
                <br>
                <strong>Stock:</strong> ${movement.quantityBefore} → ${movement.quantityAfter}
                ${movement.referenceType ? `<br><strong>Reference:</strong> ${movement.referenceType} #${movement.referenceId}` : ''}
                ${movement.reason ? `<br><strong>Reason:</strong> ${movement.reason}` : ''}
                <br><small class="text-muted">By: ${movement.movedBy}</small>
            </div>
        `;

        timeline.appendChild(item);
    });
}

// Filter movements - movement type එකෙන් filter කරන එක
function filterMovements() {
    const filterType = document.getElementById('filterMovementType').value;
    const batchId = parseInt(document.getElementById('historyBatchNumber').textContent.replace(/[^0-9]/g, ''));

    let movements = stockMovements.filter(m => m.batchId === batchId);

    if (filterType) {
        movements = movements.filter(m => m.type === filterType);
    }

    displayMovementTimeline(movements);
}

// ============================================
// STOCK ALERTS - Low stock, expiry alerts වලට අදාල
// ============================================

// Load alerts - alerts load කරන එක
function loadAlerts() {
    stockAlerts = [];

    batches.forEach(batch => {
        const batchId = batch.batchId || batch.id;
        const batchNumber = batch.batchCode || batch.batchNumber;

        // Low stock alert
        if (batch.stockQuantity <= 10 && batch.stockQuantity > 0) { // Use fixed threshold
            stockAlerts.push({
                id: stockAlerts.length + 1,
                batchId: batchId,
                batchNumber: batchNumber,
                productName: batch.productName,
                type: 'low_stock',
                threshold: 10,
                currentValue: batch.stockQuantity,
                status: 'active',
                createdDate: getCurrentDate()
            });
        }

        // Out of stock alert
        if (batch.stockQuantity === 0) {
            stockAlerts.push({
                id: stockAlerts.length + 1,
                batchId: batchId,
                batchNumber: batchNumber,
                productName: batch.productName,
                type: 'out_of_stock',
                threshold: 0,
                currentValue: 0,
                status: 'active',
                createdDate: getCurrentDate()
            });
        }

        // Expiry alerts
        if (batch.expiryDate) {
            const daysToExpiry = batch.daysUntilExpiry !== undefined ? batch.daysUntilExpiry : getDaysUntilExpiry(batch.expiryDate);

            if (daysToExpiry < 0) {
                // Expired
                stockAlerts.push({
                    id: stockAlerts.length + 1,
                    batchId: batchId,
                    batchNumber: batchNumber,
                    productName: batch.productName,
                    type: 'expired',
                    threshold: 0,
                    currentValue: daysToExpiry,
                    status: 'active',
                    createdDate: getCurrentDate()
                });
            } else if (daysToExpiry <= 30) {
                // Expiring soon
                stockAlerts.push({
                    id: stockAlerts.length + 1,
                    batchId: batchId,
                    batchNumber: batchNumber,
                    productName: batch.productName,
                    type: 'expiry_soon',
                    threshold: 30,
                    currentValue: daysToExpiry,
                    status: 'active',
                    createdDate: getCurrentDate()
                });
            }
        }
    });

    // Display කරන එක
    displayAlerts();
    displayAlertsInTab();

    // Alert count update කරන එක
    document.getElementById('alertCount').textContent = stockAlerts.filter(a => a.status === 'active').length;
}

// Display alerts in header section - page එකේ top එකේ alerts
function displayAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    const alertsList = document.getElementById('alertsList');

    if (!alertsList) return;

    const activeAlerts = stockAlerts.filter(a => a.status === 'active').slice(0, 3); // පළමු 3 විතරක්

    if (activeAlerts.length === 0) {
        alertsSection.style.display = 'none';
        return;
    }

    alertsSection.style.display = 'block';
    alertsList.innerHTML = '';

    activeAlerts.forEach(alert => {
        const alertBox = document.createElement('div');
        const alertInfo = getAlertInfo(alert);
        alertBox.className = `alert-box ${alertInfo.class}`;
        alertBox.innerHTML = `
            <i class="${alertInfo.icon}"></i>
            <div class="flex-grow-1">
                <strong>${alertInfo.title}</strong> - ${alert.productName} (${alert.batchNumber})
                <br>
                <small>${alertInfo.message}</small>
            </div>
            <button class="btn btn-sm btn-outline-secondary" onclick="resolveAlert(${alert.id})">
                Resolve
            </button>
        `;
        alertsList.appendChild(alertBox);
    });
}

// Display alerts in tab - Alerts tab එකේ alerts හැමදේම
function displayAlertsInTab() {
    const container = document.getElementById('alertsListFull');
    if (!container) return;

    const activeAlerts = stockAlerts.filter(a => a.status === 'active');

    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h4>No Active Alerts</h4>
                <p>All stocks are at good levels! 🎉</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    activeAlerts.forEach(alert => {
        const alertInfo = getAlertInfo(alert);
        const alertCard = document.createElement('div');
        alertCard.className = `alert-box ${alertInfo.class} mb-3`;
        alertCard.innerHTML = `
            <i class="${alertInfo.icon}"></i>
            <div class="flex-grow-1">
                <strong>${alertInfo.title}</strong>
                <br>
                <strong>Product:</strong> ${alert.productName}
                <br>
                <strong>Batch:</strong> ${alert.batchNumber}
                <br>
                <small>${alertInfo.message}</small>
                <br>
                <small class="text-muted">Alert created: ${formatDate(alert.createdDate)}</small>
            </div>
            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-success" onclick="resolveAlert(${alert.id})">
                    <i class="fas fa-check"></i> Resolve
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="viewBatchFromAlert(${alert.batchId})">
                    <i class="fas fa-eye"></i> View Batch
                </button>
            </div>
        `;
        container.appendChild(alertCard);
    });
}

// Get alert info - alert type එකට අනුව info
function getAlertInfo(alert) {
    const info = {
        low_stock: {
            class: 'low-stock',
            icon: 'fas fa-exclamation-triangle',
            title: '⚠️ Low Stock Alert',
            message: `Current stock: ${alert.currentValue}, Reorder point: ${alert.threshold}`
        },
        out_of_stock: {
            class: 'expired',
            icon: 'fas fa-times-circle',
            title: '❌ Out of Stock',
            message: 'This item is completely out of stock!'
        },
        expiry_soon: {
            class: 'expiring',
            icon: 'fas fa-clock',
            title: '⏰ Expiring Soon',
            message: `Expires in ${alert.currentValue} days`
        },
        expired: {
            class: 'expired',
            icon: 'fas fa-skull-crossbones',
            title: '☠️ Expired',
            message: `Expired ${Math.abs(alert.currentValue)} days ago`
        }
    };

    return info[alert.type] || {};
}

// Resolve alert - alert එකක් resolve කරන එක
function resolveAlert(alertId) {
    const alert = stockAlerts.find(a => a.id === alertId);
    if (!alert) return;

    Swal.fire({
        title: 'Resolve Alert?',
        text: 'Mark this alert as resolved?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, resolve it'
    }).then((result) => {
        if (result.isConfirmed) {
            // API call - PUT /api/alerts/:id/resolve
            alert.status = 'resolved';

            displayAlerts();
            displayAlertsInTab();

            showToast('Alert resolved!', 'success');
        }
    });
}

// Resolve all alerts - හැම alerts එකම resolve කරන එක
function resolveAllAlerts() {
    const activeAlerts = stockAlerts.filter(a => a.status === 'active');

    if (activeAlerts.length === 0) {
        showToast('No active alerts to resolve', 'info');
        return;
    }

    Swal.fire({
        title: 'Resolve All Alerts?',
        text: `This will mark ${activeAlerts.length} alerts as resolved`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, resolve all'
    }).then((result) => {
        if (result.isConfirmed) {
            // API call - PUT /api/alerts/resolve-all
            activeAlerts.forEach(alert => {
                alert.status = 'resolved';
            });

            displayAlerts();
            displayAlertsInTab();

            showToast(`${activeAlerts.length} alerts resolved!`, 'success');
        }
    });
}

// View batch from alert - alert එකෙන් batch එක view කරන එක
function viewBatchFromAlert(batchId) {
    // Switch to Batches tab
    const batchesTab = document.querySelector('a[href="#tabBatches"]');
    if (batchesTab) {
        bootstrap.Tab.getInstance(batchesTab)?.show() || new bootstrap.Tab(batchesTab).show();
    }

    // Highlight batch - batch එක highlight කරන එක
    setTimeout(() => {
        const batchRow = document.querySelector(`#batchesTableBody tr[data-batch-id="${batchId}"]`);
        if (batchRow) {
            batchRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            batchRow.style.background = '#fff3cd';
            setTimeout(() => {
                batchRow.style.background = '';
            }, 2000);
        }
    }, 300);
}

// ============================================
// STATISTICS UPDATE - Stats cards update කරන එක
// ============================================

function updateStatistics() {
    // Total products count
    const totalProducts = products.length;
    document.getElementById('statTotalProducts').textContent = totalProducts;

    // Low stock items - reorder point අඩු items
    const lowStockItems = batches.filter(b =>
        b.stockQuantity > 0 && b.stockQuantity <= b.reorderPoint
    ).length;
    document.getElementById('statLowStock').textContent = lowStockItems;

    // Out of stock items
    const outOfStockItems = batches.filter(b => b.stockQuantity === 0).length;
    document.getElementById('statOutOfStock').textContent = outOfStockItems;

    // Total stock value - හැම batch එකම value එක එකතු කරන එක
    const totalValue = batches.reduce((sum, batch) => {
        return sum + (batch.stockQuantity * batch.sellingPrice);
    }, 0);
    document.getElementById('statTotalValue').textContent = formatCurrency(totalValue);
}

// ============================================
// FILTER FUNCTIONS - Filter කරන functions
// ============================================

// Clear all filters - filters clear කරන එක
function clearFilters() {
    document.getElementById('searchProduct').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStockStatus').value = '';

    // Reload කරන එක
    loadProducts();
}

// Load suppliers - suppliers load කරන එක (batch form එකට)
async function loadSuppliers() {
    try {
        // Backend API එකෙන් suppliers load කරන එක
        const response = await fetch('/api/suppliers');
        const result = await response.json();

        if (response.ok && result.success) {
            suppliers = result.data || [];
            console.log('Suppliers loaded:', suppliers.length);
        } else {
            console.error('Failed to load suppliers:', result.message);
            suppliers = [];
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
        suppliers = [];
    }

    // Supplier dropdown එකට add කරන එක
    const dropdown = document.getElementById('batchSupplier');
    if (dropdown) {
        dropdown.innerHTML = '<option value="">Select supplier...</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.supplierId || supplier.id;
            option.textContent = supplier.supplierName || supplier.name;
            dropdown.appendChild(option);
        });
    }
}

// ============================================
// END OF FILE - Brother, මේකෙන් inventory management එකේ හැමදේම තියෙනවා! 🎉
// ============================================

console.log('✅ Inventory Management System Ready!');
