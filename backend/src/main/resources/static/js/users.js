/**
 * User Management JavaScript
 * සම්පත් සිල්ලර වෙළඳසැල - පරිශීලක කළමනාකරණ මෘදුකාංගය
 * Sampath Grocery Store - User Management System
 * 
 * Features:
 * - Create new users with role assignment
 * - List all users with detailed information
 * - Update user roles
 * - Toggle user active/inactive status
 * - Delete users
 * - Fetch available roles
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
    fetchRoles();
    fetchUsers();
    // setupFormSubmission(); // Removed - Create User form disabled
    
    // Setup search functionality
    setupUserSearch();
});

/**
 * Fetch all available roles from the backend
 */
async function fetchRoles() {
    try {
        const response = await fetch(`${API_BASE}/api/roles`);

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const result = await response.json();
        const roles = result.data || result; // Extract data array from response
        populateRoleDropdowns(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        Toast.fire({
            icon: 'error',
            title: 'Failed to load roles'
        });
    }
}

/**
 * Populate role dropdown in edit modal
 */
function populateRoleDropdowns(roles) {
    const editRoleSelect = document.getElementById('editRoleId');

    // Clear existing options (except the first placeholder)
    editRoleSelect.innerHTML = '<option value="">Select a role...</option>';

    // Add role options - use 'id' and 'name' as per @JsonProperty
    roles.forEach(role => {
        const option = new Option(role.name, role.id); // Changed from roleName/roleId
        editRoleSelect.add(option);
    });
}

/**
 * Fetch all users from the backend
 */
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        displayEmptyState('Error loading users');
    }
}

