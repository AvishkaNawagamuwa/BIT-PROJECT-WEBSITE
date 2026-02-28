/**
 * Deliveries Management - Backend Integration Example
 * This file demonstrates how to integrate the static frontend with the backend APIs
 * 
 * Usage: Replace localStorage calls with API calls from api.js
 */

// ==================== PAGE STATE ====================
let currentPage = 0;
let currentSize = 10;
let currentFilters = {
    status: null,
    date: null
};

// ==================== DATA CACHES ====================
let driversCache = [];
let vehiclesCache = [];
let deliveriesCache = [];
let routesCache = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚚 Delivery Management System (API Integration) Initializing...');
    initializePage();
    setupEventListeners();
    console.log('✅ Delivery Management System Ready');
});

/**
 * Initialize page - Load all necessary data
 */
async function initializePage() {
    await Promise.all([
        loadDrivers(),
        loadVehicles(),
        loadDeliveries()
    ]);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', handleStatusFilterChange);
    }

    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', handleDateFilterChange);
    }

    // Search
    const searchInput = document.getElementById('searchDeliveries');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadDeliveries());
    }

    // Create buttons
    setupCreateButtons();
}

/**
 * Setup create/action buttons
 */
function setupCreateButtons() {
    const buttons = {
        'createDeliveryBtn': showCreateDeliveryModal,
        'createDriverBtn': showCreateDriverModal,
        'createVehicleBtn': showCreateVehicleModal,
        'createRouteBtn': showCreateRouteModal
    };

    Object.entries(buttons).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
}

// ==================== API INTEGRATION - DRIVERS ====================

/**
 * Load all drivers from API
 */
async function loadDrivers() {
    try {
        const response = await apiGet('/api/v1/delivery/drivers', {
            page: 0,
            size: 100  // Get all for dropdown
        });

        if (response.success && response.data) {
            driversCache = response.data.content || [];
            console.log(`✅ Loaded ${driversCache.length} drivers`);
            populateDriverDropdowns();
            renderDriversTable();
        }
    } catch (error) {
        console.error('❌ Error loading drivers:', error);
    }
}

/**
 * Create a new driver
 */
