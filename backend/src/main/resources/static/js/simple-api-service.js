/**
 * ========================================================
 * API Configuration & Simple Fetch Helper
 * Basic frontend-backend connection (NO JWT)
 * ========================================================
 */

// ============================================
// 1. API Configuration
// ============================================
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT: 30000, // 30 seconds
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// ============================================
// 2. Generic API Request Function with Error Handling
// ============================================
/**
 * Make an API request to backend
 * @param {string} endpoint - API endpoint (e.g., '/test/ping')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Default configuration
    const config = {
        method: options.method || 'GET',
        headers: {
            ...API_CONFIG.HEADERS,
            ...options.headers
        },
        credentials: 'include', // Include cookies if needed
    };

    // Add body if provided (for POST, PUT, PATCH)
    if (options.body) {
        config.body = typeof options.body === 'string'
            ? options.body
            : JSON.stringify(options.body);
    }

    try {
        console.log(`🔥 API Request: ${config.method} ${url}`);
        console.log('Request Config:', config);

        const response = await fetch(url, config);

        console.log(`✅ Response Status: ${response.status} ${response.statusText}`);

        // Parse JSON response
        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Check if request was successful
        if (!response.ok) {
            const error = new Error(data.message || `HTTP Error: ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        console.log('✅ Response Data:', data);
        return data;

    } catch (error) {
        console.error('❌ API Request Failed:', error);

        // Network or CORS error
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('🚫 CORS or Network Error - Backend may not be running');
            throw new Error('Cannot connect to backend. Please ensure backend is running on ' + API_CONFIG.BASE_URL);
        }

        throw error;
    }
}

// ============================================
// 3. Specific API Methods
// ============================================
const SimpleAPI = {

    // --- TEST ENDPOINTS ---

    /**
     * Test backend connection
     */
    async testConnection() {
        return await apiRequest('/test/ping');
    },

    /**
     * Test POST request
     */
    async testPost(data) {
        return await apiRequest('/test/echo', {
            method: 'POST',
            body: data
        });
    },

    /**
     * Test path parameters
     */
    async testGreet(name) {
        return await apiRequest(`/test/greet/${name}`);
    },

    /**
     * Test error handling
     */
    async testError() {
        return await apiRequest('/test/error');
    },

    /**
     * Check backend health
     */
    async checkHealth() {
        return await apiRequest('/test/health');
    }
};

// ============================================
// 4. Utility Functions
// ============================================

/**
 * Show loading indicator
 */
function showLoading(message = 'Loading...') {
    console.log('⏳', message);
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: message,
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
 * Show error message
 */
function showError(message, title = 'Error') {
    console.error('❌', title, ':', message);
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#d33'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Show success message
 */
function showSuccess(message, title = 'Success') {
    console.log('✅', title, ':', message);
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Show info message
 */
function showInfo(message, title = 'Info') {
    console.log('ℹ️', title, ':', message);
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: title,
            text: message
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

// ============================================
// 5. Make Available Globally
// ============================================
window.SimpleAPI = SimpleAPI;
window.apiRequest = apiRequest;
window.API_CONFIG = API_CONFIG;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showError = showError;
window.showSuccess = showSuccess;
window.showInfo = showInfo;

console.log('✅ Simple API Service Loaded');
console.log('📡 Backend URL:', API_CONFIG.BASE_URL);
console.log('🔧 Available Methods:', Object.keys(SimpleAPI));
