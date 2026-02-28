# Driver Module - Complete CRUD Integration Guide

## Overview
The Driver module has been fully implemented with complete CRUD operations integrated with the database.

## Database Schema

### Driver Table Structure
```sql
CREATE TABLE Driver (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_code VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NULL,
    employee_id INT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_expiry_date DATE,
    license_type VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);
```

## Backend Components

### 1. Entity (`Driver.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/entity/delivery/Driver.java`

**Key Features:**
- All database fields mapped with JPA annotations
- Optional relationships with Employee and User entities
- Validation constraints for required fields
- Audit fields (created_at, created_by, updated_at, updated_by)

### 2. Repository (`DriverRepository.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/repository/delivery/DriverRepository.java`

**Available Queries:**
- `findByDriverCode(String driverCode)` - Find by unique driver code
- `findByLicenseNumber(String licenseNumber)` - Find by license number
- `findByIsActive(Boolean isActive)` - Filter by active status
- `findAllActiveDrivers()` - Get all active drivers (sorted by name)
- `findByEmployeeId(Integer employeeId)` - Find driver linked to employee
- `findByUserId(Integer userId)` - Find driver linked to user account
- `existsByDriverCode(String driverCode)` - Check code uniqueness
- `existsByLicenseNumber(String licenseNumber)` - Check license uniqueness

### 3. DTOs

#### DriverRequest (`DriverRequest.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/dto/delivery/DriverRequest.java`

```java
{
    "driverCode": "DRV-001",           // Required
    "userId": 1,                        // Optional
    "employeeId": 5,                    // Optional
    "fullName": "Rohan Silva",         // Required
    "phone": "+94771234567",           // Required
    "email": "rohan@example.com",     // Optional
    "licenseNumber": "DL-KAN-12345",   // Required
    "licenseExpiryDate": "2025-12-31", // Optional
    "licenseType": "B",                // Optional (A/B/C/D)
    "address": "123 Main St, Kandy",   // Optional
    "isActive": true                    // Default: true
}
```

#### DriverResponse (`DriverResponse.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/dto/delivery/DriverResponse.java`

```java
{
    "driverId": 1,
    "driverCode": "DRV-001",
    "userId": 1,
    "username": "rohan_user",
    "employeeId": 5,
    "employeeName": "Rohan Silva",
    "fullName": "Rohan Silva",
    "phone": "+94771234567",
    "email": "rohan@example.com",
    "licenseNumber": "DL-KAN-12345",
    "licenseExpiryDate": "2025-12-31",
    "licenseType": "B",
    "address": "123 Main St, Kandy",
    "isActive": true,
    "createdAt": "2025-02-27T10:30:00",
    "createdBy": 1,
    "updatedAt": "2025-02-27T10:30:00",
    "updatedBy": 1
}
```

### 4. Service (`DriverService.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/service/delivery/DriverService.java`

**Methods:**
- `getAllDrivers()` - Get all drivers
- `getActiveDrivers()` - Get only active drivers
- `getDriverById(Integer id)` - Get driver by ID
- `getDriverByCode(String code)` - Get driver by code
- `createDriver(DriverRequest request, Integer createdBy)` - Create new driver
- `updateDriver(Integer id, DriverRequest request, Integer updatedBy)` - Update existing driver
- `deleteDriver(Integer id)` - Delete driver
- `toggleDriverStatus(Integer id, Integer updatedBy)` - Activate/Deactivate driver

**Validations:**
- Unique driver_code constraint
- Unique license_number constraint
- Valid employee_id (if provided)
- Valid user_id (if provided)

### 5. Controller (`DriverController.java`)
**Location:** `backend/src/main/java/com/sampathgrocery/controller/delivery/DriverController.java`

## REST API Endpoints

### GET Endpoints

#### Get All Drivers
```http
GET /api/drivers
Response: 200 OK
{
    "success": true,
    "message": "Drivers retrieved successfully",
    "data": [DriverResponse...]
}
```

#### Get Active Drivers Only
```http
GET /api/drivers/active
Response: 200 OK
{
    "success": true,
    "message": "Active drivers retrieved successfully",
    "data": [DriverResponse...]
}
```

#### Get Driver by ID
```http
GET /api/drivers/{id}
Response: 200 OK
{
    "success": true,
    "message": "Driver retrieved successfully",
    "data": DriverResponse
}
```

