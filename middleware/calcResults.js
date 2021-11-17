const mongoose = require('mongoose');
const addUser = require('../utils/addUser');
const ErrorResponse = require('../utils/errorResponse'),
	asyncHandler = require('./async'),
	Date = require('../utils/date');
const queryStrReplaceWith$ = require('../utils/queryReplace');

// middleware to calculate results from input and query
const calcResults = input =>
	asyncHandler(async (req, res, next) => {
		// get Model, model and, personal from input
		const { model, Model, personal } = input;
		// get query from req.query
		let { query } = req;
		let date;
		let queryStr = JSON.stringify(query);
		queryStr = queryStrReplaceWith$(queryStr, /\b(gt|gte|lt|lte|in|sum|match|group)\b/g);
		console.log(queryStr);

		query = JSON.parse(queryStr);

		let { $match, $group, period } = { ...query };
		if (!$match) $match = {};
		if (personal) {
			$match = JSON.stringify($match);
			$match = addUser($match, req.user.id);
			$match = JSON.parse($match);
		}

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
