const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//  @desc     Get all courses
//  @route    Get /api/v1/courses
//  @route    Get /api/v1/bootcamps/:bootId/courses
//  @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	// let query;
	const { bootcampId } = { ...req.params };
	if (bootcampId) {
		const courses = await Course.find({ bootcamp: bootcampId });
		res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//  @desc     Get one course
//  @route    Get /api/v1/courses/:courseId
//  @access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const { courseId } = { ...req.params };
	const course = await Course.findById(courseId).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!course)
		throw new ErrorResponse(
			`1. Resource not found with id of ${courseId}`,
			404,
			courseId
		);

	res.status(200).json({
		success: true,
		data: course,
	});
});

//  @desc     Add a single Course
//  @route    Post /api/v1/bootcamps/:bootcampId/courses
//  @access   Private
exports.createCourse = asyncHandler(async (req, res, next) => {
	const { bootcampId } = { ...req.params };
	const foundBootCamp = await Bootcamp.findById(bootcampId);
	const currentUser = req.user;
	// check for bootcamp exists before creating course
	if (!foundBootCamp) {
		throw new ErrorResponse(
			`Resource not found with id of ${bootcampId}`,
			404,
			bootcampId
		);
	}

	// Make sure user is owner of bootcamp to create course
	if (
		foundBootCamp.user.toString() !== currentUser.id &&
		currentUser.role !== 'admin'
	)
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to create course for bootcamp ${bootcampId}`,
			401
		);

	const newCourse = new Course({
		bootcamp: bootcampId,
		user: req.user.id,
		...req.body,
	});
	const addedCourse = await newCourse.save();

	res.status(201).json({
		success: true,
		data: addedCourse,
	});
});

//  @desc     Update Course
//  @route    Put /api/v1/courses/:courseId
//  @access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	const { courseId } = { ...req.params };
	const currentUser = req.user;
	const updateCourse = req.body;
	let course = await Course.findById(courseId);
	if (!course)
		throw new ErrorResponse(
			`Resource not found with id of ${courseId}`,
			404,
			courseId
		);

	// Make sure user is course owner or admin if return ErrorResponse
	if (
		course.user.toString() !== currentUser.id &&
		currentUser.role !== 'admin'
	)
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update course ${courseId}`,
			401
		);

	course = await Course.findByIdAndUpdate(courseId, updateCourse, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

//  @desc     Delete course
//  @route    Delete /api/v1/courses/:courseId
//  @access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const { courseId } = { ...req.params };
	const course = await Course.findById(courseId);
	const currentUser = req.user;

	if (!course)
		throw new ErrorResponse(
			`Resource not found with id of ${courseId}`,
			404,
			courseId
		);

	// Make sure user is course owner or admin if return ErrorResponse
	if (
		course.user.toString() !== currentUser.id &&
		currentUser.role !== 'admin'
	)
		throw new ErrorResponse(
			`User ${req.user.id} is not authorized to update course ${courseId}`,
			401
		);

	await course.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
