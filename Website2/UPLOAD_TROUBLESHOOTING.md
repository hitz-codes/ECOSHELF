# 🔧 File Upload Troubleshooting Guide

## ✅ **What I Fixed:**

### 1. **HTML Form Issues**
- ❌ **Before**: Form inputs missing `name` attributes
- ✅ **After**: All inputs have proper `name` attributes matching backend expectations

### 2. **JavaScript FormData Handling**
- ❌ **Before**: FormData not properly constructed
- ✅ **After**: Manual FormData construction with proper validation

### 3. **File Validation**
- ❌ **Before**: No client-side file validation
- ✅ **After**: File size (5MB max) and type validation

### 4. **User Experience**
- ❌ **Before**: No loading states or feedback
- ✅ **After**: Loading buttons, progress indicators, error messages

## 🧪 **Testing Your Upload:**

### Step 1: Login as Seller
1. Go to your website
2. Login with: `seller@example.com` / `password123`

### Step 2: Test Upload Page
1. Go to: `http://10.100.8.238:3000/test-upload.html`
2. Fill the form
3. Select an image file
4. Click "Test Upload"
5. Check results

### Step 3: Use Seller Dashboard
1. Go to seller dashboard
2. Click "Add New Product"
3. Fill all fields
4. Select image file
5. Click "Add Product to Store"

## 🔍 **Common Upload Issues & Solutions:**

### Issue: "Please fill in all required fields"
**Solution**: Make sure all fields are filled:
- Product Name ✅
- Category ✅
- Original Price ✅
- Discounted Price ✅
- Quantity ✅
- Expiry Date ✅

### Issue: "Image file must be smaller than 5MB"
**Solution**: 
- Use image compression tools
- Resize image to smaller dimensions
- Use JPEG instead of PNG for photos

### Issue: "Please select a valid image file"
**Solution**: Use supported formats:
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP

### Issue: "Network error"
**Solution**: 
- Make sure backend is running (`npm run dev`)
- Check backend logs for errors
- Verify you're logged in as seller

### Issue: "Access denied"
**Solution**:
- Login as seller (not buyer)
- Check token hasn't expired
- Refresh page and try again

## 📁 **File Upload Flow:**

```
Frontend Form → FormData → API.addProduct() → Backend Route → Multer → File System → Database
     ↓              ↓           ↓               ↓           ↓          ↓            ↓
  Validation   File Object   HTTP POST    File Processing  Save File  Store Path  Success
```

## 🔧 **Backend File Handling:**

### Upload Directory:
```
Website2/backend/uploads/products/
```

### File Naming:
```
product_image-1671234567890-123456789.jpg
```

### URL Format:
```
http://10.100.8.238:5000/uploads/products/filename.jpg
```

## 🐛 **Debugging Steps:**

### 1. Check Browser Console
- Open Developer Tools (F12)
- Look for JavaScript errors
- Check Network tab for failed requests

### 2. Check Backend Logs
- Look at terminal running `npm run dev`
- Check for upload errors
- Verify file paths

### 3. Test with Small Image
- Use a small (< 1MB) JPEG image
- Avoid special characters in filename
- Test with simple product data

### 4. Verify Permissions
- Check uploads folder exists
- Ensure write permissions
- Verify disk space

## 📋 **Form Field Mapping:**

| Frontend Field | Backend Field | Required |
|---------------|---------------|----------|
| product-name | name | ✅ |
| product-category | category | ✅ |
| original-price | original_price | ✅ |
| discount-price | discounted_price | ✅ |
| product-quantity | quantity | ✅ |
| expiry-date | expiry_date | ✅ |
| product-description | description | ❌ |
| product-image | product_image | ❌ |

## 🎯 **Success Indicators:**

### Frontend Success:
- ✅ "Product added successfully!" alert
- ✅ Form resets after submission
- ✅ Redirects to "My Products" tab

### Backend Success:
- ✅ File saved in uploads/products/
- ✅ Product record in database
- ✅ Image URL in product data

### Database Success:
- ✅ New product appears in seller dashboard
- ✅ Product visible to buyers
- ✅ Image displays correctly

## 🚀 **Quick Test:**

1. **Login**: seller@example.com / password123
2. **Go to**: Seller Dashboard → Add New Product
3. **Fill form** with test data
4. **Select image**: Any JPG/PNG under 5MB
5. **Submit**: Should show success message
6. **Verify**: Check "My Products" tab

If upload still fails, use the test page (`test-upload.html`) to see detailed error messages and debug the issue step by step.