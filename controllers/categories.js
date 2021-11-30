const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { checkDirectory, mvFilesFromTmpToDest, deleteFiles } = require('../utils/utils');

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
	if (req.files.profileImage)
		req.body.icon = `./public/categories/${req.body.name}/${req.files.profileImage[0].filename}`;
	// remove files for a gallery if they were uploaded
	if (req.files.uploadGallery) deleteFiles(req.files.uploadGallery);

	// remove image and images if there are any in the req.body
	if (updateProduct.image) delete updateProduct.image;
	if (updateProduct.images) delete updateProduct.images;

	const newCategory = new Category({
		...req.body,
	});

	const addedCategory = await newCategory.save();

	if (!addedCategory) {
		if (req.files.profileImage) deleteFiles(req.files.profileImage);

		throw new ErrorResponse(`1. Category could not be created`, 404);
	}

	// check if directory exists to store images if not create it
	checkDirectory(`./public/categories/${req.body.name}`);

	// move files from temp to public/categories
	// delete upload gallery if one was uploaded
	if (req.files.profileImage) mvFilesFromTmpToDest(req.files.profileImage, [addedCategory.icon]);
	if (req.files.uploadGallery) deleteFiles(req.files.uploadGallery);

	res.status(201).json({
		success: true,
		data: addedCategory,
	});
});

//  @desc     Update Category
//  @route    Put /api/v1/categories/:catId
//  @access   Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
	// TODO: move profile image to a folder if name changes
	const { catId } = { ...req.params };
	const currentUser = req.user;
	const updateCategory = req.body;
	let category = await Category.findById(catId);
	if (!category) throw new ErrorResponse(`Resource not found with id of ${catId}`, 404, catId);

	// Make sure user is category owner or admin if return ErrorResponse
	if (category.user.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update category ${catId}`,
			401
		);
	for (let prop in updateCategory) {
		category[prop] = updateCategory[prop];
	}

	category = await category.save();

	res.status(200).json({
		success: true,
		data: category,
	});
});

//  @desc     Delete category
//  @route    Delete /api/v1/categories/:catId
//  @access   Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
	// TODO: delete category images from a folder
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

// TODO: Update category image
