const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

//  @desc     Get all user orders
//  @route    Get /api/v1/orders
//  @access   Private
exports.getOrders = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//  @desc     Get one order
//  @route    Get /api/v1/orders/:orderId
//  @access   Private
exports.getOrder = asyncHandler(async (req, res, next) => {
	const { orderId } = { ...req.params };
	const order = await Order.findById(orderId)
		.populate({
			path: 'orderItems',
			populate: { path: 'product', select: 'description price image' },
		})
		.populate({ path: 'user' });
	const currentUser = req.user;

	if (!order) throw new ErrorResponse(`1. Resource not found with id of ${orderId}`, 404, orderId);

	// Make sure user is product owner or admin if return ErrorResponse
	if (order.user.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(`User ${req.user.id} not authorized to look at that order`, 401);

	res.status(200).json({
		success: true,
		data: order,
	});
});

//  @desc     Create an order
//  @route    Post /api/v1/orders
//  @access   Private
exports.createOrder = asyncHandler(async (req, res, next) => {
	// make sure phone number is int
	let totalPrice = 0;
	req.body.phone = parseInt(req.body.phone.replace(/[^0-9]/g, ''), 10);

	const { orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone } = req.body;
	// go through all orderItems with map function
	let orderItemIds = orderItems.map(async orderItem => {
		// first check if product id is a valid product id, if not throw error response
		const foundProduct = await Product.findById(orderItem.product).select('price');
		if (!foundProduct) throw new ErrorResponse(`Product could not be found`, 406);

		let newOrderItem = new OrderItem({
			quantity: orderItem.quantity,
			product: orderItem.product,
		});
		// save it and return OrderItem id
		newOrderItem = await newOrderItem.save();

		totalPrice += orderItem.quantity * foundProduct.price;

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

//  @desc     Update Order
//  @route    Put /api/v1/orders/:orderId
//  @access   Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
	req.body.phone = parseInt(req.body.phone.replace(/[^0-9]/g, ''), 10);
	const { orderId } = { ...req.params };
	const currentUser = req.user;
	const updateOrder = req.body;
	let order = await Order.findById(orderId);
	if (!order) throw new ErrorResponse(`Resource not found with id of ${orderId}`, 404, orderId);

	// Make sure user is order owner or admin if return ErrorResponse
	if (order.user.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update order ${orderId}`,
			401
		);

	if (updateOrder.orderItems || updateOrder.totalPrice || updateOrder.user)
		throw new ErrorResponse(`Unable to update order with given updates`, 401);

	order = await Order.findByIdAndUpdate(orderId, updateOrder, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: order,
	});
});

//  @desc     Delete order
//  @route    Delete /api/v1/orders/:orderId
//  @access   Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
	const { orderId } = { ...req.params };
	const order = await Order.findById(orderId);
	const currentUser = req.user;

	if (!order) throw new ErrorResponse(`Resource not found with id of ${orderId}`, 404, orderId);

	// Make sure user is order owner or admin if return ErrorResponse
	if (order.user.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to delete order ${orderId}`,
			401
		);

	const deletedProd = await order.remove();
	if (!deletedProd)
		throw new ErrorResponse(`Unable to delete order with id: ${orderId}`, 500, productId);
	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc   Get sum of all orders by user
// @route  GET /api/v1/orders/sum
// @access Private
exports.getSumOfAllOrders = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.calcResults);
});
