const jwt = require('jsonwebtoken'),
	asyncHandler = require('./async'),
	ErrorResponse = require('../utils/errorResponse'),
	User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	)
		token = req.headers.authorization.split(' ')[1];
	else if (req.cookies.token) token = req.cookies.token;

	// Make sure token exists
	if (!token) throw new ErrorResponse('Not authorized', 401);
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	req.user = await User.findById(decoded.id);
	if (!req.user)
		throw new ErrorResponse(
			'Uh oh something went wrong logged in user not found',
			404
		);
	next();
});

// Grant access to specific roles
exports.authorize =
	(...roles) =>
	(req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new ErrorResponse(
				`User role '${req.user.role}' is not authorized to access this`,
				403
			);
		}
		next();
	};
