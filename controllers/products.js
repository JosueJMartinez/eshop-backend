const Product = require('../models/Product'),
	Category = require('../models/Category'),
	ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('../middleware/async');
const { checkDirectory, mvFilesFromTmpToDest, deleteFiles } = require('../utils/utils');
const fs = require('fs');

//  @desc     Get all products
//  @route    Get /api/v1/products
//  @route    Get /api/v1/products
//  @access   Public
exports.getProducts = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//  @desc     Get one product
//  @route    Get /api/v1/products/:productId
//  @access   Public
exports.getProduct = asyncHandler(async (req, res, next) => {
	const { productId } = { ...req.params };
	const product = await Product.findById(productId);

	if (!product)
		throw new ErrorResponse(`1. Resource not found with id of ${productId}`, 404, productId);

	res.status(200).json({
		success: true,
		data: product,
	});
});

//  @desc     Add a single Product
//  @route    Post /api/v1/products
//  @access   Private
exports.createProduct = asyncHandler(async (req, res) => {
	const foundCategory = await Category.findOne({
		name: req.body.category,
	});
	if (!foundCategory) {
		// delete files in public/temp folder
		if (req.files.profileImage) deleteFiles(req.files.profileImage);
		if (req.files.uploadGallery) deleteFiles(req.files.uploadGallery);

		throw new ErrorResponse(`Category ${req.body.category} does not exist`, 400);
	}

	req.body = {
		...req.body,
		category: foundCategory._id,
		isFeatured: req.body.isFeatured ? true : false,
		name: req.body.name.trim(),
		owner: req.user._id,
	};

	// modify the path for image and gallery
	if (req.files.profileImage)
		req.body.image = `./public/products/${req.body.name}/${req.files.profileImage[0].filename}`;
	if (req.files.uploadGallery)
		req.body.images = req.files.uploadGallery.map(
			image => `./public/products/${req.body.name}/${image.filename}`
		);

	const newProduct = new Product({
		...req.body,
	});

	const addedProduct = await newProduct.save();

	if (!addedProduct) {
		// delete files in public/temp folder
		if (req.files.profileImage) deleteFiles(req.files.profileImage);
		if (req.files.uploadGallery) deleteFiles(req.files.uploadGallery);
		throw new ErrorResponse(`Unable to create product please try again`, 500);
	}

	// check if directory exists to store images if not create it
	checkDirectory(`./public/products/${req.body.name}`);

	// move files from temp to public/products
	if (req.files.profileImage) mvFilesFromTmpToDest(req.files.profileImage, [addedProduct.image]);
	if (req.files.uploadGallery) mvFilesFromTmpToDest(req.files.uploadGallery, addedProduct.images);

	res.status(201).json({
		success: true,
		data: addedProduct,
	});
});

//  @desc     Update Product
//  @route    Put /api/v1/products/:productId
//  @access   Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
	const { productId } = { ...req.params };
	const currentUser = req.user;
	const updateProduct = req.body;
	const product = await Product.findById(productId);
	if (!product)
		throw new ErrorResponse(`Resource not found with id of ${productId}`, 404, productId);

	if (updateProduct.image) delete updateProduct.image;
	if (updateProduct.images) delete updateProduct.images;

	// Make sure user is product owner or admin if return ErrorResponse
	if (product.owner.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update product ${productId}`,
			401
		);

	// If product name is updated, update image and images path
	if (updateProduct.name) {
		// check if directory exists to store images if not create it
		checkDirectory(`./public/products/${updateProduct.name}`);
		if (product.image !== './public/default.png')
			updateProduct.image = `./public/products/${updateProduct.name}/${product.image
				.split('/')
				.pop()}`;
		if (product.images.length > 0)
			updateProduct.images = product.images.map(
				image => `./public/products/${updateProduct.name}/${image.split('/').pop()}`
			);
	}
	const updatedProduct = await Product.findByIdAndUpdate(productId, updateProduct, {
		new: true,
		runValidators: true,
	});

	// Move image and images in product path to new path in updatedProduct
	if (updateProduct.name) {
		if (product.image !== './public/default.png')
			mvFilesFromTmpToDest([{ path: product.image }], [updatedProduct.image]);
		// TODO: fix this keep getting undefined for image path
		if (product.images.length > 0) {
			const oldPathes = product.images.map(image => {
				return { path: image };
			});
			mvFilesFromTmpToDest(oldPathes, updatedProduct.images);
			const idx = product.image.indexOf('/', 18);
			const path = product.image.substring(0, idx);
			fs.rmSync(path, { recursive: true });
		}
	}

	res.status(200).json({
		success: true,
		data: updatedProduct,
	});
});

//  @desc     Delete product
//  @route    Delete /api/v1/products/:productId
//  @access   Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
	const { productId } = { ...req.params };
	const product = await Product.findById(productId);
	const currentUser = req.user;

	if (!product)
		throw new ErrorResponse(`Resource not found with id of ${productId}`, 404, productId);

	// Make sure user is product owner or admin if return ErrorResponse
	if (product.owner.toString() !== currentUser.id && currentUser.role !== 'admin')
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update product ${productId}`,
			401
		);

	const deletedProd = await product.remove();
	if (!deletedProd)
		throw new ErrorResponse(`Unable to delete product with id: ${productId}`, 500, productId);
	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc		 Update product image
// @route		 Put /api/v1/products/:productId/image
// @access	 Private
exports.updateProductImage = asyncHandler(async (req, res, next) => {
	// if gallery images are uploaded delete them
	if (req.files.uploadGallery) deleteFiles(req.files.uploadGallery);

	// if no profile image uploaded return ErrorResponse
	if (!req.files.profileImage) {
		throw new ErrorResponse(`Please upload an image`, 400);
	}

	const { productId } = { ...req.params };
	const currentUser = req.user;

	// check make sure product exists
	const product = await Product.findById(productId);
	// if no product return ErrorResponse and delete image from tmp folder
	if (!product) {
		if (req.files.profileImage) deleteFiles(req.files.profileImage);
		throw new ErrorResponse(`Resource not found with id of ${productId}`, 404, productId);
	}

	// Make sure user is product owner or admin if return ErrorResponse
	if (product.owner.toString() !== currentUser.id && currentUser.role !== 'admin') {
		if (req.files.profileImage) deleteFiles(req.files.profileImage);
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update product ${productId}`,
			401
		);
	}

	checkDirectory(`./public/products/${product.name}`);

	// construct path for new image
	const updatedProductImage = {
		image: `./public/products/${product.name}/${req.files.profileImage[0].filename}`,
	};

	const oldProdImage = { path: product.image };

	// update product with new path for image
	const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductImage, {
		new: true,
		runValidators: true,
	});

	// delete old image unless it is default image
	if (oldProdImage.path !== './public/default.png') {
		try {
			deleteFiles([oldProdImage]);
		} catch (err) {}
	}

	// move new image to path from updatedProduct image
	mvFilesFromTmpToDest(req.files.profileImage, [updatedProduct.image]);

	res.status(200).json({
		success: true,
		data: updatedProduct,
	});
});
