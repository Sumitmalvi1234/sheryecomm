const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Helper to catch structural validation flags
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  return null;
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Authenticated
const createProduct = async (req, res) => {
  const validationErrorResponse = handleValidationErrors(req, res);
  if (validationErrorResponse) return validationErrorResponse;

  try {
    const { name, description, price, stock, category } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(`Create Product Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error while generating product' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error(`Get All Products Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const validationErrorResponse = handleValidationErrors(req, res);
  if (validationErrorResponse) return validationErrorResponse;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error(`Get Product By ID Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error locating product' });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Authenticated
const updateProduct = async (req, res) => {
  const validationErrorResponse = handleValidationErrors(req, res);
  if (validationErrorResponse) return validationErrorResponse;

  try {
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product records do not exist' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(`Update Product Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error updating product modifications' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Authenticated
const deleteProduct = async (req, res) => {
  const validationErrorResponse = handleValidationErrors(req, res);
  if (validationErrorResponse) return validationErrorResponse;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    return res.status(200).json({ message: 'Product successfully removed' });
  } catch (error) {
    console.error(`Delete Product Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error running product deletion' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
