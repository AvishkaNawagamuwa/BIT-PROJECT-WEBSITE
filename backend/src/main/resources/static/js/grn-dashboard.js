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

            if (result.status === 'success') {
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
        try {
            const response = await fetch('/api/grns/waiting-pos');
            const result = await response.json();

            if (result.status === 'success') {
                this.renderWaitingPOs(result.data);
            }
        } catch (error) {
            console.error('Error loading waiting POs:', error);
            this.renderWaitingPOs([]);
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

            if (result.status === 'success') {
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
        const tbody = document.getElementById('grnHistoryTableBody');
        
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
            const statusBadge = grn.status === 'APPROVED' 
                ? '<span class="badge bg-success">APPROVED</span>'
                : '<span class="badge bg-secondary">DRAFT</span>';

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
                        ${grn.status === 'DRAFT' ? `
                            <button class="btn btn-sm btn-outline-success" 
                                    onclick="GRNDashboard.editGRN(${grn.grnId})">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Create a draft GRN from a PO (auto-fill items)
     */
    async createGRNFromPO(poId, poNumber) {
        try {
            if (!confirm(`Create GRN for PO ${poNumber}?`)) return;

            const response = await fetch(`/api/grns/from-po/${poId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.currentGRN = result.data;
                this.editMode = true;
                this.showGRNModal();
                this.showToast('success', 'Draft GRN created! Review and update quantities, prices, and expiry dates.');
            } else {
                this.showToast('error', result.message || 'Error creating GRN');
            }
        } catch (error) {
            console.error('Error creating GRN from PO:', error);
            this.showToast('error', 'Failed to create GRN');
        }
    },

    /**
     * Show GRN modal for editing/viewing
     */
    showGRNModal() {
        if (!this.currentGRN) return;

        const modal = new bootstrap.Modal(document.getElementById('grnModal'));
        
        // Fill header fields
        document.getElementById('grnNumber').value = this.currentGRN.grnNumber;
        document.getElementById('grnPONumber').value = this.currentGRN.poNumber || 'N/A';
        document.getElementById('grnSupplier').value = this.currentGRN.supplierName;
        document.getElementById('grnReceivedDate').value = this.currentGRN.receivedDate;
        document.getElementById('grnInvoiceNumber').value = this.currentGRN.invoiceNumber || '';
        document.getElementById('grnQualityStatus').value = this.currentGRN.qualityStatus || 'OK';
        document.getElementById('grnNotes').value = this.currentGRN.notes || '';

        // Render items grid
        this.renderGRNItems();

        // Show/hide action buttons based on status
        const isEditMode = this.currentGRN.status === 'DRAFT' && this.editMode;
        document.getElementById('saveDraftBtn').style.display = isEditMode ? 'inline-block' : 'none';
        document.getElementById('approveGRNBtn').style.display = isEditMode ? 'inline-block' : 'none';

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

        const isEditable = this.currentGRN.status === 'DRAFT' && this.editMode;

        tbody.innerHTML = this.currentGRN.items.map((item, index) => {
            const remaining = (item.orderedQuantity || 0) - ((item.orderedQuantity || 0) - (item.receivedQuantity || 0));
            
            return `
                <tr data-item-index="${index}">
                    <td>${item.productName}</td>
                    <td>${item.orderedQuantity || 'N/A'}</td>
                    <td>${remaining}</td>
                    <td>
                        ${isEditable ? `
                            <input type="number" class="form-control form-control-sm" 
                                   value="${item.receivedQuantity}" 
                                   min="0" 
                                   max="${remaining}"
                                   onchange="GRNDashboard.updateItemField(${index}, 'receivedQuantity', this.value)">
                        ` : item.receivedQuantity}
                    </td>
                    <td>
                        ${isEditable ? `
                            <input type="number" class="form-control form-control-sm" 
                                   value="${item.finalPurchasePrice}" 
                                   step="0.01" 
                                   min="0"
                                   onchange="GRNDashboard.updateItemField(${index}, 'finalPurchasePrice', this.value)">
                        ` : 'Rs. ' + (item.finalPurchasePrice || 0).toFixed(2)}
                    </td>
                    <td>
                        ${isEditable ? `
                            <input type="number" class="form-control form-control-sm" 
                                   value="${item.sellingPrice || ''}" 
                                   step="0.01" 
                                   min="0"
                                   onchange="GRNDashboard.updateItemField(${index}, 'sellingPrice', this.value)">
                        ` : 'Rs. ' + (item.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td>
                        ${isEditable ? `
                            <input type="date" class="form-control form-control-sm" 
                                   value="${item.expiryDate || ''}"
                                   onchange="GRNDashboard.updateItemField(${index}, 'expiryDate', this.value)">
                        ` : (item.expiryDate || 'N/A')}
                    </td>
                    <td>
                        ${isEditable ? `
                            <input type="text" class="form-control form-control-sm" 
                                   value="${item.batchCode}" 
                                   onchange="GRNDashboard.updateItemField(${index}, 'batchCode', this.value)">
                        ` : item.batchCode}
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

        let subtotal = 0;
        this.currentGRN.items.forEach(item => {
            const lineTotal = (item.receivedQuantity || 0) * (item.finalPurchasePrice || 0);
            subtotal += lineTotal;
        });

        const tax = this.currentGRN.taxAmount || 0;
        const discount = this.currentGRN.discountAmount || 0;
        const grandTotal = subtotal + tax - discount;

        document.getElementById('grnSubtotal').textContent = 
            'Rs. ' + subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 });
        document.getElementById('grnGrandTotal').textContent = 
            'Rs. ' + grandTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 });

        this.currentGRN.subtotal = subtotal;
        this.currentGRN.grandTotal = grandTotal;
    },

    /**
     * Save draft GRN
     */
    async saveDraftGRN() {
        try {
            const grnData = {
                purchaseOrderId: this.currentGRN.purchaseOrderId,
                supplierId: this.currentGRN.supplierId,
                receivedDate: document.getElementById('grnReceivedDate').value,
                invoiceNumber: document.getElementById('grnInvoiceNumber').value,
                notes: document.getElementById('grnNotes').value,
                taxAmount: this.currentGRN.taxAmount || 0,
                discountAmount: this.currentGRN.discountAmount || 0,
                items: this.currentGRN.items.map(item => ({
                    productId: item.productId,
                    orderedQuantity: item.orderedQuantity,
                    receivedQuantity: item.receivedQuantity,
                    finalPurchasePrice: item.finalPurchasePrice,
                    sellingPrice: item.sellingPrice,
                    expiryDate: item.expiryDate,
                    batchCode: item.batchCode,
                    notes: item.notes
                }))
            };

            const response = await fetch(`/api/grns/${this.currentGRN.grnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(grnData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showToast('success', 'Draft GRN saved successfully');
                this.currentGRN = result.data;
                this.renderGRNItems(); // Refresh
            } else {
                this.showToast('error', result.message || 'Error saving GRN');
            }
        } catch (error) {
            console.error('Error saving GRN:', error);
            this.showToast('error', 'Failed to save GRN');
        }
    },

    /**
     * Approve GRN (atomic transaction - updates inventory)
     */
    async approveGRN() {
        if (!confirm('Approve this GRN? This will update inventory and cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/grns/${this.currentGRN.grnId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showToast('success', 'GRN approved! Inventory updated and batches created.');
                
                // Close modal and refresh all sections
                bootstrap.Modal.getInstance(document.getElementById('grnModal')).hide();
                this.init(); // Refresh everything
            } else {
                this.showToast('error', result.message || 'Error approving GRN');
            }
        } catch (error) {
            console.error('Error approving GRN:', error);
            this.showToast('error', 'Failed to approve GRN');
        }
    },

    /**
     * View existing GRN
     */
    async viewGRN(grnId) {
        try {
            const response = await fetch(`/api/grns/${grnId}`);
            const result = await response.json();

            if (result.status === 'success') {
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

            if (result.status === 'success') {
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
        // Search/filter handlers
        document.getElementById('searchGRNBtn')?.addEventListener('click', () => {
            const filters = {
                query: document.getElementById('searchGRN').value,
                supplierId: document.getElementById('filterGRNSupplier').value,
                status: document.getElementById('filterGRNStatus').value,
                fromDate: document.getElementById('grnFromDate').value,
                toDate: document.getElementById('grnToDate').value
            };
            this.loadGRNHistory(filters);
        });

        // Clear filters
        document.getElementById('clearGRNFiltersBtn')?.addEventListener('click', () => {
            document.getElementById('searchGRN').value = '';
            document.getElementById('filterGRNSupplier').value = '';
            document.getElementById('filterGRNStatus').value = '';
            document.getElementById('grnFromDate').value = '';
            document.getElementById('grnToDate').value = '';
            this.loadGRNHistory();
        });

        // Modal buttons
        document.getElementById('saveDraftBtn')?.addEventListener('click', () => this.saveDraftGRN());
        document.getElementById('approveGRNBtn')?.addEventListener('click', () => this.approveGRN());
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
