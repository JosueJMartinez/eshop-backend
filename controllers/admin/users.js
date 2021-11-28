const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const { checkFor } = require('../../utils/utils');

//  @desc     Get all users
//  @route    Get /api/v1/auth/users
//  @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//  @desc     Get single user
//  @route    Get /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const { userId } = { ...req.params };
	const user = await User.findById(userId);
	if (!user) throw new ErrorResponse(`Unable to find a user with id: ${userId}`, 404, userId);

	res.status(200).json({ success: true, data: user });
});

//  @desc     Update user
//  @route    Put /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	// TODO: add move profile image to new folder if name changes
	// while updating user check make sure password is not being updated
	checkFor(req.body.password, 'Cannot update since old password was not validated', 422);

	const { userId } = { ...req.params };
	const updateUser = req.body;
	let user = await User.findById(userId);

	if (!user) throw new ErrorResponse(`Unable to find a user with id: ${userId}`, 404, userId);

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
	// TODO: save user profile image to a folder
	const newUser = await User.create(req.body);

	res.status(201).json({ success: true, data: newUser });
});

//  @desc     Delete a user
//  @route    Delete /api/v1/auth/users/:userId
//  @access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	// TODO: delete user profile image from a folder
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

// TODO: add route to update user profile image
