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
	// else if (req.cookies.token) token = req.cookies.token;

	// Make sure token exists
	if (!token) throw new ErrorResponse('Not authorized', 401);
	// decode token then use id from decode
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const userId = decoded.id;

	// check if token is blacklisted first
	const data = await redisClient.get(userId);
	if (data !== null) {
		const parsedData = JSON.parse(data);
		if (parsedData[userId].includes(token)) {
			throw new ErrorResponse('You need to login', 401);
		}
	}
	// const result = await redisClient.lrange('token', 0, 99999999);
	// console.log(result);
	// if (result.indexOf(token) > -1) {
	// 	throw new ErrorResponse('Need to login', 401);
	// }

	// next check make sure user exists in the database if does assign necessary values to req
	req.user = await User.findById(userId);
	req.tokenExp = decoded.exp;
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
