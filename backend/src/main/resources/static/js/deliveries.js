// ==================== DELIVERY MANAGEMENT SYSTEM ====================
// Comprehensive JavaScript for all 6 Delivery Management Forms

// ==================== DATA STORAGE ====================
let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
let drivers = JSON.parse(localStorage.getItem('delivery_drivers')) || [];
let vehicles = JSON.parse(localStorage.getItem('delivery_vehicles')) || [];
let routes = JSON.parse(localStorage.getItem('delivery_routes')) || [];
let deliveryRequests = JSON.parse(localStorage.getItem('delivery_requests')) || [];

// Current editing IDs
let editingDriverId = null;
let editingVehicleId = null;
let editingRouteId = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚚 Delivery Management System Initializing...');

    // Initialize blur effects for all modals
    initializeBlurEffects();

    // Initialize sample data if needed
    initializeSampleData();

    // Load all data
    loadAllData();

    // Set up all form handlers
    setupFormHandlers();

    // Set up tab handlers
    setupTabHandlers();

    // Set up search functionality
    setupSearch();

    // Update statistics
    updateStatistics();

    console.log('✅ Delivery Management System Ready');
});

// Initialize blur effects for modals
function initializeBlurEffects() {
    const modalIds = [
        'modalDeliveryAssignment',
        'modalDeliveryRequest',
        'modalDriverForm',
        'modalVehicleForm'
    ];

    modalIds.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('show.bs.modal', () => {
                document.querySelector('.main-content-wrapper')?.classList.add('blur-background');
            });
            modal.addEventListener('hide.bs.modal', () => {
                document.querySelector('.main-content-wrapper')?.classList.remove('blur-background');
            });
        }
    });
}

// Initialize sample data
function initializeSampleData() {
    // Sample Drivers
    if (drivers.length === 0) {
        drivers = [
            {
                id: 1,
                name: 'Rohan Silva',
                phone: '+94771234567',
                email: 'rohan@example.com',
                license: 'DL-KAN-12345',
                licenseExpiry: '2025-12-31',
                hiredDate: '2023-01-15',
                status: 'available',
                userAccountId: null,
                currentDeliveryId: null
            },
            {
                id: 2,
                name: 'Priya Fernando',
                phone: '+94769876543',
                email: 'priya@example.com',
                license: 'DL-COL-67890',
                licenseExpiry: '2024-06-30',
                hiredDate: '2023-03-20',
                status: 'on_delivery',
                userAccountId: null,
                currentDeliveryId: 'DEL-001'
            },
            {
                id: 3,
                name: 'Kasun Perera',
                phone: '+94775555555',
                email: 'kasun@example.com',
                license: 'DL-GAL-11111',
                licenseExpiry: '2026-01-15',
                hiredDate: '2022-11-10',
                status: 'available',
                userAccountId: null,
                currentDeliveryId: null
            }
        ];
        localStorage.setItem('delivery_drivers', JSON.stringify(drivers));
    }

    // Sample Vehicles
    if (vehicles.length === 0) {
        vehicles = [
            {
                id: 1,
                vehicleNumber: 'WP-1234',
                type: 'van',
                capacity: 500,
                capacityUnit: 'kg',
                status: 'available',
                lastMaintenance: '2024-11-15',
                nextMaintenance: '2025-02-15'
            },
            {
                id: 2,
                vehicleNumber: 'CP-5678',
                type: 'lorry',
                capacity: 1000,
                capacityUnit: 'kg',
                status: 'in_use',
                lastMaintenance: '2024-10-20',
                nextMaintenance: '2025-01-20'
            },
            {
                id: 3,
                vehicleNumber: 'KG-9012',
                type: 'bike',
                capacity: 50,
                capacityUnit: 'kg',
                status: 'available',
                lastMaintenance: '2024-12-01',
                nextMaintenance: '2025-03-01'
            },
            {
                id: 4,
                vehicleNumber: 'NC-3456',
                type: 'tuk-tuk',
                capacity: 100,
                capacityUnit: 'kg',
                status: 'maintenance',
                lastMaintenance: '2024-12-10',
                nextMaintenance: '2024-12-20'
            }
        ];
        localStorage.setItem('delivery_vehicles', JSON.stringify(vehicles));
    }

    // Sample Routes
    if (routes.length === 0) {
        routes = [
            {
                id: 1,
                name: 'Colombo North',
                areas: ['Colombo', 'Gampaha', 'Negombo'],
                defaultDriverId: 1,
                startTime: '08:00',
                endTime: '16:00',
                status: 'active'
            },
            {
                id: 2,
                name: 'Kandy Central',
                areas: ['Kandy', 'Peradeniya'],
                defaultDriverId: 2,
                startTime: '09:00',
                endTime: '17:00',
                status: 'active'
            },
            {
                id: 3,
                name: 'Southern Route',
                areas: ['Galle', 'Matara'],
                defaultDriverId: null,
                startTime: '07:00',
                endTime: '15:00',
                status: 'active'
            }
        ];
        localStorage.setItem('delivery_routes', JSON.stringify(routes));
    }
}

// ==================== FORM HANDLERS ====================
function setupFormHandlers() {
    // Form 6.1: Delivery Assignment Form
    const deliveryAssignmentForm = document.getElementById('deliveryAssignmentForm');
    if (deliveryAssignmentForm) {
        deliveryAssignmentForm.addEventListener('submit', handleDeliveryAssignment);

        // Order selection change
        document.getElementById('assignOrderCode')?.addEventListener('change', handleOrderSelection);

        // Set default dispatch time to now
        const dispatchTimeInput = document.getElementById('assignDispatchTime');
        if (dispatchTimeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dispatchTimeInput.value = now.toISOString().slice(0, 16);
        }
    }

    // Form 6.3: Delivery Request Form
    const deliveryRequestForm = document.getElementById('deliveryRequestForm');
    if (deliveryRequestForm) {
        deliveryRequestForm.addEventListener('submit', handleDeliveryRequest);

        // Product selection change
        document.getElementById('requestProduct')?.addEventListener('change', handleProductSelection);

        // Set minimum date to tomorrow
        const requestDateInput = document.getElementById('requestDate');
        if (requestDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            requestDateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    // Form 6.4: Driver Form
    const driverForm = document.getElementById('driverForm');
    if (driverForm) {
        driverForm.addEventListener('submit', handleDriverSave);
    }

    // Delete driver button
    const btnDeleteDriver = document.getElementById('btnDeleteDriver');
    if (btnDeleteDriver) {
        btnDeleteDriver.addEventListener('click', handleDriverDelete);
    }

    // Delete driver button
    document.getElementById('btnDeleteDriver')?.addEventListener('click', handleDriverDelete);

    // Form 6.6: Vehicle Form
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleVehicleSave);

        // Maintenance check
        document.getElementById('vehicleNextMaintenance')?.addEventListener('change', checkMaintenance);
    }

    // Delete vehicle button
    document.getElementById('btnDeleteVehicle')?.addEventListener('click', handleVehicleDelete);
}

