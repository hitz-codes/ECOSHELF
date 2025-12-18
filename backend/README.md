# EcoMart Backend API

Backend server for EcoMart - A marketplace for near-expiry products to reduce food waste.

## Features

- **User Authentication**: JWT-based auth for buyers and sellers
- **Product Management**: CRUD operations for products with image upload
- **Order Processing**: Complete order lifecycle management
- **File Upload**: Image upload for product photos
- **Data Validation**: Comprehensive input validation
- **Security**: Rate limiting, CORS, helmet protection

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd ESCN-main/PROTOTYPES/ESCN/Website2/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecomart
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register-consumer` - Register buyer
- `POST /api/auth/register-seller` - Register seller  
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search/:query` - Search products
- `POST /api/products` - Add product (sellers only)
- `PUT /api/products/:id` - Update product (sellers only)
- `DELETE /api/products/:id` - Delete product (sellers only)
- `GET /api/products/seller/my-products` - Get seller's products

### Orders
- `POST /api/orders` - Create order (buyers only)
- `GET /api/orders/my-orders` - Get buyer's orders
- `GET /api/orders/:orderId` - Get order details
- `PATCH /api/orders/:orderId/status` - Update order status (sellers)
- `PATCH /api/orders/:orderId/cancel` - Cancel order (buyers)
- `GET /api/orders/seller/orders` - Get orders for seller's products

### Users
- `GET /api/users/seller/dashboard` - Seller dashboard stats
- `GET /api/users/buyer/dashboard` - Buyer dashboard stats
- `PUT /api/users/change-password` - Change password
- `PATCH /api/users/deactivate` - Deactivate account
- `GET /api/users/addresses` - Get addresses (buyers)
- `PUT /api/users/addresses/default` - Update address (buyers)

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'buyer' | 'seller',
  mobile_number: String,
  delivery_address: String (buyers),
  business_name: String (sellers),
  business_address: String (sellers),
  business_license: String (sellers),
  isVerified: Boolean,
  isActive: Boolean
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  category: 'Normal' | 'Seasonal' | 'Derived',
  original_price: Number,
  discounted_price: Number,
  quantity: Number,
  expiry_date: Date,
  image_url: String,
  seller_id: ObjectId,
  seller_name: String,
  is_active: Boolean,
  views: Number,
  sold_quantity: Number
}
```

### Order Model
```javascript
{
  order_id: String (unique),
  buyer_id: ObjectId,
  buyer_name: String,
  buyer_email: String,
  buyer_mobile: String,
  delivery_address: String,
  items: [OrderItem],
  subtotal: Number,
  delivery_fee: Number,
  total_amount: Number,
  payment_method: 'card' | 'upi' | 'cod',
  payment_status: String,
  order_status: String,
  estimated_delivery: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## File Upload

Product images are uploaded to `/uploads/products/` directory. Supported formats:
- JPEG, PNG, GIF, WebP
- Maximum size: 5MB
- Files are renamed with timestamp for uniqueness

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers  
├── middleware/      # Custom middleware
├── uploads/         # File upload directory
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecomart
JWT_SECRET=your_production_secret_key
PORT=5000
```

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details