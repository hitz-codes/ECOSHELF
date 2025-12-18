// API utility functions for frontend
// Auto-detect the correct backend URL based on current host
const getBackendURL = () => {
  const currentHost = window.location.hostname;
  
  console.log('[API] Current hostname:', currentHost);
  
  // Production deployment - Frontend on Vercel, Backend on Render
  if (currentHost.includes('vercel.app') || currentHost.includes('ecoshelf')) {
    return 'https://ecoshelf-backend.onrender.com/api';
  }
  
  // If accessing via IP address, use the same IP for backend
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    const backendUrl = `http://${currentHost}:5000/api`;
    console.log('[API] Using network IP backend:', backendUrl);
    return backendUrl;
  }
  
  // Default to localhost for local development
  console.log('[API] Using localhost backend: http://localhost:5000/api');
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBackendURL();
console.log('[API] Final API_BASE_URL:', API_BASE_URL);

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get user data from localStorage
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Logout user
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle unauthorized responses
        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Specific API functions
const API = {
    // Auth
    login: (credentials) => 
        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        }),

    registerConsumer: (userData) =>
        fetch(`${API_BASE_URL}/auth/register-consumer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }),

    registerSeller: (userData) =>
        fetch(`${API_BASE_URL}/auth/register-seller`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }),

    getProfile: () => apiRequest('/auth/profile'),

    // Products
    getProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/products?${queryString}`);
    },

    getProduct: (id) => apiRequest(`/products/${id}`),

    searchProducts: (query, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/products/search/${encodeURIComponent(query)}?${queryString}`);
    },

    addProduct: (formData) => {
        const token = getAuthToken();
        return fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // FormData for file upload
        });
    },

    updateProduct: (id, formData) => {
        const token = getAuthToken();
        return fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
    },

    deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

    getMyProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/products/seller/my-products?${queryString}`);
    },

    // Orders
    createOrder: (orderData) => apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    }),

    getMyOrders: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/orders/my-orders?${queryString}`);
    },

    getOrder: (orderId) => apiRequest(`/orders/${orderId}`),

    cancelOrder: (orderId) => apiRequest(`/orders/${orderId}/cancel`, {
        method: 'PATCH'
    }),

    updateOrderStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),

    getSellerOrders: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/orders/seller/orders?${queryString}`);
    },

    // Users
    getSellerDashboard: () => apiRequest('/users/seller/dashboard'),

    getBuyerDashboard: () => apiRequest('/users/buyer/dashboard'),

    changePassword: (passwordData) => apiRequest('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
    }),

    getAddresses: () => apiRequest('/users/addresses'),

    updateAddress: (address) => apiRequest('/users/addresses/default', {
        method: 'PUT',
        body: JSON.stringify({ address })
    })
};

// Utility functions
function formatPrice(price) {
    return `₹${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

function getDaysUntilExpiry(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getExpiryStatus(expiryDate) {
    const days = getDaysUntilExpiry(expiryDate);
    
    if (days < 0) return { text: 'Expired', class: 'expired' };
    if (days === 0) return { text: 'Expires today!', class: 'expires-today' };
    if (days === 1) return { text: 'Expires tomorrow', class: 'expires-soon' };
    if (days <= 3) return { text: `Expires in ${days} days`, class: 'expires-soon' };
    if (days <= 7) return { text: `Expires in ${days} days`, class: 'expires-week' };
    
    return { text: `Expires in ${days} days`, class: 'expires-later' };
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Pages that require authentication
    const protectedPages = [
        'consumer_home.html',
        'seller_dashboard.html',
        'checkout.html',
        'account.html',
        'orders.html'
    ];

    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = 'index.html';
    }
});