// ==================== FORM 6.1: DELIVERY ASSIGNMENT ====================
function handleOrderSelection(e) {
    const orderId = e.target.value;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.code === orderId);

    if (order) {
        document.getElementById('assignCustomer').value = order.customerName || '';
        document.getElementById('assignDeliveryAddress').value = order.deliveryAddress || order.address || '';
        document.getElementById('assignDeliveryType').value = order.deliveryType || 'Standard';
    }
}

function handleDeliveryAssignment(e) {
    e.preventDefault();

    const orderCode = document.getElementById('assignOrderCode').value;
    const driverId = parseInt(document.getElementById('assignDriver').value);
    const vehicleId = parseInt(document.getElementById('assignVehicle').value);
    const routeId = document.getElementById('assignRoute').value ? parseInt(document.getElementById('assignRoute').value) : null;
    const dispatchTime = document.getElementById('assignDispatchTime').value;
    const estimatedTime = document.getElementById('assignEstimatedTime').value;
    const notes = document.getElementById('assignNotes').value;

    if (!orderCode || !driverId || !vehicleId || !dispatchTime) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
    }

    // Create delivery assignment
    const delivery = {
        id: generateId('DEL'),
        orderCode: orderCode,
        customer: document.getElementById('assignCustomer').value,
        address: document.getElementById('assignDeliveryAddress').value,
        deliveryType: document.getElementById('assignDeliveryType').value,
        driverId: driverId,
        vehicleId: vehicleId,
        routeId: routeId,
        dispatchTime: dispatchTime,
        estimatedTime: estimatedTime,
        notes: notes,
        status: 'assigned',
        assignedAt: new Date().toISOString()
    };

    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));

    // Update driver status to "on_delivery"
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
        driver.status = 'on_delivery';
        driver.currentDeliveryId = delivery.id;
        localStorage.setItem('delivery_drivers', JSON.stringify(drivers));
    }

    // Update vehicle status to "in_use"
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        vehicle.status = 'in_use';
        localStorage.setItem('delivery_vehicles', JSON.stringify(vehicles));
    }

    // Send SMS (simulated)
    simulateSMS(driver, delivery);

    // Show success message
    Swal.fire({
        icon: 'success',
        title: 'Delivery Assigned!',
        text: `Driver ${driver.name} has been assigned and customer will be notified via SMS`,
        showConfirmButton: true
    }).then(() => {
        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('modalDeliveryAssignment')).hide();
        loadAllData();
        updateStatistics();
    });
}

function simulateSMS(driver, delivery) {
    console.log(`📱 SMS Sent to Customer:`);
    console.log(`Your delivery is on the way!`);
    console.log(`Driver: ${driver.name}`);
    console.log(`Phone: ${driver.phone}`);
    console.log(`ETA: ${new Date(delivery.estimatedTime).toLocaleString()}`);
}

// ==================== FORM 6.3: DELIVERY REQUEST (REMOVED - NOT USED IN SIMPLIFIED DELIVERY SYSTEM) ====================
// Delivery request form functionality has been moved to the main pending orders tab
function handleProductSelection(e) {
    const productId = e.target.value;
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);

    if (product) {
        document.getElementById('requestBatch').value = product.batch || 'BATCH-001';
        document.getElementById('requestAvailable').textContent = product.stock || 0;
        document.getElementById('requestQuantity').max = product.stock || 0;
    }
}

function handleDeliveryRequest(e) {
    e.preventDefault();

    const productId = document.getElementById('requestProduct').value;
    const quantity = parseInt(document.getElementById('requestQuantity').value);
    const deliveryDate = document.getElementById('requestDate').value;
    const timeSlot = document.querySelector('input[name="timeSlot"]:checked')?.value;
    const address = document.getElementById('requestAddress').value;

    if (!productId || !quantity || !deliveryDate || !timeSlot || !address) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
    }

    const request = {
        id: generateId('REQ'),
        productId: productId,
        quantity: quantity,
        deliveryDate: deliveryDate,
        timeSlot: timeSlot,
        address: address,
        customerName: document.getElementById('requestCustomerName').value,
        customerPhone: document.getElementById('requestCustomerPhone').value,
        status: 'pending',
        requestedAt: new Date().toISOString()
    };

    deliveryRequests.push(request);
    localStorage.setItem('delivery_requests', JSON.stringify(deliveryRequests));

    Swal.fire({
        icon: 'success',
        title: 'Request Submitted!',
        text: "You'll receive confirmation within 24 hours.",
        showConfirmButton: true
    }).then(() => {
        bootstrap.Modal.getInstance(document.getElementById('modalDeliveryRequest')).hide();
        document.getElementById('deliveryRequestForm').reset();
    });
}

