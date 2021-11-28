const User = require('../models/User'),
	ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('../middleware/async'),
	sendEmail = require('../utils/sendEmail'),
	crypto = require('crypto'),
	{ checkFor } = require('../utils/utils'),
	redisClient = require('../configurations/redis');

//  @desc     Register User
//  @route    Post /api/v1/auth/register
//  @access   Public
exports.register = asyncHandler(async (req, res, next) => {
	// check make sure admin is not a role selected while registering
	// TODO: save user profile image to a folder
	checkFor(
		req.body.role === 'admin',
		`Cannot create a user with admin role do not have necessary permissions`,
		401
	);
	// Create user
	const user = await User.create(req.body);

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
	checkFor(req.body.password, 'Cannot update since old password was not validated', 422);
	// check make sure unable to update your role to admin
	checkFor(
		req.body.role === 'admin',
		`Cannot create a user with admin role do not have necessary permissions`,
		422
	);

	let { user } = { ...req };
	user = await User.findByIdAndUpdate(user.id, req.body, { new: true });
	user = await user.save();
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
	// TODO: delete user profile image from a folder
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

// TODO: Add route to update profile Image
