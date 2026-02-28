// Sampath Grocery Store - User Registration Page JavaScript

// Simulated existing usernames database (Replace with actual API call)
const existingUsernames = ['admin', 'manager', 'john_doe', 'jane_smith', 'cashier01'];

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initializeRegistrationPage();
});

// Initialize Registration Page
function initializeRegistrationPage() {
    setupPasswordToggles();
    setupUsernameAvailabilityCheck();
    setupPasswordStrengthMeter();
    setupPasswordMatch();
    setupFormValidation();
    setupActiveToggle();
    setupCancelButton();
}

// Password Show/Hide Toggle
function setupPasswordToggles() {
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            togglePasswordVisibility(passwordInput, togglePassword);
        });
    }

    // Confirm password toggle
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function () {
            togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
        });
    }
}

// Toggle Password Visibility
function togglePasswordVisibility(input, button) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const icon = button.querySelector('i');
    if (type === 'password') {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// Real-time Username Availability Check
function setupUsernameAvailabilityCheck() {
    const usernameInput = document.getElementById('username');
    const availabilityIndicator = document.getElementById('usernameAvailability');
    const usernameError = document.getElementById('usernameError');
    let timeoutId;

    if (usernameInput && availabilityIndicator) {
        usernameInput.addEventListener('input', function () {
            const username = this.value.trim();

            // Clear previous timeout
            clearTimeout(timeoutId);

            // Reset states
            usernameInput.classList.remove('is-invalid', 'is-valid');
            availabilityIndicator.innerHTML = '';
            availabilityIndicator.className = 'availability-indicator';

            if (username.length === 0) {
                return;
            }

            // Validate username format (alphanumeric, underscore, hyphen)
            const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
            if (!usernameRegex.test(username)) {
                usernameInput.classList.add('is-invalid');
                usernameError.textContent = 'Username must be 3-20 characters (letters, numbers, _, -)';
                return;
            }

            // Show checking indicator
            availabilityIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            availabilityIndicator.classList.add('checking');

            // Debounce the availability check
            timeoutId = setTimeout(() => {
                checkUsernameAvailability(username, usernameInput, availabilityIndicator, usernameError);
            }, 500);
        });
    }
}

// Check Username Availability (Simulated API call)
async function checkUsernameAvailability(username, inputElement, indicator, errorElement) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if username exists (Replace with actual API call)
        const isAvailable = !existingUsernames.includes(username.toLowerCase());

        if (isAvailable) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            indicator.classList.remove('checking');
            indicator.classList.add('available');
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
            indicator.innerHTML = '<i class="fas fa-times-circle"></i>';
            indicator.classList.remove('checking');
            indicator.classList.add('unavailable');
            errorElement.textContent = 'Username is already taken';
        }
    } catch (error) {
        console.error('Error checking username availability:', error);
        indicator.innerHTML = '';
        indicator.className = 'availability-indicator';
    }
}

// Password Strength Meter
function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthMeter = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');

    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function () {
            const password = this.value;

            if (password.length === 0) {
                strengthMeter.classList.remove('show');
                strengthText.classList.remove('show');
                strengthBar.className = 'password-strength-bar';
                return;
            }

            strengthMeter.classList.add('show');
            strengthText.classList.add('show');

            // Calculate password strength
            const strength = calculatePasswordStrength(password);

            // Update strength bar and text
            strengthBar.className = 'password-strength-bar ' + strength.level;
            strengthText.className = 'password-strength-text show ' + strength.level;
            strengthText.textContent = strength.text;
        });
    }
}

// Calculate Password Strength
function calculatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special characters

    // Determine strength level
    if (score <= 2) {
        return { level: 'weak', text: '🔴 Weak - Add uppercase, numbers & symbols' };
    } else if (score <= 4) {
        return { level: 'medium', text: '🟡 Medium - Add more variety for better security' };
    } else {
        return { level: 'strong', text: '🟢 Strong - Great password!' };
    }
}

// Password Match Validation
function setupPasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            validatePasswordMatch();
        });

        passwordInput.addEventListener('input', function () {
            if (confirmPasswordInput.value.length > 0) {
                validatePasswordMatch();
            }
        });
    }
}

// Validate Password Match
function validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (confirmPasswordInput.value.length === 0) {
        confirmPasswordInput.classList.remove('is-invalid', 'is-valid');
        return false;
    }

    if (passwordInput.value === confirmPasswordInput.value) {
        confirmPasswordInput.classList.remove('is-invalid');
        confirmPasswordInput.classList.add('is-valid');
        return true;
    } else {
        confirmPasswordInput.classList.remove('is-valid');
        confirmPasswordInput.classList.add('is-invalid');
        return false;
    }
}

