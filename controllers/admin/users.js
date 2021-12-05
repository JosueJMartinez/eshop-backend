const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const {
	deleteFiles,
	checkDirectory,
	mvFilesFromTmpToDest,
	checkFileExists,
	removeFolderIfEmpty,
} = require('../../utils/utils');

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
	const { password, profileImage, username } = { ...req.body };

	// if password  or profileImage exists delete it from req.body
	if (password) delete updateUser.password;
	if (profileImage) delete updateUser.profileImage;

	const { userId } = { ...req.params };
	const updateUser = req.body;
	let user = await User.findById(userId);

	if (!user) throw new ErrorResponse(`Unable to find a user with id: ${userId}`, 404, userId);

	const oldUser = { ...user._doc };
	// if username is updated, update profileImage path with new name
	if (username) {
		checkDirectory(`./public/profiles/${username}`);
		// if username updated update profileImage path with new name
		if (user.profileImage !== './public/defaultProfile.png' && checkFileExists(user.profileImage))
			req.body.profileImage = `./public/profiles/${username}/${user.profileImage.split('/').pop()}`;
		else req.body.profileImage = `./public/defaultProfile.png`;
	}
	// move req.body obj to user obj
	Object.assign(user, req.body);

	user = await user.save();

	if (username) {
		if (oldUser.profileImage !== './public/defaultProfile.png')
			mvFilesFromTmpToDest([oldUser.profileImage], [user.profileImage]);
		removeFolderIfEmpty(`./public/profiles/${oldUser.username}`);
	}

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
exports.updateUserProfileImage = asyncHandler(async (req, res, next) => {
	const { userId } = { ...req.params };
	const newProfileImage = req.file;

	// check make file is uploaded
	if (!newProfileImage) throw new ErrorResponse(`Please upload a file`, 400);

	let user = await User.findById(userId);

	if (!user) {
		deleteFiles([newProfileImage]);
		throw new ErrorResponse(`Unable to find a user with id: ${userId}`, 404, userId);
	}

	// check make sure user directory exists if not create it
	checkDirectory(`./public/profiles/${user.username}`);

	const updateProfile = {
		profileImage: `./public/profiles/${user.username}/${newProfileImage.filename}`,
	};

	const oldProfileImage = user.profileImage;
	Object.assign(user, updateProfile);
	user = await user.save();
	if (!user) {
		deleteFiles([newProfileImage]);
		throw new ErrorResponse(`Unable to update user profile image`, 400);
	}

	if (oldProfileImage !== './public/defaultProfile.png') deleteFiles([oldProfileImage]);

	mvFilesFromTmpToDest([newProfileImage], [user.profileImage]);

	res.status(200).json({ success: true, data: user });
});
