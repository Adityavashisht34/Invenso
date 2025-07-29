# React + TypeScript + Vite

# Warehouse Management System

A full-stack warehouse management system built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- User authentication with email verification
- Inventory management (add, delete, restock items)
- Sales processing and tracking
- Dashboard with analytics and charts
- Email notifications for low stock and sales
- Password reset functionality
- Responsive design

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd warehouse-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your actual values:
   - MongoDB connection string
   - JWT secret key
   - Gmail credentials for email functionality
   - Frontend and backend URLs

4. **Start the development servers**
   
   Backend (in one terminal):
   ```bash
   npm run server
   ```
   
   Frontend (in another terminal):
   ```bash
   npm run dev
   ```

### Production Deployment on Render

#### Backend Deployment:
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     EMAIL_USER=your_gmail_address
     EMAIL_PASS=your_gmail_app_password
     FRONTEND_URL=https://your-frontend-url.onrender.com
     BACKEND_URL=https://your-backend-url.onrender.com
     PORT=5000
     ```

#### Frontend Deployment:
1. Create a new Static Site on Render
2. Connect the same repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

## Environment Variables

### Required Backend Variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASS`: Gmail app password
- `FRONTEND_URL`: Frontend application URL
- `BACKEND_URL`: Backend API URL
- `PORT`: Server port (default: 5000)

### Required Frontend Variables:
- `VITE_API_URL`: Backend API base URL

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Email**: Nodemailer with Gmail
- **Charts**: Recharts
- **Icons**: Lucide React

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Inventory
- `GET /api/items` - Get all items
- `POST /api/items` - Add new item
- `DELETE /api/items/:id` - Delete item
- `PATCH /api/items/:id` - Restock item

### Sales
- `POST /api/sales` - Process sale
- `GET /api/sales/summary` - Get sales summary
- `GET /api/sales/trend` - Get sales trend data

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Email verification for new accounts
- Password reset functionality
- Input validation and sanitization
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
```

## License

