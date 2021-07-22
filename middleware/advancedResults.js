const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

const advancedResults = input =>
	asyncHandler(async (req, res, next) => {
		// 	Copy req.query
		const { Model, model, populate } = { ...input };
		const reqQuery = { ...req.query };

		// 	Fields to exclude
		const removeFields = ['select', 'sort', 'page', 'limit'];

		// 	Loop over removeFields and delete them from the reqQuery
		removeFields.forEach(param => delete reqQuery[param]);

		// 	Create query string`
		let queryStr = JSON.stringify(reqQuery);

		// 	Create operators ($gt, $gte, etc)
		queryStr = queryStr.replace(
			/\b(gt|gte|lt|lte|in)\b/g,
			match => `$${match}`
		);

		// 	Find resources
		let query = Model.find(JSON.parse(queryStr));

		// Select fields do this only if select fields are present to limit selection
		if (req.query.select) {
			const fields = req.query.select.replace(/,/g, ' ');
			query.select(fields);
		}

		// Sort
		if (req.query.sort) {
			const sortBy = req.query.sort.replace(/,/g, ' ');
			query.sort(sortBy);
		} else {
			query.sort('-createAt');
		}

		if (populate) {
			query = query.populate(populate);
		}

		// Pagination
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 25;
		const startIdx = limit * (page - 1);
		const endIdx = page * limit;
		const total = await Model.countDocuments();

		query = query.skip(startIdx).limit(limit);

		// 	Executing Query
		const results = await query;

		// Pagination result
		const pagination = {};
		if (endIdx < total) {
			pagination.next = {
				page: page + 1,
				limit,
			};
		}

		if (startIdx > 0) {
			pagination.prev = {
				page: page - 1,
				limit,
			};
		}

		if (!results.length)
			throw new ErrorResponse(`uh oh no more ${model}`, 400);

		res.advancedResults = {
			success: true,
			count: results.length,
			pagination,
			data: results,
		};
		next();
	});

module.exports = advancedResults;
