document.addEventListener('DOMContentLoaded', async () => {
    
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const user = getUser();
    if (!user) {
        logout();
        return;
    }

    // DOM elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    
    const saveNameBtn = document.querySelector('.form-card:nth-child(1) .form-button');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const savePasswordBtn = document.querySelector('.form-card:nth-child(3) .form-button');
    
    // OTP Modal elements
    const otpOverlay = document.getElementById('otp-modal-overlay');
    const otpInput = document.getElementById('otp-input');
    const confirmOtpBtn = document.getElementById('confirm-otp-btn');
    const cancelOtpBtn = document.getElementById('cancel-otp-btn');
    const otpStatus = document.getElementById('otp-status');

    // Load current user data
    loadUserData();

    // Event listeners
    if (saveNameBtn) saveNameBtn.addEventListener('click', saveName);
    if (sendOtpBtn) sendOtpBtn.addEventListener('click', sendEmailOtp);
    if (savePasswordBtn) savePasswordBtn.addEventListener('click', savePassword);
    if (confirmOtpBtn) confirmOtpBtn.addEventListener('click', confirmEmailChange);
    if (cancelOtpBtn) cancelOtpBtn.addEventListener('click', cancelEmailChange);
    
    // Handle OTP form submission
    const otpForm = document.getElementById('otp-form');
    if (otpForm) otpForm.addEventListener('submit', confirmEmailChange);

    // Load user data into form
    function loadUserData() {
        if (nameInput && user.name) {
            nameInput.value = user.name;
        }
        if (emailInput && user.email) {
            emailInput.value = user.email;
        }
    }

    // Save name function
    async function saveName() {
        const newName = nameInput.value.trim();
        
        if (!newName) {
            showMessage('Please enter a valid name', 'error');
            return;
        }

        try {
            saveNameBtn.disabled = true;
            saveNameBtn.textContent = 'Saving...';

            // Update user profile via API
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ name: newName })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage
                const updatedUser = { ...user, name: newName };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                showMessage('Name updated successfully!', 'success');
            } else {
                throw new Error(data.message || 'Failed to update name');
            }

        } catch (error) {
            console.error('Error updating name:', error);
            showMessage(error.message || 'Failed to update name', 'error');
        } finally {
            saveNameBtn.disabled = false;
            saveNameBtn.textContent = 'Save Name';
        }
    }

    // Send email OTP
    async function sendEmailOtp() {
        const newEmail = emailInput.value.trim();
        
        if (!newEmail || !isValidEmail(newEmail)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (newEmail === user.email) {
            showMessage('This is already your current email', 'error');
            return;
        }

        try {
            sendOtpBtn.disabled = true;
            sendOtpBtn.textContent = 'Sending...';

            // Send OTP via API
            const response = await fetch(`${API_BASE_URL}/users/send-email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ newEmail })
            });

            const data = await response.json();

            if (response.ok) {
                showOtpModal();
                showMessage('Passkey sent to your new email address', 'success');
            } else {
                throw new Error(data.message || 'Failed to send passkey');
            }

        } catch (error) {
            console.error('Error sending OTP:', error);
            showMessage(error.message || 'Failed to send passkey', 'error');
        } finally {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Send Passkey';
        }
    }

    // Confirm email change with OTP
    async function confirmEmailChange(e) {
        if (e) e.preventDefault();
        
        const otp = otpInput.value.trim();
        const newEmail = emailInput.value.trim();
        
        if (!otp || otp.length !== 6) {
            otpStatus.textContent = 'Please enter a valid 6-digit passkey';
            otpStatus.className = 'otp-status-text error';
            return;
        }

        try {
            confirmOtpBtn.disabled = true;
            confirmOtpBtn.textContent = 'Verifying...';

            // Verify OTP and update email
            const response = await fetch(`${API_BASE_URL}/users/verify-email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ newEmail, otp })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local storage
                const updatedUser = { ...user, email: newEmail };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                hideOtpModal();
                showMessage('Email updated successfully!', 'success');
            } else {
                throw new Error(data.message || 'Invalid passkey');
            }

        } catch (error) {
            console.error('Error verifying OTP:', error);
            otpStatus.textContent = error.message || 'Invalid passkey';
            otpStatus.className = 'otp-status-text error';
        } finally {
            confirmOtpBtn.disabled = false;
            confirmOtpBtn.textContent = 'Confirm & Save Email';
        }
    }

    // Save password
    async function savePassword() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        
        if (!currentPassword) {
            showMessage('Please enter your current password', 'error');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            showMessage('New password must be at least 6 characters long', 'error');
            return;
        }

        try {
            savePasswordBtn.disabled = true;
            savePasswordBtn.textContent = 'Saving...';

            // Update password via API
            const response = await fetch(`${API_BASE_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ 
                    currentPassword, 
                    newPassword 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear password fields
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                
                showMessage('Password updated successfully!', 'success');
            } else {
                throw new Error(data.message || 'Failed to update password');
            }

        } catch (error) {
            console.error('Error updating password:', error);
            showMessage(error.message || 'Failed to update password', 'error');
        } finally {
            savePasswordBtn.disabled = false;
            savePasswordBtn.textContent = 'Save Password';
        }
    }

    // Utility functions
    function showOtpModal() {
        otpOverlay.classList.remove('hidden');
        otpInput.value = '';
        otpStatus.textContent = '';
    }

    function hideOtpModal() {
        otpOverlay.classList.add('hidden');
    }

    function cancelEmailChange() {
        hideOtpModal();
        emailInput.value = user.email; // Reset to original email
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(message, type) {
        // Create or update message element
        let messageEl = document.querySelector('.message-alert');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message-alert';
            document.querySelector('.account-container').insertBefore(messageEl, document.querySelector('form'));
        }

        messageEl.textContent = message;
        messageEl.className = `message-alert ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.remove();
            }
        }, 5000);
    }
});