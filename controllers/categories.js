const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all categories
//  @route    Get /api/v1/categories
//  @route    Get /api/v1/categories
//  @access   Public
exports.getCategories = asyncHandler(async (req, res, next) => {
	const categories = await Category.find();
	res.status(200).json({
		success: true,
		count: categories.length,
		data: categories,
	});
});
