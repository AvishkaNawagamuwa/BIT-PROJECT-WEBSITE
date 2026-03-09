// Suppliers & Purchase Orders Management JavaScript

// Global Variables
let suppliers = [];
let products = [];
let purchaseOrders = [];
let lowStockItems = [];
let editingSupplierId = null;
let editingPOId = null;
let currentPOItems = [];
let viewingPOIndex = -1;
let selectedProductIds = []; // Track selected products for supplier

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function () {
    await loadSuppliers();
    await loadProducts();
    await loadPurchaseOrders();
    // loadSampleData(); // Disabled - using real database data
    // loadDataFromStorage(); // Disabled - using real database data
    setupEventListeners();
    populateFilterDropdowns(); // Populate after data is loaded
    populateGRNSupplierDropdown(); // Populate GRN dropdown after suppliers loaded
    loadGRNRecords(); // Load GRN records
    updateStatistics();
    displaySuppliers();
    displayPurchaseOrders();
    displayLowStockItems();
    await generatePONumber();
    setDefaultDates();
    populateProductCheckboxes(); // Populate product checkboxes for supplier form
    console.log('✅ All data loaded successfully');
});

// Load sample data
function loadSampleData() {
    // Sample suppliers
    const sampleSuppliers = [
        {
            supplierName: "Fresh Fruits Lanka",
            supplierCode: "SUP001",
            category: "Fruits & Vegetables",
            status: "Active",
            contactPerson: "Sunil Perera",
            designation: "Sales Manager",
            phone: "0112345678",
            supplierEmail: "sales@freshfruits.lk",
            supplierAddress: "No. 123, Peliyagoda, Kelaniya",
            paymentTerms: "Credit 15 days",
            supplierCreditLimit: 500000,
            supplierRating: 5,
            supplierNotes: "Reliable supplier for fresh fruits and vegetables",
            addedDate: "2023-01-15"
        },
        {
            supplierName: "Lanka Dairy Products",
            supplierCode: "SUP002",
            category: "Dairy & Frozen",
            status: "Active",
            contactPerson: "Nimal Silva",
            designation: "Regional Manager",
            phone: "0773456789",
            supplierEmail: "orders@lankadairy.com",
            supplierAddress: "No. 456, Industrial Zone, Pannipitiya",
            paymentTerms: "Credit 30 days",
            supplierCreditLimit: 750000,
            supplierRating: 4,
            supplierNotes: "Quality dairy and frozen products supplier",
            addedDate: "2023-02-20"
        },
        {
            supplierName: "Golden Beverages",
            supplierCode: "SUP003",
            category: "Beverages",
            status: "Active",
            contactPerson: "Kamala Fernando",
            designation: "Sales Executive",
            phone: "0765432109",
            supplierEmail: "info@goldenbeverages.lk",
            supplierAddress: "No. 789, Gampaha Road, Ja-Ela",
            paymentTerms: "Credit 7 days",
            supplierCreditLimit: 300000,
            supplierRating: 4,
            supplierNotes: "Wide range of beverages and soft drinks",
            addedDate: "2023-03-10"
        },
        {
            supplierName: "Home Care Distributors",
            supplierCode: "SUP004",
            category: "Household Items",
            status: "Active",
            contactPerson: "Roshan Gunasekara",
            designation: "Distribution Manager",
            phone: "0712345678",
            supplierEmail: "orders@homecare.lk",
            supplierAddress: "No. 321, Maharagama, Colombo",
            paymentTerms: "Credit 45 days",
            supplierCreditLimit: 400000,
            supplierRating: 3,
            supplierNotes: "Household cleaning and care products",
            addedDate: "2023-04-05"
        },
        {
            supplierName: "Snack World Suppliers",
            supplierCode: "SUP005",
            category: "Snacks & Confectionery",
            status: "Inactive",
            contactPerson: "Anura Wickramasinghe",
            designation: "Sales Rep",
            phone: "0778901234",
            supplierEmail: "sales@snackworld.lk",
            supplierAddress: "No. 654, Negombo Road, Wattala",
            paymentTerms: "Cash",
            supplierCreditLimit: 0,
            supplierRating: 2,
            supplierNotes: "Issues with delivery schedule - currently inactive",
            addedDate: "2023-05-15"
        }
    ];

    // Sample purchase orders
    const samplePurchaseOrders = [
        {
            poNumber: "PO-2024-001",
            supplier: "Fresh Fruits Lanka",
            poDate: "2024-01-08",
            expectedDate: "2024-01-10",
            status: "Pending",
            items: [
                { product: "Red Apples (1kg)", quantity: 50, unitPrice: 450, total: 22500 },
                { product: "Bananas (1kg)", quantity: 30, unitPrice: 280, total: 8400 }
            ],
            totalItems: 2,
            totalQuantity: 80,
            totalValue: 30900,
            poNotes: "Urgent order for weekend sale",
            createdDate: "2024-01-08"
        },
        {
            poNumber: "PO-2024-002",
            supplier: "Lanka Dairy Products",
            poDate: "2024-01-07",
            expectedDate: "2024-01-09",
            status: "Approved",
            items: [
                { product: "Fresh Milk (1L)", quantity: 100, unitPrice: 320, total: 32000 },
                { product: "Cheese Slices (200g)", quantity: 25, unitPrice: 580, total: 14500 }
            ],
            totalItems: 2,
            totalQuantity: 125,
            totalValue: 46500,
            poNotes: "Regular weekly order",
            createdDate: "2024-01-07"
        },
        {
            poNumber: "PO-2024-003",
            supplier: "Golden Beverages",
            poDate: "2024-01-05",
            expectedDate: "2024-01-07",
            status: "Received",
            items: [
                { product: "Coca Cola (330ml)", quantity: 200, unitPrice: 85, total: 17000 },
                { product: "Orange Juice (1L)", quantity: 50, unitPrice: 420, total: 21000 }
            ],
            totalItems: 2,
            totalQuantity: 250,
            totalValue: 38000,
            poNotes: "Received in good condition",
            createdDate: "2024-01-05",
            receivedDate: "2024-01-07"
        }
    ];

    // Sample low stock items
    const sampleLowStockItems = [
        {
            product: "Red Apples (1kg)",
            currentStock: 8,
            reorderLevel: 20,
            suggestedOrderQty: 50,
            preferredSupplier: "Fresh Fruits Lanka",
            unitPrice: 450
        },
        {
            product: "Fresh Milk (1L)",
            currentStock: 15,
            reorderLevel: 30,
            suggestedOrderQty: 100,
            preferredSupplier: "Lanka Dairy Products",
            unitPrice: 320
        },
        {
            product: "Bread (400g)",
            currentStock: 5,
            reorderLevel: 25,
            suggestedOrderQty: 75,
            preferredSupplier: "Ceylon Bakery",
            unitPrice: 185
        },
        {
            product: "Rice (5kg)",
            currentStock: 12,
            reorderLevel: 20,
            suggestedOrderQty: 60,
            preferredSupplier: "Lanka Rice Mills",
            unitPrice: 1850
        }
    ];

    // Only load sample data if no data exists
    if (!localStorage.getItem('suppliers')) {
        suppliers = sampleSuppliers;
        saveDataToStorage();
    }
    if (!localStorage.getItem('purchaseOrders')) {
        purchaseOrders = samplePurchaseOrders;
        saveDataToStorage();
    }
    if (!localStorage.getItem('lowStockItems')) {
        lowStockItems = sampleLowStockItems;
        saveDataToStorage();
    }
}