#### Get Driver by Code
```http
GET /api/drivers/code/{code}
Response: 200 OK
{
    "success": true,
    "message": "Driver retrieved successfully",
    "data": DriverResponse
}
```

### POST Endpoint

#### Create New Driver
```http
POST /api/drivers
Headers:
  Content-Type: application/json
  User-Id: 1
Body: DriverRequest

Response: 201 CREATED
{
    "success": true,
    "message": "Driver created successfully",
    "data": DriverResponse
}
```

### PUT Endpoint

#### Update Driver
```http
PUT /api/drivers/{id}
Headers:
  Content-Type: application/json
  User-Id: 1
Body: DriverRequest

Response: 200 OK
{
    "success": true,
    "message": "Driver updated successfully",
    "data": DriverResponse
}
```

### DELETE Endpoint

#### Delete Driver
```http
DELETE /api/drivers/{id}
Headers:
  User-Id: 1

Response: 200 OK
{
    "success": true,
    "message": "Driver deleted successfully",
    "data": null
}
```

### PATCH Endpoint

#### Toggle Driver Active Status
```http
PATCH /api/drivers/{id}/toggle-status
Headers:
  User-Id: 1

Response: 200 OK
{
    "success": true,
    "message": "Driver status updated successfully",
    "data": DriverResponse
}
```

## Frontend Components

### 1. HTML Form (`deliveries.html`)
**Location:** `backend/src/main/resources/templates/deliveries.html`

**Form Sections:**
1. **Personal Information**
   - Driver Code (text, required)
   - Full Name (text, required)
   - Phone Number (tel, required)
   - Email (email, optional)
   - Address (textarea, optional)

2. **License Information**
   - License Number (text, required)
   - License Type (select: A/B/C/D)
   - License Expiry Date (date, required)

3. **Employment Details (Optional)**
   - Link to Employee (select dropdown)
   - Link to User Account (select dropdown)

4. **Status**
   - Active Driver (checkbox toggle)

### 2. JavaScript Functions (`deliveries.js`)
**Location:** `backend/src/main/resources/static/js/deliveries.js`

**Key Functions:**

#### Driver Management
```javascript
// Load all drivers into table
loadDrivers(filterStatus = 'all')

// View driver details in modal
viewDriver(id)

// Edit driver (opens form with data)
editDriver(id)

// Save driver (create or update)
handleDriverSave(e)

// Delete driver
handleDriverDelete()

// Toggle active/inactive status
toggleDriverStatus(id)

// Reset form to default state
resetDriverForm()
```

#### Dropdown Loaders
```javascript
// Load employees for dropdown
loadEmployeeDropdown()

// Load users for dropdown  
loadUserDropdown()
```

#### Utility Functions
```javascript
// Get current logged-in user ID
getCurrentUserId()

// Format date for display
formatDate(dateString)
```

## Usage Examples

### 1. Adding a New Driver

**Frontend:**
1. Click "Add New Driver" button
2. Fill in the form:
   - Driver Code: DRV-001
   - Full Name: Rohan Silva
   - Phone: +94771234567
   - Email: rohan@example.com
   - License Number: DL-KAN-12345
   - License Type: B
   - License Expiry: 2025-12-31
   - Address: 123 Main St, Kandy
3. Optionally link to employee or user account
4. Ensure "Active Driver" is checked
5. Click "Save Driver"

**Backend API Call:**
```javascript
POST /api/drivers
{
    "driverCode": "DRV-001",
    "fullName": "Rohan Silva",
    "phone": "+94771234567",
    "email": "rohan@example.com",
    "licenseNumber": "DL-KAN-12345",
    "licenseType": "B",
    "licenseExpiryDate": "2025-12-31",
    "address": "123 Main St, Kandy",
    "isActive": true
}
```

### 2. Editing a Driver

**Frontend:**
1. Click "Edit" button on driver row
2. Form opens with existing data
3. Modify fields as needed
4. Click "Save Driver"

**Backend API Call:**
```javascript
PUT /api/drivers/1
{
    "driverCode": "DRV-001",
    "fullName": "Rohan Silva Updated",
    ...
}
```

### 3. Viewing Driver Details

**Frontend:**
1. Click "View" button on driver row
2. SweetAlert modal shows all driver information

