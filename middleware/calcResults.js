const ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('./async');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { model, Model } = input;
		// get query from req.query
		let { query } = req;
		console.log(query);
		let queryStr = JSON.stringify(query);

		queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|sum|match|group)\b/g, match => `$${match}`);
		query = JSON.parse(queryStr);
		console.log(query);

		const sum = await Model.aggregate([query]);
		res.calcResults = sum;
		next();
	});

module.exports = calcResults;
