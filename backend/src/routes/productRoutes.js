const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middlewares/authMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

// Validation Rules for Body Content
const productBodyValidation = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('price')
    .isNumeric().withMessage('Price must be a valid number')
    .custom(val => val >= 0).withMessage('Price cannot be negative'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be an integer and cannot be negative'),
  body('category').notEmpty().withMessage('Category is required').trim(),
];

// Validation Rules for Checking Hexadecimal ID structures
const productIdValidation = [
  param('id').isMongoId().withMessage('Invalid product structural ID format')
];

// Mapping Endpoints
router.get('/', getAllProducts);
router.get('/:id', productIdValidation, getProductById);

// Protected Write Paths
router.post('/', authenticate, productBodyValidation, createProduct);
router.put('/:id', authenticate, [...productIdValidation, ...productBodyValidation], updateProduct);
router.delete('/:id', authenticate, productIdValidation, deleteProduct);

module.exports = router;
