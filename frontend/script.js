document.addEventListener('DOMContentLoaded', () => {
    
    // Get the elements
    const buyerButton = document.getElementById('btn-buyer');
    const sellerButton = document.getElementById('btn-seller');
    const userRoleInput = document.getElementById('user-role');
    const signupLink = document.getElementById('signup-link');
    const loginForm = document.getElementById('login-form');

    // --- NEW: Get image elements ---
    const buyerImage = document.getElementById('buyer-image');
    const sellerImage = document.getElementById('seller-image');

    // Define signup URLs
    const buyerSignupURL = 'consumer_signup.html';
    const sellerSignupURL = 'seller_signup.html';

    // Function to set the role based on a value
    function setRole(role) {
        if (role === 'seller') {
            // Set Seller as active
            sellerButton.classList.add('active');
            buyerButton.classList.remove('active');
            userRoleInput.value = 'seller';
            signupLink.href = sellerSignupURL;
            signupLink.text = 'Sign Up'; // Matches Figma design

            // --- NEW: Toggle images ---
            if (buyerImage && sellerImage) { // Check if elements exist
                buyerImage.style.display = 'none';
                sellerImage.style.display = 'block';
            }

        } else {
            // Default to Buyer
            buyerButton.classList.add('active');
            sellerButton.classList.remove('active');
            userRoleInput.value = 'buyer';
            signupLink.href = buyerSignupURL;
            signupLink.text = 'Sign Up'; // Matches Figma design

            // --- NEW: Toggle images ---
            if (buyerImage && sellerImage) { // Check if elements exist
                buyerImage.style.display = 'block';
                sellerImage.style.display = 'none';
            }
        }
    }

    // Check URL parameters when page loads
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    
    // Set the initial role based on the URL
    setRole(urlRole);

    // Event listener for the Buyer button (if user clicks to change)
    buyerButton.addEventListener('click', () => {
        setRole('buyer');
    });

    // Event listener for the Seller button (if user clicks to change)
    sellerButton.addEventListener('click', () => {
        setRole('seller');
    });

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
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
                    
                    // Redirect based on role
                    if (result.user.role === 'seller') {
                        window.location.href = 'seller_dashboard.html';
                    } else {
                        window.location.href = 'consumer_home.html';
                    }
                } else {
                    // Show error
                    alert(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Network error. Please check your connection and try again.');
            }
        });
    }
});