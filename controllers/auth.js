const { split } = require('lodash');
const Product = require('../models/Product');
const User = require('../models/User'),
	ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('../middleware/async'),
	sendEmail = require('../utils/sendEmail'),
	crypto = require('crypto'),
	{
		deleteFiles,
		mvFilesFromTmpToDest,
		checkDirectory,
		checkFileExists,
		removeFolderIfEmpty,
	} = require('../utils/utils'),
	redisClient = require('../configurations/redis');

//  @desc     Register User
//  @route    Post /api/v1/auth/register
//  @access   Public
exports.register = asyncHandler(async (req, res, next) => {
	// check make sure admin is not a role selected while registering

	if (req.body.role === 'admin') {
		deleteFiles([req.file]);
		throw new ErrorResponse(`You cannot register as an admin`, 400);
	}

	if (req.file)
		req.body.profileImage = `./public/profiles/${req.body.username}/${req.file.filename}`;

	// Create user
	const user = await User.create(req.body);

	if (!user) {
		deleteFiles([req.file]);
		throw new ErrorResponse(`Unable to create user`, 400);
	}
	checkDirectory(`./public/profiles/${req.body.username}`);

	if (req.file) mvFilesFromTmpToDest([req.file], [user.profileImage]);

	sendTokenResponse(user, 200, res);
});

//  @desc     Login User
//  @route    Post /api/v1/auth/login
//  @access   Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	// Validate Email & password
	if (!email || !password) {
		throw new ErrorResponse('Please enter a valid email and password', 400);
	}

	// Check for user
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		throw new ErrorResponse('Invalid credentials', 401);
	}

	// Check if password matches
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		throw new ErrorResponse('Invalid credentials', 401);
	}

	sendTokenResponse(user, 200, res);
});

//  @desc     Logout User
//  @route    Get /api/v1/auth/logout
//  @access   Private
exports.logout = asyncHandler(async (req, res, next) => {
	const { token, tokenExp } = req;

	// Use the set method provided by Redis to insert the token
	// Note: the format being used is to combine 'blacklist_' as
	// a prefix to the token and use it as the key and a boolean,
	// true, as the value.
	// Here we calculate token expiration which is in seconds since Epoch
	// and subtract date.now since Epoch in seconds
	// to get the time of how much to live in the blacklist in seconds.
	await redisClient.setex(
		`blacklist_${token}`,
		tokenExp - Math.round(Date.now() / 1000), // Caculate how much in seconds
		true
	);

	res.json({ success: true, data: {} });
});

//  @desc     Get Current User
//  @route    Get /api/v1/auth/me
//  @access   Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
	const { user } = { ...req };
	const newUser = await User.findById(user._id).populate('orders');
	if (!newUser) throw new ErrorResponse('Current logged in user not found', 401);

	res.status(200).json({ success: true, data: newUser });
});

//  @desc     Update user details
//  @route    Put /api/v1/auth/updateMe
//  @access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
	// Add support to move profile image to a folder if name changes
	// check make sure password is being updated
	const { role, password, profileImage, username } = { ...req.body };
	const updateUser = req.body;
	// check make sure role is not admin while updating
	if (role && role === 'admin') throw new ErrorResponse(`You cannot update as an admin`, 400);
	// if password  or profileImage exists delete it from req.body
	if (password) delete updateUser.password;
	// if (username) throw new ErrorResponse(`You cannot update username`, 400);
	if (profileImage) delete updateUser.profileImage;

	// make sure current user logged in exists
	let user = await User.findById(req.user.id);

	if (!user) throw new ErrorResponse('Current logged in user not found', 401);

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
	// move profileImage to new folder if username is updated
	if (username) {
		if (oldUser.profileImage !== './public/defaultProfile.png')
			mvFilesFromTmpToDest([oldUser.profileImage], [user.profileImage]);
		removeFolderIfEmpty(`./public/profiles/${oldUser.username}`);
	}

	res.status(200).json({ success: true, data: user });
});

//  @desc     Update Password
//  @route    Put /api/v1/auth/updatepassword
//  @access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');
	const { password, newPassword } = { ...req.body };

	if (!user) throw new ErrorResponse('Current logged in user not found', 401);

	// Check if old password matches with database
	if (!(await user.matchPassword(password))) throw new ErrorResponse('Invalid credentials', 401);

	user.password = newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

//  @desc     Forgot password
//  @route    Post /api/v1/auth/forgotpassword
//  @access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const { email } = { ...req.body };
	const user = await User.findOne({ email });

	// check if user exists with that email
	if (!user) throw new ErrorResponse(`No user found with email ${email}`, 404);

	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Password Reset for ${user.name} on FakeStore`,
			message: `Reset URL ${resetUrl}`,
		});
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire == undefined;
		user.save({ validateBeforeSave: false });
		throw new ErrorResponse('Unable to send email', 500);
	}

	res.status(200).json({ success: true, data: `Email sent to ${user.email}` });
});

//  @desc     Delete user account
//  @route    Delete /api/v1/auth/deleteaccount
//  @access   Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	if (!user) throw new ErrorResponse(`User does not exist with id: ${userId}`, 404);

	await user.remove();

	res.status(200).json({ success: true, data: {} });
});

//  @desc     reset password
//  @route    Put /api/v1/auth/resetPassword/:resetToken
//  @access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resetToken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		throw new ErrorResponse(`Not a valid token`, 400);
	}

	// set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send resp
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	res.status(statusCode).json({ success: true, token });
};

// @desc     Update profile image
// @route    Put /api/v1/auth/updateProfileImage
// @access   Private
exports.updateProfileImage = asyncHandler(async (req, res, next) => {
	const newProfileImage = req.file;

	// check make sure file is uploaded
	if (!newProfileImage) throw new ErrorResponse('Please upload a file', 400);

	// check if user exists
	let user = await User.findById(req.user.id);
	if (!user) {
		deleteFiles([newProfileImage.path]);
		throw new ErrorResponse(`User does not exist with id: ${userId}`, 404);
	}
	// make sure directory exists
	checkDirectory(`./public/profiles/${user.username}`);

	// construct new path for newProfileImage
	const updateProfile = {
		profileImage: `./public/profiles/${user.username}/${newProfileImage.filename}`,
	};

	const oldProfileImage = user.profileImage;

	Object.assign(user, updateProfile);

	user = await user.save();

	if (!user) {
		deleteFiles([newProfileImage]);
		throw new ErrorResponse('Unable to update profile image', 500);
	}

	if (oldProfileImage !== './public/defaultProfile.png') deleteFiles([oldProfileImage]);

	mvFilesFromTmpToDest([newProfileImage], [user.profileImage]);

	res.status(200).json({ success: true, data: user });
});
