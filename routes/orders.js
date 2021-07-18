const express = require('express');
const { getOrders } = require('../controllers/orders');
const Order = require('../models/Order');
// const advancedResults = require('../middleware/advancedResults');
// const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// router
// 	.route('/:productId')
// 	.get(getOrder)
// 	.put(
// 		// protect, authorize('publisher', 'admin'),
// 		updateOrder
// 	)
// .delete(
// 	// protect, authorize('publisher', 'admin'),
// 	deleteOrder
// );
router.route('/').get(
	// advancedResults(Order, 'Categories', {
	// 	path: 'bootcamp',
	// 	select: 'name description',
	// }),
	getOrders
);
// .post(
// 	// protect, authorize('publisher', 'admin'),
// 	createOrder
// );

module.exports = router;