/**
 * Display users in the table
 */
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    const userCount = document.getElementById('userCount');

    // Update counter
    userCount.textContent = users.length;

    // Update statistics
    updateUserStatistics(users);

    if (users.length === 0) {
        displayEmptyState('No users found');
        return;
    }

    // Build table rows
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>#${user.userId}</strong></td>
            <td>
                <i class="fas fa-user me-2"></i>
                <strong>${escapeHtml(user.username)}</strong>
            </td>
            <td>${escapeHtml(user.email)}</td>
            <td>
                <span class="badge bg-primary">
                    ${escapeHtml(user.roleName || 'NO ROLE')}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    <i class="fas fa-${user.isActive ? 'check-circle' : 'times-circle'} me-1"></i>
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="openEditRoleModal(${user.userId}, ${user.roleId || 0}, '${escapeHtml(user.username).replace(/'/g, "\\'")}')">
                    <i class="fas fa-user-tag"></i> Edit Role
                </button>
                <button class="btn-action btn-toggle" onclick="toggleUserStatus(${user.userId}, ${user.isActive})">
                    <i class="fas fa-toggle-${user.isActive ? 'off' : 'on'}"></i>
                    ${user.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
    `).join('');
    
    // Reapply search filter if there's an active search
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        filterUsers(searchInput.value.toLowerCase().trim());
    }
}

/**
 * Display empty state message
 */
function displayEmptyState(message) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                <i class="fas fa-users"></i>
                <p>${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
    document.getElementById('userCount').textContent = '0';
}

/**
 * Setup user search functionality
 */
function setupUserSearch() {
    const searchInput = document.getElementById('userSearchInput');
    
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterUsers(searchTerm);
    });
}

/**
 * Filter users based on search term
 */
function filterUsers(searchTerm) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        // Skip empty state row
        if (row.querySelector('.empty-state')) {
            return;
        }
        
        const username = row.cells[1]?.textContent.toLowerCase() || '';
        const email = row.cells[2]?.textContent.toLowerCase() || '';
        const role = row.cells[3]?.textContent.toLowerCase() || '';
        
        const matches = username.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       role.includes(searchTerm);
        
        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update counter with filtered count
    const counterElement = document.getElementById('userCount');
    if (counterElement) {
        counterElement.textContent = visibleCount;
    }
    
    // Show "no results" message if no matches
    if (visibleCount === 0 && searchTerm !== '') {
        const tbody = document.getElementById('usersTableBody');
        const existingRows = tbody.querySelectorAll('tr:not(.empty-state)');
        if (existingRows.length > 0) {
            // Only show no results if there are users but none match
            let noResultsRow = tbody.querySelector('.no-results');
            if (!noResultsRow) {
                noResultsRow = document.createElement('tr');
                noResultsRow.className = 'no-results';
                noResultsRow.innerHTML = `
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No users found matching "${escapeHtml(searchTerm)}"</p>
                    </td>
                `;
                tbody.appendChild(noResultsRow);
            }
        }
    } else {
        // Remove no results message if it exists
        const noResultsRow = document.querySelector('.no-results');
        if (noResultsRow) {
            noResultsRow.remove();
        }
    }
}

/**
 * Setup form submission handler
 */
function setupFormSubmission() {
    const form = document.getElementById('userForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        await createUser();
    });
}

/**
 * Create a new user
 */
async function createUser() {
    const submitBtn = document.getElementById('saveUserBtn');
    const form = document.getElementById('userForm');

    // Get form data
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const roleId = parseInt(document.getElementById('roleId').value);
    const isActive = document.getElementById('isActive').checked;
    const isVerified = document.getElementById('isVerified').checked;

    // Validate required fields
    if (!username || !email || !password || !roleId) {
        Toast.fire({
            icon: 'warning',
            title: 'Please fill all required fields'
        });
        return;
    }

    // Prepare request data
    const userData = {
        username: username,
        email: email,
        password: password,
        roleId: roleId,
        isActive: isActive,
        isVerified: isVerified
    };

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
        const response = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }

        const createdUser = await response.json();

        // Show success message
        Toast.fire({
            icon: 'success',
            title: 'User created successfully!'
        });

        // Reset form
        form.reset();
        document.getElementById('isActive').checked = true;
        document.getElementById('isVerified').checked = false;

        // Refresh users list
        fetchUsers();

    } catch (error) {
        console.error('Error creating user:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to create user'
        });
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save User';
    }
}

/**
 * Open edit role modal
 */
function openEditRoleModal(userId, currentRoleId, username) {
    // Set user ID
    document.getElementById('editUserId').value = userId;
    
    // Set current role as selected in dropdown
    const roleDropdown = document.getElementById('editRoleId');
    roleDropdown.value = currentRoleId || '';
    
    // Optional: show username in modal (if you want to add this to the HTML)
    console.log(`Editing role for user: ${username}, current role ID: ${currentRoleId}`);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editRoleModal'));
    modal.show();
}

/**
 * Update user role
 */
async function updateUserRole() {
    const userId = document.getElementById('editUserId').value;
    const newRoleId = parseInt(document.getElementById('editRoleId').value);

    if (!newRoleId) {
        Toast.fire({
            icon: 'warning',
            title: 'Please select a role'
        });
        return;
    }

    try {
        // Use PUT /api/users/{id} with roleId in body
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roleId: newRoleId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user role');
        }

        Toast.fire({
            icon: 'success',
            title: 'User role updated successfully!'
        });

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoleModal'));
        modal.hide();

        // Refresh users list
        fetchUsers();

    } catch (error) {
        console.error('Error updating user role:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to update user role'
        });
    }
}

/**
 * Toggle user active/inactive status
 */
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';

    // Ask for confirmation
    const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
        text: `Are you sure you want to ${action} this user?`,
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
        // Use PATCH /api/users/{id}/toggle-status
        const response = await fetch(`${API_BASE}/api/users/${userId}/toggle-status`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user status');
        }

        Toast.fire({
            icon: 'success',
            title: `User ${action}d successfully!`
        });

        // Refresh users list
        fetchUsers();

    } catch (error) {
        console.error('Error updating user status:', error);
        Toast.fire({
            icon: 'error',
            title: error.message || 'Failed to update user status'
        });
    }
}

/**
 * Delete a user
 */
async function deleteUser(userId) {
    // Ask for confirmation
    const result = await Swal.fire({
        title: 'Delete User?',
        text: 'This action cannot be undone. Are you sure you want to delete this user?',
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
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        Toast.fire({
            icon: 'success',
            title: 'User deleted successfully!'
        });

        // Refresh users list
        fetchUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        Toast.fire({
            icon: 'error',
            title: 'Failed to delete user'
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
 * Update user statistics cards
 */
function updateUserStatistics(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    const usersWithRoles = users.filter(u => u.roleId != null && u.roleName != null).length;

    // Animate the statistics
    animateValue('totalUsers', 0, totalUsers, 800);
    animateValue('activeUsers', 0, activeUsers, 800);
    animateValue('inactiveUsers', 0, inactiveUsers, 800);
    animateValue('usersWithRoles', 0, usersWithRoles, 800);
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
