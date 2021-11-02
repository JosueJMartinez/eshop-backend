const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { model, Model } = input;
		// get query from req.query
		const { query } = req;

		// fields to exclude from query
		const exclude = [];

		// return sum from orders totalPrice
		// const sum = await Model.aggregate([
		// 	{
		// 		$match: {
		// 			user: userId,
		// 		},
		// 	},
		// 	{
		// 		$group: {
		// 			_id: null,
		// 			result: { $sum: '$totalPrice' },
		// 		},
		// 	},
		// ]);
		console.log(query);
		next();
	});

module.exports = calcResults;
