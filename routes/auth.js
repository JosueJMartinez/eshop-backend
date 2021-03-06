const express = require('express');
const {
	register,
	login,
	logout,
	getCurrentUser,
	forgotPassword,
	resetPassword,
	updateUser,
	updatePassword,
	deleteUser,
	updateProfileImage,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();

router.route('/register').post(upload.single('profileImage'), register);
router.route('/login').post(login);
router.route('/logout').get(protect, logout);
router.route('/me').get(protect, getCurrentUser);
router.route('/updateMe').put(protect, updateUser);
router.route('/updatePassword').put(protect, updatePassword);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);
router.route('/deleteaccount').delete(protect, deleteUser);
router.route('/updateProfileImage').put(protect, upload.single('profileImage'), updateProfileImage);

module.exports = router;
