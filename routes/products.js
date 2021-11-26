const express = require('express');
const {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	getCount,
} = require('../controllers/products');
const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const { upload, makeDir } = require('../middleware/upload');

router
	.route('/:productId')
	.get(getProduct)
	.put(protect, authorize('publisher', 'admin'), updateProduct)
	.delete(protect, authorize('publisher', 'admin'), deleteProduct);

router
	.route('/')
	.get(
		advancedResults({
			Model: Product,
			model: 'Products',
			popArray: [
				{
					path: 'category',
					select: 'name icon',
				},
			],
		}),
		getProducts
	)
	.post(protect, authorize('publisher', 'admin'), makeDir('./public/tmp'), upload, createProduct);

module.exports = router;
