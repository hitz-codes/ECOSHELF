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

// ======== ENHANCED DASHBOARD WITH CHARTS ========

// Chart instances
let categoryChart = null;
let revenueChart = null;

// Enhanced dashboard stats loading with animations
async function loadDashboardStatsEnhanced() {
    try {
        // Show loading animation
        showLoadingStats();
        
        const response = await fetch(`${API_BASE_URL}/users/seller/dashboard`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        const stats = data.stats;

        // Update stats with animation
        animateStatUpdate('stat-total-listings', stats.total_listings || 0);
        animateStatUpdate('stat-items-sold', stats.items_sold_24h || 0);
        animateStatUpdate('stat-total-revenue', `₹${(stats.total_revenue || 0).toFixed(2)}`);
        animateStatUpdate('stat-nearing-expiry', stats.nearing_expiry || 0);

        // Load charts
        await loadCharts(stats);
        
        // Load recent activity
        loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showStatsError();
    }
}

// Show loading animation for stats
function showLoadingStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        stat.classList.add('loading');
        stat.textContent = '...';
    });
}

// Animate stat number updates
function animateStatUpdate(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.remove('loading');
    
    // If it's a number, animate the counting
    if (typeof finalValue === 'number' || (typeof finalValue === 'string' && finalValue.match(/^\d+$/))) {
        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = finalValue;
            }
        }
        
        requestAnimationFrame(updateNumber);
    } else {
        // For non-numeric values (like currency), just set directly
        element.textContent = finalValue;
    }
}

// Load and create charts
async function loadCharts(stats) {
    await Promise.all([
        createCategoryChart(stats),
        createRevenueChart(stats)
    ]);
}

// Create category pie chart
async function createCategoryChart(stats) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Sample data - in real app, fetch from API
    const categoryData = {
        labels: ['Normal', 'Seasonal', 'Derived'],
        datasets: [{
            data: [45, 35, 20],
            backgroundColor: [
                '#3498db',
                '#27ae60',
                '#f39c12'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: categoryData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

// Create revenue line chart
async function createRevenueChart(stats) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
    }

    // Sample data for last 7 days
    const last7Days = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        revenueData.push(Math.floor(Math.random() * 200) + 50); // Sample data
    }

    const chartData = {
        labels: last7Days,
        datasets: [{
            label: 'Revenue (₹)',
            data: revenueData,
            borderColor: '#561C24',
            backgroundColor: 'rgba(86, 28, 36, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#561C24',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    // Sample activity data
    const activities = [
        {
            type: 'sale',
            icon: 'fa-cart-shopping',
            message: 'Sold 2x Fresh Milk',
            time: '2 hours ago'
        },
        {
            type: 'product',
            icon: 'fa-plus',
            message: 'Added new product: Organic Mangoes',
            time: '5 hours ago'
        },
        {
            type: 'warning',
            icon: 'fa-clock',
            message: 'Product "Bread Loaf" expires tomorrow',
            time: '1 day ago'
        }
    ];

    if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fa-solid ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Show error state for stats
function showStatsError() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        stat.classList.remove('loading');
        stat.textContent = '--';
    });
}

// Initialize enhanced dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load enhanced dashboard stats when dashboard section is active
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboardStatsEnhanced();
    }
    
    // Override the original loadDashboardStats function
    window.loadDashboardStats = loadDashboardStatsEnhanced;
});

// Refresh charts when window is resized
window.addEventListener('resize', () => {
    if (categoryChart) categoryChart.resize();
    if (revenueChart) revenueChart.resize();
});