// ==================== FORM 6.4: DRIVER MANAGEMENT ====================
function checkLicenseExpiry(e) {
    const expiryDate = new Date(e.target.value);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

    const warning = document.getElementById('licenseExpiryWarning');
    if (daysUntilExpiry < 30) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

function handleDriverSave(e) {
    e.preventDefault();

    const driverId = document.getElementById('driverId').value;
    const name = document.getElementById('driverName').value;
    const phone = document.getElementById('driverPhone').value;
    const email = document.getElementById('driverEmail').value;
    const address = document.getElementById('driverAddress').value;
    const license = document.getElementById('driverLicense').value;
    const licenseType = document.getElementById('driverLicenseType').value;
    const isActive = document.getElementById('driverActive').checked;

    if (!name || !phone || !license) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
    }

    // Auto-generate driver code if creating new driver
    let driverCode = driverId ? document.getElementById('driverId').dataset.existingCode : null;
    if (!driverCode) {
        // Generate format: DRV-XXX (3 random uppercase letters)
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
        driverCode = 'DRV-' + randomLetters;
    }

    const driverData = {
        driverCode: driverCode,
        fullName: name,
        phone: phone,
        email: email || null,
        address: address || null,
        licenseNumber: license,
        licenseType: licenseType || null,
        isActive: isActive
    };

    const url = driverId ? `/api/v1/delivery/drivers/${driverId}` : '/api/v1/delivery/drivers';
    const method = driverId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'User-Id': getCurrentUserId()
        },
        body: JSON.stringify(driverData)
    })
        .then(response => {
            // Check if response is ok (status 200-299)
            return response.json().then(data => ({
                ok: response.ok,
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            if (result.ok && result.data.success) {
                Swal.fire('Success', result.data.message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('modalDriverForm')).hide();
                loadDrivers();
                resetDriverForm();
            } else {
                // Handle both HTTP errors and API errors
                Swal.fire('Error', result.data.message || 'Failed to save driver', 'error');
            }
        })
        .catch(error => {
            console.error('Error saving driver:', error);
            Swal.fire('Error', 'Network error. Failed to save driver.', 'error');
        });
}

function resetDriverForm() {
    document.getElementById('driverForm').reset();
    const driverIdElement = document.getElementById('driverId');
    driverIdElement.value = '';
    driverIdElement.dataset.existingCode = '';
    document.getElementById('driverActive').checked = true;
    document.getElementById('btnDeleteDriver').style.display = 'none';
    document.getElementById('driverFormTitle').innerHTML = '<i class="fas fa-user-plus me-2"></i>Add Driver';
    editingDriverId = null;
}

function loadEmployeeDropdown() {
    const select = document.getElementById('driverEmployeeLink');
    if (!select) return;

    // Load active employees from the API
    fetch('/api/employees/active')
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                select.innerHTML = '<option value="">Not linked to employee...</option>';
                result.data.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.employeeId;
                    option.textContent = `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading employees:', error);
        });
}

function loadUserDropdown() {
    const select = document.getElementById('driverUserAccount');
    if (!select) return;

    // Load active users from the API  
    fetch('/api/users')
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                select.innerHTML = '<option value="">No user account...</option>';
                result.data.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.userId;
                    option.textContent = `${user.username} (${user.email || 'No email'})`;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

function handleDriverDelete() {
    const driverId = document.getElementById('driverId').value;
    if (!driverId) return;

    Swal.fire({
        title: 'Delete Driver?',
        text: 'This action cannot be undone',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/v1/delivery/drivers/${driverId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id': getCurrentUserId()
                }
            })
                .then(response => {
                    return response.json().then(data => ({
                        ok: response.ok,
                        status: response.status,
                        data: data
                    }));
                })
                .then(result => {
                    if (result.ok && result.data.success) {
                        Swal.fire('Deleted!', result.data.message, 'success');
                        bootstrap.Modal.getInstance(document.getElementById('modalDriverForm')).hide();
                        loadDrivers();
                        resetDriverForm();
                    } else {
                        Swal.fire('Error', result.data.message || 'Failed to delete driver', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting driver:', error);
                    Swal.fire('Error', 'Network error. Failed to delete driver.', 'error');
                });
        }
    });
}

function editDriver(id) {
    fetch(`/api/v1/delivery/drivers/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const driver = result.data;

                document.getElementById('driverFormTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Driver';
                const driverIdElement = document.getElementById('driverId');
                driverIdElement.value = driver.driverId;
                // Store the existing driver code to prevent regeneration
                driverIdElement.dataset.existingCode = driver.driverCode;
                document.getElementById('driverName').value = driver.fullName;
                document.getElementById('driverPhone').value = driver.phone;
                document.getElementById('driverEmail').value = driver.email || '';
                document.getElementById('driverAddress').value = driver.address || '';
                document.getElementById('driverLicense').value = driver.licenseNumber;
                document.getElementById('driverLicenseType').value = driver.licenseType || '';
                document.getElementById('driverActive').checked = driver.isActive;

                document.getElementById('btnDeleteDriver').style.display = 'block';

                new bootstrap.Modal(document.getElementById('modalDriverForm')).show();
            } else {
                Swal.fire('Error', 'Driver not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading driver:', error);
            Swal.fire('Error', 'Failed to load driver details', 'error');
        });
}

// ==================== FORM 6.6: VEHICLE MANAGEMENT ====================
function checkMaintenance(e) {
    const maintenanceDate = new Date(e.target.value);
    const today = new Date();
    const daysUntilMaintenance = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));

    const warning = document.getElementById('maintenanceWarning');
    if (daysUntilMaintenance < 7) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

