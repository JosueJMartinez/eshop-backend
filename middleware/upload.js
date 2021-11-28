const multer = require('multer');
const { checkDirectory } = require('../utils/utils');

const storage = multer.diskStorage({
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + file.originalname);
	},
	destination: function (req, file, cb) {
		cb(null, './public/tmp');
	},
});

const imageFilter = function (req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};

// @desc middleware to upload the images to temp folder
// @return {void}
exports.upload = multer({ storage: storage, fileFilter: imageFilter }).fields([
	{ name: 'profileImage', maxCount: 1 },
	{ name: 'uploadProdGallery', maxCount: 10 },
]);
