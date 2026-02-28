# 🚚 Delivery Management Module - Backend Integration Guide

## ✅ Implementation Status

### Backend (100% Complete)
- ✅ Entity classes (7 entities)
- ✅ Enums (5 enums with business logic)
- ✅ Repositories (7 repositories with custom queries)
- ✅ DTOs (18 request/response classes)
- ✅ Services (5 services with full business logic)
- ✅ Controllers (4 REST controllers)
- ✅ Exception handling
- ✅ CORS configuration
- ✅ Automatic status history logging
- ✅ Status transition validation

### Frontend Integration Helper
- ✅ `api.js` - Complete API helper with fetch wrappers
- ✅ `deliveries-backend-integration.js` - Full integration example

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [API Endpoints](#api-endpoints)
3. [Frontend Integration](#frontend-integration)
4. [Migration from LocalStorage](#migration)
5. [Examples](#examples)

---

## 🚀 Quick Start

### 1. Include API Helper
```html
<!-- In your HTML (deliveries.html) -->
<script src="js/api.js"></script>
<script src="js/deliveries.js"></script>
```

### 2. Basic Usage Pattern

#### Load Deliveries
```javascript
async function loadDeliveries() {
    const response = await apiGet('/api/v1/delivery/deliveries', {
        page: 0,
        size: 10,
        status: 'PENDING'
    });
    
    if (response.success) {
        const deliveries = response.data.content;
        // Render deliveries...
    }
}
```

#### Create Delivery
```javascript
async function createDelivery() {
    const deliveryData = {
        orderId: 123,
        deliveryAddress: "123 Main St",
        deliveryCity: "Colombo",
        postalCode: "00100",
        customerPhone: "0771234567",
        scheduledDate: "2024-01-15"
    };
    
    const response = await apiPost('/api/v1/delivery/deliveries', deliveryData);
    
    if (response.success) {
        showSuccess('Delivery created: ' + response.data.deliveryCode);
        loadDeliveries(); // Reload table
    }
}
```

#### Assign Delivery
```javascript
async function assignDelivery(deliveryId, driverId, vehicleId) {
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/assign`,
        { driverId, vehicleId }
    );
    
    if (response.success) {
        showSuccess('Delivery assigned successfully');
        loadDeliveries();
    }
}
```

#### Update Status
```javascript
async function updateStatus(deliveryId, newStatus) {
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/status`,
        {
            status: newStatus,
            latitude: 6.9271,
            longitude: 79.8612,
            notes: "Package delivered at gate"
        }
    );
    
    if (response.success) {
        showSuccess('Status updated to ' + newStatus);
        loadDeliveries();
    }
}
```

---

## 📡 API Endpoints

### Deliveries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/delivery/deliveries` | List deliveries (paginated) |
| GET | `/api/v1/delivery/deliveries/{id}` | Get delivery details |
| GET | `/api/v1/delivery/deliveries/order/{orderId}` | Get delivery by order |
| POST | `/api/v1/delivery/deliveries` | Create new delivery |
| PATCH | `/api/v1/delivery/deliveries/{id}/assign` | Assign driver & vehicle |
| PATCH | `/api/v1/delivery/deliveries/{id}/status` | Update delivery status |
| PATCH | `/api/v1/delivery/deliveries/{id}/proof` | Update proof of delivery |

### Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/delivery/drivers` | List drivers (paginated) |
| GET | `/api/v1/delivery/drivers/{id}` | Get driver details |
| POST | `/api/v1/delivery/drivers` | Create new driver |
| PUT | `/api/v1/delivery/drivers/{id}` | Update driver |
| PATCH | `/api/v1/delivery/drivers/{id}/activate` | Activate driver |
| PATCH | `/api/v1/delivery/drivers/{id}/deactivate` | Deactivate driver |
| POST | `/api/v1/delivery/drivers/{id}/attendance` | Record attendance |
| GET | `/api/v1/delivery/drivers/{id}/attendance` | Get attendance history |

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/delivery/vehicles` | List vehicles (paginated) |
| GET | `/api/v1/delivery/vehicles/{id}` | Get vehicle details |
| POST | `/api/v1/delivery/vehicles` | Create new vehicle |
| PUT | `/api/v1/delivery/vehicles/{id}` | Update vehicle |
| PATCH | `/api/v1/delivery/vehicles/{id}/activate` | Activate vehicle |
| PATCH | `/api/v1/delivery/vehicles/{id}/deactivate` | Deactivate vehicle |
| GET | `/api/v1/delivery/vehicles/available` | Get available vehicles |

### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/delivery/routes` | List routes (paginated) |
| GET | `/api/v1/delivery/routes/{id}` | Get route details |
| GET | `/api/v1/delivery/routes/{id}/items` | Get route deliveries |
| POST | `/api/v1/delivery/routes` | Create new route |
| POST | `/api/v1/delivery/routes/{id}/add-delivery` | Add delivery to route |
| POST | `/api/v1/delivery/routes/{id}/remove-delivery` | Remove delivery from route |
| PATCH | `/api/v1/delivery/routes/{id}/status` | Update route status |

---

## 🔄 Migration from LocalStorage to Backend APIs

### Current State
Your existing `deliveries.js` uses localStorage:
```javascript
// OLD CODE (localStorage)
let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];

function loadDeliveries() {
    deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    renderDeliveriesTable();
}

function createDelivery(delivery) {
    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
}
```

### Migration Strategy

#### Option 1: Full Replacement (Recommended)
1. **Backup** your current `deliveries.js`
2. **Copy** code from `deliveries-backend-integration.js`
3. **Adapt** modal HTML to match your existing UI
4. **Test** all functions

#### Option 2: Incremental Migration
Update functions one by one:

1. **Update Load Function**
```javascript
// BEFORE (localStorage)
function loadDeliveries() {
    deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    renderDeliveriesTable(deliveries);
}

// AFTER (API)
async function loadDeliveries() {
    const response = await apiGet('/api/v1/delivery/deliveries', {
        page: currentPage,
        size: 10
    });
    
    if (response.success) {
        renderDeliveriesTable(response.data.content);
        updatePagination(response.data);
    }
}
```

2. **Update Create Function**
```javascript
// BEFORE
function createDelivery(deliveryData) {
    const delivery = {
        id: Date.now(),
        ...deliveryData,
        status: 'PENDING'
    };
    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
    renderDeliveriesTable(deliveries);
}

// AFTER
async function createDelivery(deliveryData) {
    const response = await apiPost('/api/v1/delivery/deliveries', deliveryData);
    
    if (response.success) {
        showSuccess('Delivery created: ' + response.data.deliveryCode);
        await loadDeliveries();
    }
}
```

3. **Update Assignment Function**
```javascript
// BEFORE
function assignDelivery(deliveryId, driverId, vehicleId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        delivery.driverId = driverId;
        delivery.vehicleId = vehicleId;
        delivery.status = 'ASSIGNED';
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
        renderDeliveriesTable(deliveries);
    }
}

// AFTER
async function assignDelivery(deliveryId, driverId, vehicleId) {
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/assign`,
        { driverId, vehicleId }
    );
    
    if (response.success) {
        showSuccess('Delivery assigned successfully');
        await loadDeliveries();
    }
}
```

4. **Update Status Function**
```javascript
// BEFORE
function updateStatus(deliveryId, newStatus) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        delivery.status = newStatus;
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
        renderDeliveriesTable(deliveries);
    }
}

