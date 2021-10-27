const express = require('express');
const {
	getOrders,
	createOrder,
	getOrder,
	updateOrder,
	deleteOrder,
} = require('../controllers/orders');
const Order = require('../models/Order');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

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
						select: 'name image',
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
