const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 
const productRoutes = require('./routes/productRoutes'); 

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize the Express Application
const app = express();

// 💡 FIX: Allow both port 3000 and port 3001 to pass the CORS policy check
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl/Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Origin not allowed'));
    }
  },
  credentials: true // Crucial: Allows handling HTTP-Only cookies securely
}));

app.use(express.json());
app.use(cookieParser());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Base Test Route
app.get('/', (req, res) => {
  res.send('Sheryians E-commerce API is running successfully!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server running in development mode on port ${PORT}`);
});
