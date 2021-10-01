const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all categories
//  @route    Get /api/v1/categories
//  @route    Get /api/v1/categories
//  @access   Public
exports.getCategories = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//  @desc     Get one category
//  @route    Get /api/v1/categories/:catId
//  @access   Public
exports.getCategory = asyncHandler(async (req, res, next) => {
	const { catId } = { ...req.params };
	const category = await Category.findById(catId).populate({
		path: 'products',
		select: 'name',
	});

	if (!category)
		throw new ErrorResponse(`1. Category ${catId} not found`, 404, catId);

	res.status(200).json({
		success: true,
		data: category,
	});
});

//  @desc     Add a single Category
//  @route    Post /api/v1/categories
//  @access   Private
exports.createCategory = asyncHandler(async (req, res, next) => {
	const newCategory = new Category({
		...req.body,
		user: req.user,
	});
	const addedCategory = await newCategory.save();

	if (!addedCategory)
		throw new ErrorResponse(`1. Category could not be created`, 404);

	res.status(201).json({
		success: true,
		data: addedCategory,
	});
});

//  @desc     Update Category
//  @route    Put /api/v1/categories/:catId
//  @access   Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
	const { catId } = { ...req.params };
	const currentUser = req.user;
	const updateCategory = req.body;
	let category = await Category.findById(catId);
	if (!category)
		throw new ErrorResponse(
			`Resource not found with id of ${catId}`,
			404,
			catId
		);

	// Make sure user is category owner or admin if return ErrorResponse
	if (
		category.user.toString() !== currentUser.id &&
		currentUser.role !== 'admin'
	)
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update category ${catId}`,
			401
		);
	for (let prop in updateCategory) {
		category[prop] = updateCategory[prop];
	}

	category = await category.save();
	// await Category.findOneAndUpdate(
	// 	{ slug: catId },
	// 	updateCategory,
	// 	{
	// 		new: true,
	// 		runValidators: true,
	// 	}
	// );

	res.status(200).json({
		success: true,
		data: category,
	});
});

//  @desc     Delete category
//  @route    Delete /api/v1/categories/:catId
//  @access   Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
	const { catId } = { ...req.params };
	const category = await Category.findById(catId);
	const currentUser = req.user;

	if (!category)
		throw new ErrorResponse(
			`Resource not found with id of ${catId}`,
			404,
			catId
		);

	// Make sure user is category owner or admin if return ErrorResponse
	if (
		category.user.toString() !== currentUser.id &&
		currentUser.role !== 'admin'
	)
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update category ${catId}`,
			401
		);

	const catRemoved = await category.remove();
	if (!catRemoved)
		throw new ErrorResponse(
			`Unable to delete resource with id of ${catId}`,
			404,
			catId
		);

	res.status(200).json({
		success: true,
		data: {},
	});
});
