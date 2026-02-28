// Sampath Grocery Store - Login Page JavaScript

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeLoginPage();
});

// Initialize Login Page
function initializeLoginPage() {
    setupPasswordToggle();
    setupFormValidation();
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

// Form Validation and Submission
function setupFormValidation() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Remove previous validation states
            usernameInput.classList.remove('is-invalid');
            passwordInput.classList.remove('is-invalid');

            // Get form values
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;

            // Validate inputs
            let isValid = true;

            if (!username) {
                usernameInput.classList.add('is-invalid');
                isValid = false;
            }

            if (!password) {
                passwordInput.classList.add('is-invalid');
                isValid = false;
            }

            if (!isValid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please fill in all required fields.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
                return;
            }

            // Show loading state
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';

            // Simulate login (Replace with actual authentication logic)
            try {
                await simulateLogin(username, password, rememberMe);
            } catch (error) {
                console.error('Login error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: error.message || 'An error occurred during login.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
            } finally {
                // Reset button state
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        });

        // Real-time validation
        usernameInput.addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });

        passwordInput.addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    }
}

// Simulate Login (Replace with actual API call)
async function simulateLogin(username, password, rememberMe) {
    try {
        // Call backend login API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                rememberMe: rememberMe
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Save credentials if remember me is checked
            if (rememberMe) {
                saveCredentials(username);
            } else {
                clearSavedCredentials();
            }

            // Save session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('email', data.email);
            sessionStorage.setItem('roleName', data.roleName);
            sessionStorage.setItem('loginTime', new Date().toISOString());

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: `Welcome back, ${data.username}!`,
                timer: 2000,
                showConfirmButton: false,
                confirmButtonColor: '#22C55E',
                iconColor: '#22C55E'
            }).then(() => {
                // Redirect to dashboard (clean URL)
                window.location.href = '/dashboard';
            });
        } else {
            throw new Error(data.message || 'Invalid username or password. Please try again.');
        }
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please ensure the backend is running.');
        }
        throw error;
    }
}

// Save Credentials to LocalStorage
function saveCredentials(username) {
    try {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberMe', 'true');
    } catch (error) {
        console.error('Error saving credentials:', error);
    }
}

// Clear Saved Credentials
function clearSavedCredentials() {
    try {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberMe');
    } catch (error) {
        console.error('Error clearing credentials:', error);
    }
}

// Load Remembered Credentials
function loadRememberedCredentials() {
    try {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const rememberedUsername = localStorage.getItem('rememberedUsername');

        if (rememberMe && rememberedUsername) {
            document.getElementById('username').value = rememberedUsername;
            document.getElementById('rememberMe').checked = true;
        }
    } catch (error) {
        console.error('Error loading remembered credentials:', error);
    }
}

// Forgot Password Handler
function setupForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                title: 'Forgot Password?',
                html: `
                    <p style="margin-bottom: 1rem; color: #64748B;">
                        Enter your username to receive password reset instructions.
                    </p>
                    <input type="text" 
                           id="resetUsername" 
                           class="swal2-input" 
                           placeholder="Enter your username"
                           style="width: 85%; font-size: 1rem;">
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Send Reset Link',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#22C55E',
                cancelButtonColor: '#64748B',
                iconColor: '#3B82F6',
                preConfirm: () => {
                    const username = document.getElementById('resetUsername').value;
                    if (!username) {
                        Swal.showValidationMessage('Please enter your username');
                        return false;
                    }
                    return username;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Simulate sending reset email
                    Swal.fire({
                        icon: 'success',
                        title: 'Email Sent!',
                        html: `
                            <p>Password reset instructions have been sent to the email associated with <strong>${result.value}</strong>.</p>
                            <p style="color: #64748B; font-size: 0.9rem; margin-top: 1rem;">
                                Please check your inbox and spam folder.
                            </p>
                        `,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#22C55E',
                        iconColor: '#22C55E'
                    });
                }
            });
        });
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Alt + U: Focus username field
        if (e.altKey && e.key === 'u') {
            e.preventDefault();
            document.getElementById('username').focus();
        }

        // Alt + P: Focus password field
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('password').focus();
        }
    });
}

// Check if already logged in
(function checkExistingSession() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Optional: Auto-redirect to dashboard if already logged in
        // window.location.href = 'dashboard.html';
    }
})();

// Console welcome message
console.log('%c🌿 Sampath Grocery Store Login System',
    'color: #22C55E; font-size: 16px; font-weight: bold;');
console.log('%cDemo Credentials:',
    'color: #3B82F6; font-size: 14px; font-weight: bold;');
console.log('Username: admin | Password: admin123');
console.log('Username: manager | Password: manager123');
console.log('Username: staff | Password: staff123');
