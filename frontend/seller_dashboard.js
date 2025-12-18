document.addEventListener('DOMContentLoaded', async () => {

    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const user = getUser();
    if (!user || user.role !== 'seller') {
        logout();
        return;
    }

    // --- Navigation ---
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    // Handle sidebar navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            
            if (link.classList.contains('active')) return;

            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load data when switching to sections
                if (targetId === 'my-products') {
                    loadMyProducts();
                } else if (targetId === 'dashboard') {
                    loadDashboardStats();
                }
            }
        });
    });

    // --- Load Dashboard Stats ---
    async function loadDashboardStats() {
        try {
            const data = await API.getSellerDashboard();
            const stats = data.stats;

            // Update stat cards
            document.querySelector('.stat-card:nth-child(1) p').textContent = stats.total_listings;
            document.querySelector('.stat-card:nth-child(2) p').textContent = stats.items_sold_24h;
            document.querySelector('.stat-card:nth-child(3) p').textContent = formatPrice(stats.total_revenue);
            document.querySelector('.stat-card:nth-child(4) p').textContent = stats.nearing_expiry;
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // --- Load My Products ---
    async function loadMyProducts() {
        try {
            const data = await API.getMyProducts();
            const productListBody = document.getElementById('product-list');
            
            productListBody.innerHTML = '';

            data.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${formatPrice(product.discounted_price)}</td>
                    <td>${product.quantity}</td>
                    <td>${formatDate(product.expiry_date)}</td>
                    <td>
                        <button class="btn-edit" data-id="${product._id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" data-id="${product._id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                productListBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Error loading products. Please try again.');
        }
    }

    // --- Add Product Form Logic ---
    const addProductForm = document.getElementById('add-product-form');
    const formError = document.getElementById('form-error');

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.style.display = 'none';

        // Show loading state
        const submitBtn = addProductForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding Product...';

        try {
            // Create FormData object
            const formData = new FormData();
            
            // Get form values
            const name = document.getElementById('product-name').value.trim();
            const category = document.getElementById('product-category').value;
            const originalPrice = parseFloat(document.getElementById('original-price').value);
            const discountedPrice = parseFloat(document.getElementById('discount-price').value);
            const quantity = parseInt(document.getElementById('product-quantity').value);
            const expiryDate = document.getElementById('expiry-date').value;
            const description = document.getElementById('product-description').value.trim();
            const imageFile = document.getElementById('product-image').files[0];

            // Client-side validation
            if (!name || !category || !originalPrice || !discountedPrice || !quantity || !expiryDate) {
                throw new Error('Please fill in all required fields.');
            }

            if (discountedPrice >= originalPrice) {
                throw new Error('Discounted price must be less than original price.');
            }

            const expiryDateObj = new Date(expiryDate);
            if (expiryDateObj <= new Date()) {
                throw new Error('Expiry date must be in the future.');
            }

            // Validate image file if provided
            if (imageFile) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (imageFile.size > maxSize) {
                    throw new Error('Image file must be smaller than 5MB.');
                }
                
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(imageFile.type)) {
                    throw new Error('Please select a valid image file (JPG, PNG, GIF, WebP).');
                }
            }

            // Append data to FormData
            formData.append('name', name);
            formData.append('category', category);
            formData.append('original_price', originalPrice);
            formData.append('discounted_price', discountedPrice);
            formData.append('quantity', quantity);
            formData.append('expiry_date', expiryDate);
            formData.append('description', description);
            
            if (imageFile) {
                formData.append('product_image', imageFile);
            }

            // Send to backend
            const response = await API.addProduct(formData);
            const result = await response.json();

            if (response.ok) {
                alert('Product added successfully!');
                addProductForm.reset();
                
                // Switch to My Products tab and reload
                document.getElementById('nav-products').click();
            } else {
                if (result.errors && result.errors.length > 0) {
                    throw new Error(result.errors[0].msg);
                } else {
                    throw new Error(result.message || 'Failed to add product');
                }
            }
        } catch (error) {
            console.error('Error adding product:', error);
            formError.textContent = error.message;
            formError.style.display = 'block';
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // --- Delete Product Logic ---
    const productListBody = document.getElementById('product-list');
    productListBody.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.btn-delete');
        
        if (deleteButton) {
            const productId = deleteButton.dataset.id;
            
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await API.deleteProduct(productId);
                    alert('Product deleted successfully!');
                    loadMyProducts(); // Reload the list
                } catch (error) {
                    console.error('Error deleting product:', error);
                    alert('Error deleting product. Please try again.');
                }
            }
        }
    });

    // --- Logout Logic ---
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }

    // Initial load
    loadDashboardStats();
    loadMyProducts();
});