const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const {
	checkDirectory,
	mvFilesFromTmpToDest,
	deleteFiles,
	checkFileExists,
	removeImagesFromObj,
	removeFolderIfEmpty,
} = require('../utils/utils');

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

	if (!category) throw new ErrorResponse(`1. Category ${catId} not found`, 404, catId);

	res.status(200).json({
		success: true,
		data: category,
	});
});

//  @desc     Add a single Category
//  @route    Post /api/v1/categories
//  @access   Private
exports.createCategory = asyncHandler(async (req, res, next) => {
	// modify the path for image and gallery
	if (req.files.uploadIcon)
		req.body.icon = `./public/categories/${req.body.name}/${req.files.uploadIcon[0].filename}`;

	const newCategory = new Category({
		...req.body,
	});

	const addedCategory = await newCategory.save();

	if (!addedCategory) {
		if (req.files.uploadIcon) deleteFiles(req.files.uploadIcon);

		throw new ErrorResponse(`1. Category could not be created`, 404);
	}

	// check if directory exists to store images if not create it
	checkDirectory(`./public/categories/${req.body.name}`);

	// move files from temp to public/categories
	// delete upload gallery if one was uploaded
	if (req.files.uploadIcon) mvFilesFromTmpToDest(req.files.uploadIcon, [addedCategory.icon]);

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

	const updateCategory = req.body;
	let category = await Category.findById(catId);
	if (!category) throw new ErrorResponse(`Resource not found with id of ${catId}`, 404, catId);

	const oldCategory = { ...category._doc };
	// If updatedProduct name is updated, update image path with new name
	if (updateCategory.name) {
		checkDirectory(`./public/categories/${updateCategory.name}`);

		// modify the path for image
		if (category.icon !== './public/default.png' && checkFileExists(category.icon))
			updateCategory.icon = `./public/categories/${updateCategory.name}/${category.icon
				.split('/')
				.pop()}`;
		else updateCategory.icon = `./public/default.png`;
	}

	Object.assign(category, updateCategory);
	const updatedCategory = await category.save();

	if (updateCategory.name) {
		if (oldCategory.icon !== './public/default.png')
			mvFilesFromTmpToDest([{ path: oldCategory.icon }], [updatedCategory.icon]);
		removeFolderIfEmpty(`./public/categories/${oldCategory.name}`);
	}

	res.status(200).json({
		success: true,
		data: updatedCategory,
	});
});

//  @desc     Delete category
//  @route    Delete /api/v1/categories/:catId
//  @access   Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
	const { catId } = { ...req.params };
	const category = await Category.findById(catId);
	const currentUser = req.user;

	if (!category) throw new ErrorResponse(`Resource not found with id of ${catId}`, 404, catId);

	// Make sure user is category owner or admin if return ErrorResponse
	if (currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update category ${catId}`,
			401
		);

	const catRemoved = await category.remove();
	if (!catRemoved)
		throw new ErrorResponse(`Unable to delete resource with id of ${catId}`, 404, catId);

	res.status(200).json({
		success: true,
		data: {},
	});
});

exports.updateCategoryImage = asyncHandler(async (req, res, next) => {
	// if no profile image uploaded return ErrorResponse
	if (!req.files.uploadIcon) {
		throw new ErrorResponse(`Please upload an image`, 400);
	}

	const { catId } = { ...req.params };
	const currentUser = req.user;

	const category = await Category.findById(catId);
	if (!category) {
		if (req.files.uploadIcon) deleteFiles(req.files.uploadIcon);
		throw new ErrorResponse(`Resource not found with id of ${catId}`, 404, catId);
	}

	checkDirectory(`./public/categories/${category.name}`);
	// modify the path for image
	// if (req.files.uploadIcon)
	// 	req.body.icon = `./public/categories/${category.name}/${req.files.uploadIcon[0].filename}`;

	const updatedCategoryImage = {
		icon: `./public/categories/${category.name}/${req.files.uploadIcon[0].filename}`,
	};
	// move files from temp to public/categories
	const oldCatIcon = category.icon;

	const updatedCategory = await Category.findByIdAndUpdate(catId, updatedCategoryImage, {
		new: true,
		runValidators: true,
	});

	// delete old image unless it is default image
	if (oldCatIcon !== './public/default.png') {
		deleteFiles([oldCatIcon]);
	}

	// move new image to path from updatedProduct image
	mvFilesFromTmpToDest(req.files.uploadIcon, [updatedCategory.icon]);

	res.status(200).json({
		success: true,
		data: updatedCategory,
	});
});
