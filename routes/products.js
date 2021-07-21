const express = require('express');
const {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
} = require('../controllers/products');
const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');
// const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router
	.route('/:productId')
	.get(getProduct)
	.put(
		// protect, authorize('publisher', 'admin'),
		updateProduct
	)
	.delete(
		// protect, authorize('publisher', 'admin'),
		deleteProduct
	);
router
	.route('/')
	.get(advancedResults(Product, 'Products'), getProducts)
	.post(
		// protect, authorize('publisher', 'admin'),
		createProduct
	);

module.exports = router;