// AFTER
async function updateStatus(deliveryId, newStatus, notes = '') {
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/status`,
        {
            status: newStatus,
            notes: notes,
            latitude: null,  // Add GPS if available
            longitude: null
        }
    );
    
    if (response.success) {
        showSuccess('Status updated to ' + newStatus);
        await loadDeliveries();
    }
}
```

---

## 💡 Integration Examples

### Example 1: Complete Delivery Form Handler
```javascript
document.getElementById('createDeliveryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        orderId: parseInt(document.getElementById('orderId').value),
        deliveryAddress: document.getElementById('address').value,
        deliveryCity: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        customerPhone: document.getElementById('phone').value,
        scheduledDate: document.getElementById('scheduledDate').value
    };
    
    try {
        const response = await apiPost('/api/v1/delivery/deliveries', formData);
        
        if (response.success) {
            showSuccess('Delivery created: ' + response.data.deliveryCode);
            $('#createDeliveryModal').modal('hide');
            this.reset();
            await loadDeliveries();
        }
    } catch (error) {
        // Error already handled by api.js
    }
});
```

### Example 2: Delivery Assignment with Dropdowns
```javascript
async function showAssignModal(deliveryId) {
    // Load drivers and vehicles
    const [driversResp, vehiclesResp] = await Promise.all([
        apiGet('/api/v1/delivery/drivers', { page: 0, size: 100 }),
        apiGet('/api/v1/delivery/vehicles/available')
    ]);
    
    if (driversResp.success && vehiclesResp.success) {
        // Populate dropdowns
        const driverSelect = document.getElementById('assignDriverId');
        driverSelect.innerHTML = '<option value="">Select Driver</option>' +
            driversResp.data.content
                .filter(d => d.isActive)
                .map(d => `<option value="${d.driverId}">${d.fullName} (${d.driverCode})</option>`)
                .join('');
        
        const vehicleSelect = document.getElementById('assignVehicleId');
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>' +
            vehiclesResp.data
                .map(v => `<option value="${v.vehicleId}">${v.vehicleNumber} (${v.vehicleType})</option>`)
                .join('');
        
        // Store delivery ID
        document.getElementById('assignDeliveryId').value = deliveryId;
        
        // Show modal
        $('#assignModal').modal('show');
    }
}

// Handle assignment form submission
document.getElementById('assignForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const deliveryId = document.getElementById('assignDeliveryId').value;
    const driverId = document.getElementById('assignDriverId').value;
    const vehicleId = document.getElementById('assignVehicleId').value;
    
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/assign`,
        { driverId: parseInt(driverId), vehicleId: parseInt(vehicleId) }
    );
    
    if (response.success) {
        showSuccess('Delivery assigned successfully');
        $('#assignModal').modal('hide');
        await loadDeliveries();
    }
});
```

### Example 3: Status Update with History
```javascript
async function showUpdateStatusModal(deliveryId) {
    // Get current delivery
    const response = await apiGet(`/api/v1/delivery/deliveries/${deliveryId}`);
    
    if (response.success) {
        const delivery = response.data;
        
        // Populate status dropdown with valid transitions
        const validStatuses = getValidStatusTransitions(delivery.status);
        const statusSelect = document.getElementById('newStatus');
        statusSelect.innerHTML = validStatuses
            .map(s => `<option value="${s}">${s}</option>`)
            .join('');
        
        document.getElementById('updateDeliveryId').value = deliveryId;
        $('#updateStatusModal').modal('show');
    }
}

