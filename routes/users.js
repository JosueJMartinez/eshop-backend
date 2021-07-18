const express = require('express');
const { getUsers } = require('../controllers/users');
const User = require('../models/User');
// const advancedResults = require('../middleware/advancedResults');
// const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// router
// 	.route('/:productId')
// 	.get(getUser)
// 	.put(
// 		// protect, authorize('publisher', 'admin'),
// 		updateUser
// 	)
// .delete(
// 	// protect, authorize('publisher', 'admin'),
// 	deleteUser
// );
router.route('/').get(
	// advancedResults(User, 'Categories', {
	// 	path: 'bootcamp',
	// 	select: 'name description',
	// }),
	getUsers
);
// .post(
// 	// protect, authorize('publisher', 'admin'),
// 	createUser
// );

module.exports = router;
