const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const OrderItem = require('../models/OrderItem');

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
	req.body.phone = parseInt(req.body.phone.replace(/[^0-9]/g, ''), 10);
	const { orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, totalPrice } =
		req.body;
	let orderItemIds = orderItems.map(async orderItem => {
		let newOrderItem = new OrderItem({
			quantity: orderItem.quantity,
			product: orderItem.product,
		});

		newOrderItem = await newOrderItem.save();
		return newOrderItem._id;
	});

	orderItemIds = Promise.all(orderItemIds);
	orderItemIds = await orderItemIds;

	const newOrder = new Order({
		shippingAddress1,
		shippingAddress2,
		city,
		zip,
		country,
		phone,
		user: req.user._id,
		orderItems: orderItemIds,
		totalPrice,
	});
	const addedOrder = await newOrder.save();

	if (!addedOrder) throw new ErrorResponse(`1. Order could not be created`, 404);

	res.status(201).json({
		success: true,
		data: addedOrder,
	});
});
