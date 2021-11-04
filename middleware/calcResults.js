const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { model, Model } = input;
		// get query from req.query
		const { params } = req;

		const { matchE, matchF, group } = params;

		// create an obj query with $group and $match as fields that are objects
		const query = {
			$group: {},
			$match: {},
		};

		console.log(matchE, matchF, group);

		// fields to exclude from query
		const exclude = [];

		// return sum from orders totalPrice
		const sum = await Model.aggregate([
			{
				$match: {
					user: userId,
				},
			},
			{
				$group: {
					_id: null,
					result: { $sum: '$totalPrice' },
				},
			},
		]);
		// console.log(query);
		next();
	});

module.exports = calcResults;