function handleVehicleSave(e) {
    e.preventDefault();

    const vehicleId = document.getElementById('vehicleId').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
    const vehicleType = document.getElementById('vehicleType').value;
    const make = document.getElementById('vehicleMake').value.trim() || null;
    const model = document.getElementById('vehicleModel').value.trim() || null;
    const year = document.getElementById('vehicleYear').value || null;
    const fuelType = document.getElementById('vehicleFuelType').value || null;
    const capacity = document.getElementById('vehicleCapacity').value || null;
    const insuranceExpiry = document.getElementById('vehicleInsuranceExpiry').value || null;
    const revenueLicenseExpiry = document.getElementById('vehicleRevenueLicenseExpiry').value || null;

    if (!vehicleNumber || !vehicleType) {
        Swal.fire('Error', 'Please fill in all required fields (Vehicle Number and Type)', 'error');
        return;
    }

    const vehicleData = {
        vehicleNumber: vehicleNumber,
        vehicleType: vehicleType,
        make: make,
        model: model,
        yearManufactured: year ? parseInt(year) : null,
        fuelType: fuelType,
        capacityKg: capacity ? parseFloat(capacity) : null,
        insuranceExpiryDate: insuranceExpiry,
        revenueLicenseExpiryDate: revenueLicenseExpiry
    };

    const url = vehicleId ? `/api/v1/delivery/vehicles/${vehicleId}` : '/api/v1/delivery/vehicles';
    const method = vehicleId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'User-Id': getCurrentUserId()
        },
        body: JSON.stringify(vehicleData)
    })
        .then(response => {
            return response.json().then(data => ({
                ok: response.ok,
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            if (result.ok && result.data.success) {
                Swal.fire('Success', result.data.message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('modalVehicleForm')).hide();
                loadVehicles();
                resetVehicleForm();
            } else {
                Swal.fire('Error', result.data.message || 'Failed to save vehicle', 'error');
            }
        })
        .catch(error => {
            console.error('Error saving vehicle:', error);
            Swal.fire('Error', 'Network error. Failed to save vehicle.', 'error');
        });
}

function handleVehicleDelete() {
    const vehicleId = document.getElementById('vehicleId').value;
    if (!vehicleId) return;

    Swal.fire({
        title: 'Delete Vehicle?',
        text: 'This will deactivate the vehicle',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/v1/delivery/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'User-Id': getCurrentUserId()
                }
            })
                .then(response => {
                    return response.json().then(data => ({
                        ok: response.ok,
                        status: response.status,
                        data: data
                    }));
                })
                .then(result => {
                    if (result.ok && result.data.success) {
                        Swal.fire('Deleted!', result.data.message, 'success');
                        bootstrap.Modal.getInstance(document.getElementById('modalVehicleForm')).hide();
                        loadVehicles();
                        resetVehicleForm();
                    } else {
                        Swal.fire('Error', result.data.message || 'Failed to delete vehicle', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error deleting vehicle:', error);
                    Swal.fire('Error', 'Network error. Failed to delete vehicle.', 'error');
                });
        }
    });
}

function resetVehicleForm() {
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
    document.getElementById('vehicleCode').value = '';
    document.getElementById('vehicleFormTitle').innerHTML = '<i class="fas fa-car me-2"></i>Add Vehicle';
    document.getElementById('btnDeleteVehicle').style.display = 'none';
}

