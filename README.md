# EcoShelf 🌱

A sustainable ecommerce platform for near-expiry products, helping reduce food waste while offering great deals to consumers.

## 🚀 Live Demo

**Frontend**: [Your Vercel URL will be here]
**Backend API**: [Your Vercel URL]/api

## 📋 Features

- **User Authentication**: Separate login for buyers and sellers
- **Product Management**: Sellers can add products with expiry dates
- **Shopping Cart**: Full cart functionality with localStorage persistence
- **Order Management**: Complete order processing system
- **Profile Management**: Users can edit name, email, and password
- **Category Filtering**: Browse by product categories and price ranges
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Deployment**: Vercel

## 🔧 Environment Variables

Set these in your Vercel dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## 📱 Test Accounts

- **Buyer**: buyer@example.com / password123
- **Seller**: seller@example.com / password123

## 🏗️ Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm start`
5. Open `http://localhost:3000`

## 📦 Deployment

This project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - see LICENSE file for details