async function createDriver(driverData) {
    try {
        showLoading();
        const response = await apiPost('/api/v1/delivery/drivers', driverData);
        hideLoading();

        if (response.success) {
            showSuccess('Driver created successfully');
            await loadDrivers();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error creating driver:', error);
        throw error;
    }
}

/**
 * Update driver
 */
async function updateDriver(driverId, driverData) {
    try {
        showLoading();
        const response = await apiPut(`/api/v1/delivery/drivers/${driverId}`, driverData);
        hideLoading();

        if (response.success) {
            showSuccess('Driver updated successfully');
            await loadDrivers();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error updating driver:', error);
        throw error;
    }
}

/**
 * Toggle driver active status
 */
async function toggleDriverStatus(driverId, activate) {
    try {
        showLoading();
        const endpoint = activate ? 'activate' : 'deactivate';
        const response = await apiPatch(`/api/v1/delivery/drivers/${driverId}/${endpoint}`);
        hideLoading();

        if (response.success) {
            showSuccess(`Driver ${activate ? 'activated' : 'deactivated'} successfully`);
            await loadDrivers();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error toggling driver status:', error);
        throw error;
    }
}

// ==================== API INTEGRATION - VEHICLES ====================

/**
 * Load all vehicles from API
 */
async function loadVehicles() {
    try {
        const response = await apiGet('/api/v1/delivery/vehicles', {
            page: 0,
            size: 100
        });

        if (response.success && response.data) {
            vehiclesCache = response.data.content || [];
            console.log(`✅ Loaded ${vehiclesCache.length} vehicles`);
            populateVehicleDropdowns();
            renderVehiclesTable();
        }
    } catch (error) {
        console.error('❌ Error loading vehicles:', error);
    }
}

/**
 * Create a new vehicle
 */
async function createVehicle(vehicleData) {
    try {
        showLoading();
        const response = await apiPost('/api/v1/delivery/vehicles', vehicleData);
        hideLoading();

        if (response.success) {
            showSuccess('Vehicle created successfully');
            await loadVehicles();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error creating vehicle:', error);
        throw error;
    }
}

/**
 * Update vehicle
 */
async function updateVehicle(vehicleId, vehicleData) {
    try {
        showLoading();
        const response = await apiPut(`/api/v1/delivery/vehicles/${vehicleId}`, vehicleData);
        hideLoading();

        if (response.success) {
            showSuccess('Vehicle updated successfully');
            await loadVehicles();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error updating vehicle:', error);
        throw error;
    }
}

// ==================== API INTEGRATION - DELIVERIES ====================

/**
 * Load deliveries with filters
 */
async function loadDeliveries() {
    try {
        showLoading();

        const params = {
            page: currentPage,
            size: currentSize
        };

        if (currentFilters.status) {
            params.status = currentFilters.status;
        }

        if (currentFilters.date) {
            params.date = currentFilters.date;
        }

        const response = await apiGet('/api/v1/delivery/deliveries', params);
        hideLoading();

        if (response.success && response.data) {
            deliveriesCache = response.data.content || [];
            console.log(`✅ Loaded ${deliveriesCache.length} deliveries`);
            renderDeliveriesTable(response.data);
            updatePagination(response.data);
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error loading deliveries:', error);
    }
}

/**
 * Create a new delivery
 */
async function createDelivery(deliveryData) {
    try {
        showLoading();
        const response = await apiPost('/api/v1/delivery/deliveries', deliveryData);
        hideLoading();

        if (response.success) {
            showSuccess('Delivery created successfully');
            await loadDeliveries();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error creating delivery:', error);
        throw error;
    }
}

/**
 * Assign driver and vehicle to delivery
 */
async function assignDelivery(deliveryId, assignmentData) {
    try {
        showLoading();
        const response = await apiPatch(
            `/api/v1/delivery/deliveries/${deliveryId}/assign`,
            assignmentData
        );
        hideLoading();

        if (response.success) {
            showSuccess('Delivery assigned successfully');
            await loadDeliveries();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error assigning delivery:', error);
        throw error;
    }
}

/**
 * Update delivery status
 */
async function updateDeliveryStatus(deliveryId, statusData) {
    try {
        showLoading();
        const response = await apiPatch(
            `/api/v1/delivery/deliveries/${deliveryId}/status`,
            statusData
        );
        hideLoading();

        if (response.success) {
            showSuccess('Delivery status updated successfully');
            await loadDeliveries();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error updating delivery status:', error);
        throw error;
    }
}

/**
 * Update proof of delivery
 */
async function updateProofOfDelivery(deliveryId, proofUrl) {
    try {
        showLoading();
        const response = await apiPatch(
            `/api/v1/delivery/deliveries/${deliveryId}/proof`,
            { proofOfDeliveryUrl: proofUrl }
        );
        hideLoading();

        if (response.success) {
            showSuccess('Proof of delivery updated successfully');
            await loadDeliveries();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error updating proof:', error);
        throw error;
    }
}

// ==================== API INTEGRATION - ROUTES ====================

/**
 * Load routes with filters
 */
async function loadRoutes() {
    try {
        const params = {
            page: 0,
            size: 100
        };

        if (currentFilters.date) {
            params.date = currentFilters.date;
        }

        const response = await apiGet('/api/v1/delivery/routes', params);

        if (response.success && response.data) {
            routesCache = response.data.content || [];
            console.log(`✅ Loaded ${routesCache.length} routes`);
            renderRoutesTable();
        }
    } catch (error) {
        console.error('❌ Error loading routes:', error);
    }
}

/**
 * Create a new route
 */
async function createRoute(routeData) {
    try {
        showLoading();
        const response = await apiPost('/api/v1/delivery/routes', routeData);
        hideLoading();

        if (response.success) {
            showSuccess('Route created successfully');
            await loadRoutes();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error creating route:', error);
        throw error;
    }
}

/**
 * Update route status
 */
async function updateRouteStatus(routeId, status) {
    try {
        showLoading();
        const response = await apiPatch(
            `/api/v1/delivery/routes/${routeId}/status`,
            { status: status }
        );
        hideLoading();

        if (response.success) {
            showSuccess('Route status updated successfully');
            await loadRoutes();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error updating route status:', error);
        throw error;
    }
}

/**
 * Add delivery to route
 */
async function addDeliveryToRoute(routeId, deliveryId, stopOrder = null) {
    try {
        showLoading();
        const response = await apiPost(
            `/api/v1/delivery/routes/${routeId}/add-delivery`,
            { deliveryId, stopOrder }
        );
        hideLoading();

        if (response.success) {
            showSuccess('Delivery added to route successfully');
            await loadRoutes();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error adding delivery to route:', error);
        throw error;
    }
}

/**
 * Remove delivery from route
 */
async function removeDeliveryFromRoute(routeId, deliveryId) {
    try {
        showLoading();
        const response = await apiPost(
            `/api/v1/delivery/routes/${routeId}/remove-delivery`,
            { deliveryId }
        );
        hideLoading();

        if (response.success) {
            showSuccess('Delivery removed from route successfully');
            await loadRoutes();
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error removing delivery from route:', error);
        throw error;
    }
}

/**
 * Get route items (deliveries in route)
 */
async function getRouteItems(routeId) {
    try {
        const response = await apiGet(`/api/v1/delivery/routes/${routeId}/items`);

        if (response.success && response.data) {
            return response.data;
        }
    } catch (error) {
        console.error('❌ Error getting route items:', error);
        return [];
    }
}

// ==================== API INTEGRATION - ATTENDANCE ====================

/**
 * Record driver attendance
 */
async function recordAttendance(driverId, attendanceData) {
    try {
        showLoading();
        const response = await apiPost(
            `/api/v1/delivery/drivers/${driverId}/attendance`,
            attendanceData
        );
        hideLoading();

        if (response.success) {
            showSuccess('Attendance recorded successfully');
            return response.data;
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error recording attendance:', error);
        throw error;
    }
}

/**
 * Get driver attendance records
 */
async function getDriverAttendance(driverId, fromDate, toDate) {
    try {
        const response = await apiGet(
            `/api/v1/delivery/drivers/${driverId}/attendance`,
            { from: fromDate, to: toDate }
        );

        if (response.success && response.data) {
            return response.data;
        }
    } catch (error) {
        console.error('❌ Error getting attendance:', error);
        return [];
    }
}

// ==================== UI RENDERING ====================

/**
 * Render deliveries table
 */
function renderDeliveriesTable(pageData) {
    const tbody = document.getElementById('deliveriesTableBody');
    if (!tbody) return;

    if (!pageData.content || pageData.content.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No deliveries found</td></tr>';
        return;
    }

    tbody.innerHTML = pageData.content.map(delivery => `
        <tr>
            <td>${delivery.deliveryCode}</td>
            <td>${delivery.orderCode}</td>
            <td>
                ${delivery.deliveryAddress}<br>
                <small class="text-muted">${delivery.customerPhone}</small>
            </td>
            <td>${delivery.driverName || '<span class="text-muted">Unassigned</span>'}</td>
            <td>${delivery.vehicleNumber || '<span class="text-muted">Unassigned</span>'}</td>
            <td>${delivery.scheduledDate ? formatDate(delivery.scheduledDate) : '-'}</td>
            <td><span class="badge bg-${getStatusColor(delivery.status)}">${delivery.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="viewDelivery(${delivery.deliveryId})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${delivery.status === 'PENDING' ? `
                        <button class="btn btn-primary" onclick="showAssignModal(${delivery.deliveryId})" title="Assign">
                            <i class="bi bi-person-plus"></i>
                        </button>
                    ` : ''}
                    ${!['DELIVERED', 'CANCELLED', 'FAILED'].includes(delivery.status) ? `
                        <button class="btn btn-warning" onclick="showUpdateStatusModal(${delivery.deliveryId})" title="Update Status">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render drivers table
 */
function renderDriversTable() {
    const tbody = document.getElementById('driversTableBody');
    if (!tbody) return;

    if (driversCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No drivers found</td></tr>';
        return;
    }

    tbody.innerHTML = driversCache.map(driver => `
        <tr>
            <td>${driver.driverCode}</td>
            <td>${driver.fullName}</td>
            <td>${driver.phone}</td>
            <td>${driver.licenseNumber}</td>
            <td><span class="badge bg-${driver.isActive ? 'success' : 'danger'}">${driver.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="editDriver(${driver.driverId})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-${driver.isActive ? 'danger' : 'success'}" 
                            onclick="toggleDriverStatus(${driver.driverId}, ${!driver.isActive})" 
                            title="${driver.isActive ? 'Deactivate' : 'Activate'}">
                        <i class="bi bi-${driver.isActive ? 'x-circle' : 'check-circle'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render vehicles table
 */
function renderVehiclesTable() {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!tbody) return;

    if (vehiclesCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No vehicles found</td></tr>';
        return;
    }

    tbody.innerHTML = vehiclesCache.map(vehicle => `
        <tr>
            <td>${vehicle.vehicleCode}</td>
            <td>${vehicle.vehicleNumber}</td>
            <td>${vehicle.vehicleType}</td>
            <td>${vehicle.make || '-'} ${vehicle.model || ''}</td>
            <td><span class="badge bg-${vehicle.isActive ? 'success' : 'danger'}">${vehicle.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="editVehicle(${vehicle.vehicleId})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-${vehicle.isActive ? 'danger' : 'success'}" 
                            onclick="toggleVehicleStatus(${vehicle.vehicleId}, ${!vehicle.isActive})" 
                            title="${vehicle.isActive ? 'Deactivate' : 'Activate'}">
                        <i class="bi bi-${vehicle.isActive ? 'x-circle' : 'check-circle'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render routes table
 */
function renderRoutesTable() {
    const tbody = document.getElementById('routesTableBody');
    if (!tbody) return;

    if (routesCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No routes found</td></tr>';
        return;
    }

    tbody.innerHTML = routesCache.map(route => `
        <tr>
            <td>${route.routeName}</td>
            <td>${formatDate(route.routeDate)}</td>
            <td>${route.driverName || '-'}</td>
            <td>${route.vehicleNumber || '-'}</td>
            <td>${route.totalDeliveries || 0}</td>
            <td><span class="badge bg-${getRouteStatusColor(route.status)}">${route.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="viewRoute(${route.routeId})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${route.status === 'PLANNED' ? `
                        <button class="btn btn-success" onclick="updateRouteStatus(${route.routeId}, 'IN_PROGRESS')" title="Start">
                            <i class="bi bi-play"></i>
                        </button>
                    ` : ''}
                    ${route.status === 'IN_PROGRESS' ? `
                        <button class="btn btn-primary" onclick="updateRouteStatus(${route.routeId}, 'COMPLETED')" title="Complete">
                            <i class="bi bi-check2"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Populate driver dropdowns
 */
function populateDriverDropdowns() {
    const selects = document.querySelectorAll('.driver-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Driver</option>' +
            driversCache
                .filter(d => d.isActive)
                .map(d => `<option value="${d.driverId}">${d.fullName} (${d.driverCode})</option>`)
                .join('');
    });
}

/**
 * Populate vehicle dropdowns
 */
function populateVehicleDropdowns() {
    const selects = document.querySelectorAll('.vehicle-select');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Vehicle</option>' +
            vehiclesCache
                .filter(v => v.isActive)
                .map(v => `<option value="${v.vehicleId}">${v.vehicleNumber} (${v.vehicleType})</option>`)
                .join('');
    });
}

/**
 * Get status badge color
 */
function getStatusColor(status) {
    const colors = {
        'PENDING': 'secondary',
        'ASSIGNED': 'info',
        'PICKED_UP': 'primary',
        'IN_TRANSIT': 'warning',
        'DELIVERED': 'success',
        'FAILED': 'danger',
        'CANCELLED': 'dark'
    };
    return colors[status] || 'secondary';
}

/**
 * Get route status color
 */
function getRouteStatusColor(status) {
    const colors = {
        'PLANNED': 'info',
        'IN_PROGRESS': 'warning',
        'COMPLETED': 'success',
        'CANCELLED': 'dark'
    };
    return colors[status] || 'secondary';
}

/**
 * Update pagination
 */
function updatePagination(pageData) {
    // Implementation similar to the one in deliveries.js earlier
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    // Build pagination HTML...
}

/**
 * Change page
 */
function changePage(page) {
    currentPage = page;
    loadDeliveries();
}

/**
 * Handle filter changes
 */
function handleStatusFilterChange(e) {
    currentFilters.status = e.target.value || null;
    currentPage = 0;
    loadDeliveries();
}

function handleDateFilterChange(e) {
    currentFilters.date = e.target.value || null;
    currentPage = 0;
    loadDeliveries();
}

function handleSearch(e) {
    // Implement search logic
    loadDeliveries();
}

// ==================== MODAL HANDLERS (Placeholders) ====================

function showCreateDeliveryModal() {
    // Show modal for creating delivery
}

function showCreateDriverModal() {
    // Show modal for creating driver
}

function showCreateVehicleModal() {
    // Show modal for creating vehicle
}

function showCreateRouteModal() {
    // Show modal for creating route
}

function showAssignModal(deliveryId) {
    // Show modal for assigning delivery
}

function showUpdateStatusModal(deliveryId) {
    // Show modal for updating status
}

function viewDelivery(deliveryId) {
    // View delivery details
}

function viewRoute(routeId) {
    // View route details
}

function editDriver(driverId) {
    // Edit driver
}

function editVehicle(vehicleId) {
    // Edit vehicle
}