function getValidStatusTransitions(currentStatus) {
    const transitions = {
        'PENDING': ['ASSIGNED', 'CANCELLED'],
        'ASSIGNED': ['PICKED_UP', 'CANCELLED'],
        'PICKED_UP': ['IN_TRANSIT', 'CANCELLED'],
        'IN_TRANSIT': ['DELIVERED', 'FAILED'],
        'DELIVERED': [],
        'FAILED': [],
        'CANCELLED': []
    };
    return transitions[currentStatus] || [];
}

document.getElementById('updateStatusForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const deliveryId = document.getElementById('updateDeliveryId').value;
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value;
    
    const response = await apiPatch(
        `/api/v1/delivery/deliveries/${deliveryId}/status`,
        {
            status: newStatus,
            notes: notes,
            latitude: null,
            longitude: null
        }
    );
    
    if (response.success) {
        showSuccess('Status updated to ' + newStatus);
        $('#updateStatusModal').modal('hide');
        await loadDeliveries();
    }
});
```

### Example 4: Route Management
```javascript
async function createRoute() {
    const routeData = {
        routeName: document.getElementById('routeName').value,
        routeDate: document.getElementById('routeDate').value,
        driverId: parseInt(document.getElementById('routeDriverId').value),
        vehicleId: parseInt(document.getElementById('routeVehicleId').value),
        startLocation: document.getElementById('startLocation').value
    };
    
    const response = await apiPost('/api/v1/delivery/routes', routeData);
    
    if (response.success) {
        showSuccess('Route created: ' + response.data.routeName);
        $('#createRouteModal').modal('hide');
        await loadRoutes();
    }
}

