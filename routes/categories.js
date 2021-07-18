const express = require('express');
const { getCategories } = require('../controllers/categories');
const Category = require('../models/Category');
// const advancedResults = require('../middleware/advancedResults');
// const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// router
// 	.route('/:productId')
// 	.get(getCategory)
// 	.put(
// 		// protect, authorize('publisher', 'admin'),
// 		updateCategory
// 	)
// .delete(
// 	// protect, authorize('publisher', 'admin'),
// 	deleteCategory
// );
router.route('/').get(
	// advancedResults(Category, 'Categories', {
	// 	path: 'bootcamp',
	// 	select: 'name description',
	// }),
	getCategories
);
// .post(
// 	// protect, authorize('publisher', 'admin'),
// 	createCategory
// );

module.exports = router;
