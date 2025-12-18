document.addEventListener('DOMContentLoaded', async () => {
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        alert('Product not found');
        window.location.href = 'consumer_home.html';
        return;
    }

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

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentProduct = null;

    // Modal elements
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const overlay = document.getElementById('modal-overlay');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

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
    function getImageUrl(imageUrl, size = '600') {
        if (!imageUrl || imageUrl.trim() === '') {
            // Use a consistent placeholder for missing images
            return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"%3E%3Crect fill="%23E2E3E5" width="${size}" height="${size}"/%3E%3Ctext fill="%236C757D" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E`;
        }
        
        // If it's already a full URL (starts with http), use it directly
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // If it's a relative path (uploaded image), construct full URL
        return `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
    }

    try {
        // Load product details
        const productData = await API.getProduct(productId);
        currentProduct = productData.product;
        
        displayProductDetails(currentProduct);
        setupAddToCartButton(currentProduct);
        setupTabs();
        loadRecommendedProducts();
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Failed to load product details');
        window.location.href = 'consumer_home.html';
    }

    function displayProductDetails(product) {
        // Update page title
        document.title = `${product.name} - EcoMart`;
        
        // Update product image
        const productImage = document.querySelector('.product-image-gallery img');
        if (productImage) {
            const imageUrl = getImageUrl(product.image_url);
            console.log('[PRODUCT DETAIL] Product:', product.name);
            console.log('[PRODUCT DETAIL] Raw image_url:', product.image_url);
            console.log('[PRODUCT DETAIL] Constructed URL:', imageUrl);
            console.log('[PRODUCT DETAIL] API_BASE_URL:', API_BASE_URL);
            productImage.src = imageUrl;
            productImage.alt = product.name;
            productImage.onerror = function() {
                console.error('[PRODUCT DETAIL] Image failed to load:', this.src);
                this.onerror = null;
            };
        }

        // Update product name
        const productName = document.querySelector('.product-details-content h1');
        if (productName) productName.textContent = product.name;

        // Update seller info
        const productBrand = document.querySelector('.product-details-content .product-brand');
        if (productBrand) {
            productBrand.innerHTML = `Sold by: <a href="#seller-info">${product.seller_name}</a>`;
        }

        // Update pricing
        const priceOld = document.querySelector('.price-box .price-old');
        if (priceOld) priceOld.textContent = `₹${product.original_price.toFixed(2)}`;

        const priceNew = document.querySelector('.price-box .price-new');
        if (priceNew) priceNew.textContent = `₹${product.discounted_price.toFixed(2)}`;

        // Update expiry info
        const expiryStatus = getExpiryStatus(product.expiry_date);
        const expiryInfo = document.querySelector('.expiry-info');
        if (expiryInfo) {
            const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
            let expiryText = '';
            
            if (daysUntilExpiry < 0) {
                expiryText = 'Expired';
            } else if (daysUntilExpiry === 0) {
                expiryText = 'Expires today!';
            } else if (daysUntilExpiry === 1) {
                expiryText = 'Expires tomorrow';
            } else {
                expiryText = `${daysUntilExpiry} days`;
            }
            
            expiryInfo.innerHTML = `<strong><i class="fa-solid fa-calendar-times"></i> Expires in:</strong> ${expiryText}`;
        }

        // Update description
        const shortDescription = document.querySelector('.short-description');
        if (shortDescription) {
            shortDescription.textContent = product.description || 'No description available.';
        }

        // Update tab content
        const tabDescription = document.getElementById('tab-description');
        if (tabDescription) {
            const discountPercent = Math.round(((product.original_price - product.discounted_price) / product.original_price) * 100);
            tabDescription.innerHTML = `
                <h3>Product Details</h3>
                <p><strong>Name:</strong> ${product.name}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Original Price:</strong> ₹${product.original_price.toFixed(2)}</p>
                <p><strong>Discounted Price:</strong> ₹${product.discounted_price.toFixed(2)} (${discountPercent}% off)</p>
                <p><strong>Available Stock:</strong> ${product.quantity} units</p>
                <p><strong>Expiry Date:</strong> ${formatDate(product.expiry_date)}</p>
                <h3>Description</h3>
                <p>${product.description || 'No detailed description available.'}</p>
                <p><strong>Note:</strong> This is a near-expiry product. Please consume it before the expiry date and store it properly.</p>
            `;
        }

        const tabSeller = document.getElementById('tab-seller');
        if (tabSeller) {
            tabSeller.innerHTML = `
                <h3>Seller: ${product.seller_name}</h3>
                <p><strong>Seller ID:</strong> ${product.seller_id}</p>
                <p>A trusted seller on EcoMart platform committed to providing quality near-expiry products at great prices.</p>
            `;
        }
    }

    function setupAddToCartButton(product) {
        const addToCartBtn = document.querySelector('.add-to-cart-btn-large');
        
        if (!addToCartBtn) return;

        if (product.quantity === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Out of Stock';
            addToCartBtn.style.backgroundColor = '#999';
            addToCartBtn.style.cursor = 'not-allowed';
            return;
        }

        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
            
            // Visual feedback
            addToCartBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added to Cart!';
            addToCartBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
                addToCartBtn.style.backgroundColor = '';
            }, 2000);
        });
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product._id);
        
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                alert(`Cannot add more items. Only ${product.quantity} available.`);
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product._id,
                name: product.name,
                price: product.discounted_price,
                image: product.image_url,
                quantity: 1,
                seller: product.seller_name
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
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
                        <p class="item-total">$${itemTotal.toFixed(2)}</p>
                        <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                `;
                cartItemsList.appendChild(itemEl);
            });

            cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
        }

        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Global functions for cart management
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
                // Check if we have the product data to validate max quantity
                if (currentProduct && currentProduct._id === productId && newQuantity > currentProduct.quantity) {
                    alert(`Only ${currentProduct.quantity} items available.`);
                    return;
                }
                item.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
        }
    };

    function setupTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Remove active class from all tabs
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab
                link.classList.add('active');
                const tabId = link.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }

    async function loadRecommendedProducts() {
        try {
            const data = await API.getProducts({ 
                limit: 4,
                category: currentProduct.category 
            });
            
            const recommendedGrid = document.querySelector('.recommended-products .product-grid');
            if (!recommendedGrid) return;

            recommendedGrid.innerHTML = '';

            // Filter out current product and limit to 4
            const products = data.products
                .filter(p => p._id !== currentProduct._id)
                .slice(0, 4);

            if (products.length === 0) {
                recommendedGrid.innerHTML = '<p>No similar products available at the moment.</p>';
                return;
            }

            products.forEach(product => {
                const expiryStatus = getExpiryStatus(product.expiry_date);
                const discountPercent = Math.round(((product.original_price - product.discounted_price) / product.original_price) * 100);
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-expiry-tag ${expiryStatus.class}">${expiryStatus.text}</div>
                    <a href="product_detail.html?id=${product._id}" class="product-link">
                        <img src="${getImageUrl(product.image_url, '200')}" alt="${product.name}" loading="lazy">
                        <h3>${product.name}</h3>
                    </a>
                    <p class="product-brand">${product.seller_name}</p>
                    <div class="product-price">
                        <span class="price-old">₹${product.original_price.toFixed(2)}</span>
                        <span class="price-new">₹${product.discounted_price.toFixed(2)}</span>
                        <span class="discount-percent">${discountPercent}% off</span>
                    </div>
                    <p class="product-quantity">Stock: ${product.quantity}</p>
                    <button class="add-to-cart-btn" data-product-id="${product._id}" ${product.quantity === 0 ? 'disabled' : ''}>
                        ${product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                `;
                
                recommendedGrid.appendChild(productCard);
            });

            // Add event listeners to recommended product add-to-cart buttons
            const addToCartButtons = recommendedGrid.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const productId = e.target.getAttribute('data-product-id');
                    
                    try {
                        const productData = await API.getProduct(productId);
                        const product = productData.product;
                        
                        addToCart(product);
                        
                        // Visual feedback
                        const originalText = e.target.textContent;
                        e.target.textContent = 'Added!';
                        e.target.style.backgroundColor = '#28a745';
                        setTimeout(() => {
                            e.target.textContent = originalText;
                            e.target.style.backgroundColor = '';
                        }, 1000);
                    } catch (error) {
                        console.error('Error adding product to cart:', error);
                        alert('Failed to add product to cart');
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading recommended products:', error);
        }
    }

    // Initialize cart display
    updateCartDisplay();
});
