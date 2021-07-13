const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all products
//  @route    Get /api/v1/products
//  @route    Get /api/v1/products
//  @access   Public
exports.getProducts = asyncHandler(async (req, res, next) => {
	const products = await Product.find();
	res.status(200).json({
		success: true,
		count: products.length,
		data: products,
	});
});

//  @desc     Get one product
//  @route    Get /api/v1/products/:productId
//  @access   Public
exports.getProduct = asyncHandler(async (req, res, next) => {
	const { productId } = { ...req.params };
	const product = await Product.findById(productId);

	if (!product)
		throw new ErrorResponse(
			`1. Resource not found with id of ${productId}`,
			404,
			productId
		);

	res.status(200).json({
		success: true,
		data: product,
	});
});

//  @desc     Add a single Product
//  @route    Post /api/v1/products
//  @access   Private
exports.createProduct = asyncHandler(async (req, res, next) => {
	const newProduct = new Product({
		...req.body,
	});
	const addedProduct = await newProduct.save();

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
	// const currentUser = req.user;
	const updateProduct = req.body;
	let product = await Product.findById(productId);
	if (!product)
		throw new ErrorResponse(
			`Resource not found with id of ${productId}`,
			404,
			productId
		);

	// Make sure user is product owner or admin if return ErrorResponse
	// if (
	// 	product.user.toString() !== currentUser.id &&
	// 	currentUser.role !== 'admin'
	// )
	// 	throw new ErrorResponse(
	// 		`User ${req.user.id} is not authorized to update product ${productId}`,
	// 		401
	// 	);

	product = await Product.findByIdAndUpdate(productId, updateProduct, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: product,
	});
});

//  @desc     Delete product
//  @route    Delete /api/v1/products/:productId
//  @access   Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
	const { productId } = { ...req.params };
	const product = await Product.findById(productId);
	// const currentUser = req.user;

	if (!product)
		throw new ErrorResponse(
			`Resource not found with id of ${productId}`,
			404,
			productId
		);

	// // Make sure user is product owner or admin if return ErrorResponse
	// if (
	// 	product.user.toString() !== currentUser.id &&
	// 	currentUser.role !== 'admin'
	// )
	// 	throw new ErrorResponse(
	// 		`User ${req.user.id} is not authorized to update product ${productId}`,
	// 		401
	// 	);

	await product.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
