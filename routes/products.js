const express = require('express');
const {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	updateProductImage,
	updateProductImages,
	deleteProductImages,
} = require('../controllers/products');
const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const { upload } = require('../middleware/upload');

router
	.route('/:productId/image')
	.put(
		protect,
		authorize('publisher', 'admin'),
		upload.fields([{ name: 'profileImage', maxCount: 1 }]),
		updateProductImage
	);

router
	.route('/:productId/images')
	.put(
		protect,
		authorize('publisher', 'admin'),
		upload.fields([{ name: 'uploadGallery', maxCount: 10 }]),
		updateProductImages
	)
	.delete(protect, authorize('publisher', 'admin'), deleteProductImages);
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
	.post(
		protect,
		authorize('publisher', 'admin'),
		upload.fields([
			{ name: 'profileImage', maxCount: 1 },
			{ name: 'uploadGallery', maxCount: 10 },
		]),
		createProduct
	);

module.exports = router;
