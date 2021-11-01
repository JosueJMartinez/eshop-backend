const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { Model, model, personal } = input;
		// get query from req.query
		const { query } = req;
		// get user from req.user
		const { user } = req;
		// get user id from user
		const { id: userId } = user;

		// return sum from orders totalPrice
		const sum = await Model.aggregate([
			{
				$match: {
					user: userId,
					...query,
				},
			},
			{
				$group: {
					_id: null,
					sum: { $sum: '$totalPrice' },
				},
			},
		]);
	});