**Backend API Call:**
```javascript
GET /api/drivers/1
```

### 4. Deactivating a Driver

**Frontend:**
1. Click toggle button on driver row
2. Confirmation dialog appears
3. Driver's active status is toggled

**Backend API Call:**
```javascript
PATCH /api/drivers/1/toggle-status
```

### 5. Deleting a Driver

**Frontend:**
1. Click "Edit" to open driver form
2. Click "Delete Driver" button
3. Confirm deletion in dialog

**Backend API Call:**
```javascript
DELETE /api/drivers/1
```

## Table Display

The drivers table shows:
- Driver Code
- Full Name
- Phone
- License Number
- License Expiry (with expiration warning if < 30 days)
- License Type
- Status Badge (Active/Inactive)
- Action Buttons (View, Edit, Toggle Status)

## Validation Rules

### Backend Validation
- `driverCode`: Required, max 30 chars, must be unique
- `fullName`: Required, max 200 chars
- `phone`: Required, max 20 chars
- `email`: Optional, valid email format, max 100 chars
- `licenseNumber`: Required, max 50 chars, must be unique
- `licenseExpiryDate`: Optional, date format
- `licenseType`: Optional, max 50 chars
- `address`: Optional, text
- `employeeId`: Optional, must reference valid employee
- `userId`: Optional, must reference valid user

### Frontend Validation
- License expiry date cannot be in the past
- Shows warning if license expires within 30 days
- Required fields marked with *
- Email format validation

## Integration Points

### 1. Delivery Module
The Delivery entity references Driver:
```java
@ManyToOne
@JoinColumn(name = "driver_id")
private Driver driver;
```

### 2. DeliveryRoute Module
The DeliveryRoute entity references Driver:
```java
@ManyToOne
@JoinColumn(name = "driver_id")
private Driver driver;
```

### 3. Employee Module
Drivers can optionally link to employees (for internal drivers who are also employees).

### 4. User Module
Drivers can optionally have user accounts (for system access/mobile app login).

## Testing the Integration

### 1. Backend Testing
```bash
cd backend
./mvnw.cmd spring-boot:run
```

### 2. API Testing (Postman/curl)

**Create Driver:**
```bash
curl -X POST http://localhost:8080/api/drivers \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{
    "driverCode": "DRV-001",
    "fullName": "Rohan Silva",
    "phone": "+94771234567",
    "email": "rohan@example.com",
    "licenseNumber": "DL-KAN-12345",
    "licenseType": "B",
    "licenseExpiryDate": "2025-12-31",
    "isActive": true
  }'
```

**Get All Drivers:**
```bash
curl http://localhost:8080/api/drivers
```

### 3. Frontend Testing
1. Open browser: http://localhost:8080/deliveries
2. Navigate to "Drivers" tab
3. Test CRUD operations through UI

## Troubleshooting

### Common Issues

**1. "Driver code already exists"**
- Solution: Use a unique driver code

**2. "License number already exists"**
- Solution: Use a unique license number

**3. "Employee not found"**
- Solution: Ensure employee_id exists in Employee table

**4. "User not found"**
- Solution: Ensure user_id exists in User table

**5. Dropdowns not loading**
- Check if `/api/employees/active` and `/api/users` endpoints are working
- Check browser console for JavaScript errors

**6. License expiry warning not showing**
- Check if date calculation in JavaScript is correct
- Ensure licenseExpiryDate is properly formatted

## Next Steps

1. **DriverAttendance Module**
   - Track driver daily attendance
   - Link to Driver table

2. **Driver Performance Metrics**
   - Deliveries completed
   - Average delivery time
   - Customer ratings

3. **Driver Assignment Logic**
   - Auto-assign based on availability
   - Route optimization
   - Load balancing

4. **Mobile App Integration**
   - Driver login via linked user account
   - Real-time delivery updates
   - Route navigation

## Summary

✅ Driver entity created with all database fields
✅ Complete CRUD operations implemented
✅ REST API endpoints exposed
✅ Frontend form with all fields
✅ JavaScript integration with API
✅ Validation on both backend and frontend
✅ Optional employee and user linking
✅ Active/inactive status management
✅ License expiry tracking
✅ Fully integrated with database

The Driver module is now fully functional and ready for use!