function toggleVehicleStatus(vehicleId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';

    fetch(`/api/v1/delivery/vehicles/${vehicleId}/${action}`, {
        method: 'PATCH',
        headers: {
            'User-Id': getCurrentUserId()
        }
    })
        .then(response => {
            return response.json().then(data => ({
                ok: response.ok,
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            if (result.ok && result.data.success) {
                Swal.fire('Success', result.data.message, 'success');
                loadVehicles();
            } else {
                Swal.fire('Error', result.data.message || 'Failed to update status', 'error');
            }
        })
        .catch(error => {
            console.error('Error toggling vehicle status:', error);
            Swal.fire('Error', 'Network error. Failed to update status.', 'error');
        });
}

function editVehicle(vehicleId) {
    fetch(`/api/v1/delivery/vehicles/${vehicleId}`, {
        headers: {
            'User-Id': getCurrentUserId()
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const vehicle = result.data;

                document.getElementById('vehicleFormTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Vehicle';
                document.getElementById('vehicleId').value = vehicle.vehicleId;
                document.getElementById('vehicleCode').value = vehicle.vehicleCode;
                document.getElementById('vehicleNumber').value = vehicle.vehicleNumber;
                document.getElementById('vehicleType').value = vehicle.vehicleType;
                document.getElementById('vehicleMake').value = vehicle.make || '';
                document.getElementById('vehicleModel').value = vehicle.model || '';
                document.getElementById('vehicleYear').value = vehicle.yearManufactured || '';
                document.getElementById('vehicleFuelType').value = vehicle.fuelType || '';
                document.getElementById('vehicleCapacity').value = vehicle.capacityKg || '';
                document.getElementById('vehicleInsuranceExpiry').value = vehicle.insuranceExpiryDate || '';
                document.getElementById('vehicleRevenueLicenseExpiry').value = vehicle.revenueLicenseExpiryDate || '';
                document.getElementById('vehicleIsActive').value = vehicle.isActive ? 'true' : 'false';

                document.getElementById('btnDeleteVehicle').style.display = 'block';

                new bootstrap.Modal(document.getElementById('modalVehicleForm')).show();
            } else {
                Swal.fire('Error', 'Failed to load vehicle data', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading vehicle:', error);
            Swal.fire('Error', 'Failed to load vehicle data', 'error');
        });
}

// ==================== DATA LOADING ====================
function loadAllData() {
    loadDeliveries();
    loadPendingOrders();
    loadDrivers();
    loadVehicles();
    // Routes feature removed - direct assignment only
    // loadRoutes();
    populateDropdowns();
}

/**
 * Load pending online delivery orders from Orders API
 * Filters: orderType = ONLINE, fulfillmentType = DELIVERY, status = PENDING
 */
function loadPendingOrders() {
    const tbody = document.getElementById('pendingOrdersTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="10" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading pending orders...</td></tr>';

    fetch('/api/orders')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch orders');
            return response.json();
        })
        .then(result => {
            // Filter for ONLINE + DELIVERY + PENDING orders
            const pendingOrders = (result.data || []).filter(order =>
                order.orderType === 'ONLINE' &&
                order.fulfillmentType === 'DELIVERY' &&
                order.status === 'PENDING'
            );

            // Update badge count
            const badge = document.getElementById('pendingOrdersBadge');
            if (badge) {
                badge.textContent = pendingOrders.length;
                badge.style.display = pendingOrders.length > 0 ? 'inline-block' : 'none';
            }

            // Display pending orders
            if (pendingOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4"><i class="fas fa-check-circle"></i> No pending delivery orders</td></tr>';
                return;
            }

            tbody.innerHTML = pendingOrders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${order.orderCode}</strong></td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${order.deliveryPhone || 'N/A'}</td>
                    <td>${order.deliveryAddress || 'N/A'}</td>
                    <td><span class="badge bg-info">${order.deliveryCity || 'N/A'}</span></td>
                    <td><span class="badge bg-secondary">${order.items ? order.items.length : 0}</span></td>
                    <td class="fw-bold text-success">Rs. ${formatNumber(order.grandTotal || 0)}</td>
                    <td><small>${formatDateTime(order.createdAt)}</small></td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-info" onclick="viewOrderDetails(${order.orderId})" title="View Order">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-primary" onclick="assignDelivery(${order.orderId}, '${order.orderCode}')" title="Assign Delivery">
                                <i class="fas fa-truck-loading"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading pending orders:', error);
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger"><i class="fas fa-exclamation-circle"></i> Failed to load pending orders</td></tr>';
        });
}

/**
 * Format number as currency
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
 * Format date only
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * View order details
 */
function viewOrderDetails(orderId) {
    fetch(`/api/orders/${orderId}`)
        .then(response => response.json())
        .then(result => {
            const order = result.data;
            const itemsHTML = (order.items || []).map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">Rs. ${formatNumber(item.unitPrice)}</td>
                    <td class="text-end">Rs. ${formatNumber(item.lineTotal)}</td>
                </tr>
            `).join('');

            Swal.fire({
                title: `Order ${order.orderCode}`,
                html: `
                    <div class="text-start">
                        <h6 class="text-primary mb-2">Customer Details</h6>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Phone:</strong> ${order.deliveryPhone}</p>
                        <p><strong>Address:</strong> ${order.deliveryAddress}</p>
                        <p><strong>City:</strong> ${order.deliveryCity}</p>
                        
                        <h6 class="text-primary mb-2 mt-3">Order Items</h6>
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-end">Price</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>
                        
                        <div class="alert alert-info mt-3">
                            <strong>Grand Total:</strong> Rs. ${formatNumber(order.grandTotal)}
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Close'
            });
        })
        .catch(error => {
            console.error('Error loading order:', error);
            Swal.fire('Error', 'Failed to load order details', 'error');
        });
}

/**
 * Assign delivery to a pending order (Driver + Vehicle only, no routes)
 */
function assignDelivery(orderId, orderCode) {
    // Load order details, drivers, and vehicles
    Promise.all([
        fetch(`/api/orders/${orderId}`).then(r => r.json()),
        fetch('/api/v1/delivery/drivers').then(r => r.json()),
        fetch('/api/v1/delivery/vehicles?page=0&size=100').then(r => r.json())
    ])
        .then(([orderResult, driversResult, vehiclesResult]) => {
            if (!orderResult.data) throw new Error('Order not found');

            const order = orderResult.data;
            const deliveryAddress = order.deliveryAddress || '';
            const deliveryCity = order.deliveryCity || '';
            const deliveryPhone = order.deliveryPhone || '';

            const drivers = driversResult.data || [];
            const vehicles = (vehiclesResult.data?.content) || vehiclesResult.data || [];

            const driverOptions = drivers
                .filter(d => d.isActive)
                .map(d => `<option value="${d.driverId}">${d.driverCode} - ${d.fullName}</option>`)
                .join('');

            const vehicleOptions = vehicles
                .filter(v => v.isActive)
                .map(v => `<option value="${v.vehicleId}">${v.vehicleNumber} (${v.vehicleType})</option>`)
                .join('');

            Swal.fire({
                title: `📦 Assign Delivery<br><small>${orderCode}</small>`,
                html: `
                <div class="text-start">
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-map-pin me-2"></i><strong>Delivery Address</strong></label>
                        <div class="form-control bg-light" style="cursor: auto;">${deliveryAddress}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-city me-2"></i><strong>City</strong></label>
                        <div class="form-control bg-light" style="cursor: auto;">${deliveryCity}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-phone me-2"></i><strong>Phone</strong></label>
                        <div class="form-control bg-light" style="cursor: auto;">${deliveryPhone}</div>
                    </div>
                    <hr>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-user-tie me-2"></i><strong>Driver *</strong></label>
                        <select id="assignDriver" class="form-select" required>
                            <option value="">-- Select a driver --</option>
                            ${driverOptions}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-van-shuttle me-2"></i><strong>Vehicle *</strong></label>
                        <select id="assignVehicle" class="form-select" required>
                            <option value="">-- Select a vehicle --</option>
                            ${vehicleOptions}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-calendar-alt me-2"></i><strong>Expected Delivery Date *</strong></label>
                        <input type="date" id="expectedDeliveryDate" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="fas fa-sticky-note me-2"></i><strong>Notes (Optional)</strong></label>
                        <textarea id="deliveryNotes" class="form-control" rows="2" placeholder="Add any special instructions..."></textarea>
                    </div>
                </div>
            `,
                showCancelButton: true,
                confirmButtonText: '✓ Assign Delivery',
                confirmButtonColor: '#28a745',
                cancelButtonText: 'Cancel',
                width: '550px',
                preConfirm: () => {
                    const driverId = document.getElementById('assignDriver').value;
                    const vehicleId = document.getElementById('assignVehicle').value;
                    const deliveryDate = document.getElementById('expectedDeliveryDate').value;
                    const notes = document.getElementById('deliveryNotes').value;

                    if (!driverId) {
                        Swal.showValidationMessage('Please select a driver');
                        return false;
                    }
                    if (!vehicleId) {
                        Swal.showValidationMessage('Please select a vehicle');
                        return false;
                    }
                    if (!deliveryDate) {
                        Swal.showValidationMessage('Please select a delivery date');
                        return false;
                    }

                    return { driverId: parseInt(driverId), vehicleId: parseInt(vehicleId), deliveryDate, notes };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    const data = result.value;

                    // Step 1: Create the delivery record
                    fetch('/api/v1/delivery/deliveries', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Id': getCurrentUserId()
                        },
                        body: JSON.stringify({
                            orderId: orderId,
                            deliveryAddress: deliveryAddress,
                            deliveryCity: deliveryCity,
                            customerPhone: deliveryPhone,
                            scheduledDate: data.deliveryDate,
                            deliveryNotes: data.notes
                        })
                    })
                        .then(response => {
                            if (!response.ok) {
                                return response.json().then(err => {
                                    throw new Error(err.message || 'Failed to create delivery');
                                });
                            }
                            return response.json();
                        })
                        .then(result => {
                            if (result.success && result.data) {
                                const deliveryId = result.data.deliveryId;

                                // Step 2: Assign driver and vehicle to the delivery
                                return fetch(`/api/v1/delivery/deliveries/${deliveryId}/assign`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        driverId: data.driverId,
                                        vehicleId: data.vehicleId,
                                        scheduledDate: data.deliveryDate
                                    })
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            return response.json().then(err => {
                                                throw new Error(err.message || 'Failed to assign driver and vehicle');
                                            });
                                        }
                                        return response.json();
                                    })
                                    .then(assignResult => {
                                        if (assignResult.success) {
                                            // Step 3: Update order status to ASSIGNED
                                            return fetch(`/api/orders/${orderId}/status`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ statusId: 2, notes: 'Order assigned for delivery' })
                                            }).then(r => r.json());
                                        } else {
                                            throw new Error(assignResult.message || 'Failed to assign delivery');
                                        }
                                    });
                            } else {
                                throw new Error(result.message || 'Failed to create delivery');
                            }
                        })
                        .then(result => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Delivery Assigned!',
                                text: `Order ${orderCode} assigned to driver and vehicle`,
                                timer: 2000
                            });
                            loadPendingOrders();
                        })
                        .catch(error => {
                            console.error('Error assigning delivery:', error);
                            Swal.fire('Error', 'Failed to assign delivery: ' + error.message, 'error');
                        });
                }
            });
        })
        .catch(error => {
            console.error('Error loading delivery data:', error);
            Swal.fire('Error', 'Failed to load delivery data: ' + error.message, 'error');
        });
}

