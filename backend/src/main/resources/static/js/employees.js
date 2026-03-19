/**
 * Employee Management JavaScript
 * සම්පත් සිල්ලර වෙළඳසැල - සේවක කළමනාකරණ මෘදුකාංගය
 * Sampath Grocery Store - Employee Management System
 * 
 * Features:
 * - Create new employees (HR profile only)
 * - Create login accounts for employees (separate action)
 * - List all employees with account status
 * - Update employee information
 * - Toggle employee active/inactive status
 * - Delete employees
 */

// API Base URL
const API_BASE = "";

// Toast notification configuration
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    fetchEmployees();
    fetchRoles();
    setupFormSubmission();
    setupSearchHandler();
});

/**
 * Fetch roles for account creation dropdown
 */
async function fetchRoles() {
    try {
        const response = await fetch(`${API_BASE}/api/roles`);

        if (!response.ok) {
            console.error('Failed to fetch roles');
            return;
        }

        const result = await response.json();
        console.log('Roles API response:', result); // Debug
        const roles = result.data || result;

        populateRoleDropdown(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

/**
 * Populate role dropdown in create login account modal
 */
function populateRoleDropdown(roles) {
    const roleSelect = document.getElementById('accountRole');

    if (!roleSelect) {
        console.error('Role select element not found!');
        return;
    }

    // Clear existing options (except placeholder)
    roleSelect.innerHTML = '<option value="">Select role...</option>';

    console.log('Populating roles:', roles); // Debug

    // Add role options - show all active roles
    if (Array.isArray(roles)) {
        roles.forEach(role => {
            // Only add active roles
            if (role.isActive === true || role.isActive === 1) {
                const option = new Option(role.name, role.id); // Fixed: use role.name and role.id
                roleSelect.add(option);
                console.log('Added role:', role.name, 'ID:', role.id); // Debug
            }
        });
    } else {
        console.error('Roles is not an array:', roles);
    }

    console.log('Total options in dropdown:', roleSelect.options.length); // Debug
}

/**
 * Fetch all employees from the backend
 */
async function fetchEmployees() {
    try {
        const response = await fetch(`${API_BASE}/api/employees`);

        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        displayEmptyState('Error loading employees');
    }
}

/**
 * Display employees in the table
 */
function displayEmployees(employees) {
    const tbody = document.getElementById('employeesTableBody');
    const employeeCount = document.getElementById('employeeCount');

    // Update counter
    employeeCount.textContent = employees.length;

    // Update statistics
    updateEmployeeStatistics(employees);

    if (employees.length === 0) {
        displayEmptyState('No employees found');
        return;
    }

    // Build table rows
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>
                <strong>${escapeHtml(emp.employeeCode)}</strong>
            </td>
            <td>
                <i class="fas fa-user me-2"></i>
                <strong>${escapeHtml(emp.fullName)}</strong>
            </td>
            <td>
                <i class="fas fa-phone me-1"></i>
                ${escapeHtml(emp.phone)}
            </td>
            <td>
                <span class="badge bg-info">
                    ${escapeHtml(emp.designation)}
                </span>
            </td>
            <td>
                ${emp.user ? `
                    <span class="account-badge account-linked" title="${escapeHtml(emp.user.email)}">
                        <i class="fas fa-user-check"></i>
                        ${escapeHtml(emp.user.username)}
                    </span>
                ` : `
                    <span class="account-badge account-none">
                        <i class="fas fa-user-slash"></i>
                        No Account
                    </span>
                `}
            </td>
            <td>
                <span class="status-badge ${emp.isActive ? 'status-active' : 'status-inactive'}">
                    <i class="fas fa-${emp.isActive ? 'check-circle' : 'times-circle'} me-1"></i>
                    ${emp.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                ${!emp.user ? `
                    <button class="btn-action btn-create-account" 
                        onclick="showCreateLoginAccountModal(${emp.employeeId}, '${escapeHtml(emp.fullName).replace(/'/g, "\\'")}')">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                ` : `
                    <button class="btn-action btn-manage-account" 
                        onclick="viewUserAccount(${emp.user.userId})">
                        <i class="fas fa-id-badge"></i> View Account
                    </button>
                `}
                <button class="btn-action btn-edit" onclick="openEditModal(${emp.employeeId})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-toggle" onclick="toggleEmployeeStatus(${emp.employeeId}, ${emp.isActive})">
                    <i class="fas fa-toggle-${emp.isActive ? 'off' : 'on'}"></i>
                    ${emp.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Display empty state message
 */
function displayEmptyState(message) {
    const tbody = document.getElementById('employeesTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <i class="fas fa-user-tie"></i>
                <p>${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
    document.getElementById('employeeCount').textContent = '0';
}

/**
 * Setup form submission handler
 */
function setupFormSubmission() {
    const form = document.getElementById('employeeForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        await createEmployee();
    });
}

/**
 * Create a new employee
 */
async function createEmployee() {
    const submitBtn = document.getElementById('saveEmployeeBtn');
    const form = document.getElementById('employeeForm');

    // Get form data (employeeCode is auto-generated by backend)
    const fullName = document.getElementById('fullName').value.trim();
    const nic = document.getElementById('nic').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.trim();
    const alternatePhone = document.getElementById('alternatePhone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const designation = document.getElementById('designation').value.trim();
    const isActive = document.getElementById('isActive').checked;

    // Validate required fields (employeeCode removed - auto-generated)
    if (!fullName || !phone || !address || !designation) {
        Toast.fire({
            icon: 'warning',
            title: 'Please fill all required fields'
        });
        return;
    }

    // Prepare request data (no employeeCode - auto-generated by backend)
    const employeeData = {
        fullName: fullName,
        nic: nic || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        phone: phone,
        alternatePhone: alternatePhone || null,
        email: email || null,
        address: address,
        city: city || null,
        designation: designation,
        isActive: isActive
    };

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
        const response = await fetch(`${API_BASE}/api/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create employee');
        }

        const createdEmployee = await response.json();

        // Show success message
        Toast.fire({
            icon: 'success',
            title: 'Employee created successfully!'
        });

        // Reset form
        form.reset();
        document.getElementById('isActive').checked = true;

        // Refresh employees list
        fetchEmployees();

    } catch (error) {
        console.error('Error creating employee:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to create employee'
        });
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Employee';
    }
}

/**
 * Open edit employee modal
 */
async function openEditModal(employeeId) {
    try {
        // Fetch employee details
        const response = await fetch(`${API_BASE}/api/employees/${employeeId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch employee details');
        }

        const result = await response.json();
        const employee = result.data || result;

        // Populate ALL edit form fields
        document.getElementById('editEmployeeId').value = employee.employeeId;
        document.getElementById('editFullName').value = employee.fullName || '';
        document.getElementById('editNic').value = employee.nic || '';
        document.getElementById('editDateOfBirth').value = employee.dateOfBirth || '';
        document.getElementById('editGender').value = employee.gender || '';
        document.getElementById('editPhone').value = employee.phone || '';
        document.getElementById('editAlternatePhone').value = employee.alternatePhone || '';
        document.getElementById('editEmail').value = employee.email || '';
        document.getElementById('editAddress').value = employee.address || '';
        document.getElementById('editCity').value = employee.city || '';
        document.getElementById('editDesignation').value = employee.designation || '';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
        modal.show();

    } catch (error) {
        console.error('Error fetching employee details:', error);
        Toast.fire({
            icon: 'error',
            title: 'Failed to load employee details'
        });
    }
}

/**
 * Update employee information
 */
async function updateEmployee() {
    const employeeId = document.getElementById('editEmployeeId').value;
    const fullName = document.getElementById('editFullName').value.trim();
    const nic = document.getElementById('editNic').value.trim();
    const dateOfBirth = document.getElementById('editDateOfBirth').value;
    const gender = document.getElementById('editGender').value;
    const phone = document.getElementById('editPhone').value.trim();
    const alternatePhone = document.getElementById('editAlternatePhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const city = document.getElementById('editCity').value.trim();
    const designation = document.getElementById('editDesignation').value.trim();

    // Validate required fields
    if (!fullName || !phone || !address || !designation) {
        Toast.fire({
            icon: 'warning',
            title: 'Please fill all required fields'
        });
        return;
    }

    try {
        // Prepare employee data with all fields
        const employeeData = {
            fullName: fullName,
            nic: nic || null,
            dateOfBirth: dateOfBirth || null,
            gender: gender || null,
            phone: phone,
            alternatePhone: alternatePhone || null,
            email: email || null,
            address: address,
            city: city || null,
            designation: designation
        };

        const response = await fetch(`${API_BASE}/api/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update employee');
        }

        Toast.fire({
            icon: 'success',
            title: 'Employee updated successfully!'
        });

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
        modal.hide();

        // Refresh employees list
        fetchEmployees();

    } catch (error) {
        console.error('Error updating employee:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to update employee'
        });
    }
}

/**
 * Toggle employee active/inactive status
 */
async function toggleEmployeeStatus(employeeId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';

    // Ask for confirmation
    const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Employee?`,
        text: `Are you sure you want to ${action} this employee?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22C55E',
        cancelButtonColor: '#EF4444',
        confirmButtonText: `Yes, ${action}!`,
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        // Use the toggle-status endpoint
        const response = await fetch(`${API_BASE}/api/employees/${employeeId}/toggle-status`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update employee status');
        }

        Toast.fire({
            icon: 'success',
            title: `Employee ${action}d successfully!`
        });

        // Refresh employees list
        fetchEmployees();

    } catch (error) {
        console.error('Error updating employee status:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to update employee status'
        });
    }
}

/**
 * Delete an employee
 */
async function deleteEmployee(employeeId) {
    // Ask for confirmation
    const result = await Swal.fire({
        title: 'Delete Employee?',
        text: 'This action cannot be undone. Are you sure you want to delete this employee?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/employees/${employeeId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete employee');
        }

        Toast.fire({
            icon: 'success',
            title: 'Employee deleted successfully!'
        });

        // Refresh employees list
        fetchEmployees();

    } catch (error) {
        console.error('Error deleting employee:', error);
        Toast.fire({
            icon: 'error',
            title: 'Failed to delete employee'
        });
    }
}

/**
 * Show modal to create login account for employee
 */
function showCreateLoginAccountModal(employeeId, employeeName) {
    // Store employee info
    document.getElementById('accountEmployeeId').value = employeeId;
    document.getElementById('accountEmployeeName').textContent = employeeName;

    // Reset form
    document.getElementById('createLoginAccountForm').reset();
    document.getElementById('accountActive').checked = true;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('createLoginAccountModal'));
    modal.show();
}

/**
 * Save new login account for employee
 */
async function saveLoginAccount() {
    const employeeId = document.getElementById('accountEmployeeId').value;
    const username = document.getElementById('accountUsername').value.trim();
    const email = document.getElementById('accountEmail').value.trim();
    const password = document.getElementById('accountPassword').value;
    const roleId = document.getElementById('accountRole').value;
    const isActive = document.getElementById('accountActive').checked;

    // Validate
    if (!username || !email || !password || !roleId) {
        Toast.fire({
            icon: 'warning',
            title: 'Please fill all required fields'
        });
        return;
    }

    if (password.length < 6) {
        Toast.fire({
            icon: 'warning',
            title: 'Password must be at least 6 characters'
        });
        return;
    }

    // Prepare data
    const accountData = {
        username: username,
        email: email,
        password: password,
        roleId: parseInt(roleId),
        isActive: isActive
    };

    try {
        // Show loading
        Swal.fire({
            title: 'Creating Account...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Make API request to create user and link to employee
        const response = await fetch(`${API_BASE}/api/employees/${employeeId}/create-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to create account');
        }

        const result = await response.json();

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('createLoginAccountModal')).hide();

        // Show success message
        await Swal.fire({
            icon: 'success',
            title: 'Account Created',
            text: `Login account created successfully for ${username}`,
            confirmButtonColor: 'var(--primary-green)'
        });

        // Refresh employee list
        fetchEmployees();

    } catch (error) {
        console.error('Error creating account:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to create login account',
            confirmButtonColor: 'var(--danger-red)'
        });
    }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

/**
 * Update employee statistics cards
 */
function updateEmployeeStatistics(employees) {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive).length;
    const departments = [...new Set(employees.filter(e => e.department).map(e => e.department))].length;
    const linkedUsers = employees.filter(e => e.user).length;

    // Update stats cards with animation
    animateValue('totalEmployees', 0, totalEmployees, 800);
    animateValue('activeEmployees', 0, activeEmployees, 800);
    animateValue('departments', 0, departments, 800);
    animateValue('linkedUsers', 0, linkedUsers, 800);
}

/**
 * Animate counter value
 */
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * Setup search handler
 */
function setupSearchHandler() {
    const searchInput = document.getElementById('employeeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            filterEmployees(e.target.value);
        });
    }
}

/**
 * Filter employees based on search query
 */
function filterEmployees(query) {
    const tbody = document.getElementById('employeesTableBody');
    const rows = tbody.getElementsByTagName('tr');

    const searchLower = query.toLowerCase();
    let visibleCount = 0;

    for (let row of rows) {
        // Skip empty state rows
        if (row.classList.contains('empty-state')) continue;

        const text = row.textContent.toLowerCase();
        if (text.includes(searchLower)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }

    // Update counter based on visible rows
    const employeeCount = document.getElementById('employeeCount');
    if (employeeCount) {
        employeeCount.textContent = visibleCount;
    }
}

/**
 * Clear search and show all employees
 */
function clearSearch() {
    const searchInput = document.getElementById('employeeSearch');
    if (searchInput) {
        searchInput.value = '';
        filterEmployees('');
    }

    // Restore original count
    fetchEmployees();
}

/**
 * View user account details (redirect to users page)
 */
function viewUserAccount(userId) {
    // You can either redirect to users page or show account details in modal
    window.location.href = `/users?userId=${userId}`;
}
