const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all orders
//  @route    Get /api/v1/orders
//  @route    Get /api/v1/orders
//  @access   Public
exports.getOrders = asyncHandler(async (req, res, next) => {
	const orders = await Order.find();
	res.status(200).json({
		success: true,
		count: orders.length,
		data: orders,
	});
});