async function addDeliveryToRoute(routeId, deliveryId, stopOrder) {
    const response = await apiPost(
        `/api/v1/delivery/routes/${routeId}/add-delivery`,
        { deliveryId, stopOrder }
    );
    
    if (response.success) {
        showSuccess('Delivery added to route');
        await loadRoutes();
        await viewRouteDetails(routeId);
    }
}

async function viewRouteDetails(routeId) {
    const [routeResp, itemsResp] = await Promise.all([
        apiGet(`/api/v1/delivery/routes/${routeId}`),
        apiGet(`/api/v1/delivery/routes/${routeId}/items`)
    ]);
    
    if (routeResp.success && itemsResp.success) {
        const route = routeResp.data;
        const items = itemsResp.data;
        
        // Display route details and items
        console.log('Route:', route);
        console.log('Deliveries in route:', items);
    }
}
```

---

## 🎯 Complete Integration Checklist

### Backend Setup
- [x] All entities created
- [x] All repositories created
- [x] All DTOs created
- [x] All services created
- [x] All controllers created
- [x] Exception handling configured
- [x] CORS enabled

### Frontend Setup
- [ ] Include `api.js` in HTML
- [ ] Update `deliveries.js` to use API calls
- [ ] Remove localStorage dependencies
- [ ] Test all CRUD operations
- [ ] Test status transitions
- [ ] Test route management
- [ ] Test driver/vehicle assignment

### Testing Checklist
- [ ] Create delivery
- [ ] Assign driver and vehicle
- [ ] Update status (PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED)
- [ ] View delivery history
- [ ] Create route
- [ ] Add deliveries to route
- [ ] Remove deliveries from route
- [ ] Update route status
- [ ] Record driver attendance
- [ ] View driver attendance history

---

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution:** Backend already has `@CrossOrigin` configured. If still getting errors, check browser console.

### Issue: 401 Unauthorized
**Solution:** Ensure JWT token is being sent. Check `api.js` - it automatically includes the token from localStorage.

### Issue: Validation Error (400)
**Solution:** Check request payload matches DTO structure. Enable browser DevTools Network tab to see exact error message.

### Issue: Status Transition Error
**Solution:** You can only transition to valid statuses. See `DeliveryStatus.java` for allowed transitions:
- PENDING → ASSIGNED, CANCELLED
- ASSIGNED → PICKED_UP, CANCELLED
- PICKED_UP → IN_TRANSIT, CANCELLED
- IN_TRANSIT → DELIVERED, FAILED

---

## 📚 API Response Format

All APIs return this standard format:
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

Error response:
```json
{
    "success": false,
    "message": "Error description",
    "data": null
}
```

Paginated response:
```json
{
    "success": true,
    "message": "Deliveries retrieved successfully",
    "data": {
        "content": [...],
        "totalElements": 50,
        "totalPages": 5,
        "number": 0,
        "size": 10,
        "first": true,
        "last": false
    }
}
```

---

## 🎓 Next Steps

1. **Backup** your current `deliveries.js`
2. **Review** `deliveries-backend-integration.js` for complete examples
3. **Update** existing functions to use API calls
4. **Test** each function after migration
5. **Remove** localStorage code once everything works

Need help? Check the example file: `deliveries-backend-integration.js`

---

**Implementation Complete! 🎉**
