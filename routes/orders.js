const express = require('express');
const {
	getOrders,
	createOrder,
	getOrder,
	updateOrder,
	deleteOrder,
	getSumOfAllOrders,
} = require('../controllers/orders');
const Order = require('../models/Order');
const advancedResults = require('../middleware/advancedResults');
const calcResults = require('../middleware/calcResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router
	.route('/statistics')
	.get(protect, calcResults({ Model: Order, model: 'Orders', personal: true }), getSumOfAllOrders);

router
	.route('/:orderId')
	.get(protect, getOrder)
	.put(protect, updateOrder)
	.delete(protect, deleteOrder);
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
					populate: {
						path: 'product',
						model: 'Product',
						select: 'name image price',
					},
				},
				// { path: 'user', select: 'name' },
			],
			personal: true,
		}),
		getOrders
	)
	.post(protect, createOrder);

module.exports = router;
