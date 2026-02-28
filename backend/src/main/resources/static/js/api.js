/**
 * API Helper for Sampath Grocery System
 * Provides reusable functions for making API calls
 */

const API_CONFIG = {
    baseURL: '', // Same origin - empty string for relative paths
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * Get authentication token from session storage
 */
function getAuthToken() {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
}

/**
 * Get headers with authentication token
 */
function getHeaders() {
    const headers = { ...API_CONFIG.defaultHeaders };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Handle API response
 */
async function handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        // Check if session expired (401)
        if (response.status === 401) {
            showError('Session expired. Please login again.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        }
        
        throw new Error(data.message || 'An error occurred');
    }
    
    return data;
}

/**
 * Show success message (using SweetAlert2 if available, fallback to alert)
 */
function showSuccess(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    } else {
        alert(message);
    }
}

/**
 * Show error message (using SweetAlert2 if available, fallback to alert)
 */
function showError(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    } else {
        alert('Error: ' + message);
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Loading...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    if (typeof Swal !== 'undefined') {
        Swal.close();
    }
}

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint (e.g., '/api/v1/delivery/drivers')
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
async function apiGet(endpoint, params = {}) {
    try {
        // Build query string
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API GET Error:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Response data
 */
async function apiPost(endpoint, data = {}) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API POST Error:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * Generic PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Response data
 */
async function apiPut(endpoint, data = {}) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API PUT Error:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * Generic PATCH request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Response data
 */
async function apiPatch(endpoint, data = {}) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API PATCH Error:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * Generic DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Response data
 */
async function apiDelete(endpoint) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API DELETE Error:', error);
        showError(error.message);
        throw error;
    }
}

/**
 * Format date for display (YYYY-MM-DD to DD/MM/YYYY)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format date-time for display
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Rs. 0.00';
    return 'Rs. ' + parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
