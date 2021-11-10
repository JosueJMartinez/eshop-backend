const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('./async');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { model, Model } = input;
		// get query from req.query
		let { query } = req;
		let queryStr = JSON.stringify(query);

		queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|sum|match|group)\b/g, match => `$${match}`);
		query = JSON.parse(queryStr);

		const arr = [{ $match: query.$match }, { $group: query.$group }];

		if (arr[0].$match.user) arr[0].$match.user = mongoose.Types.ObjectId(arr[0].$match.user);

		const result = await Model.aggregate([arr]);
		res.calcResults = result;
		next();
	});

module.exports = calcResults;
