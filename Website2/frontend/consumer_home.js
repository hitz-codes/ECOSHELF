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

    // Update user info in navbar
    updateUserInfo();

    // --- Modal/Drawer Elements ---
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const overlay = document.getElementById('modal-overlay');
    const profileBtn = document.querySelector('.nav-icon-btn');
    const profileModal = document.getElementById('profile-modal');
    const profileCloseBtn = document.getElementById('profile-close-btn');

    // --- Cart Logic Elements ---
    const cartItemsList = document.getElementById('cart-items-list');
    const cartEmptyMsg = document.querySelector('.cart-empty-msg');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // In-memory cart (will be enhanced later with localStorage)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Modal Functions ---
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('open');
        if (overlay) overlay.classList.remove('hidden');
    };

    const closeModal = () => {
        if (cartModal) cartModal.classList.remove('open');
        if (profileModal) profileModal.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
    };

    // Modal event listeners
    if (cartBtn) cartBtn.addEventListener('click', () => openModal(cartModal));
    if (profileBtn) profileBtn.addEventListener('click', () => openModal(profileModal));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeModal);
    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // --- User Info Functions ---
    function updateUserInfo() {
        // Update profile modal
        const profileContent = document.querySelector('#profile-modal .modal-content');
        if (profileContent && user) {
            profileContent.innerHTML = `
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <button class="logout-btn" onclick="handleLogout()">Logout</button>
            `;
        }
    }

    // --- Logout Function ---
    window.handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    // --- Cart Functions ---
    function addToCart(product) {
        console.log('addToCart function called with:', product);
        console.log('Current cart before adding:', cart);
        
        const existingItem = cart.find(item => item.id === product._id);
        
        if (existingItem) {
            console.log('Product already in cart, increasing quantity');
            existingItem.quantity += 1;
        } else {
            console.log('Adding new product to cart');
            cart.push({
                id: product._id,
                name: product.name,
                price: product.discounted_price,
                image: product.image_url,
                quantity: 1,
                seller: product.seller_name
            });
        }
        
        console.log('Cart after adding:', cart);
        updateCart();
        saveCart();
        console.log('Cart saved to localStorage');
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        saveCart();
    }

    function updateQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                updateCart();
                saveCart();
            }
        }
    }

    function updateCart() {
        if (!cartItemsList) return;

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
                        <img src="${getImageUrl(item.image)}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
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

            if (cartTotalSpan) cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
        }

        if (cartCountSpan) cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Make functions global for onclick handlers
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;

    // --- Checkout Function ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Save cart for checkout page
            localStorage.setItem('checkout_cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
    }

    // Store products globally for cart functionality
    let currentProducts = [];

    // Helper function to get correct image URL
    function getImageUrl(imageUrl) {
        if (!imageUrl || imageUrl.trim() === '') {
            // Use a consistent placeholder for missing images
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23E2E3E5" width="200" height="200"/%3E%3Ctext fill="%236C757D" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        }
        
        // If it's already a full URL (starts with http), use it directly
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // If it's a relative path (uploaded image), construct full URL
        return `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
    }

    // --- Load Products from Backend ---
    async function loadProducts() {
        try {
            showLoading(true);
            const data = await API.getProducts({ limit: 20 });
            displayProducts(data.products);
        } catch (error) {
            console.error('Error loading products:', error);
            showError('Failed to load products. Please refresh the page.');
        } finally {
            showLoading(false);
        }
    }

    function displayProducts(products) {
        // Store products for cart functionality
        currentProducts = products;
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;

        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products available at the moment.</p>';
            return;
        }

        products.forEach(product => {
            const expiryStatus = getExpiryStatus(product.expiry_date);
            const discountPercent = Math.round(((product.original_price - product.discounted_price) / product.original_price) * 100);
            
            // Debug image URL construction (only for uploaded images)
            if (product.image_url && !product.image_url.startsWith('http')) {
                const finalImageUrl = getImageUrl(product.image_url);
                console.log(`[UPLOADED IMAGE] ${product.name}:`);
                console.log(`  Raw: ${product.image_url}`);
                console.log(`  Final: ${finalImageUrl}`);
            }
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-expiry-tag ${expiryStatus.class}">${expiryStatus.text}</div>
                <a href="product_detail.html?id=${product._id}" class="product-link">
                    <img src="${getImageUrl(product.image_url)}" alt="${product.name}" loading="lazy" onerror="console.error('Image load failed for ${product.name}:', this.src); this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23E2E3E5%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%236C757D%22 font-family=%22Arial%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${product.name}%3C/text%3E%3C/svg%3E';">
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
            
            productGrid.appendChild(productCard);
        });

        // Add event listeners to add-to-cart buttons
        const addToCartButtons = productGrid.querySelectorAll('.add-to-cart-btn');
        console.log('Found add-to-cart buttons:', addToCartButtons.length);
        console.log('Current products available:', currentProducts.length);
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('Add to cart button clicked!');
                const productId = e.target.getAttribute('data-product-id');
                console.log('Product ID:', productId);
                console.log('Available products:', currentProducts.map(p => p._id));
                
                const product = currentProducts.find(p => p._id === productId);
                console.log('Found product:', product);
                
                if (product) {
                    console.log('Adding product to cart:', product.name);
                    addToCart(product);
                    // Visual feedback
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Added!';
                    e.target.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        e.target.textContent = originalText;
                        e.target.style.backgroundColor = '';
                    }, 1000);
                } else {
                    console.error('Product not found for ID:', productId);
                }
            });
        });
    }

    // --- Search Functionality ---
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                loadProducts(); // Load all products
                return;
            }
            
            if (query.length < 2) return; // Wait for at least 2 characters
            
            searchTimeout = setTimeout(async () => {
                try {
                    showLoading(true);
                    const data = await API.searchProducts(query);
                    displayProducts(data.products);
                } catch (error) {
                    console.error('Search error:', error);
                    showError('Search failed. Please try again.');
                } finally {
                    showLoading(false);
                }
            }, 500); // Debounce search
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    searchInput.blur(); // Trigger search
                }
            }
        });
    }

    // --- Enhanced Filter Functionality ---
    const categoryFilter = document.getElementById('category-filter');
    const priceRangeFilter = document.getElementById('price-range');
    const timePeriodFilter = document.getElementById('time-period');
    const sortFilter = document.getElementById('sort-by');
    const availabilityFilter = document.getElementById('availability');

    async function applyFilters() {
        try {
            showLoading(true);
            const params = {};
            
            if (categoryFilter && categoryFilter.value) {
                params.category = categoryFilter.value;
            }
            
            if (priceRangeFilter && priceRangeFilter.value) {
                params.price_range = priceRangeFilter.value;
            }
            
            if (timePeriodFilter && timePeriodFilter.value) {
                params.time_period = timePeriodFilter.value;
            }
            
            if (sortFilter && sortFilter.value) {
                params.sort = sortFilter.value;
            }
            
            if (availabilityFilter && availabilityFilter.value) {
                params.availability = availabilityFilter.value;
            }
            
            console.log('Applying filters:', params);
            const data = await API.getProducts(params);
            displayProducts(data.products);
        } catch (error) {
            console.error('Filter error:', error);
            showError('Failed to apply filters.');
        } finally {
            showLoading(false);
        }
    }

    // Add event listeners to all filters
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceRangeFilter) priceRangeFilter.addEventListener('change', applyFilters);
    if (timePeriodFilter) timePeriodFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    if (availabilityFilter) availabilityFilter.addEventListener('change', applyFilters);

    // --- Utility Functions ---
    function showLoading(show) {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;

        if (show) {
            productGrid.innerHTML = '<div class="loading">Loading products...</div>';
        }
    }

    function showError(message) {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;

        productGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // --- Carousel Logic (keeping existing) ---
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track ? track.children : []);
    const nextButton = document.querySelector('.carousel-nav.next');
    const prevButton = document.querySelector('.carousel-nav.prev');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (track && slides.length > 0) {
        let currentSlide = 0;

        // Create dots
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });
        const dots = Array.from(dotsContainer ? dotsContainer.children : []);

        const moveToSlide = (targetIndex) => {
            if (targetIndex < 0) {
                targetIndex = slides.length - 1;
            } else if (targetIndex >= slides.length) {
                targetIndex = 0;
            }
            
            track.style.transform = `translateX(-${100 * targetIndex}%)`;
            
            dots.forEach(dot => dot.classList.remove('active'));
            dots[targetIndex].classList.add('active');
            
            currentSlide = targetIndex;
        };

        if (nextButton) nextButton.addEventListener('click', () => moveToSlide(currentSlide + 1));
        if (prevButton) prevButton.addEventListener('click', () => moveToSlide(currentSlide - 1));

        if (dotsContainer) {
            dotsContainer.addEventListener('click', e => {
                if (!e.target.matches('.carousel-dot')) return;
                const targetIndex = parseInt(e.target.dataset.index);
                moveToSlide(targetIndex);
            });
        }
        
        // Auto-play
        setInterval(() => {
            moveToSlide(currentSlide + 1);
        }, 5000);

        // Add category filtering functionality to carousel slides
        slides.forEach(slide => {
            if (slide.classList.contains('category-slide')) {
                slide.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = slide.getAttribute('data-category');
                    console.log('Category slide clicked:', category);
                    
                    // Update the category filter dropdown
                    if (categoryFilter) {
                        categoryFilter.value = category;
                    }
                    
                    // Apply the filter
                    filterByCategory(category);
                    
                    // Scroll to products section
                    const productsSection = document.querySelector('.product-showcase');
                    if (productsSection) {
                        productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
                
                // Add hover effect
                slide.style.cursor = 'pointer';
            }
        });
    }

    // Category filtering function
    async function filterByCategory(category) {
        try {
            showLoading(true);
            const params = { category: category };
            
            console.log('Filtering by category:', category || 'All');
            const data = await API.getProducts(params);
            displayProducts(data.products);
            
            // Update page title based on category
            const categoryNames = {
                'Normal': 'Food & Grocery',
                'Seasonal': 'Seasonal Items', 
                'Derived': 'By-products & Materials',
                '': 'All Products'
            };
            
            const showcaseTitle = document.querySelector('.product-showcase h2');
            if (showcaseTitle) {
                showcaseTitle.textContent = categoryNames[category] || 'Available Products';
            }
            
        } catch (error) {
            console.error('Category filter error:', error);
            showError('Failed to load category products.');
        } finally {
            showLoading(false);
        }
    }

    // --- Initialize ---
    updateCart(); // Load cart from localStorage
    loadProducts(); // Load products from backend
});