document.addEventListener('DOMContentLoaded', () => {
    
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

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('checkout_cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'consumer_home.html';
        return;
    }

    // DOM elements
    const orderSummaryContainer = document.querySelector('.summary-card');
    const addressDetails = document.querySelector('.address-details');
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    const paymentContents = document.querySelectorAll('.payment-content');
    const placeOrderBtn = document.getElementById('place-order-btn');

    // Initialize page
    displayOrderSummary();
    displayAddressDetails();
    setupPaymentMethodHandlers();
    setupPlaceOrderHandler();

    function displayOrderSummary() {
        if (!orderSummaryContainer) return;

        let subtotal = 0;
        let summaryHTML = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            summaryHTML += `
                <div class="summary-item">
                    <p>${item.name} (x${item.quantity})</p>
                    <p>₹${itemTotal.toFixed(2)}</p>
                </div>
            `;
        });

        const deliveryFee = 1.00;
        const total = subtotal + deliveryFee;

        summaryHTML += `
            <hr>
            <div class="summary-total">
                <p>Subtotal</p>
                <p>₹${subtotal.toFixed(2)}</p>
            </div>
            <div class="summary-total">
                <p>Delivery Fee</p>
                <p>₹${deliveryFee.toFixed(2)}</p>
            </div>
            <hr>
            <div class="summary-total grand-total">
                <p>Total to Pay</p>
                <p>₹${total.toFixed(2)}</p>
            </div>
        `;

        orderSummaryContainer.innerHTML = summaryHTML;
    }

    function displayAddressDetails() {
        if (!addressDetails || !user) return;

        addressDetails.innerHTML = `
            <p><strong>${user.name}</strong></p>
            <p>${user.delivery_address || 'No address provided'}</p>
            <p>${user.mobile_number || 'No phone provided'}</p>
            <a href="#" class="change-address-link" onclick="changeAddress()">Change Address</a>
        `;
    }

    function setupPaymentMethodHandlers() {
        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                // Hide all payment content
                paymentContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Show selected payment content
                const selectedContent = document.getElementById(`${e.target.value}-details`);
                if (selectedContent) {
                    selectedContent.classList.add('active');
                }
            });
        });
    }

    function setupPlaceOrderHandler() {
        if (!placeOrderBtn) return;

        placeOrderBtn.addEventListener('click', async () => {
            try {
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Processing...';

                const orderData = prepareOrderData();
                
                if (!validateOrderData(orderData)) {
                    return;
                }

                const response = await API.createOrder(orderData);
                
                if (response) {
                    // Clear cart
                    localStorage.removeItem('cart');
                    localStorage.removeItem('checkout_cart');
                    
                    // Show success message with better styling
                    showOrderSuccess(response.order);
                } else {
                    throw new Error('Order creation failed');
                }
            } catch (error) {
                console.error('Order placement error:', error);
                alert('Failed to place order. Please try again.');
            } finally {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
        });
    }

    function prepareOrderData() {
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        
        // Convert cart items to order format
        const orderItems = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }));

        return {
            items: orderItems,
            payment_method: selectedPaymentMethod ? selectedPaymentMethod.value : 'cod',
            delivery_address: user.delivery_address,
            notes: ''
        };
    }

    function validateOrderData(orderData) {
        if (!orderData.items || orderData.items.length === 0) {
            alert('No items in cart');
            return false;
        }

        if (!orderData.payment_method) {
            alert('Please select a payment method');
            return false;
        }

        if (!orderData.delivery_address) {
            alert('Please provide a delivery address');
            return false;
        }

        // Validate payment method specific fields
        if (orderData.payment_method === 'card') {
            const cardNumber = document.querySelector('#card-details input[placeholder="Card Number"]');
            const cardType = document.querySelector('#card-details select');
            const expiry = document.querySelector('#card-details input[placeholder="MM / YY"]');
            const cvv = document.querySelector('#card-details input[placeholder="CVV"]');

            if (!cardNumber?.value || !cardType?.value || !expiry?.value || !cvv?.value) {
                alert('Please fill in all card details');
                return false;
            }
        }

        if (orderData.payment_method === 'upi') {
            const upiId = document.querySelector('#upi-details input');
            if (!upiId?.value) {
                alert('Please enter your UPI ID');
                return false;
            }
        }

        return true;
    }

    // Show order success message
    function showOrderSuccess(order) {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const successCard = document.createElement('div');
        successCard.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        successCard.innerHTML = `
            <div style="color: #28a745; font-size: 60px; margin-bottom: 20px;">✓</div>
            <h2 style="color: #28a745; margin-bottom: 15px;">Order Placed Successfully!</h2>
            <p style="margin-bottom: 10px;"><strong>Order ID:</strong> ${order.order_id || 'N/A'}</p>
            <p style="margin-bottom: 20px; color: #666;">Your order will be delivered to your address soon.</p>
            <button onclick="closeSuccessAndRedirect()" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">Continue Shopping</button>
        `;

        overlay.appendChild(successCard);
        document.body.appendChild(overlay);

        // Auto redirect after 5 seconds
        setTimeout(() => {
            closeSuccessAndRedirect();
        }, 5000);
    }

    // Global function to close success message and redirect
    window.closeSuccessAndRedirect = () => {
        const overlay = document.querySelector('div[style*="position: fixed"]');
        if (overlay) {
            overlay.remove();
        }
        window.location.href = 'consumer_home.html';
    };

    // Enhanced address change function
    window.changeAddress = async () => {
        // Create address change modal
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const addressModal = document.createElement('div');
        addressModal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        addressModal.innerHTML = `
            <h3 style="margin-bottom: 20px;">Update Delivery Address</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Full Name:</label>
                <input type="text" id="new-name" value="${user.name || ''}" style="
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Delivery Address:</label>
                <textarea id="new-address" rows="3" style="
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                    resize: vertical;
                ">${user.delivery_address || ''}</textarea>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Phone Number:</label>
                <input type="tel" id="new-phone" value="${user.mobile_number || ''}" style="
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
            </div>
            <div style="text-align: right;">
                <button onclick="closeAddressModal()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Cancel</button>
                <button onclick="saveAddress()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Save Address</button>
            </div>
        `;

        overlay.appendChild(addressModal);
        document.body.appendChild(overlay);
    };

    // Global functions for address modal
    window.closeAddressModal = () => {
        const overlay = document.querySelector('div[style*="position: fixed"]');
        if (overlay) {
            overlay.remove();
        }
    };

    window.saveAddress = async () => {
        const newName = document.getElementById('new-name').value.trim();
        const newAddress = document.getElementById('new-address').value.trim();
        const newPhone = document.getElementById('new-phone').value.trim();

        if (!newName || !newAddress || !newPhone) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Update user object
            user.name = newName;
            user.delivery_address = newAddress;
            user.mobile_number = newPhone;
            
            // Save to localStorage (in real app, this would update the backend)
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update the backend address
            await API.updateAddress(newAddress);
            
            // Refresh the display
            displayAddressDetails();
            
            // Close modal
            closeAddressModal();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 1001;
            `;
            successMsg.textContent = 'Address updated successfully!';
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
            
        } catch (error) {
            console.error('Address update error:', error);
            alert('Failed to update address. Please try again.');
        }
    };
});