document.addEventListener('DOMContentLoaded', async () => {
    
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const user = getUser();
    if (!user || user.role !== 'buyer') {
        logout();
        return;
    }

    // DOM elements
    const toggleBtn = document.getElementById('add-address-toggle-btn');
    const cancelBtn = document.getElementById('cancel-add-address-btn');
    const formContainer = document.getElementById('add-address-form-container');
    const addressForm = document.getElementById('add-address-form');
    const addressGrid = document.getElementById('address-grid');

    // Cart functionality (for navbar)
    const cartBtn = document.getElementById('cart-btn');
    const cartCountSpan = document.getElementById('cart-count');
    
    // Update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountSpan) cartCountSpan.textContent = cartCount;
    }

    // Initialize cart count
    updateCartCount();

    // Show the form
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (formContainer) {
                formContainer.classList.remove('hidden');
            }
            toggleBtn.classList.add('hidden');
        });
    }

    // Hide the form
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideAddressForm();
        });
    }

    function hideAddressForm() {
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
        if (toggleBtn) {
            toggleBtn.classList.remove('hidden');
        }
        // Reset form
        if (addressForm) {
            addressForm.reset();
        }
    }

    // Handle form submission
    if (addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addressForm);
            const addressData = {
                name: document.getElementById('address-name').value.trim(),
                mobile: document.getElementById('address-mobile').value.trim(),
                address_line: document.getElementById('address-full').value.trim(),
                city: document.getElementById('address-city').value.trim(),
                pincode: document.getElementById('address-pincode').value.trim()
            };

            // Combine into full address string
            const fullAddress = `${addressData.name}, ${addressData.address_line}, ${addressData.city}, ${addressData.pincode}. Mobile: ${addressData.mobile}`;

            try {
                showLoading(true);
                
                const response = await API.updateAddress(fullAddress);
                
                if (response.message) {
                    showSuccess('Address updated successfully!');
                    hideAddressForm();
                    loadAddresses(); // Reload addresses
                } else {
                    throw new Error('Failed to update address');
                }
                
            } catch (error) {
                console.error('Address update error:', error);
                showError(`Failed to update address: ${error.message}`);
            } finally {
                showLoading(false);
            }
        });
    }

    // Load addresses from backend
    async function loadAddresses() {
        try {
            showLoading(true);
            
            const data = await API.getAddresses();
            displayAddresses(data.addresses || []);
            
        } catch (error) {
            console.error('Error loading addresses:', error);
            showError('Failed to load addresses');
        } finally {
            showLoading(false);
        }
    }

    function displayAddresses(addresses) {
        if (!addressGrid) return;

        if (addresses.length === 0) {
            addressGrid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fa-solid fa-map-marker-alt" style="font-size: 48px; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>No Addresses Added</h3>
                    <p>Add your first delivery address to get started with orders.</p>
                </div>
            `;
            return;
        }

        addressGrid.innerHTML = addresses.map(address => {
            // Parse the address if it's a combined string
            let displayName = user.name;
            let displayAddress = address.address;
            let displayMobile = user.mobile_number;

            // Try to extract name and mobile from address string if formatted
            if (address.address && address.address.includes('Mobile:')) {
                const parts = address.address.split('Mobile:');
                if (parts.length === 2) {
                    displayAddress = parts[0].trim().replace(/,$/, '');
                    displayMobile = parts[1].trim();
                    
                    // Extract name if it's at the beginning
                    const addressParts = displayAddress.split(',');
                    if (addressParts.length > 1) {
                        displayName = addressParts[0].trim();
                        displayAddress = addressParts.slice(1).join(',').trim();
                    }
                }
            }

            return `
                <div class="address-card">
                    <h3>${displayName}</h3>
                    <p>${displayAddress}</p>
                    <p>Mobile: ${displayMobile}</p>
                    <div class="address-actions">
                        <button class="address-link" onclick="editAddress('${address.id}')">Edit</button>
                    </div>
                    ${address.is_default ? '<div class="default-badge">Default</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Global function for editing address
    window.editAddress = (addressId) => {
        // For now, just show the form to update the default address
        if (formContainer) {
            formContainer.classList.remove('hidden');
        }
        if (toggleBtn) {
            toggleBtn.classList.add('hidden');
        }
        
        // Pre-fill form with current user data if available
        if (user) {
            const nameField = document.getElementById('address-name');
            const mobileField = document.getElementById('address-mobile');
            
            if (nameField) nameField.value = user.name || '';
            if (mobileField) mobileField.value = user.mobile_number || '';
        }
    };

    function showLoading(show) {
        if (!addressGrid) return;

        if (show) {
            addressGrid.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #007bff;"></i>
                    <p style="margin-top: 10px;">Loading addresses...</p>
                </div>
            `;
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Initialize
    loadAddresses();
});