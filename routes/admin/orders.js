const express = require('express');

const { getOrders } = require('../../controllers/admin/orders');
const Order = require('../../models/Order');
const advancedResults = require('../../middleware/advancedResults');
const { protect, authorize } = require('../../middleware/auth');
const router = express.Router();

router.route('/').get(
	protect,
	authorize('admin'),
	advancedResults({
		Model: Order,
		model: 'Orders',
		popArray: [
			{
				path: 'orderItems',
				populate: {
					path: 'product',
					select: 'name image price',
					model: 'Product',
				},
			},
			{ path: 'user', select: 'name' },
		],
	}),
	getOrders
);

module.exports = router;
