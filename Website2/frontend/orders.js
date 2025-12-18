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
    const orderCardList = document.querySelector('.order-card-list');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const overlay = document.getElementById('modal-overlay');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Cart functionality (reused from consumer_home.js)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Modal functions
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('open');
        if (overlay) overlay.classList.remove('hidden');
    };

    const closeModal = () => {
        if (cartModal) cartModal.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    };

    // Modal event listeners
    if (cartBtn) cartBtn.addEventListener('click', () => openModal(cartModal));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Checkout functionality
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            localStorage.setItem('checkout_cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
    }

    // Helper function to get correct image URL
    function getImageUrl(imageUrl, size = '100') {
        if (!imageUrl || imageUrl.trim() === '') {
            // Use a consistent placeholder for missing images
            return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"%3E%3Crect fill="%23E2E3E5" width="${size}" height="${size}"/%3E%3Ctext fill="%236C757D" font-family="Arial" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E`;
        }
        
        // If it's already a full URL (starts with http), use it directly
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // If it's a relative path (uploaded image), construct full URL
        return `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
    }

    // Initialize
    updateCartDisplay();
    loadOrders();

    // Load orders from backend
    async function loadOrders() {
        try {
            showLoading(true);
            console.log('Loading orders for user:', user);
            console.log('API Base URL:', API_BASE_URL);
            console.log('Auth token present:', !!getAuthToken());
            
            const data = await API.getMyOrders({ limit: 20 });
            console.log('Orders API response:', data);
            
            displayOrders(data.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                user: user,
                token: getAuthToken() ? 'present' : 'missing',
                apiUrl: API_BASE_URL
            });
            showError(`Failed to load orders: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }

    function displayOrders(orders) {
        if (!orderCardList) return;

        if (orders.length === 0) {
            orderCardList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fa-solid fa-shopping-bag" style="font-size: 48px; margin-bottom: 20px; color: #ddd;"></i>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <a href="consumer_home.html" style="
                        display: inline-block;
                        background: #007bff;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 15px;
                    ">Start Shopping</a>
                </div>
            `;
            return;
        }

        orderCardList.innerHTML = orders.map(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            const statusInfo = getOrderStatusInfo(order.order_status || order.status);
            const deliveryInfo = getDeliveryInfo(order);

            return `
                <div class="order-card">
                    <div class="order-card-header">
                        <span class="order-info">ORDER PLACED: ${orderDate}</span>
                        <span class="order-info">TOTAL: ₹${order.total_amount.toFixed(2)}</span>
                        <span class="order-info">ORDER #: ${order.order_id}</span>
                    </div>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${getImageUrl(item.product_id?.image_url)}" 
                                 alt="${item.product_id?.name || item.product_name || 'Product'}" 
                                 class="order-item-img">
                            <div class="order-item-details">
                                <h3>${item.product_id?.name || item.product_name || 'Product'} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</h3>
                                <p class="order-status ${statusInfo.class}">
                                    <i class="${statusInfo.icon}"></i> ${statusInfo.text}
                                </p>
                                <p class="order-delivery-est">${deliveryInfo}</p>
                            </div>
                            ${getOrderActionButton(order)}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }

    function getOrderStatusInfo(status) {
        if (!status) {
            return {
                text: 'Unknown Status',
                class: 'status-unknown',
                icon: 'fa-solid fa-question-circle'
            };
        }
        
        switch (status.toLowerCase()) {
            case 'placed':
            case 'pending':
                return {
                    text: 'Order Confirmed',
                    class: 'status-confirmed',
                    icon: 'fa-solid fa-check-circle'
                };
            case 'confirmed':
            case 'preparing':
            case 'processing':
                return {
                    text: 'Processing',
                    class: 'status-processing',
                    icon: 'fa-solid fa-cog'
                };
            case 'shipped':
                return {
                    text: 'In Transit',
                    class: 'status-transit',
                    icon: 'fa-solid fa-truck-fast'
                };
            case 'delivered':
                return {
                    text: 'Delivered',
                    class: 'status-delivered',
                    icon: 'fa-solid fa-check-circle'
                };
            case 'cancelled':
                return {
                    text: 'Cancelled',
                    class: 'status-cancelled',
                    icon: 'fa-solid fa-times-circle'
                };
            default:
                return {
                    text: 'Unknown Status',
                    class: 'status-unknown',
                    icon: 'fa-solid fa-question-circle'
                };
        }
    }

    function getDeliveryInfo(order) {
        const status = (order.order_status || order.status || 'unknown').toLowerCase();
        const orderDate = new Date(order.createdAt);
        
        switch (status) {
            case 'placed':
            case 'pending':
                return 'Order is being prepared';
            case 'confirmed':
            case 'preparing':
            case 'processing':
                return 'Your order is being processed';
            case 'shipped':
                const estimatedDelivery = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
                return `Arriving ${estimatedDelivery.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                })}`;
            case 'delivered':
                const deliveredDate = order.delivered_at ? 
                    new Date(order.delivered_at).toLocaleDateString('en-US', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                    }) : 
                    'Recently';
                return `Delivered on ${deliveredDate}`;
            case 'cancelled':
                return 'This order has been cancelled';
            default:
                return 'Status unknown';
        }
    }

    function getOrderActionButton(order) {
        const status = (order.order_status || order.status || 'unknown').toLowerCase();
        
        switch (status) {
            case 'placed':
            case 'pending':
            case 'confirmed':
            case 'preparing':
            case 'processing':
                return `<button class="form-button-outline track-button" onclick="cancelOrder('${order.order_id}')">Cancel Order</button>`;
            case 'shipped':
                return `<button class="form-button track-button" onclick="trackOrder('${order.order_id}')">Track Package</button>`;
            case 'delivered':
                return `<button class="form-button-outline track-button" onclick="reorderItems('${order.order_id}')">Buy Again</button>`;
            case 'cancelled':
                return `<button class="form-button-outline track-button" onclick="reorderItems('${order.order_id}')">Order Again</button>`;
            default:
                return '';
        }
    }

    function updateCartDisplay() {
        if (!cartItemsList || !cartCountSpan || !cartTotalSpan) return;

        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
        } else {
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${getImageUrl(item.image, '60')}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                    </div>
                    <div class="cart-item-details">
                        <p class="item-name">${item.name}</p>
                        <p class="item-seller">by ${item.seller}</p>
                        <p class="item-price">₹${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <p class="item-total">₹${itemTotal.toFixed(2)}</p>
                        <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                `;
                cartItemsList.appendChild(itemEl);
            });

            cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
        }

        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function showLoading(show) {
        if (!orderCardList) return;

        if (show) {
            orderCardList.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #007bff;"></i>
                    <p style="margin-top: 10px;">Loading your orders...</p>
                </div>
            `;
        }
    }

    function showError(message) {
        if (!orderCardList) return;

        orderCardList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Error Loading Orders</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                ">Try Again</button>
            </div>
        `;
    }

    // Global functions for order actions
    window.cancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        // Find the button that was clicked and show loading state
        const button = event.target;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Cancelling...';

        try {
            console.log('Cancelling order:', orderId);
            const response = await API.cancelOrder(orderId);
            console.log('Cancel response:', response);
            
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
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;
            successMsg.textContent = 'Order cancelled successfully!';
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
            
            loadOrders(); // Reload orders
        } catch (error) {
            console.error('Cancel order error:', error);
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
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
            errorMsg.textContent = `Failed to cancel order: ${error.message}`;
            document.body.appendChild(errorMsg);
            
            setTimeout(() => {
                errorMsg.remove();
            }, 5000);
            
            // Reset button
            button.disabled = false;
            button.textContent = originalText;
        }
    };

    window.trackOrder = (orderId) => {
        alert(`Tracking information for order ${orderId} will be available soon.`);
    };

    window.reorderItems = async (orderId) => {
        try {
            const orderData = await API.getOrder(orderId);
            
            if (orderData && orderData.order && orderData.order.items) {
                // Add items to cart
                orderData.order.items.forEach(item => {
                    if (item.product_id) {
                        const cartItem = {
                            id: item.product_id._id,
                            name: item.product_id.name,
                            price: item.product_id.discounted_price,
                            image: item.product_id.image_url,
                            quantity: item.quantity,
                            seller: item.product_id.seller_name
                        };
                        
                        const existingItem = cart.find(cartItem => cartItem.id === item.product_id._id);
                        if (existingItem) {
                            existingItem.quantity += item.quantity;
                        } else {
                            cart.push(cartItem);
                        }
                    }
                });
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                alert('Items added to cart successfully!');
            }
        } catch (error) {
            console.error('Reorder error:', error);
            alert('Failed to add items to cart. Please try again.');
        }
    };

    // Cart management functions (for cart modal)
    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    };

    window.updateQuantity = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
        }
    };
});