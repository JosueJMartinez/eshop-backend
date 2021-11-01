const Order = require('../../models/Order');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const OrderItem = require('../../models/OrderItem');
const Product = require('../../models/Product');

//  @desc     Get all user orders
//  @route    Get /api/v1/orders
//  @access   Private
exports.getOrders = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});