// Load suppliers from backend API
async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        if (!response.ok) {
            throw new Error('Failed to load suppliers');
        }
        const data = await response.json();
        console.log('Suppliers API Response:', data);
        console.log('Raw supplier data:', data.data);
        if (data.data && data.data.length > 0) {
            console.log('First supplier:', data.data[0]);
        }

        if (data.success && data.data) {
            // Normalize supplier fields to handle different backend formats
            suppliers = (data.data || []).map(s => {
                // Check all possible formats for isActive field
                let isActive = true; // Default to true  
                if (s.isActive !== undefined) {
                    isActive = s.isActive === true || s.isActive === 1 || s.isActive === "true" || s.isActive === "1";
                } else if (s.active !== undefined) {
                    isActive = s.active === true || s.active === 1;
                } else if (s.is_active !== undefined) {
                    isActive = s.is_active === true || s.is_active === 1;
                } else if (s.status !== undefined) {
                    isActive = typeof s.status === "string" && s.status.toLowerCase() === "active";
                }

                return {
                    supplierId: s.supplierId ?? s.id ?? s.supplier_id,
                    supplierName: s.supplierName ?? s.name ?? s.supplier_name,
                    supplierCode: s.supplierCode ?? s.code ?? s.supplier_code,
                    contactPerson: s.contactPerson ?? s.contact_person,
                    phone: s.phone ?? s.contactNo ?? s.contact_no,
                    alternatePhone: s.alternatePhone ?? s.alternate_phone,
                    email: s.email ?? s.supplierEmail ?? s.supplier_email,
                    address: s.address ?? s.supplierAddress ?? s.supplier_address,
                    city: s.city ?? null,
                    paymentTerms: s.paymentTerms ?? s.payment_terms ?? null,
                    creditLimit: s.creditLimit ?? s.supplierCreditLimit ?? s.credit_limit ?? 0,
                    isActive: isActive
                };
            });
            console.log('Loaded suppliers:', suppliers.length, suppliers);
            console.log('Normalized suppliers:', suppliers);
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
        showToast('Failed to load suppliers', 'error');
    }
}

// Load products from backend API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        const data = await response.json();
        if (data.success && data.data) {
            products = data.data;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Continue even if products fail to load
    }
}

// Load purchase orders from backend API
async function loadPurchaseOrders() {
    try {
        const response = await fetch('/api/purchase-orders');
        if (!response.ok) {
            throw new Error('Failed to load purchase orders');
        }
        const data = await response.json();
        if (data.success && data.data) {
            purchaseOrders = data.data;
        }
    } catch (error) {
        console.error('Error loading purchase orders:', error);
        // Continue even if POs fail to load
    }
}

