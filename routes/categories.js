const express = require('express');
const {
	getCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
} = require('../controllers/categories');
const Category = require('../models/Category');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router
	.route('/:catId')
	.get(getCategory)
	.put(protect, authorize('publisher', 'admin'), updateCategory)
	.delete(protect, authorize('publisher', 'admin'), deleteCategory);
router
	.route('/')
	.get(
		advancedResults({
			Model: Category,
			model: 'Categories',
		}),
		getCategories
	)
	.post(protect, authorize('publisher', 'admin'), createCategory);

module.exports = router;
