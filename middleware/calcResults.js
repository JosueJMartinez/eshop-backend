const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('./async'),
	Date = require('../utils/Date');

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

		const { $match, $group, period } = { ...query };
		if ($match) {
			if ($match.date) {
				date = $match.date;
				date = new Date(date);
				$match.dateOrdered = { $gte: new Date(date) };
				delete $match.date;

				if (period === 'day') date.addDays(date, 1);
				else if (period === 'week') date.addDays(date, 7);
				else if (period === 'month') date.addDays(date, 30);
				else date.addDays(date, 365);

				$match.dateOrdered.$lt = date;
			}
			if ($match.user) $match.user = mongoose.Types.ObjectId($match.user);
		}

		if ($group) {
			if ($group._id) {
				if ($group._id === 'day') {
					$group._id = { $dateToString: { format: '%Y-%m-%d', date: '$dateOrdered' } };
				} else if ($group._id === 'week') {
					$group._id = { $dateToString: { format: '%Y-%V', date: '$dateOrdered' } };
				} else if ($group._id === 'month') {
					$group._id = { $dateToString: { format: '%Y-%m', date: '$dateOrdered' } };
				} else {
					$group._id = { $dateToString: { format: '%Y', date: '$dateOrdered' } };
				}
			}
		}
		let result;
		if ($match) result = await Model.aggregate([{ $match }, { $group }]);
		else result = await Model.aggregate([{ $group }]);
		if (result.length === 0) res.calcResults = { data: 'no data found' };
		else res.calcResults = { data: result };
		next();
	});

module.exports = calcResults;
