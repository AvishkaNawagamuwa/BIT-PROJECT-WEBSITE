/**
 * ========================================================
 * Sampath Grocery Store - Login Page (Backend Integrated)
 * ========================================================
 */

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in
    if (API.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    initializeLoginPage();
});

// Initialize Login Page
function initializeLoginPage() {
    setupPasswordToggle();
    setupLoginForm();
    setupForgotPassword();
    loadRememberedCredentials();
    setupKeyboardShortcuts();
}

// Password Show/Hide Toggle
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function () {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            const icon = toggleBtn.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
}

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Remove previous validation states
            removeValidationErrors();

            // Get form values
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

            // Validate inputs
            let isValid = true;

            if (!username) {
                showFieldError(usernameInput, 'Username or email is required');
                isValid = false;
            }

            if (!password) {
                showFieldError(passwordInput, 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showFieldError(passwordInput, 'Password must be at least 6 characters');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Disable form during submission
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';

            try {
                // Call API login
                const response = await API.login({
                    usernameOrEmail: username,
                    password: password,
                    rememberMe: rememberMe
                });

                if (response && response.success) {
                    // Save remember me credentials if checked
                    if (rememberMe) {
                        localStorage.setItem('remembered_username', username);
                    } else {
                        localStorage.removeItem('remembered_username');
                    }

                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: `Welcome back, ${response.data.user.username}!`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirect to dashboard
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    throw new Error(response.message || 'Login failed');
                }

            } catch (error) {
                console.error('Login error:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: error.message || 'Invalid username or password. Please try again.',
                    confirmButtonColor: '#22C55E'
                });

            } finally {
                // Re-enable form
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
            }
        });
    }
}

// Show field error
function showFieldError(input, message) {
    input.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
}

// Remove validation errors
function removeValidationErrors() {
    const invalidInputs = document.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
    
    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(msg => msg.remove());
}

// Setup Forgot Password
function setupForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                title: 'Reset Password',
                html: `
                    <input type="email" id="resetEmail" class="swal2-input" placeholder="Enter your email">
                `,
                showCancelButton: true,
                confirmButtonText: 'Send Reset Link',
                confirmButtonColor: '#22C55E',
                cancelButtonColor: '#6c757d',
                preConfirm: () => {
                    const email = document.getElementById('resetEmail').value;
                    if (!email) {
                        Swal.showValidationMessage('Email is required');
                        return false;
                    }
                    return { email: email };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // TODO: Call password reset API when implemented
                    Swal.fire({
                        icon: 'info',
                        title: 'Coming Soon',
                        text: 'Password reset functionality will be available soon. Please contact administrator.',
                        confirmButtonColor: '#22C55E'
                    });
                }
            });
        });
    }
}

// Load Remembered Credentials
function loadRememberedCredentials() {
    const rememberedUsername = localStorage.getItem('remembered_username');
    const usernameInput = document.getElementById('username');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    if (rememberedUsername && usernameInput) {
        usernameInput.value = rememberedUsername;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
}

// Setup Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Enter key to submit (if not already handled by form)
        if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.click();
            }
        }
    });
}

// Quick Login for Testing (Remove in production)
function quickLogin(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// Add quick login buttons for development (Remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('DOMContentLoaded', () => {
        const loginCard = document.querySelector('.card-body');
        if (loginCard) {
            const devTools = document.createElement('div');
            devTools.className = 'dev-tools mt-3 p-2 bg-light rounded';
            devTools.innerHTML = `
                <small class="text-muted d-block mb-2">Quick Login (Dev Only):</small>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="quickLogin('admin', 'Admin@123')">Admin</button>
                    <button type="button" class="btn btn-outline-success" onclick="quickLogin('manager', 'Manager@123')">Manager</button>
                    <button type="button" class="btn btn-outline-info" onclick="quickLogin('cashier', 'Cashier@123')">Cashier</button>
                </div>
            `;
            loginCard.appendChild(devTools);
        }
    });
}
