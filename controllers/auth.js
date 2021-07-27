const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// const sendEmail = require('../utils/sendEmail');
// const crypto = require('crypto');

//  @desc     Register User
//  @route    Post /api/v1/auth/register
//  @access   Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResponse(user, 200, res);
});

//  @desc     Login User
//  @route    Post /api/v1/auth/login
//  @access   Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	// Validate Email & password
	if (!email || !password) {
		throw new ErrorResponse(
			'Please enter a valid email and password',
			400
		);
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
	res.cookie('token', 'none', {
		expires: new Date(Date.now + 3 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ success: true, data: {} });
});

// //  @desc     Get Current User
// //  @route    Get /api/v1/auth/me
// //  @access   Private
// exports.getCurrentUser = asyncHandler(async (req, res, next) => {
// 	const { user } = { ...req };
// 	if (!user)
// 		throw new ErrorResponse('Current logged in user not found', 401);
// 	res.status(200).json({ success: true, data: user });
// });

// //  @desc     Update user details
// //  @route    Put /api/v1/auth/updateMe
// //  @access   Private
// exports.updateUser = asyncHandler(async (req, res, next) => {
// 	let { user } = { ...req };
// 	const { name, email } = { ...req.body };

// 	if (!user)
// 		throw new ErrorResponse('Current logged in user not found', 401);

// 	user = await User.findById(user.id);

// 	if (name) user.name = name;

// 	if (email) user.email = email;

// 	user = await user.save();
// 	res.status(200).json({ success: true, data: user });
// });

// //  @desc     Update Password
// //  @route    Put /api/v1/auth/updatepassword
// //  @access   Private
// exports.updatePassword = asyncHandler(async (req, res, next) => {
// 	const user = await User.findById(req.user.id).select('+password');
// 	const { password, newPassword } = { ...req.body };

// 	if (!user)
// 		throw new ErrorResponse('Current logged in user not found', 401);

// 	// Check if old password matches with database
// 	if (!(await user.matchPassword(password)))
// 		throw new ErrorResponse('Invalid credentials', 401);

// 	user.password = newPassword;
// 	await user.save();

// 	sendTokenResponse(user, 200, res);
// });

//  @desc     Forgot password
//  @route    Post /api/v1/auth/forgotpassword
//  @access   Public
// exports.forgotPassword = asyncHandler(async (req, res, next) => {
// 	const { email } = { ...req.body };
// 	const user = await User.findOne({ email });

// 	// check if user exists with that email
// 	if (!user)
// 		throw new ErrorResponse(`No user found with email ${email}`, 404);

// 	const resetToken = user.getResetPasswordToken();

// 	await user.save({ validateBeforeSave: false });

// 	// Create reset url
// 	const resetUrl = `${req.protocol}://${req.get(
// 		'host'
// 	)}/api/v1/auth/resetPassword/${resetToken}`;

// 	try {
// 		await sendEmail({
// 			email: user.email,
// 			subject: `Reset Password DevCamper ${user.name}`,
// 			message: `Make a put request to ${resetUrl}`,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 		user.resetPasswordToken = undefined;
// 		user.resetPasswordExpire == undefined;
// 		user.save({ validateBeforeSave: false });
// 		throw new ErrorResponse('Unable to send email', 500);
// 	}

// 	res.status(200).json({ success: true, data: 'Email sent' });
// });

//  @desc     Delete user account
//  @route    Delete /api/v1/auth/deleteaccount
//  @access   Private
// exports.deleteUser = asyncHandler(async (req, res, next) => {
// 	const user = await User.findById(req.user.id);

// 	if (!user)
// 		throw new ErrorResponse(`User does not exist with id: ${userId}`, 404);

// 	await user.remove();

// 	res.status(200).json({ success: true, data: {} });
// });

//  @desc     reset password
//  @route    Put /api/v1/auth/resetPassword/:resetToken
//  @access   Public
// exports.resetPassword = asyncHandler(async (req, res, next) => {
// 	// get hashed token
// 	const resetPasswordToken = crypto
// 		.createHash('sha256')
// 		.update(req.params.resetToken)
// 		.digest('hex');

// 	const user = await User.findOne({
// 		resetPasswordToken,
// 		resetPasswordExpire: { $gt: Date.now() },
// 	});

// 	if (!user) {
// 		throw new ErrorResponse(`Not a valid token`, 400);
// 	}

// 	// set new password
// 	user.password = req.body.password;
// 	user.resetPasswordToken = undefined;
// 	user.resetPasswordExpire = undefined;

// 	await user.save();

// 	sendTokenResponse(user, 200, res);
// });

// // Get token from model, create cookie and send resp
// const sendTokenResponse = (user, statusCode, res) => {
// 	// Create token
// 	const token = user.getSignedJwtToken();

// 	const options = {
// 		expires: new Date(
// 			Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
// 		),
// 		httpOnly: true,
// 	};

// 	if (process.env.NODE_ENV === 'production') options.secure = true;

// 	res
// 		.status(statusCode)
// 		.cookie('token', token, options)
// 		.json({ success: true, token });
// };
