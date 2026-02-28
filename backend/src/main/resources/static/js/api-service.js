/**
 * ========================================================
 * Sampath Grocery Store - API Service
 * Centralized API service for backend integration
 * ========================================================
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: '/api', // Relative URL - works with Spring Boot static resources
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3
};

// Token Management Service
const TokenService = {
    /**
     * Get access token from localStorage
     */
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    },

    /**
     * Save tokens to localStorage
     */
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    },

    /**
     * Clear all tokens and user data
     */
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    /**
     * Get stored user data
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Save user data
     */
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

// API Request Handler
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Add authorization token if available
    const token = TokenService.getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        let response = await fetch(url, config);

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && TokenService.getRefreshToken()) {
            console.log('Access token expired, attempting refresh...');

            const refreshed = await refreshAccessToken();

            if (refreshed) {
                // Retry original request with new token
                config.headers['Authorization'] = `Bearer ${TokenService.getAccessToken()}`;
                response = await fetch(url, config);
            } else {
                // Refresh failed, redirect to login
                console.error('Token refresh failed');
                TokenService.clearTokens();
                window.location.href = '/grocery-store/login.html';
                return null;
            }
        }

        // Parse response
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
    try {
        const refreshToken = TokenService.getRefreshToken();

        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success && result.data) {
                TokenService.setTokens(result.data.accessToken, result.data.refreshToken);
                TokenService.setUser(result.data.user);
                console.log('Token refreshed successfully');
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
}

// ========================================================
// API METHODS
// ========================================================

const API = {
    // ====================================================
    // AUTHENTICATION ENDPOINTS
    // ====================================================

    /**
     * Login user
     * @param {Object} credentials - { usernameOrEmail, password, rememberMe }
     */
    async login(credentials) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response && response.success) {
            TokenService.setTokens(response.data.accessToken, response.data.refreshToken);
            TokenService.setUser(response.data.user);
        }

        return response;
    },

    /**
     * Register new user
     * @param {Object} userData - Registration data
     */
    async register(userData) {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        return response;
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiRequest('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            TokenService.clearTokens();
            window.location.href = '/grocery-store/login.html';
        }
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        return await apiRequest('/auth/me', {
            method: 'GET'
        });
    },

    /**
     * Check authentication status
     */
    isAuthenticated() {
        return !!TokenService.getAccessToken();
    },

    /**
     * Check if user has specific role
     * @param {String} roleName - Role name to check
     */
    hasRole(roleName) {
        const user = TokenService.getUser();
        return user && user.roles && user.roles.includes(roleName);
    },

    /**
     * Check if user has specific privilege
     * @param {String} privilegeName - Privilege name to check
     */
    hasPrivilege(privilegeName) {
        const user = TokenService.getUser();
        return user && user.privileges && user.privileges.includes(privilegeName);
    },

    // ====================================================
    // PRODUCTS ENDPOINTS (Coming in Phase 2)
    // ====================================================

    // To be implemented in Phase 2

    // ====================================================
    // ORDERS ENDPOINTS (Coming in Phase 3)
    // ====================================================

    // To be implemented in Phase 3

    // ====================================================
    // CUSTOMERS ENDPOINTS (Coming in Phase 4)
    // ====================================================

    // To be implemented in Phase 4

    // ====================================================
    // SUPPLIERS ENDPOINTS (Coming in Phase 5)
    // ====================================================

    // To be implemented in Phase 5

    // ====================================================
    // DELIVERY ENDPOINTS (Coming in Phase 6)
    // ====================================================

    // To be implemented in Phase 6
};

// ========================================================
// UTILITY FUNCTIONS
// ========================================================

/**
 * Show loading indicator
 */
function showLoading() {
    // You can customize this based on your UI framework
    console.log('Loading...');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log('Loading complete');
}

/**
 * Show error message
 */
function showError(message) {
    console.error('Error:', message);
    // Use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    } else {
        alert(message);
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log('Success:', message);
    // Use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 2000
        });
    } else {
        alert(message);
    }
}

/**
 * Protect page - redirect to login if not authenticated
 */
function requireAuth() {
    if (!API.isAuthenticated()) {
        window.location.href = '/grocery-store/login.html';
        return false;
    }
    return true;
}

/**
 * Require specific role
 */
function requireRole(roleName) {
    if (!requireAuth()) {
        return false;
    }

    if (!API.hasRole(roleName)) {
        showError('You do not have permission to access this page');
        window.location.href = '/grocery-store/dashboard.html';
        return false;
    }

    return true;
}

/**
 * Require specific privilege
 */
function requirePrivilege(privilegeName) {
    if (!requireAuth()) {
        return false;
    }

    if (!API.hasPrivilege(privilegeName)) {
        showError('You do not have permission to perform this action');
        return false;
    }

    return true;
}

// ========================================================
// EXPORT API SERVICE
// ========================================================

// Make API service available globally
window.API = API;
window.TokenService = TokenService;
window.requireAuth = requireAuth;
window.requireRole = requireRole;
window.requirePrivilege = requirePrivilege;
window.showError = showError;
window.showSuccess = showSuccess;

console.log('✅ API Service initialized');
console.log('📡 Backend URL:', API_CONFIG.BASE_URL);
