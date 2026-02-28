// Sampath Grocery Store - Role & Permission Management JavaScript

// Module-based permissions structure
const permissionModules = [
    {
        id: 'products',
        name: 'Products Management',
        icon: 'fas fa-box',
        permissions: [
            { code: 'PRODUCT_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'PRODUCT_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'PRODUCT_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'PRODUCT_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'inventory',
        name: 'Inventory Management',
        icon: 'fas fa-warehouse',
        permissions: [
            { code: 'INVENTORY_VIEW', label: 'View Inventory', icon: 'fa-eye' },
            { code: 'INVENTORY_UPDATE', label: 'Update Stock', icon: 'fa-edit' },
            { code: 'BATCH_CREATE', label: 'Create Batch', icon: 'fa-plus' },
            { code: 'BATCH_UPDATE', label: 'Update Batch', icon: 'fa-edit' },
            { code: 'BATCH_DELETE', label: 'Delete Batch', icon: 'fa-trash' },
            { code: 'STOCK_ALERT_VIEW', label: 'View Alerts', icon: 'fa-bell' }
        ]
    },
    {
        id: 'orders',
        name: 'Order Management',
        icon: 'fas fa-shopping-cart',
        permissions: [
            { code: 'ORDER_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'ORDER_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'ORDER_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'ORDER_CANCEL', label: 'Cancel', icon: 'fa-ban' }
        ]
    },
    {
        id: 'customers',
        name: 'Customer Management',
        icon: 'fas fa-users',
        permissions: [
            { code: 'CUSTOMER_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'CUSTOMER_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'CUSTOMER_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'CUSTOMER_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'suppliers',
        name: 'Supplier Management',
        icon: 'fas fa-truck',
        permissions: [
            { code: 'SUPPLIER_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'SUPPLIER_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'SUPPLIER_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'SUPPLIER_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'reorders',
        name: 'Reorder Management',
        icon: 'fas fa-redo',
        permissions: [
            { code: 'REORDER_VIEW', label: 'View Reorders', icon: 'fa-eye' },
            { code: 'REORDER_CREATE', label: 'Create Reorder', icon: 'fa-plus' },
            { code: 'REORDER_APPROVE', label: 'Approve', icon: 'fa-check' },
            { code: 'GRN_CREATE', label: 'Create GRN', icon: 'fa-file-invoice' }
        ]
    },
    {
        id: 'delivery',
        name: 'Delivery Management',
        icon: 'fas fa-shipping-fast',
        permissions: [
            { code: 'DELIVERY_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'DELIVERY_ASSIGN', label: 'Assign', icon: 'fa-user-tag' },
            { code: 'DELIVERY_UPDATE_STATUS', label: 'Update Status', icon: 'fa-tasks' },
            { code: 'DELIVERY_CANCEL', label: 'Cancel', icon: 'fa-ban' }
        ]
    },
    {
        id: 'pos',
        name: 'POS & Sales',
        icon: 'fas fa-cash-register',
        permissions: [
            { code: 'POS_ACCESS', label: 'Access POS', icon: 'fa-unlock' },
            { code: 'SALE_CREATE', label: 'Create Sale', icon: 'fa-plus' },
            { code: 'SALE_VOID', label: 'Void Sale', icon: 'fa-ban' },
            { code: 'PAYMENT_CREATE', label: 'Process Payment', icon: 'fa-money-bill' },
            { code: 'INVOICE_PRINT', label: 'Print Invoice', icon: 'fa-print' }
        ]
    },
    {
        id: 'reports',
        name: 'Reports & Analytics',
        icon: 'fas fa-chart-bar',
        permissions: [
            { code: 'REPORT_VIEW', label: 'View Reports', icon: 'fa-eye' },
            { code: 'REPORT_EXPORT', label: 'Export Reports', icon: 'fa-download' }
        ]
    },
    {
        id: 'users',
        name: 'User Management',
        icon: 'fas fa-user',
        permissions: [
            { code: 'USER_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'USER_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'USER_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'USER_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'employees',
        name: 'Employee Management',
        icon: 'fas fa-id-badge',
        permissions: [
            { code: 'EMPLOYEE_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'EMPLOYEE_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'EMPLOYEE_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'EMPLOYEE_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'roles',
        name: 'Role Management',
        icon: 'fas fa-user-shield',
        permissions: [
            { code: 'ROLE_VIEW', label: 'View', icon: 'fa-eye' },
            { code: 'ROLE_CREATE', label: 'Create', icon: 'fa-plus' },
            { code: 'ROLE_UPDATE', label: 'Update', icon: 'fa-edit' },
            { code: 'ROLE_DELETE', label: 'Delete', icon: 'fa-trash' }
        ]
    },
    {
        id: 'settings',
        name: 'System Settings',
        icon: 'fas fa-cog',
        permissions: [
            { code: 'SYSTEM_SETTINGS', label: 'Manage Settings', icon: 'fa-cogs' }
        ]
    }
];

// Sample roles data with new permission structure (will be replaced by API data)
let rolesData = [];

let currentEditingRoleId = null;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeRoleManagement();
    renderPermissionModules();
    fetchRoles(); // Fetch roles from API
});

// Initialize Role Management Page
function initializeRoleManagement() {
    setupSelectAllPermissions();
    setupFormSubmission();
    setupCancelButton();
    setupDeleteButton();
}

// Render permission modules dynamically
function renderPermissionModules() {
    const container = document.getElementById('permissionsContainer');
    if (!container) return;

    const modulesHTML = permissionModules.map(module => `
        <div class="module-section" id="module-${module.id}" data-module-id="${module.id}">
            <div class="module-header" onclick="toggleModule('${module.id}')">
                <input type="checkbox" class="module-checkbox" id="module-check-${module.id}" 
                       onclick="event.stopPropagation(); handleModuleCheck('${module.id}')" />
                <i class="${module.icon} module-icon"></i>
                <span class="module-name">${module.name}</span>
                <span class="module-badge" id="badge-${module.id}">0/${module.permissions.length}</span>
                <i class="fas fa-chevron-down expand-icon"></i>
            </div>
            <div class="crud-permissions">
                <div class="module-quick-select">
                    <button type="button" class="quick-select-btn" onclick="selectModuleCRUD('${module.id}', 'all')">
                        <i class="fas fa-check-double"></i> Select All
                    </button>
                    <button type="button" class="quick-select-btn" onclick="selectModuleCRUD('${module.id}', 'view')">
                        <i class="fas fa-eye"></i> View Only
                    </button>
                    <button type="button" class="quick-select-btn" onclick="selectModuleCRUD('${module.id}', 'none')">
                        <i class="fas fa-times"></i> Clear All
                    </button>
                </div>
                <div class="crud-grid">
                    ${module.permissions.map(perm => `
                        <div class="crud-item" id="perm-${perm.code}">
                            <input type="checkbox" 
                                   id="check-${perm.code}" 
                                   name="permissions" 
                                   value="${perm.code}"
                                   data-module-id="${module.id}"
                                   onchange="handlePermissionChange('${module.id}', '${perm.code}')" />
                            <label for="check-${perm.code}">
                                <i class="fas ${perm.icon} action-icon"></i>
                                ${perm.label}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = modulesHTML;
}

// Toggle module expand/collapse
function toggleModule(moduleId) {
    const moduleSection = document.getElementById(`module-${moduleId}`);
    if (moduleSection) {
        moduleSection.classList.toggle('expanded');
    }
}

// Handle module checkbox
function handleModuleCheck(moduleId) {
    const moduleCheckbox = document.getElementById(`module-check-${moduleId}`);
    const isChecked = moduleCheckbox.checked;

    // Select/deselect all permissions in this module
    const module = permissionModules.find(m => m.id === moduleId);
    if (!module) return;

    module.permissions.forEach(perm => {
        const permCheckbox = document.getElementById(`check-${perm.code}`);
        if (permCheckbox) {
            permCheckbox.checked = isChecked;
            handlePermissionChange(moduleId, perm.code);
        }
    });

    // Expand module if checked
    if (isChecked) {
        const moduleSection = document.getElementById(`module-${moduleId}`);
        if (moduleSection && !moduleSection.classList.contains('expanded')) {
            moduleSection.classList.add('expanded');
        }
    }
}

// Handle individual permission change
function handlePermissionChange(moduleId, permCode) {
    const permCheckbox = document.getElementById(`check-${permCode}`);
    const permItem = document.getElementById(`perm-${permCode}`);

    // Update visual state
    if (permCheckbox.checked) {
        permItem.classList.add('checked');
    } else {
        permItem.classList.remove('checked');
    }

    // Update module badge and state
    updateModuleBadge(moduleId);
    updatePermissionCounter();
    updateSelectAllState();
}

// Update module badge (shows selected/total)
function updateModuleBadge(moduleId) {
    const module = permissionModules.find(m => m.id === moduleId);
    if (!module) return;

    const selectedCount = module.permissions.filter(perm => {
        const checkbox = document.getElementById(`check-${perm.code}`);
        return checkbox && checkbox.checked;
    }).length;

    const badge = document.getElementById(`badge-${moduleId}`);
    const moduleSection = document.getElementById(`module-${moduleId}`);
    const moduleCheckbox = document.getElementById(`module-check-${moduleId}`);

    if (badge) {
        badge.textContent = `${selectedCount}/${module.permissions.length}`;
    }

    // Update module section state
    if (selectedCount > 0) {
        moduleSection?.classList.add('has-permissions');
        if (moduleCheckbox) {
            moduleCheckbox.checked = selectedCount === module.permissions.length;
            moduleCheckbox.indeterminate = selectedCount > 0 && selectedCount < module.permissions.length;
        }
    } else {
        moduleSection?.classList.remove('has-permissions');
        if (moduleCheckbox) {
            moduleCheckbox.checked = false;
            moduleCheckbox.indeterminate = false;
        }
    }
}

// Quick select for module CRUD
function selectModuleCRUD(moduleId, action) {
    const module = permissionModules.find(m => m.id === moduleId);
    if (!module) return;

    module.permissions.forEach(perm => {
        const permCheckbox = document.getElementById(`check-${perm.code}`);
        if (!permCheckbox) return;

        if (action === 'all') {
            permCheckbox.checked = true;
        } else if (action === 'view') {
            // Select only VIEW permissions
            permCheckbox.checked = perm.code.includes('_VIEW');
        } else if (action === 'none') {
            permCheckbox.checked = false;
        }

        handlePermissionChange(moduleId, perm.code);
    });
}

// Update role statistics and animate counters
function updateRoleStatistics() {
    const totalRoles = rolesData.length;
    const activeRoles = rolesData.filter(role => role.permissions && role.permissions.length > 0).length;

    // Calculate total permissions from all modules
    const totalPermissions = permissionModules.reduce((total, module) => {
        return total + module.permissions.length;
    }, 0);

    const rolesWithUsers = rolesData.filter(role => role.userCount && role.userCount > 0).length || rolesData.length; // Placeholder until API provides userCount

    animateValue('totalRoles', 0, totalRoles, 800);
    animateValue('activeRoles', 0, activeRoles, 800);
    animateValue('totalPermissions', 0, totalPermissions, 800);
    animateValue('rolesWithUsers', 0, rolesWithUsers, 800);
}

// Animate counter values
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

// Setup Select All Permissions
function setupSelectAllPermissions() {
    const selectAllCheckbox = document.getElementById('selectAllPermissions');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const isChecked = this.checked;

            // Select/deselect all module checkboxes
            permissionModules.forEach(module => {
                const moduleCheckbox = document.getElementById(`module-check-${module.id}`);
                if (moduleCheckbox) {
                    moduleCheckbox.checked = isChecked;
                    handleModuleCheck(module.id);
                }
            });

            // If checking all, expand all modules
            if (isChecked) {
                document.querySelectorAll('.module-section').forEach(section => {
                    section.classList.add('expanded');
                });
            }
        });
    }
}

// Update Permission Counter
function updatePermissionCounter() {
    const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');
    const counter = document.getElementById('permissionCounter');
    const count = permissionCheckboxes.length;

    if (counter) {
        counter.textContent = `${count} selected`;
    }
}

// Update Select All State
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllPermissions');
    const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');
    const checkedCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');

    if (selectAllCheckbox) {
        if (checkedCheckboxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCheckboxes.length === permissionCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Form Submission
function setupFormSubmission() {
    const roleForm = document.getElementById('roleForm');

    if (roleForm) {
        roleForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const roleName = document.getElementById('roleName').value.trim();
            const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
                .map(cb => cb.value);

            // Validate
            if (!roleName) {
                document.getElementById('roleName').classList.add('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please enter a role name.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
                return;
            }

            if (selectedPermissions.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please select at least one permission.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
                return;
            }

            // Show loading
            const saveBtn = document.getElementById('saveBtn');
            const originalBtnText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

            try {
                if (currentEditingRoleId) {
                    // Update existing role
                    await updateRole(currentEditingRoleId, roleName, selectedPermissions);
                } else {
                    // Create new role
                    await createRole(roleName, selectedPermissions);
                }

                // Render updated table
                renderRolesTable();

                // Reset form
                resetForm();

                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: currentEditingRoleId ? 'Role Updated!' : 'Role Created!',
                    text: `The role "${roleName}" has been ${currentEditingRoleId ? 'updated' : 'created'} successfully.`,
                    timer: 2000,
                    showConfirmButton: false,
                    iconColor: '#22C55E'
                });
            } catch (error) {
                console.error('Error saving role:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to save role.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalBtnText;
            }
        });

        // Real-time validation
        document.getElementById('roleName').addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    }
}

// ==================== API Functions ====================

// Fetch all roles from API
async function fetchRoles() {
    try {
        const response = await fetch('/api/roles');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            // Map API response to frontend format
            rolesData = result.data.map(role => ({
                id: role.id,
                name: role.name,
                permissions: role.permissions || [],
                description: role.description,
                isActive: role.isActive,
                userCount: role.userCount || 0
            }));

            renderRolesTable();
            updateRoleStatistics();
        } else {
            throw new Error(result.message || 'Failed to fetch roles');
        }
    } catch (error) {
        console.error('Error fetching roles:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Roles',
            text: 'Failed to load roles from database: ' + error.message,
            confirmButtonColor: '#22C55E',
            iconColor: '#EF4444'
        });
    }
}

// Create New Role
async function createRole(name, permissions, description = '') {
    try {
        const response = await fetch('/api/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                permissions: permissions,
                description: description,
                isActive: true
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to create role');
        }

        // Refresh roles list
        await fetchRoles();

        return result.data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
}

// Update Existing Role
async function updateRole(roleId, name, permissions, description = '') {
    try {
        const response = await fetch(`/api/roles/${roleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                permissions: permissions,
                description: description
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update role');
        }

        // Refresh roles list
        await fetchRoles();

        return result.data;
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
}

// Delete Role
async function deleteRole(roleId) {
    try {
        const response = await fetch(`/api/roles/${roleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete role');
        }

        // Refresh roles list
        await fetchRoles();

        return result;
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
}

// ==================== End API Functions ====================

// Setup Delete Button
function setupDeleteButton() {
    const deleteBtn = document.getElementById('deleteBtn');

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function () {
            if (!currentEditingRoleId) return;

            const role = rolesData.find(r => r.id === currentEditingRoleId);
            if (!role) return;

            // Show confirmation
            const result = await Swal.fire({
                title: 'Delete Role?',
                html: `Are you sure you want to delete the role <strong>"${role.name}"</strong>?<br><br>
                       <span style="color: #EF4444;">⚠️ This action cannot be undone!</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#64748B',
                iconColor: '#F59E0B'
            });

            if (result.isConfirmed) {
                // Show loading
                const originalBtnText = deleteBtn.innerHTML;
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';

                try {
                    await deleteRole(currentEditingRoleId);

                    // Render updated table
                    renderRolesTable();

                    // Reset form
                    resetForm();

                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Role Deleted!',
                        text: `The role "${role.name}" has been deleted successfully.`,
                        timer: 2000,
                        showConfirmButton: false,
                        iconColor: '#22C55E'
                    });
                } catch (error) {
                    console.error('Error deleting role:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete role.',
                        confirmButtonColor: '#22C55E',
                        iconColor: '#EF4444'
                    });
                } finally {
                    deleteBtn.disabled = false;
                    deleteBtn.innerHTML = originalBtnText;
                }
            }
        });
    }
}

// Setup Cancel Button
function setupCancelButton() {
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            resetForm();
        });
    }
}

// Reset Form
function resetForm() {
    currentEditingRoleId = null;

    // Reset form fields
    document.getElementById('roleForm').reset();
    document.getElementById('roleName').classList.remove('is-invalid');

    // Uncheck all permissions and module checkboxes
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        checkbox.checked = false;
        const permItem = checkbox.closest('.crud-item');
        if (permItem) permItem.classList.remove('checked');
    });

    // Reset module checkboxes and collapse all
    permissionModules.forEach(module => {
        const moduleCheckbox = document.getElementById(`module-check-${module.id}`);
        if (moduleCheckbox) {
            moduleCheckbox.checked = false;
            moduleCheckbox.indeterminate = false;
        }

        const moduleSection = document.getElementById(`module-${module.id}`);
        if (moduleSection) {
            moduleSection.classList.remove('expanded', 'has-permissions');
        }

        updateModuleBadge(module.id);
    });

    document.getElementById('selectAllPermissions').checked = false;

    // Update UI
    document.getElementById('formTitle').textContent = 'Create New Role';
    document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Save Role';
    document.getElementById('deleteBtn').disabled = true;
    updatePermissionCounter();
}

// Load Role for Editing
function loadRoleForEditing(roleId) {
    const role = rolesData.find(r => r.id === roleId);
    if (!role) return;

    currentEditingRoleId = roleId;

    // Update form title
    document.getElementById('formTitle').textContent = 'Edit Role';

    // Fill form
    document.getElementById('roleName').value = role.name;

    // Check permissions
    document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
        const isChecked = role.permissions.includes(checkbox.value);
        checkbox.checked = isChecked;
        const permItem = checkbox.closest('.crud-item');
        if (permItem) {
            if (isChecked) {
                permItem.classList.add('checked');
            } else {
                permItem.classList.remove('checked');
            }
        }
    });

    // Update module badges and expand modules with permissions
    permissionModules.forEach(module => {
        updateModuleBadge(module.id);

        // Expand module if it has any permissions selected
        const hasPermissions = module.permissions.some(perm =>
            role.permissions.includes(perm.code)
        );

        if (hasPermissions) {
            const moduleSection = document.getElementById(`module-${module.id}`);
            if (moduleSection) {
                moduleSection.classList.add('expanded');
            }
        }
    });

    // Update UI
    updatePermissionCounter();
    updateSelectAllState();
    document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Update Role';
    document.getElementById('deleteBtn').disabled = false;

    // Scroll to form
    document.querySelector('.role-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render Roles Table
function renderRolesTable() {
    const container = document.getElementById('rolesTableContainer');
    const roleCounter = document.getElementById('roleCounter');

    // Update counter
    roleCounter.textContent = `${rolesData.length} role${rolesData.length !== 1 ? 's' : ''}`;

    if (rolesData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No roles created yet. Create your first role above!</p>
            </div>
        `;
        return;
    }

    const tableHTML = `
        <table class="table roles-table">
            <thead>
                <tr>
                    <th>Role Name</th>
                    <th>Permissions</th>
                    <th style="text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${rolesData.map(role => `
                    <tr>
                        <td>
                            <span class="role-badge">${role.name}</span>
                        </td>
                        <td>
                            <div class="permissions-pills">
                                ${role.permissions.slice(0, 3).map(perm => `
                                    <span class="permission-pill">
                                        <i class="fas ${getPermissionIcon(perm)}"></i>
                                        ${getPermissionLabel(perm)}
                                    </span>
                                `).join('')}
                                ${role.permissions.length > 3 ? `
                                    <span class="permission-pill" style="background: var(--medium-grey); color: var(--text-dark);">
                                        +${role.permissions.length - 3} more
                                    </span>
                                ` : ''}
                            </div>
                        </td>
                        <td style="text-align: center;">
                            <div class="action-buttons" style="justify-content: center;">
                                <button class="btn-action btn-edit" onclick="loadRoleForEditing(${role.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn-action btn-remove" onclick="handleDeleteRole(${role.id})">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
    updateRoleStatistics();
}

// Handle Delete Role from Table
async function handleDeleteRole(roleId) {
    const role = rolesData.find(r => r.id === roleId);
    if (!role) return;

    // Show confirmation
    const result = await Swal.fire({
        title: 'Delete Role?',
        html: `Are you sure you want to delete the role <strong>"${role.name}"</strong>?<br><br>
               <span style="color: #EF4444;">⚠️ This action cannot be undone!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
        iconColor: '#F59E0B'
    });

    if (result.isConfirmed) {
        try {
            await deleteRole(roleId);

            // If currently editing this role, reset form
            if (currentEditingRoleId === roleId) {
                resetForm();
            }

            // Render updated table
            renderRolesTable();

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Role Deleted!',
                text: `The role "${role.name}" has been deleted successfully.`,
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#22C55E'
            });
        } catch (error) {
            console.error('Error deleting role:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete role.',
                confirmButtonColor: '#22C55E',
                iconColor: '#EF4444'
            });
        }
    }
}

// Helper function to get user-friendly permission label
function getPermissionLabel(permCode) {
    for (const module of permissionModules) {
        const perm = module.permissions.find(p => p.code === permCode);
        if (perm) {
            return perm.label;
        }
    }
    return permCode; // Return code if not found
}

// Helper function to get permission icon
function getPermissionIcon(permCode) {
    for (const module of permissionModules) {
        const perm = module.permissions.find(p => p.code === permCode);
        if (perm) {
            return perm.icon;
        }
    }
    return 'fa-check'; // Default icon
}

// Console welcome message
console.log('%c🌿 Sampath Grocery Store - Role & Permission Management',
    'color: #22C55E; font-size: 16px; font-weight: bold;');
console.log('%cManage user roles and permissions for the system',
    'color: #3B82F6; font-size: 14px;');