function loadDeliveries() {
    const tbody = document.getElementById('deliveriesTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="11" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading active deliveries...</td></tr>';

    // Fetch active deliveries with ASSIGNED or ON_ROAD status
    fetch('/api/v1/delivery/deliveries?page=0&size=100&status=ASSIGNED')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch deliveries');
            return response.json();
        })
        .then(result => {
            const deliveriesList = (result.data?.content) || result.data || [];

            if (deliveriesList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted py-4"><i class="fas fa-truck"></i> No active deliveries</td></tr>';
                return;
            }

            tbody.innerHTML = deliveriesList.map((delivery, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${delivery.deliveryCode || 'N/A'}</strong></td>
                    <td><strong>${delivery.orderCode || 'N/A'}</strong></td>
                    <td>${delivery.driverName || 'N/A'}</td>
                    <td>${delivery.deliveryAddress || 'N/A'}</td>
                    <td>${delivery.driverName || 'N/A'}</td>
                    <td>${delivery.vehicleNumber || 'N/A'}</td>
                    <td><small>${formatDateTime(delivery.createdAt)}</small></td>
                    <td><strong>${delivery.scheduledDate ? formatDate(delivery.scheduledDate) : 'N/A'}</strong></td>
                    <td><span class="badge bg-info">${delivery.status || 'PENDING'}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-info" onclick="viewDeliveryDetails(${delivery.deliveryId})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="completeDelivery(${delivery.deliveryId}, '${delivery.orderCode}')" title="Mark Complete">
                                <i class="fas fa-check-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading deliveries:', error);
            tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger"><i class="fas fa-exclamation-circle"></i> Failed to load deliveries</td></tr>';
        });
}

/**
 * Complete a delivery - Mark as DELIVERED
 */
function completeDelivery(deliveryId, orderCode) {
    // Fetch all orders to find the one matching this order code
    fetch(`/api/orders`)
        .then(r => r.json())
        .then(result => {
            if (result.data) {
                const orders = result.data;
                const order = orders.find(o => o.orderCode === orderCode);
                
                if (order) {
                    // Order found, proceed with completion
                    proceedCompleteDelivery(deliveryId, orderCode, order.orderId);
                } else {
                    // Order not found in list, proceed without order ID
                    proceedCompleteDelivery(deliveryId, orderCode, null);
                }
            } else {
                // No orders data, proceed without order ID
                proceedCompleteDelivery(deliveryId, orderCode, null);
            }
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            // Proceed anyway without order ID update
            proceedCompleteDelivery(deliveryId, orderCode, null);
        });
}

/**
 * Proceed with delivery completion - transitions through proper status flow
 */
function proceedCompleteDelivery(deliveryId, orderCode, orderId) {
    Swal.fire({
        title: '✓ Complete Delivery?',
        text: `Mark order ${orderCode} delivery as complete?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Complete',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            // Show loading message
            Swal.fire({
                icon: 'info',
                title: 'Processing...',
                text: 'Updating delivery status...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.hideLoading();
                }
            });

            // Status transition flow: ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
            updateDeliveryStatus(deliveryId, 'PICKED_UP')
                .then(() => updateDeliveryStatus(deliveryId, 'IN_TRANSIT'))
                .then(() => updateDeliveryStatus(deliveryId, 'DELIVERED'))
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Delivery Completed!',
                        text: `Order ${orderCode} delivery marked as complete`,
                        timer: 2000
                    });
                    
                    // Update order status to COMPLETED
                    if (orderId) {
                        // Update order status
                        fetch(`/api/orders/${orderId}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                statusId: 4,  // COMPLETED status
                                notes: 'Delivery completed' 
                            })
                        }).catch(err => console.error('Error updating order status:', err));
                        
                        // Update payment status for this order
                        fetch(`/api/payments/order/${orderId}`)
                            .then(r => r.json())
                            .then(result => {
                                if (result.data && Array.isArray(result.data)) {
                                    // For each payment, mark it as complete
                                    result.data.forEach(payment => {
                                        if (payment.paymentId && payment.status !== 'COMPLETED') {
                                            fetch(`/api/payments/${payment.paymentId}/complete`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                }
                                            })
                                            .then(r => r.json())
                                            .then(res => {
                                                console.log('Payment completed:', res);
                                            })
                                            .catch(err => console.error('Error completing payment:', err));
                                        }
                                    });
                                }
                            })
                            .catch(err => console.error('Error fetching payments:', err));
                    }
                    
                    // Reload deliveries table after a brief delay
                    setTimeout(() => {
                        loadDeliveries();
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error completing delivery:', error);
                    Swal.fire('Error', 'Failed to complete delivery: ' + error.message, 'error');
                });
        }
    });
}