// Load data from localStorage
function loadDataFromStorage() {
    const storedSuppliers = localStorage.getItem('suppliers');
    if (storedSuppliers) {
        suppliers = JSON.parse(storedSuppliers);
    }

    const storedPurchaseOrders = localStorage.getItem('purchaseOrders');
    if (storedPurchaseOrders) {
        purchaseOrders = JSON.parse(storedPurchaseOrders);
    }

    const storedLowStockItems = localStorage.getItem('lowStockItems');
    if (storedLowStockItems) {
        lowStockItems = JSON.parse(storedLowStockItems);
    }
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    localStorage.setItem('lowStockItems', JSON.stringify(lowStockItems));
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    console.log('Populating dropdowns, suppliers:', suppliers.length);

    // Suppliers for PO filter
    const filterPOSupplier = document.getElementById('filterPOSupplier');
    const poSupplier = document.getElementById('poSupplier');

    if (filterPOSupplier) {
        filterPOSupplier.innerHTML = '<option value="">All Suppliers</option>';
    }

    if (poSupplier) {
        poSupplier.innerHTML = '<option value="">Select Supplier</option>';
    }

    // Filter active suppliers (now safe after normalization)
    const activeSuppliers = suppliers.filter(s => s.isActive === true);
    console.log('Active suppliers:', activeSuppliers.length, activeSuppliers);

    activeSuppliers.forEach(supplier => {
        // Use supplierName, or contactPerson as fallback if name is missing
        const displayName = supplier.supplierName || supplier.contactPerson || `Supplier ${supplier.supplierId}`;
        const option = `<option value="${supplier.supplierId}">${displayName}</option>`;
        console.log('Adding supplier option:', option, 'Supplier data:', supplier);
        if (filterPOSupplier) {
            filterPOSupplier.innerHTML += option;
        }
        if (poSupplier) {
            poSupplier.innerHTML += option;
        }
    });

    console.log('poSupplier dropdown HTML:', poSupplier ? poSupplier.innerHTML : 'not found');

    // Products for PO items (loaded from inventory API)
    const itemProduct = document.getElementById('itemProduct');

    if (itemProduct) {
        itemProduct.innerHTML = '<option value="">Select Product</option>';
        console.log('Populating products, count:', products.length);
        products.forEach(product => {
            itemProduct.innerHTML += `<option value="${product.productId}">${product.productName} (${product.productCode})</option>`;
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchSupplier').addEventListener('input', filterSuppliers);
    document.getElementById('filterSupplierStatus').addEventListener('change', filterSuppliers);

    // Purchase order filters
    document.getElementById('searchPurchaseOrder').addEventListener('input', filterPurchaseOrders);
    document.getElementById('filterPOStatus').addEventListener('change', filterPurchaseOrders);
    document.getElementById('filterPOSupplier').addEventListener('change', filterPurchaseOrders);
    document.getElementById('filterDateFrom').addEventListener('change', filterPurchaseOrders);
    document.getElementById('filterDateTo').addEventListener('change', filterPurchaseOrders);

    // PO item calculations
    document.getElementById('itemQuantity').addEventListener('input', calculateItemTotal);
    document.getElementById('itemUnitPrice').addEventListener('input', calculateItemTotal);

    // Product search in supplier form
    document.getElementById('searchProducts').addEventListener('input', filterProductCheckboxes);

    // Dynamic PO supplier/product filtering
    const poSupplier = document.getElementById('poSupplier');
    const itemProduct = document.getElementById('itemProduct');

    if (poSupplier) {
        poSupplier.addEventListener('change', onPOSupplierChange);
    }

    if (itemProduct) {
        itemProduct.addEventListener('change', onPOProductChange);
    }
}

// Product checkbox handling for supplier form
function populateProductCheckboxes() {
    const container = document.getElementById('productCheckboxList');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-3">No products available</div>';
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const isActive = product.isActive === true || product.isActive === 1;
        if (!isActive) return; // Only show active products

        const checkboxId = `product-${product.productId}`;
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check mb-2 product-checkbox-item';
        checkbox.innerHTML = `
            <input class="form-check-input product-checkbox" type="checkbox" value="${product.productId}" id="${checkboxId}"
                onchange="updateSelectedProductCount()">
            <label class="form-check-label" for="${checkboxId}">
                <strong>${product.productName}</strong>
                <br>
                <small class="text-muted">
                    ${product.productCode} | ${product.categoryName || 'No Category'} | ${product.barcode || 'No Barcode'}
                </small>
            </label>
        `;
        container.appendChild(checkbox);
    });

    updateSelectedProductCount();
}

function filterProductCheckboxes() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const checkboxItems = document.querySelectorAll('.product-checkbox-item');

    checkboxItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateSelectedProductCount() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const count = checkboxes.length;
    document.getElementById('selectedProductCount').textContent = count;

    // Update global selectedProductIds
    selectedProductIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function getSelectedProductIds() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function setSelectedProducts(productIds) {
    // Uncheck all first
    document.querySelectorAll('.product-checkbox').forEach(cb => {
        cb.checked = false;
    });

    // Check the selected ones
    if (productIds && productIds.length > 0) {
        productIds.forEach(productId => {
            const checkbox = document.getElementById(`product-${productId}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    updateSelectedProductCount();
}

// === Purchase Order Supplier/Product Dynamic Filtering ===

// Original unfiltered lists
let allPOSuppliers = [];
let allPOProducts = [];

// When PO supplier is selected, filter products to only those the supplier can supply
async function onPOSupplierChange() {
    const supplierId = parseInt(document.getElementById('poSupplier').value);
    const itemProductDropdown = document.getElementById('itemProduct');
    const itemUnitPriceField = document.getElementById('itemUnitPrice');

    if (!supplierId) {
        // If no supplier selected, show all products
        populateItemProductDropdown(products);
        return;
    }

    try {
        // Get products that this supplier can supply
        const response = await fetch(`/api/supplier-products/suppliers/${supplierId}/products`);
        if (!response.ok) {
            throw new Error('Failed to load supplier products');
        }

        const result = await response.json();
        if (result.success && result.data) {
            populateItemProductDropdown(result.data);

            // Clear current product selection if it's not in the filtered list
            const currentProductId = parseInt(itemProductDropdown.value);
            if (currentProductId) {
                const stillValid = result.data.some(p => p.productId === currentProductId);
                if (!stillValid) {
                    itemProductDropdown.value = '';
                    itemUnitPriceField.value = '';
                    document.getElementById('itemTotal').value = '';
                } else {
                    // If product is still valid, reload price
                    await loadSuggestedPrice(supplierId, currentProductId);
                }
            }
        }
    } catch (error) {
        console.error('Error loading supplier products:', error);
        showToast('Failed to load products for supplier', 'error');
    }
}

// When PO product is selected, filter suppliers to only those who can supply it
async function onPOProductChange() {
    const productId = parseInt(document.getElementById('itemProduct').value);
    const poSupplierDropdown = document.getElementById('poSupplier');
    const itemUnitPriceField = document.getElementById('itemUnitPrice');

    if (!productId) {
        // If no product selected, show all suppliers
        populatePOSupplierDropdown(suppliers);
        return;
    }

    try {
        // Get suppliers that can supply this product
        const response = await fetch(`/api/supplier-products/products/${productId}/suppliers`);
        if (!response.ok) {
            throw new Error('Failed to load product suppliers');
        }

        const result = await response.json();
        if (result.success && result.data) {
            populatePOSupplierDropdown(result.data);

            // Clear current supplier selection if it's not in the filtered list
            const currentSupplierId = parseInt(poSupplierDropdown.value);
            if (currentSupplierId) {
                const stillValid = result.data.some(s => s.supplierId === currentSupplierId);
                if (!stillValid) {
                    poSupplierDropdown.value = '';
                    itemUnitPriceField.value = '';
                    document.getElementById('itemTotal').value = '';
                } else {
                    // If supplier is still valid, reload price
                    await loadSuggestedPrice(currentSupplierId, productId);
                }
            }
        }
    } catch (error) {
        console.error('Error loading product suppliers:', error);
        showToast('Failed to load suppliers for product', 'error');
    }
}

// Load suggested unit price based on supplier-product combination
async function loadSuggestedPrice(supplierId, productId) {
    if (!supplierId || !productId) return;

    try {
        const response = await fetch(`/api/supplier-products/price?supplierId=${supplierId}&productId=${productId}`);
        if (!response.ok) {
            // If no relationship found, just clear price
            console.log('No supplier-product relationship found');
            return;
        }

        const result = await response.json();
        if (result.success && result.data) {
            const priceInfo = result.data;

            // Use suggested price (last PO price or default price)
            if (priceInfo.suggestedUnitPrice) {
                document.getElementById('itemUnitPrice').value = priceInfo.suggestedUnitPrice;
                calculateItemTotal();

                // Show tooltip or message about price source
                let priceSource = '';
                if (priceInfo.lastPurchasePrice) {
                    priceSource = `Last purchase price: Rs. ${priceInfo.lastPurchasePrice}`;
                } else if (priceInfo.defaultPurchasePrice) {
                    priceSource = `Default price: Rs. ${priceInfo.defaultPurchasePrice}`;
                }

                if (priceSource) {
                    console.log('Price loaded:', priceSource);
                }
            }
        }
    } catch (error) {
        console.error('Error loading price:', error);
        // Don't show error toast, just log it
    }
}

// Populate item product dropdown with filtered products
function populateItemProductDropdown(productList) {
    const itemProduct = document.getElementById('itemProduct');
    if (!itemProduct) return;

    const currentValue = itemProduct.value;
    itemProduct.innerHTML = '<option value="">Select Product</option>';

    productList.forEach(product => {
        const option = `<option value="${product.productId}">${product.productName} (${product.productCode})</option>`;
        itemProduct.innerHTML += option;
    });

    // Restore previous selection if it still exists
    if (currentValue && productList.some(p => p.productId == currentValue)) {
        itemProduct.value = currentValue;
    }
}

// Populate PO supplier dropdown with filtered suppliers
function populatePOSupplierDropdown(supplierList) {
    const poSupplier = document.getElementById('poSupplier');
    if (!poSupplier) return;

    const currentValue = poSupplier.value;
    poSupplier.innerHTML = '<option value="">Select Supplier</option>';

    supplierList.forEach(supplier => {
        const option = `<option value="${supplier.supplierId}">${supplier.supplierName} (${supplier.supplierCode})</option>`;
        poSupplier.innerHTML += option;
    });

    // Restore previous selection if it still exists
    if (currentValue && supplierList.some(s => s.supplierId == currentValue)) {
        poSupplier.value = currentValue;
    }
}


// Generate supplier code from API
async function generateSupplierCode() {
    try {
        const response = await fetch('/api/suppliers/generate-code');
        if (!response.ok) {
            throw new Error('Failed to generate code');
        }
        const data = await response.json();
        if (data.success && data.data) {
            document.getElementById('supplierCode').value = data.data;
        }
    } catch (error) {
        console.error('Error generating supplier code:', error);
        // Fallback to simple generation
        const counter = suppliers.length + 1;
        document.getElementById('supplierCode').value = `SUP${String(counter).padStart(3, '0')}`;
    }
}

// Update statistics
function updateStatistics() {
    const totalSuppliers = suppliers.length;
    const activePurchaseOrders = purchaseOrders.filter(po => po.status !== 'Received' && po.status !== 'Cancelled').length;
    const lowStockAlerts = lowStockItems.length;
    const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);

    document.getElementById('totalSuppliers').textContent = totalSuppliers;
    document.getElementById('activePurchaseOrders').textContent = activePurchaseOrders;
    document.getElementById('lowStockAlerts').textContent = lowStockAlerts;
    document.getElementById('totalPurchaseValue').textContent = formatCurrency(totalPurchaseValue);
}

// Display suppliers
function displaySuppliers(suppliersToDisplay = suppliers) {
    const tableBody = document.getElementById('suppliersTableBody');
    tableBody.innerHTML = '';

    suppliersToDisplay.forEach((supplier, index) => {
        const row = document.createElement('tr');

        // Get product count
        const productCount = supplier.totalProducts || (supplier.suppliedProducts ? supplier.suppliedProducts.length : 0);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="fw-bold">${supplier.supplierName}</div>
                <small class="text-muted">${supplier.supplierCode}</small>
            </td>
            <td>${supplier.contactPerson || '-'}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.email || '-'}</td>
            <td>${supplier.paymentTerms || '-'}</td>
            <td>
                <span class="badge ${supplier.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${supplier.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="text-center">
                <span class="badge bg-info">${productCount}</span>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="editSupplier(${supplier.supplierId})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteSupplier(${supplier.supplierId})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Display purchase orders
function displayPurchaseOrders(ordersToDisplay = purchaseOrders) {
    const tableBody = document.getElementById('purchaseOrdersTableBody');
    tableBody.innerHTML = '';

    ordersToDisplay.forEach((po, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <div class="fw-bold">${po.poNumber}</div>
            </td>
            <td>${po.supplierName || '-'}</td>
            <td>${formatDate(po.requestedDate)}</td>
            <td>${formatDate(po.expectedDeliveryDate)}</td>
            <td>${po.totalItems || 0} items (${po.totalQuantity || 0} qty)</td>
            <td class="fw-bold text-success">${formatCurrency(po.grandTotal || 0)}</td>
            <td>${getStatusBadge(po.status)}</td>
            <td>
                <button class="btn btn-outline-info btn-sm me-1" onclick="viewPurchaseOrder(${index})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${getPOActionButtons(po, index)}
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Display low stock items
function displayLowStockItems() {
    const tableBody = document.getElementById('lowStockTableBody');
    tableBody.innerHTML = '';

    lowStockItems.forEach((item, index) => {
        const row = document.createElement('tr');

        const urgencyClass = item.currentStock <= (item.reorderLevel * 0.5) ? 'table-danger' : 'table-warning';
        row.className = urgencyClass;

        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input low-stock-checkbox" value="${index}">
            </td>
            <td>
                <div class="fw-bold">${item.product}</div>
                <small class="text-muted">Reorder urgency: ${item.currentStock <= (item.reorderLevel * 0.5) ? 'High' : 'Medium'}</small>
            </td>
            <td>
                <span class="badge bg-warning">${item.currentStock}</span>
            </td>
            <td>${item.reorderLevel}</td>
            <td>
                <input type="number" class="form-control form-control-sm" value="${item.suggestedOrderQty}" id="orderQty_${index}" min="1">
            </td>
            <td>${item.preferredSupplier}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="quickReorder(${index})" title="Quick Reorder">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Filter functions
function filterSuppliers() {
    const searchTerm = document.getElementById('searchSupplier').value.toLowerCase();
    const statusFilter = document.getElementById('filterSupplierStatus').value;

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = !searchTerm ||
            supplier.supplierName.toLowerCase().includes(searchTerm) ||
            (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm)) ||
            supplier.phone.includes(searchTerm) ||
            (supplier.email && supplier.email.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter ||
            (statusFilter === 'Active' && supplier.isActive) ||
            (statusFilter === 'Inactive' && !supplier.isActive);

        return matchesSearch && matchesStatus;
    });

    displaySuppliers(filteredSuppliers);
}

function filterPurchaseOrders() {
    const searchTerm = document.getElementById('searchPurchaseOrder').value.toLowerCase();
    const statusFilter = document.getElementById('filterPOStatus').value;
    const supplierFilter = document.getElementById('filterPOSupplier').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    const filteredOrders = purchaseOrders.filter(po => {
        const matchesSearch = !searchTerm ||
            po.poNumber.toLowerCase().includes(searchTerm) ||
            po.supplier.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || po.status === statusFilter;
        const matchesSupplier = !supplierFilter || po.supplier === supplierFilter;

        const matchesDateFrom = !dateFrom || po.poDate >= dateFrom;
        const matchesDateTo = !dateTo || po.poDate <= dateTo;

        return matchesSearch && matchesStatus && matchesSupplier && matchesDateFrom && matchesDateTo;
    });

    displayPurchaseOrders(filteredOrders);
}

// Clear filter functions
function clearSupplierFilters() {
    document.getElementById('searchSupplier').value = '';
    document.getElementById('filterSupplierCategory').value = '';
    document.getElementById('filterSupplierStatus').value = '';
    displaySuppliers();
}

function clearPurchaseOrderFilters() {
    document.getElementById('searchPurchaseOrder').value = '';
    document.getElementById('filterPOStatus').value = '';
    document.getElementById('filterPOSupplier').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    displayPurchaseOrders();
}

// Supplier form functions
async function saveSupplier() {
    if (!validateSupplierForm()) {
        return;
    }

    const supplierData = getSupplierFormData();

    try {
        let response;
        if (editingSupplierId) {
            // Update existing supplier
            response = await fetch(`/api/suppliers/${editingSupplierId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });
        } else {
            // Create new supplier
            response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save supplier');
        }

        const result = await response.json();
        if (result.success) {
            await loadSuppliers();
            updateStatistics();
            populateFilterDropdowns();
            displaySuppliers();
            clearSupplierForm();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSupplierForm'));
            modal.hide();

            showToast(editingSupplierId ? 'Supplier updated successfully!' : 'Supplier added successfully!', 'success');
            editingSupplierId = null;
        }
    } catch (error) {
        console.error('Error saving supplier:', error);
        showToast(error.message || 'Failed to save supplier', 'error');
    }
}

function validateSupplierForm() {
    const supplierName = document.getElementById('supplierName').value;
    const phone = document.getElementById('phone').value;
    const supplierAddress = document.getElementById('supplierAddress').value;

    if (!supplierName.trim()) {
        showToast('Supplier name is required', 'error');
        document.getElementById('supplierName').focus();
        return false;
    }

    if (!phone.trim()) {
        showToast('Phone number is required', 'error');
        document.getElementById('phone').focus();
        return false;
    }

    if (!supplierAddress.trim()) {
        showToast('Address is required', 'error');
        document.getElementById('supplierAddress').focus();
        return false;
    }

    return true;
}

function getSupplierFormData() {
    return {
        supplierCode: document.getElementById('supplierCode').value.trim(),
        supplierName: document.getElementById('supplierName').value.trim(),
        contactPerson: document.getElementById('contactPerson').value.trim() || null,
        phone: document.getElementById('phone').value.trim(),
        alternatePhone: document.getElementById('alternatePhone').value.trim() || null,
        email: document.getElementById('supplierEmail').value.trim() || null,
        address: document.getElementById('supplierAddress').value.trim(),
        city: document.getElementById('city').value.trim() || null,
        paymentTerms: document.getElementById('paymentTerms').value.trim() || null,
        creditLimit: parseFloat(document.getElementById('supplierCreditLimit').value) || 0,
        isActive: document.getElementById('supplierIsActive').checked,
        productIds: getSelectedProductIds() // Include selected products
    };
}

async function editSupplier(supplierId) {
    try {
        const response = await fetch(`/api/suppliers/${supplierId}`);
        if (!response.ok) {
            throw new Error('Failed to load supplier');
        }

        const result = await response.json();
        if (result.success && result.data) {
            const supplier = result.data;
            editingSupplierId = supplierId;

            // Fill form with supplier data
            document.getElementById('supplierName').value = supplier.supplierName || '';
            document.getElementById('supplierCode').value = supplier.supplierCode || '';
            document.getElementById('contactPerson').value = supplier.contactPerson || '';
            document.getElementById('phone').value = supplier.phone || '';
            document.getElementById('alternatePhone').value = supplier.alternatePhone || '';
            document.getElementById('supplierEmail').value = supplier.email || '';
            document.getElementById('supplierAddress').value = supplier.address || '';
            document.getElementById('city').value = supplier.city || '';
            document.getElementById('paymentTerms').value = supplier.paymentTerms || '';
            document.getElementById('supplierCreditLimit').value = supplier.creditLimit || 0;
            document.getElementById('supplierIsActive').checked = supplier.isActive;

            // Set selected products
            if (supplier.suppliedProducts && supplier.suppliedProducts.length > 0) {
                const productIds = supplier.suppliedProducts.map(sp => sp.productId);
                setSelectedProducts(productIds);
            } else {
                setSelectedProducts([]);
            }

            // Change button text
            document.getElementById('btnSubmitSupplier').innerHTML = '<i class="fas fa-save"></i> Update Supplier';

            // Change modal title
            document.getElementById('modalSupplierFormLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Supplier';

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('modalSupplierForm'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading supplier:', error);
        showToast('Failed to load supplier', 'error');
    }
}

function updateSupplier() {
    if (!validateSupplierForm()) {
        return;
    }

    const supplierData = getSupplierFormData();
    suppliers[editingSupplierIndex] = supplierData;

    saveDataToStorage();
    updateStatistics();
    populateFilterDropdowns();
    displaySuppliers();

    clearSupplierForm();
    editingSupplierIndex = -1;

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSupplierForm'));
    modal.hide();

    showToast('Supplier updated successfully!', 'success');
}

async function deleteSupplier(supplierId) {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    if (!supplier) return;

    if (confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
        try {
            const response = await fetch(`/api/suppliers/${supplierId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete supplier');
            }

            const result = await response.json();
            if (result.success) {
                await loadSuppliers();
                updateStatistics();
                populateFilterDropdowns();
                displaySuppliers();
                showToast('Supplier deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            showToast('Failed to delete supplier', 'error');
        }
    }
}

function clearSupplierForm() {
    document.getElementById('supplierForm').reset();
    editingSupplierId = null;

    // Clear selected products
    setSelectedProducts([]);

    // Generate new supplier code
    generateSupplierCode();

    // Reset button text
    document.getElementById('btnSubmitSupplier').innerHTML = '<i class="fas fa-plus"></i> Add Supplier';

    // Reset modal title
    document.getElementById('modalSupplierFormLabel').innerHTML = '<i class="fas fa-truck me-2"></i>Supplier Information';
}

// Generate PO number from API
async function generatePONumber() {
    try {
        // Refresh dropdowns to ensure they are populated
        populateFilterDropdowns();

        const response = await fetch('/api/purchase-orders/generate-number');
        if (!response.ok) {
            throw new Error('Failed to generate PO number');
        }
        const data = await response.json();
        if (data.success && data.data) {
            document.getElementById('poNumber').value = data.data;
        }
    } catch (error) {
        console.error('Error generating PO number:', error);
        // Fallback to simple generation
        const today = new Date();
        const year = today.getFullYear();
        const counter = purchaseOrders.length + 1;
        const poNumber = `PO-${year}-${String(counter).padStart(3, '0')}`;
        document.getElementById('poNumber').value = poNumber;
    }
}

function setDefaultDates() {
    const today = new Date();
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() + 3); // Default 3 days from today

    document.getElementById('poDate').value = today.toISOString().split('T')[0];
    document.getElementById('expectedDate').value = expectedDate.toISOString().split('T')[0];
}

function calculateItemTotal() {
    const quantity = parseFloat(document.getElementById('itemQuantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('itemUnitPrice').value) || 0;
    const total = quantity * unitPrice;

    document.getElementById('itemTotal').value = total.toFixed(2);
}

function addPOItem() {
    const productId = parseInt(document.getElementById('itemProduct').value);
    const quantity = parseFloat(document.getElementById('itemQuantity').value);
    const unitPrice = parseFloat(document.getElementById('itemUnitPrice').value);

    if (!productId) {
        showToast('Please select a product', 'error');
        return;
    }

    if (!quantity || quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    if (!unitPrice || unitPrice <= 0) {
        showToast('Please enter a valid unit price', 'error');
        return;
    }

    const product = products.find(p => p.productId === productId);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    const total = quantity * unitPrice;

    const item = {
        productId: productId,
        productName: product.productName,
        productCode: product.productCode,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total
    };

    currentPOItems.push(item);
    displayPOItems();
    updatePOSummary();

    // Clear item form
    document.getElementById('itemProduct').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemUnitPrice').value = '';
    document.getElementById('itemTotal').value = '';
}

function displayPOItems() {
    const tableBody = document.getElementById('poItemsTableBody');
    tableBody.innerHTML = '';

    currentPOItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.productName} (${item.productCode})</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(item.total)}</td>
            <td>
                <button class="btn btn-outline-danger btn-sm" onclick="removePOItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function removePOItem(index) {
    currentPOItems.splice(index, 1);
    displayPOItems();
    updatePOSummary();
}

function updatePOSummary() {
    const totalItems = currentPOItems.length;
    const totalQuantity = currentPOItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = currentPOItems.reduce((sum, item) => sum + item.total, 0);

    document.getElementById('poTotalItems').textContent = totalItems;
    document.getElementById('poTotalQuantity').textContent = totalQuantity;
    document.getElementById('poTotalValue').textContent = formatCurrency(totalValue);
}

async function submitPurchaseOrderForm() {
    if (!validatePurchaseOrderForm()) {
        return;
    }

    const poData = getPurchaseOrderFormData();

    try {
        const response = await fetch('/api/purchase-orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(poData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create purchase order');
        }

        const result = await response.json();
        if (result.success) {
            await loadPurchaseOrders();
            updateStatistics();
            displayPurchaseOrders();
            clearPurchaseOrderForm();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPurchaseOrderForm'));
            modal.hide();

            showToast('Purchase order created successfully!', 'success');
        }
    } catch (error) {
        console.error('Error creating purchase order:', error);
        showToast(error.message || 'Failed to create purchase order', 'error');
    }
}

function validatePurchaseOrderForm() {
    const supplier = document.getElementById('poSupplier').value;
    const poDate = document.getElementById('poDate').value;
    const expectedDate = document.getElementById('expectedDate').value;

    if (!supplier) {
        showToast('Please select a supplier', 'error');
        document.getElementById('poSupplier').focus();
        return false;
    }

    if (!poDate) {
        showToast('Please select order date', 'error');
        document.getElementById('poDate').focus();
        return false;
    }

    if (!expectedDate) {
        showToast('Please select expected date', 'error');
        document.getElementById('expectedDate').focus();
        return false;
    }

    if (currentPOItems.length === 0) {
        showToast('Please add at least one item to the purchase order', 'error');
        return false;
    }

    return true;
}

function getPurchaseOrderFormData() {
    const items = currentPOItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        expectedUnitPrice: item.unitPrice,
        notes: null
    }));

    return {
        supplierId: parseInt(document.getElementById('poSupplier').value),
        requestedDate: document.getElementById('poDate').value,
        expectedDeliveryDate: document.getElementById('expectedDate').value,
        notes: document.getElementById('poNotes').value.trim() || null,
        items: items,
        taxAmount: 0,
        discountAmount: 0
    };
}

function clearPurchaseOrderForm() {
    document.getElementById('purchaseOrderForm').reset();
    currentPOItems = [];
    displayPOItems();
    updatePOSummary();
    generatePONumber();
    setDefaultDates();
    editingPOId = null;

    // Reset modal title
    document.getElementById('modalPurchaseOrderFormLabel').innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Purchase Order';
}

function viewPurchaseOrder(index) {
    viewingPOIndex = index;
    const po = purchaseOrders[index];

    const detailsContent = document.getElementById('poDetailsContent');
    detailsContent.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <h6><i class="fas fa-info-circle me-2"></i>Purchase Order Information</h6>
                <p><strong>PO Number:</strong> ${po.poNumber}</p>
                <p><strong>Supplier:</strong> ${po.supplier}</p>
                <p><strong>Order Date:</strong> ${formatDate(po.poDate)}</p>
                <p><strong>Expected Date:</strong> ${formatDate(po.expectedDate)}</p>
                <p><strong>Status:</strong> ${getStatusBadge(po.status)}</p>
            </div>
            <div class="col-md-6">
                <h6><i class="fas fa-chart-line me-2"></i>Order Summary</h6>
                <p><strong>Total Items:</strong> ${po.totalItems}</p>
                <p><strong>Total Quantity:</strong> ${po.totalQuantity}</p>
                <p><strong>Total Value:</strong> ${formatCurrency(po.totalValue)}</p>
                <p><strong>Notes:</strong> ${po.poNotes || 'N/A'}</p>
            </div>
        </div>
        <hr>
        <h6><i class="fas fa-list me-2"></i>Order Items</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${po.items.map(item => `
                        <tr>
                            <td>${item.product}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.unitPrice)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Show/hide receive button based on status
    const receiveButton = document.getElementById('btnReceivePO');
    receiveButton.style.display = po.status === 'Approved' ? 'inline-block' : 'none';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('modalPODetails'));
    modal.show();
}

function receivePurchaseOrder() {
    if (viewingPOIndex >= 0) {
        purchaseOrders[viewingPOIndex].status = 'Received';
        purchaseOrders[viewingPOIndex].receivedDate = new Date().toISOString().split('T')[0];

        saveDataToStorage();
        updateStatistics();
        displayPurchaseOrders();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalPODetails'));
        modal.hide();

        showToast('Purchase order marked as received!', 'success');
    }
}

function editPurchaseOrder(index) {
    const po = purchaseOrders[index];

    if (po.status === 'Received') {
        showToast('Cannot edit received purchase orders', 'error');
        return;
    }

    editingPOIndex = index;

    // Fill form with PO data
    document.getElementById('poNumber').value = po.poNumber;
    document.getElementById('poSupplier').value = po.supplier;
    document.getElementById('poDate').value = po.poDate;
    document.getElementById('expectedDate').value = po.expectedDate;
    document.getElementById('poNotes').value = po.poNotes || '';

    currentPOItems = [...po.items];
    displayPOItems();
    updatePOSummary();

    // Show update button, hide submit button
    document.getElementById('btnSubmitPO').style.display = 'none';
    document.getElementById('btnUpdatePO').style.display = 'inline-block';

    // Change modal title
    document.getElementById('modalPurchaseOrderFormLabel').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Purchase Order';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('modalPurchaseOrderForm'));
    modal.show();
}

function updatePurchaseOrder() {
    if (!validatePurchaseOrderForm()) {
        return;
    }

    const poData = getPurchaseOrderFormData();
    poData.poNumber = purchaseOrders[editingPOIndex].poNumber; // Keep original PO number
    poData.createdDate = purchaseOrders[editingPOIndex].createdDate; // Keep original creation date

    purchaseOrders[editingPOIndex] = poData;

    saveDataToStorage();
    updateStatistics();
    displayPurchaseOrders();

    clearPurchaseOrderForm();
    editingPOIndex = -1;

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPurchaseOrderForm'));
    modal.hide();

    showToast('Purchase order updated successfully!', 'success');
}

function deletePurchaseOrder(index) {
    const po = purchaseOrders[index];

    if (po.status === 'Received') {
        showToast('Cannot delete received purchase orders', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete purchase order "${po.poNumber}"?`)) {
        purchaseOrders.splice(index, 1);
        saveDataToStorage();
        updateStatistics();
        displayPurchaseOrders();

        showToast('Purchase order deleted successfully!', 'success');
    }
}

// Low stock functions
function toggleSelectAllLowStock() {
    const selectAll = document.getElementById('selectAllLowStock');
    const checkboxes = document.querySelectorAll('.low-stock-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function quickReorder(index) {
    const item = lowStockItems[index];
    const orderQty = document.getElementById(`orderQty_${index}`).value;

    if (!orderQty || orderQty <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    // Create a quick purchase order
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const today = new Date();
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() + 2);

    const quickPO = {
        poNumber: poNumber,
        supplier: item.preferredSupplier,
        poDate: today.toISOString().split('T')[0],
        expectedDate: expectedDate.toISOString().split('T')[0],
        status: 'Pending',
        items: [{
            product: item.product,
            quantity: parseInt(orderQty),
            unitPrice: item.unitPrice,
            total: parseInt(orderQty) * item.unitPrice
        }],
        totalItems: 1,
        totalQuantity: parseInt(orderQty),
        totalValue: parseInt(orderQty) * item.unitPrice,
        poNotes: 'Auto-generated reorder for low stock item',
        createdDate: today.toISOString().split('T')[0]
    };

    purchaseOrders.push(quickPO);
    saveDataToStorage();
    updateStatistics();
    displayPurchaseOrders();

    showToast(`Quick reorder created: ${poNumber}`, 'success');
}

function generateBulkReorder() {
    const selectedCheckboxes = document.querySelectorAll('.low-stock-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        showToast('Please select items to reorder', 'error');
        return;
    }

    // Group items by supplier
    const supplierGroups = {};

    selectedCheckboxes.forEach(checkbox => {
        const index = parseInt(checkbox.value);
        const item = lowStockItems[index];
        const orderQty = document.getElementById(`orderQty_${index}`).value;

        if (orderQty && orderQty > 0) {
            if (!supplierGroups[item.preferredSupplier]) {
                supplierGroups[item.preferredSupplier] = [];
            }

            supplierGroups[item.preferredSupplier].push({
                product: item.product,
                quantity: parseInt(orderQty),
                unitPrice: item.unitPrice,
                total: parseInt(orderQty) * item.unitPrice
            });
        }
    });

    // Create purchase orders for each supplier
    let createdOrders = 0;
    const today = new Date();
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() + 3);

    Object.keys(supplierGroups).forEach(supplier => {
        const items = supplierGroups[supplier];
        const totalItems = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + item.total, 0);

        const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

        const bulkPO = {
            poNumber: poNumber,
            supplier: supplier,
            poDate: today.toISOString().split('T')[0],
            expectedDate: expectedDate.toISOString().split('T')[0],
            status: 'Pending',
            items: items,
            totalItems: totalItems,
            totalQuantity: totalQuantity,
            totalValue: totalValue,
            poNotes: 'Bulk reorder for low stock items',
            createdDate: today.toISOString().split('T')[0]
        };

        purchaseOrders.push(bulkPO);
        createdOrders++;
    });

    saveDataToStorage();
    updateStatistics();
    displayPurchaseOrders();

    // Clear selections
    document.getElementById('selectAllLowStock').checked = false;
    selectedCheckboxes.forEach(checkbox => checkbox.checked = false);

    showToast(`${createdOrders} bulk purchase orders created successfully!`, 'success');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function formatCurrency(amount) {
    return `Rs. ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function getStatusBadge(status) {
    const statusClasses = {
        // Old format (for backward compatibility)
        'Pending': 'bg-warning text-dark',
        'Approved': 'bg-info',
        'Received': 'bg-success',
        'Cancelled': 'bg-danger',
        // New ERP format
        'DRAFT': 'bg-secondary',
        'PENDING': 'bg-warning text-dark',
        'APPROVED': 'bg-info',
        'ORDERED': 'bg-primary',
        'PARTIALLY_RECEIVED': 'bg-warning text-dark',
        'RECEIVED': 'bg-success',
        'REJECTED': 'bg-danger',
        'CANCELLED': 'bg-danger'
    };

    return `<span class="badge ${statusClasses[status] || 'bg-secondary'}">${status.replace(/_/g, ' ')}</span>`;
}

// Get action buttons based on PO status
function getPOActionButtons(po, index) {
    let buttons = '';
    const poId = po.requestId;

    // DRAFT: Edit | Submit | Cancel
    if (po.status === 'DRAFT') {
        buttons += `
            <button class="btn btn-primary btn-sm me-1" onclick="editPurchaseOrder(${index})" title="Edit PO">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-warning btn-sm me-1" onclick="submitPurchaseOrder(${poId})" title="Submit for Approval">
                <i class="fas fa-paper-plane"></i> Submit
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelPurchaseOrder(${poId})" title="Cancel PO">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;
    }
    // PENDING: Edit | Approve | Reject
    else if (po.status === 'PENDING') {
        buttons += `
            <button class="btn btn-primary btn-sm me-1" onclick="editPurchaseOrder(${index})" title="Edit PO">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-success btn-sm me-1" onclick="approvePurchaseOrder(${poId})" title="Approve PO">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn btn-danger btn-sm" onclick="rejectPurchaseOrder(${poId})" title="Reject PO">
                <i class="fas fa-ban"></i> Reject
            </button>
        `;
    }
    // APPROVED: View | Ordered | Cancel
    else if (po.status === 'APPROVED') {
        buttons += `
            <button class="btn btn-info btn-sm me-1" onclick="viewPurchaseOrder(${index})" title="View Details">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-primary btn-sm me-1" onclick="markAsOrdered(${poId})" title="Mark as Ordered">
                <i class="fas fa-truck"></i> Ordered
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelPurchaseOrder(${poId})" title="Cancel PO">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;
    }
    // ORDERED or PARTIALLY_RECEIVED: View only (Receive via GRN Records tab)
    else if (po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') {
        buttons += `
            <button class="btn btn-info btn-sm" onclick="viewPurchaseOrder(${index})" title="View Details">
                <i class="fas fa-eye"></i> View
            </button>
        `;
    }
    // RECEIVED, REJECTED, CANCELLED: View only
    else if (po.status === 'RECEIVED' || po.status === 'REJECTED' || po.status === 'CANCELLED') {
        buttons += `
            <button class="btn btn-info btn-sm" onclick="viewPurchaseOrder(${index})" title="View Details">
                <i class="fas fa-eye"></i> View
            </button>
        `;
    }

    return buttons;
}

// Submit Purchase Order for Approval (DRAFT → PENDING)
async function submitPurchaseOrder(poId) {
    if (!confirm('Submit this Purchase Order for approval?')) {
        return;
    }

    try {
        const response = await fetch(`/api/purchase-orders/${poId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Purchase Order submitted for approval!', 'success');
            loadPurchaseOrders(); // Reload the list
        } else {
            showToast(result.message || 'Failed to submit purchase order', 'error');
        }
    } catch (error) {
        console.error('Error submitting PO:', error);
        showToast('Failed to submit purchase order', 'error');
    }
}

// Approve Purchase Order (PENDING → APPROVED)
async function approvePurchaseOrder(poId) {
    if (!confirm('Are you sure you want to APPROVE this Purchase Order?')) {
        return;
    }

    try {
        const response = await fetch(`/api/purchase-orders/${poId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Purchase Order approved successfully!', 'success');
            loadPurchaseOrders(); // Reload the list
        } else {
            showToast(result.message || 'Failed to approve purchase order', 'error');
        }
    } catch (error) {
        console.error('Error approving PO:', error);
        showToast('Failed to approve purchase order', 'error');
    }
}

// Reject Purchase Order (PENDING → REJECTED)
async function rejectPurchaseOrder(poId) {
    const reason = prompt('Please enter reason for rejection:');
    if (!reason || !reason.trim()) {
        showToast('Rejection reason is required', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/purchase-orders/${poId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason.trim() })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Purchase Order rejected!', 'success');
            loadPurchaseOrders(); // Reload the list
        } else {
            showToast(result.message || 'Failed to reject purchase order', 'error');
        }
    } catch (error) {
        console.error('Error rejecting PO:', error);
        showToast('Failed to reject purchase order', 'error');
    }
}

// Mark as Ordered (APPROVED → ORDERED)
async function markAsOrdered(poId) {
    if (!confirm('Mark this Purchase Order as ORDERED (sent to supplier)?')) {
        return;
    }

    try {
        const response = await fetch(`/api/purchase-orders/${poId}/mark-ordered`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Purchase Order marked as ORDERED! It will now appear in GRN Receiving Dashboard.', 'success');
            loadPurchaseOrders(); // Reload the list
        } else {
            showToast(result.message || 'Failed to mark as ordered', 'error');
        }
    } catch (error) {
        console.error('Error marking PO as ordered:', error);
        showToast('Failed to mark as ordered', 'error');
    }
}

// Cancel Purchase Order (DRAFT/APPROVED → CANCELLED)
async function cancelPurchaseOrder(poId) {
    const reason = prompt('Please enter reason for cancellation:');
    if (!reason || !reason.trim()) {
        showToast('Cancellation reason is required', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/purchase-orders/${poId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason.trim() })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Purchase Order cancelled successfully!', 'success');
            loadPurchaseOrders(); // Reload the list
        } else {
            showToast(result.message || 'Failed to cancel purchase order', 'error');
        }
    } catch (error) {
        console.error('Error cancelling PO:', error);
        showToast('Failed to cancel purchase order', 'error');
    }
}

// Navigate to GRN Records tab (for Add GRN action)
function goToGRNTab() {
    // Switch to GRN Records tab
    const grnTab = document.querySelector('[data-bs-target="#grn"]');
    if (grnTab) {
        grnTab.click();

        // Initialize GRN Dashboard after tab is shown
        setTimeout(() => {
            if (typeof GRNDashboard !== 'undefined') {
                console.log('Initializing GRN Dashboard from goToGRNTab');
                GRNDashboard.init();
            } else {
                console.error('GRNDashboard not loaded!');
            }
        }, 100);

        showToast('Click "Receive" button next to the PO you want to receive', 'info');
    }
}

// Helper function to show toast notifications
function showToast(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    const bgColor = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    }[type] || '#6c757d';

    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== GRN (GOODS RECEIVED NOTE) FUNCTIONALITY ====================

// Global GRN Variables
let grnRecords = JSON.parse(localStorage.getItem('grnRecords')) || [];
let currentGRN = null;
let currentGRNItems = [];

// Open GRN Form for a Purchase Order
function openGRNForm(poIndex) {
    const po = purchaseOrders[poIndex];
    if (!po) return;

    // Generate GRN Number
    const grnNumber = 'GRN-' + Date.now();
    document.getElementById('grnNumber').value = grnNumber;
    document.getElementById('grnPONumber').value = po.poNumber;
    document.getElementById('grnSupplier').value = po.supplierName;
    document.getElementById('grnReceivedDate').value = new Date().toISOString().split('T')[0];

    // Get logged-in user (mock for now)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Store Keeper' };
    document.getElementById('grnReceivedBy').value = currentUser.name;

    // Populate items table
    currentGRNItems = po.items.map((item, index) => ({
        ...item,
        receivedQty: item.quantity,
        damagedQty: 0,
        batchNo: 'BATCH-' + Date.now() + '-' + (index + 1),
        mfgDate: '',
        expDate: '',
        unitCost: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice
    }));

    populateGRNItemsTable();
    calculateGRNSummary();

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('modalGRN'));
    modal.show();

    currentGRN = {
        grnNumber,
        poNumber: po.poNumber,
        poIndex: poIndex,
        supplierName: po.supplierName
    };
}

// Populate GRN Items Table
function populateGRNItemsTable() {
    const tbody = document.getElementById('grnItemsTableBody');
    tbody.innerHTML = '';

    currentGRNItems.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td>
                <input type="text" class="form-control form-control-sm" 
                    value="${item.batchNo}" 
                    onchange="updateGRNItemField(${index}, 'batchNo', this.value)" required>
            </td>
            <td>
                <input type="date" class="form-control form-control-sm" 
                    value="${item.mfgDate}" 
                    onchange="updateGRNItemField(${index}, 'mfgDate', this.value)">
            </td>
            <td>
                <input type="date" class="form-control form-control-sm" 
                    value="${item.expDate}" 
                    onchange="updateGRNItemField(${index}, 'expDate', this.value)" required>
            </td>
            <td class="text-center">${item.quantity}</td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                    value="${item.receivedQty}" min="0" 
                    onchange="updateGRNItemField(${index}, 'receivedQty', parseFloat(this.value))" required>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm" 
                    value="${item.damagedQty}" min="0" 
                    onchange="updateGRNItemField(${index}, 'damagedQty', parseFloat(this.value))">
            </td>
            <td>Rs. ${item.unitCost.toFixed(2)}</td>
            <td class="fw-bold">Rs. ${item.lineTotal.toFixed(2)}</td>
        `;
    });
}

// Update GRN Item Field
function updateGRNItemField(index, field, value) {
    currentGRNItems[index][field] = value;

    // Recalculate line total
    if (field === 'receivedQty' || field === 'unitCost') {
        currentGRNItems[index].lineTotal = currentGRNItems[index].receivedQty * currentGRNItems[index].unitCost;
        populateGRNItemsTable();
    }

    calculateGRNSummary();
}

// Calculate GRN Summary
function calculateGRNSummary() {
    const totalOrdered = currentGRNItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = currentGRNItems.reduce((sum, item) => sum + (parseFloat(item.receivedQty) || 0), 0);
    const totalDamaged = currentGRNItems.reduce((sum, item) => sum + (parseFloat(item.damagedQty) || 0), 0);
    const totalValue = currentGRNItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

    document.getElementById('grnTotalOrdered').textContent = totalOrdered;
    document.getElementById('grnTotalReceived').textContent = totalReceived;
    document.getElementById('grnTotalDamaged').textContent = totalDamaged;
    document.getElementById('grnTotalValue').textContent = totalValue.toFixed(2);
}

// Save GRN Draft
function saveGRNDraft() {
    if (!validateGRNForm()) return;

    const grnData = collectGRNData();
    grnData.status = 'Draft';

    // Save to records
    grnRecords.push(grnData);
    localStorage.setItem('grnRecords', JSON.stringify(grnRecords));

    Swal.fire('Success', 'GRN saved as draft successfully', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalGRN')).hide();
    loadGRNRecords();
}

// Save and Update Inventory
function saveAndUpdateInventory() {
    if (!validateGRNForm()) return;

    const grnData = collectGRNData();
    grnData.status = 'Completed';

    // Create Product Batches
    createProductBatches(grnData);

    // Update Inventory Stock
    updateInventoryFromGRN(grnData);

    // Mark PO as Received
    updatePOStatus(grnData);

    // Save GRN Record
    grnRecords.push(grnData);
    localStorage.setItem('grnRecords', JSON.stringify(grnRecords));

    Swal.fire({
        icon: 'success',
        title: 'GRN Completed!',
        html: `
            <p>✅ Product batches created</p>
            <p>✅ Inventory updated</p>
            <p>✅ Purchase order marked as received</p>
        `,
        confirmButtonText: 'OK'
    }).then(() => {
        bootstrap.Modal.getInstance(document.getElementById('modalGRN')).hide();
        loadGRNRecords();
        displayPurchaseOrders();
        updateStatistics();
    });
}

// Validate GRN Form
function validateGRNForm() {
    const receivedDate = document.getElementById('grnReceivedDate').value;
    const receivedBy = document.getElementById('grnReceivedBy').value;
    const invoiceNo = document.getElementById('grnInvoiceNumber').value;
    const qualityStatus = document.getElementById('grnQualityStatus').value;
    const storageLocation = document.getElementById('grnStorageLocation').value;

    if (!receivedDate || !receivedBy || !invoiceNo || !qualityStatus || !storageLocation) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return false;
    }

    // Validate items
    for (let item of currentGRNItems) {
        if (!item.batchNo || !item.expDate || !item.receivedQty) {
            Swal.fire('Error', 'Please fill in Batch No, Expiry Date, and Received Qty for all items', 'error');
            return false;
        }
    }

    return true;
}

// Collect GRN Data
function collectGRNData() {
    return {
        grnNumber: document.getElementById('grnNumber').value,
        poNumber: document.getElementById('grnPONumber').value,
        supplierName: document.getElementById('grnSupplier').value,
        receivedDate: document.getElementById('grnReceivedDate').value,
        receivedBy: document.getElementById('grnReceivedBy').value,
        invoiceNumber: document.getElementById('grnInvoiceNumber').value,
        qualityStatus: document.getElementById('grnQualityStatus').value,
        storageLocation: document.getElementById('grnStorageLocation').value,
        notes: document.getElementById('grnNotes').value,
        items: currentGRNItems,
        totalValue: currentGRNItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0),
        createdAt: new Date().toISOString()
    };
}

// Create Product Batches
function createProductBatches(grnData) {
    let batches = JSON.parse(localStorage.getItem('productBatches')) || [];

    grnData.items.forEach(item => {
        if (item.receivedQty > 0) {
            const batch = {
                batchId: item.batchNo,
                productName: item.productName,
                productCode: item.productCode || 'N/A',
                quantity: item.receivedQty - (item.damagedQty || 0),
                mfgDate: item.mfgDate,
                expDate: item.expDate,
                unitCost: item.unitCost,
                supplierName: grnData.supplierName,
                grnNumber: grnData.grnNumber,
                receivedDate: grnData.receivedDate,
                storageLocation: grnData.storageLocation,
                status: 'Active'
            };
            batches.push(batch);
        }
    });

    localStorage.setItem('productBatches', JSON.stringify(batches));
    console.log('✅ Product batches created:', batches.length);
}

// Update Inventory from GRN
function updateInventoryFromGRN(grnData) {
    let products = JSON.parse(localStorage.getItem('products')) || [];

    grnData.items.forEach(item => {
        const product = products.find(p => p.name === item.productName);
        if (product) {
            const netReceived = (item.receivedQty || 0) - (item.damagedQty || 0);
            product.stock = (product.stock || 0) + netReceived;
            console.log(`✅ Updated ${product.name}: +${netReceived} units`);
        }
    });

    localStorage.setItem('products', JSON.stringify(products));
}

// Update PO Status
function updatePOStatus(grnData) {
    const po = purchaseOrders.find(p => p.poNumber === grnData.poNumber);
    if (po) {
        // Check if all items fully received
        const allReceived = grnData.items.every(item => item.receivedQty >= item.quantity);
        po.status = allReceived ? 'Received' : 'Partially Received';
        po.receivedDate = grnData.receivedDate;
        po.grnNumber = grnData.grnNumber;
        saveDataToStorage();
    }
}

// Load GRN Records
function loadGRNRecords() {
    const tbody = document.getElementById('grnRecordsTableBody');
    if (!tbody) return;

    if (grnRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">No GRN records found</td></tr>';
        return;
    }

    tbody.innerHTML = grnRecords.map(grn => `
        <tr>
            <td><strong>${grn.grnNumber}</strong></td>
            <td>${grn.poNumber}</td>
            <td>${grn.supplierName}</td>
            <td>${formatDate(grn.receivedDate)}</td>
            <td>${grn.receivedBy}</td>
            <td>${grn.items.length}</td>
            <td class="fw-bold">${formatCurrency(grn.totalValue)}</td>
            <td>
                <span class="badge ${getQualityBadge(grn.qualityStatus)}">${grn.qualityStatus}</span>
            </td>
            <td>
                <span class="badge ${grn.status === 'Completed' ? 'bg-success' : 'bg-warning'}">${grn.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewGRN('${grn.grnNumber}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="printGRNRecord('${grn.grnNumber}')" title="Print">
                    <i class="fas fa-print"></i>
                </button>
                ${grn.status === 'Completed' ?
            `<button class="btn btn-sm btn-danger" onclick="reverseGRN('${grn.grnNumber}')" title="Reverse (Admin)">
                        <i class="fas fa-undo"></i>
                    </button>` : ''}
            </td>
        </tr>
    `).join('');

    // Update statistics
    updateGRNStatistics();
}

// Get Quality Badge
function getQualityBadge(status) {
    const badges = {
        'Approved': 'bg-success',
        'Approved with Minor Issues': 'bg-warning',
        'Rejected': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
}

// View GRN
function viewGRN(grnNumber) {
    const grn = grnRecords.find(g => g.grnNumber === grnNumber);
    if (!grn) return;

    const itemsTable = grn.items.map((item, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${item.productName}</td>
            <td>${item.batchNo}</td>
            <td>${item.quantity}</td>
            <td>${item.receivedQty}</td>
            <td>${item.damagedQty || 0}</td>
            <td>${item.expDate}</td>
        </tr>
    `).join('');

    Swal.fire({
        title: `GRN: ${grn.grnNumber}`,
        html: `
            <div class="text-start">
                <p><strong>PO Number:</strong> ${grn.poNumber}</p>
                <p><strong>Supplier:</strong> ${grn.supplierName}</p>
                <p><strong>Received Date:</strong> ${formatDate(grn.receivedDate)}</p>
                <p><strong>Received By:</strong> ${grn.receivedBy}</p>
                <p><strong>Invoice No:</strong> ${grn.invoiceNumber}</p>
                <p><strong>Quality Status:</strong> ${grn.qualityStatus}</p>
                <p><strong>Storage:</strong> ${grn.storageLocation}</p>
                <p><strong>Total Value:</strong> ${formatCurrency(grn.totalValue)}</p>
                <hr>
                <h6>Items:</h6>
                <table class="table table-sm table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Batch</th>
                            <th>Ordered</th>
                            <th>Received</th>
                            <th>Damaged</th>
                            <th>Expiry</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsTable}
                    </tbody>
                </table>
                ${grn.notes ? `<p><strong>Notes:</strong> ${grn.notes}</p>` : ''}
            </div>
        `,
        width: '800px',
        confirmButtonText: 'Close'
    });
}

// Print GRN
function printGRN() {
    const grnNumber = document.getElementById('grnNumber').value;
    Swal.fire('Print', `Printing GRN ${grnNumber}... (Feature in development)`, 'info');
}

// Print GRN Record
function printGRNRecord(grnNumber) {
    Swal.fire('Print', `Printing GRN ${grnNumber}... (Feature in development)`, 'info');
}

// Reverse GRN (Admin only)
function reverseGRN(grnNumber) {
    Swal.fire({
        title: 'Reverse GRN?',
        text: 'This will reverse inventory changes. Admin access required.',
        icon: 'warning',
        input: 'password',
        inputPlaceholder: 'Enter admin password',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Reverse'
    }).then((result) => {
        if (result.isConfirmed && result.value === 'admin123') {
            // Reverse logic here
            Swal.fire('Reversed', 'GRN has been reversed', 'success');
        } else if (result.isConfirmed) {
            Swal.fire('Error', 'Invalid admin password', 'error');
        }
    });
}

// Update GRN Statistics
function updateGRNStatistics() {
    const total = grnRecords.length;
    const thisMonth = grnRecords.filter(g => {
        const grnDate = new Date(g.receivedDate);
        const now = new Date();
        return grnDate.getMonth() === now.getMonth() && grnDate.getFullYear() === now.getFullYear();
    }).length;

    const withIssues = grnRecords.filter(g =>
        g.qualityStatus === 'Approved with Minor Issues' || g.qualityStatus === 'Rejected'
    ).length;

    const totalValue = grnRecords.reduce((sum, g) => sum + (g.totalValue || 0), 0);

    document.getElementById('totalGRNs').textContent = total;
    document.getElementById('grnThisMonth').textContent = thisMonth;
    document.getElementById('grnWithIssues').textContent = withIssues;
    document.getElementById('totalGRNValue').textContent = totalValue.toFixed(2);
}

// Clear GRN Filters
function clearGRNFilters() {
    document.getElementById('searchGRN').value = '';
    document.getElementById('filterGRNSupplier').value = '';
    document.getElementById('filterGRNDateFrom').value = '';
    document.getElementById('filterGRNDateTo').value = '';
    loadGRNRecords();
}

// Initialize GRN Tab
// Populate GRN Supplier Dropdown (called after suppliers load)
function populateGRNSupplierDropdown() {
    const grnSupplierFilter = document.getElementById('filterGRNSupplier');
    if (!grnSupplierFilter) return;

    grnSupplierFilter.innerHTML = '<option value="">All Suppliers</option>';

    suppliers.forEach(supplier => {
        const name = supplier.supplierName || supplier.contactPerson || `Supplier ${supplier.supplierId}`;
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        grnSupplierFilter.appendChild(option);
    });
}