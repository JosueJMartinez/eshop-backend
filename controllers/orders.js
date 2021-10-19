const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all orders
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

//  @desc     Create an order
//  @route    Post /api/v1/orders
//  @access   Private
exports.createOrder = asyncHandler(async (req, res, next) => {
	console.log(req.user);
	// const newOrder = new Order({
	// 	...req.body,
	// 	user: req.user,
	// });
	// const addedOrder = await newOrder.save();

	// if (!addedOrder)
	// 	throw new ErrorResponse(`1. Order could not be created`, 404);

	res.status(201).json({
		success: true,
		// data: addedOrder,
	});
});