/**
 * Update delivery status with proper error handling
 */
function updateDeliveryStatus(deliveryId, newStatus) {
    return fetch(`/api/v1/delivery/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newStatus,
            notes: `Delivery status updated to ${newStatus}`
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || `Failed to update status to ${newStatus}`);
            });
        }
        return response.json();
    })
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || `Failed to update status to ${newStatus}`);
        }
        return result;
    });
}

/**
 * Helper function to get orderId from orderCode
 */
function getOrderIdFromCode(orderCode) {
    // This is a placeholder - in a real scenario, you might need to fetch this
    // For now, we'll extract it from API response
    return null;
}

function loadDrivers(filterStatus = 'all') {
    const tbody = document.getElementById('driversTableBody');
    if (!tbody) return;

    const url = filterStatus === 'active' ? '/api/v1/delivery/drivers/active' : '/api/v1/delivery/drivers';

    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                let drivers = result.data;

                if (drivers.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No drivers found</td></tr>';
                    return;
                }

                tbody.innerHTML = drivers.map(driver => {
                    const statusBadge = driver.isActive
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>';

                    return `
                        <tr>
                            <td>${driver.driverCode}</td>
                            <td>${driver.fullName}</td>
                            <td>${driver.phone}</td>
                            <td>${driver.licenseNumber}</td>
                            <td>${driver.licenseType || '-'}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <button class="action-btn view" onclick="viewDriver(${driver.driverId})" title="View">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit" onclick="editDriver(${driver.driverId})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn ${driver.isActive ? 'warning' : 'success'}" 
                                        onclick="toggleDriverStatus(${driver.driverId})" 
                                        title="${driver.isActive ? 'Deactivate' : 'Activate'}">
                                    <i class="fas fa-toggle-${driver.isActive ? 'on' : 'off'}"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load drivers</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading drivers:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading drivers</td></tr>';
        });
}

function viewDriver(id) {
    fetch(`/api/v1/delivery/drivers/${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data) {
                const driver = result.data;

                Swal.fire({
                    title: `<strong>${driver.fullName}</strong>`,
                    html: `
                        <div class="text-start">
                            <p><strong>Driver Code:</strong> ${driver.driverCode}</p>
                            <p><strong>Phone:</strong> ${driver.phone}</p>
                            <p><strong>Email:</strong> ${driver.email || 'N/A'}</p>
                            <p><strong>License:</strong> ${driver.licenseNumber}</p>
                            <p><strong>License Type:</strong> ${driver.licenseType || 'N/A'}</p>
                            <p><strong>Address:</strong> ${driver.address || 'N/A'}</p>
                            <p><strong>Status:</strong> 
                                <span class="badge bg-${driver.isActive ? 'success' : 'secondary'}">
                                    ${driver.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Close'
                });
            }
        })
        .catch(error => {
            console.error('Error viewing driver:', error);
            Swal.fire('Error', 'Failed to load driver details', 'error');
        });
}

function toggleDriverStatus(id) {
    fetch(`/api/v1/delivery/drivers/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
            'User-Id': getCurrentUserId()
        }
    })
        .then(response => {
            return response.json().then(data => ({
                ok: response.ok,
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            if (result.ok && result.data.success) {
                Swal.fire('Success', result.data.message, 'success');
                loadDrivers();
            } else {
                Swal.fire('Error', result.data.message || 'Failed to update driver status', 'error');
            }
        })
        .catch(error => {
            console.error('Error toggling driver status:', error);
            Swal.fire('Error', 'Network error. Failed to update driver status.', 'error');
        });
}

function loadVehicles() {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!tbody) return;

    fetch('/api/v1/delivery/vehicles?page=0&size=100', {
        headers: {
            'User-Id': getCurrentUserId()
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data && result.data.content) {
                const vehicles = result.data.content;

                if (vehicles.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="10" class="text-center">No vehicles found</td></tr>';
                    return;
                }

                tbody.innerHTML = vehicles.map(vehicle => {
                    const statusBadge = vehicle.isActive
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>';

                    const statusToggle = vehicle.isActive
                        ? `<button class="action-btn" onclick="toggleVehicleStatus(${vehicle.vehicleId}, true)" title="Deactivate"><i class="fas fa-toggle-on text-success"></i></button>`
                        : `<button class="action-btn" onclick="toggleVehicleStatus(${vehicle.vehicleId}, false)" title="Activate"><i class="fas fa-toggle-off text-secondary"></i></button>`;

                    return `
                    <tr>
                        <td>${vehicle.vehicleCode}</td>
                        <td>${vehicle.vehicleNumber}</td>
                        <td>${vehicle.vehicleType || 'N/A'}</td>
                        <td>${vehicle.make || 'N/A'}</td>
                        <td>${vehicle.model || 'N/A'}</td>
                        <td>${vehicle.yearManufactured || 'N/A'}</td>
                        <td>${vehicle.fuelType || 'N/A'}</td>
                        <td>${vehicle.capacityKg ? vehicle.capacityKg + ' kg' : 'N/A'}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="action-btn view" onclick="viewVehicle(${vehicle.vehicleId})" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="editVehicle(${vehicle.vehicleId})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${statusToggle}
                        </td>
                    </tr>
                `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center">Failed to load vehicles</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading vehicles:', error);
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Error loading vehicles</td></tr>';
        });
}

function loadRoutes() {
    const tbody = document.getElementById('routesTableBody');
    if (!tbody) return;

    fetch('/api/v1/delivery/routes?page=0&size=100', {
        headers: {
            'User-Id': getCurrentUserId()
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data && result.data.content) {
                const routes = result.data.content;

                if (routes.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No routes found</td></tr>';
                    return;
                }

                tbody.innerHTML = routes.map(route => {
                    const statusBadge = getRouteStatusBadge(route.status);
                    const deliveryInfo = `${route.totalDeliveries || 0} (${route.completedDeliveries || 0}/${route.failedDeliveries || 0})`;

                    return `
                    <tr>
                        <td>${route.routeId}</td>
                        <td>${route.routeName}</td>
                        <td>${route.routeDate || 'N/A'}</td>
                        <td>${route.driverName || 'Not Assigned'}</td>
                        <td>${route.vehicleNumber || 'Not Assigned'}</td>
                        <td><small class="text-muted">${deliveryInfo}</small></td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="action-btn view" onclick="viewRoute(${route.routeId})" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="editRoute(${route.routeId})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load routes</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading routes:', error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading routes</td></tr>';
        });
}

