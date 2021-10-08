const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all users
//  @route    Get /api/v1/auth/users
//  @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
	console.log('hello');
	res.status(200).json(res.advancedResults);
});

//  @desc     Get single user
//  @route    Get /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const { userId } = { ...req.params };
	const user = await User.findById(userId);

	if (!user)
		throw new ErrorResponse(
			`Unable to find a user with id: ${userId}`,
			404,
			userId
		);

	res.status(200).json({ success: true, data: user });
});

//  @desc     Update user
//  @route    Put /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const { userId } = { ...req.params };
	const updateUser = req.body;
	let user = await User.findById(userId);

	if (!user)
		throw new ErrorResponse(
			`Unable to find a user with id: ${userId}`,
			404,
			userId
		);

	user = await User.findByIdAndUpdate(userId, updateUser, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: user });
});

//  @desc     Create a user
//  @route    Post /api/v1/auth/users
//  @access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	const { email } = { ...req.body };
	const newUser = await User.create(req.body);

	res.status(201).json({ success: true, data: newUser });
});

//  @desc     Delete a user
//  @route    Delete /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const userId = req.params.userId;
	const user = await User.findById(userId);

	if (!user) {
		throw new ErrorResponse(`User does not exist with id: ${userId}`, 404);
	}

	await user.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
