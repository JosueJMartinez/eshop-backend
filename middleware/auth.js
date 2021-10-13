const jwt = require('jsonwebtoken'),
	asyncHandler = require('./async'),
	ErrorResponse = require('../utils/errorResponse'),
	User = require('../models/User'),
	redisClient = require('../configurations/redis');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	)
		token = req.headers.authorization.split(' ')[1];

	// Make sure token exists
	if (!token) throw new ErrorResponse('Not authorized', 401);
	// decode token then use id from decode
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const userId = decoded.id;
	// ==============================================
	// check if token is blacklisted first
	// ===============================================
	const data = await redisClient.get(`blacklist_${token}`);
	// if it is on the blacklist tell user to relogin
	if (data !== null) {
		throw new ErrorResponse('You need to login', 401);
	}

	// next check make sure user exists in the database if does assign necessary values to req
	req.user = await User.findById(userId);

	// here we get token expiration which sec since Epoch
	// and subtract date.now since Epoch in seconds
	// to get the time of how much to live in the blacklist
	req.tokenExp = decoded.exp - Math.round(Date.now() / 1000);
	req.token = token;
	req.userId = userId;
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
