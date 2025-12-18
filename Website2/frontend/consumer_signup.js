document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('consumer-signup-form');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Client-side validation
        if (data.password !== data.confirm_password) {
            showError('Passwords do not match');
            return;
        }

        if (data.password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        try {
            // Submit to backend
            const response = await fetch('http://localhost:5000/api/auth/register-consumer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Success - store token and redirect
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                alert('Account created successfully! Redirecting to home...');
                window.location.href = 'consumer_home.html';
            } else {
                // Show error from server
                if (result.errors && result.errors.length > 0) {
                    showError(result.errors[0].msg);
                } else {
                    showError(result.message || 'Registration failed');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please check your connection and try again.');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});