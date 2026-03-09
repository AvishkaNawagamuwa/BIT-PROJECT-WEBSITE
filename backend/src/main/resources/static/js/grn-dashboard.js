/**
 * GRN Receiving Dashboard JavaScript
 * Handles PO → GRN workflow with partial receiving support
 */

const GRNDashboard = {
    currentGRN: null,
    editMode: false,

    /**
     * Initialize GRN Dashboard
     */
    init() {
        this.loadDashboardStats();
        this.loadWaitingPOs();
        this.loadGRNHistory();
        this.setupEventListeners();
    },

    /**
     * Load dashboard statistics cards
     */
    async loadDashboardStats() {
        try {
            const response = await fetch('/api/grns/dashboard-stats');
            const result = await response.json();

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                const stats = result.data;

                // Update cards
                document.getElementById('totalGRNsValue').textContent = stats.totalGRNs || 0;
                document.getElementById('thisMonthGRNsValue').textContent = stats.thisMonthGRNs || 0;
                document.getElementById('grnWithIssuesValue').textContent = stats.grnWithIssues || 0;
                document.getElementById('totalGRNValueValue').textContent =
                    'Rs. ' + (stats.totalValue || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    },

    /**
     * Load POs waiting to be received
     */
    async loadWaitingPOs() {
        const tbody = document.getElementById('waitingPOsTableBody');
        if (!tbody) {
            console.error('waitingPOsTableBody element not found');
            return;
        }

        try {
            const response = await fetch('/api/grns/waiting-pos');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Waiting POs response:', result);

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                this.renderWaitingPOs(result.data);
            } else {
                console.error('API returned error:', result.message);
                this.renderWaitingPOs([]);
            }
        } catch (error) {
            console.error('Error loading waiting POs:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <p>Error loading purchase orders: ${error.message}</p>
                        <button class="btn btn-sm btn-primary" onclick="GRNDashboard.loadWaitingPOs()">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    },

    /**
     * Render waiting POs table
     */
    renderWaitingPOs(pos) {
        const tbody = document.getElementById('waitingPOsTableBody');

        if (!pos || pos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No purchase orders waiting to receive</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pos.map(po => {
            const statusBadge = po.receivingStatus === 'WAITING'
                ? '<span class="badge bg-warning">WAITING</span>'
                : '<span class="badge bg-info">PARTIAL</span>';

            const completionPercent = po.completionPercentage || 0;

            return `
                <tr>
                    <td><strong>${po.poNumber}</strong></td>
                    <td>${po.supplierName}</td>
                    <td>${po.expectedDeliveryDate || 'N/A'}</td>
                    <td>
                        ${statusBadge}
                        <div class="progress mt-1" style="height: 6px;">
                            <div class="progress-bar" role="progressbar" 
                                style="width: ${completionPercent}%" 
                                aria-valuenow="${completionPercent}" 
                                aria-valuemin="0" 
                                aria-valuemax="100">
                            </div>
                        </div>
                        <small class="text-muted">${po.totalReceived}/${po.totalOrdered} items</small>
                    </td>
                    <td>Rs. ${(po.grandTotal || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                    <td>
<button class="btn btn-sm btn-success" 
                                onclick="GRNDashboard.createGRNFromPO(${po.requestId}, '${po.poNumber}')">
                            <i class="fas fa-truck-loading me-1"></i>Receive
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Load GRN history records
     */
    async loadGRNHistory(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.query) params.append('query', filters.query);
            if (filters.supplierId) params.append('supplierId', filters.supplierId);
            if (filters.status) params.append('status', filters.status);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);

            const response = await fetch(`/api/grns?${params}`);
            const result = await response.json();

            console.log('GRN History response:', result);

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                console.log('Rendering', result.data.length, 'GRN records');
                this.renderGRNHistory(result.data);
            }
        } catch (error) {
            console.error('Error loading GRN history:', error);
            this.renderGRNHistory([]);
        }
    },

    /**
     * Render GRN history table
     */
    renderGRNHistory(grns) {
        const tbody = document.getElementById('grnRecordsTableBody');

        if (!grns || grns.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No GRN records found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = grns.map(grn => {
            const statusBadge = grn.status === 'RECEIVED'
                ? '<span class="badge bg-success">Received</span>'
                : '<span class="badge bg-warning">Partially Received</span>';

            const qualityBadge = grn.qualityStatus === 'OK'
                ? '<span class="badge bg-success">OK</span>'
                : '<span class="badge bg-warning">ISSUES</span>';

            return `
                <tr>
                    <td><strong>${grn.grnNumber}</strong></td>
                    <td>${grn.poNumber || 'N/A'}</td>
                    <td>${grn.supplierName}</td>
                    <td>${grn.receivedDate}</td>
                    <td>${grn.receivedByName || 'User ' + grn.receivedBy}</td>
                    <td>${grn.totalItems || 0} items (${grn.totalQuantity || 0} qty)</td>
                    <td>Rs. ${(grn.grandTotal || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                    <td>${qualityBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="GRNDashboard.viewGRN(${grn.grnId})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Prepare GRN data from PO (does not create in backend yet)
     */
    async createGRNFromPO(poId, poNumber) {
        try {
            console.log(`Preparing GRN receive form for PO ${poNumber} (ID: ${poId})`);

            const response = await fetch(`/api/grns/prepare-from-po/${poId}`);
            const result = await response.json();
            console.log('Prepare GRN response:', result);

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                this.currentGRN = result.data;
                this.currentGRN.poId = poId; // Store PO ID for later
                this.showGRNModal();
            } else {
                this.showToast('error', result.message || 'Error preparing GRN form');
            }
        } catch (error) {
            console.error('Error preparing GRN from PO:', error);
            this.showToast('error', 'Failed to load PO data: ' + error.message);
        }
    },

    /**
     * Show GRN modal for receiving goods
     */
    showGRNModal() {
        if (!this.currentGRN) {
            console.error('No currentGRN data available!');
            return;
        }

        console.log('showGRNModal - currentGRN:', this.currentGRN);

        const modal = new bootstrap.Modal(document.getElementById('grnModal'));

        // Fill header fields
        const grnNumberEl = document.getElementById('grnNumber');
        const grnPONumberEl = document.getElementById('grnPONumber');
        const grnSupplierEl = document.getElementById('grnSupplier');
        const grnExpectedDateEl = document.getElementById('grnExpectedDate');
        const grnReceivedDateEl = document.getElementById('grnReceivedDate');
        const grnInvoiceNumberEl = document.getElementById('grnInvoiceNumber');
        const grnNotesEl = document.getElementById('grnNotes');

        if (grnNumberEl) grnNumberEl.value = this.currentGRN.grnNumber || 'AUTO-GEN';
        if (grnPONumberEl) grnPONumberEl.value = this.currentGRN.poNumber || 'N/A';
        if (grnSupplierEl) grnSupplierEl.value = this.currentGRN.supplierName || '';
        if (grnExpectedDateEl) grnExpectedDateEl.value = this.currentGRN.expectedDeliveryDate || '';
        if (grnReceivedDateEl) grnReceivedDateEl.value = this.currentGRN.receivedDate || new Date().toISOString().split('T')[0];
        if (grnInvoiceNumberEl) grnInvoiceNumberEl.value = this.currentGRN.invoiceNumber || '';
        if (grnNotesEl) grnNotesEl.value = this.currentGRN.notes || '';

        // Render items grid
        this.renderGRNItems();
        modal.show();
    },

    /**
     * Render GRN items in editable grid
     */
    renderGRNItems() {
        const tbody = document.getElementById('grnItemsTableBody');

        if (!this.currentGRN.items || this.currentGRN.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">No items</td></tr>';
            return;
        }

        tbody.innerHTML = this.currentGRN.items.map((item, index) => {
            const alreadyReceived = item.alreadyReceivedQuantity || 0;
            const remaining = (item.orderedQuantity || 0) - alreadyReceived;

            return `
                <tr data-item-index="${index}">
                    <td>${item.productName}</td>
                    <td>${item.orderedQuantity || 'N/A'}</td>
                    <td class="text-muted">${alreadyReceived}</td>
                    <td class="text-info fw-bold">${remaining}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm" 
                               value="${item.receivedQuantity}" 
                               min="0" 
                               max="${remaining}"
                               onchange="GRNDashboard.updateItemField(${index}, 'receivedQuantity', this.value)">
                    </td>
                    <td>
                        <input type="number" class="form-control form-control-sm" 
                               value="${item.finalPurchasePrice}" 
                               step="0.01" 
                               min="0"
                               onchange="GRNDashboard.updateItemField(${index}, 'finalPurchasePrice', this.value)">
                    </td>
                    <td>
                        <input type="number" class="form-control form-control-sm" 
                               value="${item.sellingPrice || ''}" 
                               step="0.01" 
                               min="0"
                               onchange="GRNDashboard.updateItemField(${index}, 'sellingPrice', this.value)">
                    </td>
                    <td>
                        <input type="date" class="form-control form-control-sm" 
                               value="${item.expiryDate || ''}"
                               onchange="GRNDashboard.updateItemField(${index}, 'expiryDate', this.value)">
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" 
                               value="${item.batchCode}" 
                               onchange="GRNDashboard.updateItemField(${index}, 'batchCode', this.value)">
                    </td>
                    <td class="text-end">
                        Rs. ${((item.receivedQuantity || 0) * (item.finalPurchasePrice || 0)).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
            `;
        }).join('');

        this.updateGRNTotals();
    },

    /**
     * Update item field value
     */
    updateItemField(index, field, value) {
        if (!this.currentGRN.items[index]) return;

        if (field === 'receivedQuantity' || field === 'finalPurchasePrice' || field === 'sellingPrice') {
            this.currentGRN.items[index][field] = parseFloat(value) || 0;
        } else {
            this.currentGRN.items[index][field] = value;
        }

        this.updateGRNTotals();
    },

    /**
     * Update GRN totals
     */
    updateGRNTotals() {
        if (!this.currentGRN.items) return;

        let grandTotal = 0;
        let totalItems = 0;

        this.currentGRN.items.forEach(item => {
            const lineTotal = (item.receivedQuantity || 0) * (item.finalPurchasePrice || 0);
            grandTotal += lineTotal;
            if (item.receivedQuantity && item.receivedQuantity > 0) {
                totalItems++;
            }
        });

        // Update UI
        const totalItemsEl = document.getElementById('grnTotalItems');
        const grandTotalEl = document.getElementById('grnGrandTotal');

        if (totalItemsEl) {
            totalItemsEl.textContent = totalItems;
        }
        if (grandTotalEl) {
            grandTotalEl.textContent = 'Rs. ' + grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 });
        }

        this.currentGRN.grandTotal = grandTotal;
    },

    /**
     * Save draft GRN
     */
    /**
     * Receive goods - creates GRN, batches, and updates inventory in one transaction
     */
    async receiveGoods() {
        // Validation
        if (!this.currentGRN || !this.currentGRN.items) {
            this.showToast('error', 'No items to receive');
            return;
        }

        // Check if at least one item has quantity > 0
        const hasItems = this.currentGRN.items.some(item => (item.receivedQuantity || 0) > 0);
        if (!hasItems) {
            this.showToast('error', 'Please enter receive quantity for at least one item');
            return;
        }

        // Confirm
        if (!confirm('Receive these goods? This will update inventory immediately and cannot be undone.')) {
            return;
        }

        try {
            // Collect form data
            const receivedDate = document.getElementById('grnReceivedDate')?.value;
            const invoiceNumber = document.getElementById('grnInvoiceNumber')?.value;
            const notes = document.getElementById('grnNotes')?.value;

            const grnData = {
                purchaseOrderId: this.currentGRN.poId,
                supplierId: this.currentGRN.supplierId,
                receivedDate: receivedDate,
                invoiceNumber: invoiceNumber,
                notes: notes,
                items: this.currentGRN.items
                    .filter(item => (item.receivedQuantity || 0) > 0)
                    .map(item => ({
                        productId: item.productId,
                        orderedQuantity: item.orderedQuantity,
                        receivedQuantity: item.receivedQuantity,
                        finalPurchasePrice: item.finalPurchasePrice,
                        sellingPrice: item.sellingPrice,
                        expiryDate: item.expiryDate,
                        batchCode: item.batchCode
                    }))
            };

            console.log('Receiving goods:', grnData);

            const response = await fetch('/api/grns/receive-from-po', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(grnData)
            });

            const result = await response.json();

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                this.showToast('success', `✅ Goods received successfully! GRN ${result.data.grnNumber} created. Inventory and batches updated.`, 5000);

                // Close modal and refresh all sections
                bootstrap.Modal.getInstance(document.getElementById('grnModal')).hide();
                this.init(); // Refresh everything
            } else {
                this.showToast('error', result.message || 'Error receiving goods');
            }
        } catch (error) {
            console.error('Error receiving goods:', error);
            this.showToast('error', 'Failed to receive goods: ' + error.message);
        }
    },

    /**
     * View existing GRN
     */
    async viewGRN(grnId) {
        try {
            const response = await fetch(`/api/grns/${grnId}`);
            const result = await response.json();

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                this.currentGRN = result.data;
                this.editMode = false;
                this.showGRNModal();
            }
        } catch (error) {
            console.error('Error loading GRN:', error);
            this.showToast('error', 'Failed to load GRN');
        }
    },

    /**
     * Edit existing draft GRN
     */
    async editGRN(grnId) {
        try {
            const response = await fetch(`/api/grns/${grnId}`);
            const result = await response.json();

            // Support both response formats: {status: 'success'} and {success: true}
            if (result.status === 'success' || result.success === true) {
                this.currentGRN = result.data;
                this.editMode = true;
                this.showGRNModal();
            }
        } catch (error) {
            console.error('Error loading GRN:', error);
            this.showToast('error', 'Failed to load GRN');
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search on input change
        document.getElementById('searchGRN')?.addEventListener('input', () => {
            this.applyFilters();
        });

        document.getElementById('filterGRNSupplier')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('filterGRNDateFrom')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('filterGRNDateTo')?.addEventListener('change', () => {
            this.applyFilters();
        });
    },

    /**
     * Apply current filters
     */
    applyFilters() {
        const filters = {
            query: document.getElementById('searchGRN')?.value || '',
            supplierId: document.getElementById('filterGRNSupplier')?.value || '',
            fromDate: document.getElementById('filterGRNDateFrom')?.value || '',
            toDate: document.getElementById('filterGRNDateTo')?.value || ''
        };
        this.loadGRNHistory(filters);
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('searchGRN').value = '';
        document.getElementById('filterGRNSupplier').value = '';
        document.getElementById('filterGRNDateFrom').value = '';
        document.getElementById('filterGRNDateTo').value = '';
        this.loadGRNHistory();
    },

    /**
     * Show toast notification
     */
    showToast(type, message) {
        // You can implement your own toast notification here
        // For now, using alert
        if (type === 'success') {
            alert('✓ ' + message);
        } else {
            alert('✗ ' + message);
        }
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('grnRecordsTab')) {
        GRNDashboard.init();
    }
});
