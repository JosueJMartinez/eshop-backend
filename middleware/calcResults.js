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
		let date;

		queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|sum|match|group)\b/g, match => `$${match}`);
		query = JSON.parse(queryStr);
		const period = query.period;
		const arr = [{ $match: query.$match }, { $group: query.$group }];
		date = arr[0].$match.date;
		arr[0].$match.date = { $lt: new Date(date) };
		arr[0].$match.date.$gte = new Date(date);
		if (arr[0].$match.user) arr[0].$match.user = mongoose.Types.ObjectId(arr[0].$match.user);
		if (arr[0].$match.date) {
			if (period === 'day') arr[0].$match.date.$lt.setDate(arr[0].$match.date.$lt + 1);
			else if (period === 'week') arr[0].$match.date.$lt.setDate(arr[0].$match.date.$lt + 7);
			else if (period === 'month') arr[0].$match.date.$lt.setDate(arr[0].$match.date.$lt + 30);
			else arr[0].$match.date.$lt.setDate(arr[0].$match.date.$lt + 365);
		}
		console.log(arr[0].$match);
		const result = await Model.aggregate([arr]);
		res.calcResults = result;
		next();
	});

module.exports = calcResults;
