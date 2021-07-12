const ErrorResponse = require('../utils/errorResponse');
const _ = require('lodash');

function errorHandler(err, req, res, next) {
	let error = { ...err };
	error.message = err.message;
	if (err.name === 'CastError')
		error = new ErrorResponse(`Resource not found`, 404);

	// Mongoose Duplicate Error
	if (error.code === 11000)
		if (_.isEqual(error.keyPattern, { bootcamp: 1, user: 1 }))
			error = new ErrorResponse(`User already has a review`, 400);
		else
			error = new ErrorResponse(
				`Duplicate name found trying to create this resource`,
				400
			);

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const msg = Object.values(err.errors).map(val => val.message);
		error = new ErrorResponse(msg, 400);
	}

	// JSON Web Token Error
	if (err.name === 'JsonWebTokenError')
		error = new ErrorResponse(`Not authorized`, 401);

	// JSON web expiration error
	if (err.name === 'TokenExpiredError')
		error = new ErrorResponse(`Please log in again`, 401);

	// Server Console log errors
	if (error.statusCode === 404)
		console.log(
			`404 error getting resource with id: ${err.value}`.yellow.underline
				.bold
		);
	else
		console.log(
			`${error.message}: ${error.statusCode}`.red.underline.bold
		);

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
	});
}

module.exports = errorHandler;
