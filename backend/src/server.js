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

// 💡 अल्टीमेट फिक्स 1: CORS को पूरी तरह ओपन कर दिया ताकि फ्रंटएंड चाहे जिस डोमेन से आए, एरर न आए
app.use(cors({
  origin: true, // यह हर प्रकार के फ्रंटएंड ओरिजिन (Origin) को एक्सेप्ट कर लेगा
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

// 💡 अल्टीमेट फिक्स 2: फ्रंटएंड के सभी संभावित रास्तों (URL paths) को बैकएंड में जोड़ दिया
app.use('/api/auth', authRoutes);       // सही रास्ता
app.use('/api/auth/auth', authRoutes);  // डबल auth बग के लिए
app.use('/auth', authRoutes);           // बिना /api वाले रास्ते के लिए
app.use('/api', authRoutes);            // बिना /auth वाले रास्ते के लिए

// प्रोडक्ट रूट्स के बैकअप
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

// Base Test Route
app.get('/', (req, res) => {
  res.send('Sheryians E-commerce API is running successfully!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server running in development mode on port ${PORT}`);
});