function getRouteStatusBadge(status) {
    const statusColors = {
        'PLANNED': 'bg-info',
        'IN_PROGRESS': 'bg-primary',
        'COMPLETED': 'bg-success',
        'CANCELLED': 'bg-secondary'
    };
    const color = statusColors[status] || 'bg-secondary';
    return `<span class="badge ${color}">${status}</span>`;
}

// ==================== POPULATE DROPDOWNS ====================
function populateDropdowns() {
    // Populate product dropdown for delivery requests
    const productSelect = document.getElementById('requestProduct');
    if (productSelect) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productSelect.innerHTML = '<option value="">Select product...</option>' +
            products.filter(p => p.stock > 0)
                .map(p => `<option value="${p.id}">${p.name} - Rs. ${p.price}</option>`).join('');
    }

    // Pre-fill customer info for delivery request
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (currentUser.name) {
        const nameInput = document.getElementById('requestCustomerName');
        const phoneInput = document.getElementById('requestCustomerPhone');
        const addressInput = document.getElementById('requestAddress');

        if (nameInput) nameInput.value = currentUser.name;
        if (phoneInput) phoneInput.value = currentUser.phone || '';
        if (addressInput && currentUser.address) addressInput.value = currentUser.address;
    }
}

// ==================== TAB HANDLERS ====================
function setupTabHandlers() {
    // Driver status filter
    const filterLinks = document.querySelectorAll('#driverStatusFilter .nav-link');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const status = link.getAttribute('data-status');
            loadDrivers(status);
        });
    });
}

// ==================== SEARCH ====================
function setupSearch() {
    const searchInput = document.getElementById('searchDeliveries');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tbody = document.getElementById('deliveriesTableBody');
            const rows = tbody.querySelectorAll('tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// ==================== STATISTICS ====================
function updateStatistics() {
    const pending = deliveries.filter(d => d.status === 'assigned' || d.status === 'pending').length;
    const onRoad = deliveries.filter(d => d.status === 'out-for-delivery').length;
    const completed = deliveries.filter(d => {
        const deliveryDate = new Date(d.actualDeliveryTime || d.dispatchTime);
        const today = new Date();
        return d.status === 'delivered' && deliveryDate.toDateString() === today.toDateString();
    }).length;

    document.getElementById('pendingDeliveries').textContent = pending;
    document.getElementById('onRoadDeliveries').textContent = onRoad;
    document.getElementById('completedToday').textContent = completed;
    document.getElementById('avgDeliveryTime').textContent = '45 mins'; // Mock data
}

// ==================== UTILITY FUNCTIONS ====================
function getCurrentUserId() {
    // Try to get from session storage or local storage
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    return userId || '1'; // Default to 1 if not found
}

function generateId(prefix) {
    return parseInt(Math.random() * 100000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'assigned': 'info',
        'out-for-delivery': 'primary',
        'delivered': 'success',
        'failed': 'danger',
        'active': 'success',
        'completed': 'secondary',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

function getVehicleStatusColor(status) {
    const colors = {
        'available': 'success',
        'in_use': 'warning',
        'maintenance': 'danger',
        'retired': 'secondary'
    };
    return colors[status] || 'secondary';
}

function getDriverStatusBadge(status) {
    const badges = {
        'available': '<span class="status-indicator status-available"></span> Available',
        'on_delivery': '<span class="status-indicator status-on-delivery"></span> On Delivery',
        'off_duty': '<span class="status-indicator status-off-duty"></span> Off Duty'
    };
    return badges[status] || status;
}

function checkMaintenanceDue(nextMaintenance) {
    if (!nextMaintenance) return false;
    const maintenanceDate = new Date(nextMaintenance);
    const today = new Date();
    const daysUntilMaintenance = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance < 7;
}

// ==================== VIEW FUNCTIONS ====================
function viewDelivery(id) {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    Swal.fire({
        title: 'Delivery Details',
        html: `
            <div class="text-start">
                <p><strong>Order:</strong> ${delivery.orderCode}</p>
                <p><strong>Customer:</strong> ${delivery.customer}</p>
                <p><strong>Address:</strong> ${delivery.address}</p>
                <p><strong>Status:</strong> ${delivery.status}</p>
                <p><strong>Notes:</strong> ${delivery.notes || 'None'}</p>
            </div>
        `,
        icon: 'info'
    });
}

function viewVehicle(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    Swal.fire({
        title: 'Vehicle Details',
        html: `
            <div class="text-start">
                <p><strong>Number:</strong> ${vehicle.vehicleNumber}</p>
                <p><strong>Type:</strong> ${capitalizeFirst(vehicle.type)}</p>
                <p><strong>Capacity:</strong> ${vehicle.capacity} ${vehicle.capacityUnit}</p>
                <p><strong>Status:</strong> ${vehicle.status}</p>
            </div>
        `,
        icon: 'info'
    });
}

function viewRoute(id) {
    const route = routes.find(r => r.id === id);
    if (!route) return;

    Swal.fire({
        title: 'Route Details',
        html: `
            <div class="text-start">
                <p><strong>Name:</strong> ${route.name}</p>
                <p><strong>Areas:</strong> ${route.areas.join(', ')}</p>
                <p><strong>Time:</strong> ${route.startTime} - ${route.endTime || 'N/A'}</p>
                <p><strong>Status:</strong> ${route.status}</p>
            </div>
        `,
        icon: 'info'
    });
}

function assignDeliveryToDriver(driverId) {
    // Pre-select driver in assignment form
    document.getElementById('assignDriver').value = driverId;
    new bootstrap.Modal(document.getElementById('modalDeliveryAssignment')).show();
}

console.log('✅ Delivery Management System Loaded');
