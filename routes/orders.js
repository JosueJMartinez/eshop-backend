const express = require('express');
const { getOrders, createOrder } = require('../controllers/orders');
const Order = require('../models/Order');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
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
router
	.route('/')
	.get(
		protect,
		advancedResults({
			Model: Order,
			model: 'Orders',
			popArray: [
				{
					path: 'orderItems',
				},
				{ path: 'user', select: 'name' },
			],
		}),
		getOrders
	)
	.post(protect, createOrder);

module.exports = router;
