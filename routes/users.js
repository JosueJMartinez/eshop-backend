const express = require('express');
const {
	getUser,
	getUsers,
	createUser,
	deleteUser,
	updateUser,
} = require('../controllers/users');
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/:userId').get(getUser).put(updateUser).delete(deleteUser);
router
	.route('/')
	.get(advancedResults({ Model: User, model: 'Users' }), getUsers)
	.post(createUser);

module.exports = router;
