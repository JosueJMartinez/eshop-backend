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
const { upload, makeDir } = require('../middleware/upload');

router
	.route('/:catId')
	.get(getCategory)
	.put(protect, authorize('admin'), updateCategory)
	.delete(protect, authorize('admin'), deleteCategory);
router
	.route('/')
	.get(
		advancedResults({
			Model: Category,
			model: 'Categories',
		}),
		getCategories
	)
	.post(protect, authorize('admin'), makeDir('./public/tmp'), upload, createCategory);

module.exports = router;
