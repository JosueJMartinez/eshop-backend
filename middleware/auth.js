const jwt = require('jsonwebtoken'),
	asyncHandler = require('./async'),
	ErrorResponse = require('../utils/errorResponse'),
	User = require('../models/User'),
	redisClient = require('../configurations/redis');

// Protect middleware
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
		token = req.headers.authorization.split(' ')[1];

	// Make sure token exists
	if (!token) throw new ErrorResponse('Please login', 401);

	// decode token then use id from decode
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const userId = decoded.id;

	// ==============================================
	// check if token is blacklisted first
	// ===============================================

	// look for it in the Redis Database
	const redisData = await redisClient.get(`blacklist_${token}`);

	// if it is on the blacklist tell user to relogin
	if (redisData) throw new ErrorResponse('You need to login again', 401);

	// next check make sure user exists in the database if does assign necessary values to req
	req.user = await User.findById(userId);

	// Check if is logout route then
	// we pass the token and tokenExp along in the req for logout
	if (req.originalUrl === '/api/v1/auth/logout') {
		req.tokenExp = decoded.exp;
		req.token = token;
	}

	if (!req.user) throw new ErrorResponse('Need to be logged in', 401);

	next();
});

// Grant access to specific roles
exports.authorize =
	(...roles) =>
	(req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new ErrorResponse(`User role '${req.user.role}' is not authorized to access this`, 403);
		}
		next();
	};
