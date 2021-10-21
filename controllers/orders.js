const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

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
	// make sure phone number is int
	req.body.phone = parseInt(req.body.phone.replace(/[^0-9]/g, ''), 10);

	const { orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, totalPrice } =
		req.body;
	// go through all orderItems with map function
	let orderItemIds = orderItems.map(async orderItem => {
		// first check if product id is a valid product id, if not throw error response
		const foundProduct = await Product.findById(orderItem.product);

		if (!foundProduct) throw new ErrorResponse(`Product could not be found`, 406);

		// create an order iterm with quantity and product id.
		let newOrderItem = new OrderItem({
			quantity: orderItem.quantity,
			product: orderItem.product,
		});
		// save it and return OrderItem id
		newOrderItem = await newOrderItem.save();
		return newOrderItem._id;
	});
	// await promises to resolve themselves
	orderItemIds = Promise.all(orderItemIds);
	orderItemIds = await orderItemIds;

	// create a new order
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
	// save order
	const addedOrder = await newOrder.save();
	// throw error if order was not saved
	if (!addedOrder) throw new ErrorResponse(`1. Order could not be created`, 404);

	// return response if order was successfully saved
	res.status(201).json({
		success: true,
		data: addedOrder,
	});
});
