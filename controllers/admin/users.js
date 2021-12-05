const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const { deleteFiles, checkDirectory, mvFilesFromTmpToDest } = require('../../utils/utils');
// const { checkFor } = require('../../utils/utils');

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
	if (req.body.password) {
		throw new ErrorResponse(`Password cannot be updated`, 400);
	}
	// checkFor(req.body.password, 'Cannot update since old password was not validated', 422);

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
	if (req.file)
		req.body.profileImage = `./public/profiles/${req.body.username}/${req.file.filename}`;

	const newUser = await User.create(req.body);

	if (!newUser) {
		deleteFiles([req.file]);
		throw new ErrorResponse(`Unable to create a new user`, 400);
	}

	checkDirectory(`./public/profiles/${req.body.username}`);

	if (req.file) mvFilesFromTmpToDest([req.file], [newUser.profileImage]);

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