// Form Validation and Submission
function setupFormValidation() {
    const registerForm = document.getElementById('registerForm');
    const createBtn = document.getElementById('createBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form values
            const formData = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
                confirmPassword: document.getElementById('confirmPassword').value.trim(),
                role: document.getElementById('role').value,
                isActive: document.getElementById('isActive').checked
            };

            // Validate all fields
            const validation = validateForm(formData);

            if (!validation.isValid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    html: validation.errors.join('<br>'),
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
                return;
            }

            // Show loading state
            const originalBtnText = createBtn.innerHTML;
            createBtn.disabled = true;
            createBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating User...';

            try {
                await createUser(formData);
            } catch (error) {
                console.error('Registration error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: error.message || 'An error occurred during registration.',
                    confirmButtonColor: '#22C55E',
                    iconColor: '#EF4444'
                });
            } finally {
                // Reset button state
                createBtn.disabled = false;
                createBtn.innerHTML = originalBtnText;
            }
        });
    }
}

// Validate Form Data
function validateForm(data) {
    const errors = [];
    let isValid = true;

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!data.username || !usernameRegex.test(data.username)) {
        errors.push('❌ Invalid username format');
        document.getElementById('username').classList.add('is-invalid');
        isValid = false;
    } else if (existingUsernames.includes(data.username.toLowerCase())) {
        errors.push('❌ Username is already taken');
        document.getElementById('username').classList.add('is-invalid');
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('❌ Invalid email address');
        document.getElementById('email').classList.add('is-invalid');
        isValid = false;
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
        errors.push('❌ Password must be at least 8 characters');
        document.getElementById('password').classList.add('is-invalid');
        isValid = false;
    }

    // Password match validation
    if (data.password !== data.confirmPassword) {
        errors.push('❌ Passwords do not match');
        document.getElementById('confirmPassword').classList.add('is-invalid');
        isValid = false;
    }

    // Role validation
    if (!data.role) {
        errors.push('❌ Please select a user role');
        document.getElementById('role').classList.add('is-invalid');
        isValid = false;
    }

    return { isValid, errors };
}

// Create User (Simulated API call)
async function createUser(userData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful registration (Replace with actual API call)
    console.log('Creating user:', userData);

    // Show success message with user details
    const result = await Swal.fire({
        icon: 'success',
        title: 'User Created Successfully!',
        html: `
            <div style="text-align: left; padding: 1rem;">
                <p><strong>Username:</strong> ${userData.username}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Role:</strong> ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</p>
                <p><strong>Status:</strong> ${userData.isActive ? '✅ Active' : '❌ Inactive'}</p>
            </div>
        `,
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Create Another User',
        confirmButtonColor: '#22C55E',
        cancelButtonColor: '#64748B',
        iconColor: '#22C55E'
    });

    if (result.isConfirmed) {
        // Redirect to login page
        window.location.href = 'login.html';
    } else {
        // Reset form for new user
        document.getElementById('registerForm').reset();
        document.getElementById('isActive').checked = true;
        document.getElementById('activeStatus').textContent = '(Enabled)';

        // Clear validation states
        document.querySelectorAll('.form-control, .form-select').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });

        // Hide password strength indicator
        document.getElementById('passwordStrength').classList.remove('show');
        document.getElementById('passwordStrengthText').classList.remove('show');

        // Clear availability indicator
        document.getElementById('usernameAvailability').innerHTML = '';
    }
}

// Active Toggle Status Update
function setupActiveToggle() {
    const activeToggle = document.getElementById('isActive');
    const activeStatus = document.getElementById('activeStatus');

    if (activeToggle && activeStatus) {
        activeToggle.addEventListener('change', function () {
            if (this.checked) {
                activeStatus.textContent = '(Enabled)';
                activeStatus.style.color = 'var(--success-green)';
            } else {
                activeStatus.textContent = '(Disabled)';
                activeStatus.style.color = 'var(--danger-red)';
            }
        });
    }
}

// Cancel Button Handler
function setupCancelButton() {
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            Swal.fire({
                title: 'Cancel Registration?',
                text: 'All entered data will be lost. Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Cancel',
                cancelButtonText: 'Continue Editing',
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#22C55E',
                iconColor: '#F59E0B'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect to login or dashboard
                    window.location.href = 'login.html';
                }
            });
        });
    }
}

// Console welcome message
console.log('%c🌿 Sampath Grocery Store - User Registration System',
    'color: #22C55E; font-size: 16px; font-weight: bold;');
console.log('%cPassword Requirements:',
    'color: #3B82F6; font-size: 14px; font-weight: bold;');
console.log('• Minimum 8 characters');
console.log('• Include uppercase and lowercase letters');
console.log('• Include numbers and special characters');
console.log('• Passwords must match');
