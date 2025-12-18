document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Consumer home debug script loaded');
    
    // Check authentication
    if (!isLoggedIn()) {
        console.log('❌ User not logged in, redirecting...');
        window.location.href = 'index.html';
        return;
    }

    const user = getUser();
    console.log('👤 User:', user);
    
    if (!user || user.role !== 'buyer') {
        console.log('❌ User is not a buyer, logging out...');
        logout();
        return;
    }

    console.log('✅ User authenticated as buyer');

    // Simple product loading
    async function loadProducts() {
        console.log('📦 Starting to load products...');
        
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) {
            console.error('❌ Product grid not found!');
            return;
        }

        try {
            // Show loading
            productGrid.innerHTML = '<div class="loading">Loading products...</div>';
            console.log('⏳ Loading state set');

            // Test API connection
            console.log('🌐 API Base URL:', API_BASE_URL);
            
            // Make API call
            console.log('📡 Making API call to get products...');
            const data = await API.getProducts({ limit: 20 });
            console.log('📊 API Response:', data);

            if (!data || !data.products) {
                throw new Error('Invalid API response format');
            }

            const products = data.products;
            console.log(`✅ Loaded ${products.length} products`);

            if (products.length === 0) {
                productGrid.innerHTML = '<div class="no-products">No products available at the moment.</div>';
                return;
            }

            // Clear loading
            productGrid.innerHTML = '';

            // Create product cards
            products.forEach((product, index) => {
                console.log(`🏷️ Processing product ${index + 1}:`, product.name);
                
                try {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    
                    // Simple product card without complex features
                    productCard.innerHTML = `
                        <div class="product-expiry-tag">Expires: ${new Date(product.expiry_date).toLocaleDateString()}</div>
                        <img src="${product.image_url || 'https://via.placeholder.com/200/E2E3E5/6C757D?text=Product'}" alt="${product.name}" style="width: 100%; height: 180px; object-fit: cover;">
                        <h3>${product.name}</h3>
                        <p class="product-brand">by ${product.seller_name}</p>
                        <div class="product-price">
                            <span class="price-old">$${product.original_price.toFixed(2)}</span>
                            <span class="price-new">$${product.discounted_price.toFixed(2)}</span>
                        </div>
                        <p class="product-quantity">Stock: ${product.quantity}</p>
                        <button class="add-to-cart-btn" onclick="alert('Product: ${product.name}')">
                            Add to Cart
                        </button>
                    `;
                    
                    productGrid.appendChild(productCard);
                    console.log(`✅ Added product card for: ${product.name}`);
                    
                } catch (error) {
                    console.error(`❌ Error creating card for product ${product.name}:`, error);
                }
            });

            console.log('🎉 All products loaded successfully!');

        } catch (error) {
            console.error('❌ Error loading products:', error);
            productGrid.innerHTML = `
                <div class="error-message">
                    <h3>Failed to load products</h3>
                    <p>Error: ${error.message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    // Load products immediately
    console.log('🎯 Calling loadProducts...');
    await loadProducts();
    
    console.log('✅ Consumer home debug script completed');
});