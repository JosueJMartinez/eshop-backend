const ErrorResponse = require('./errorResponse');
const fs = require('fs');

exports.checkFor = (checker, message, errorCode) => {
	if (checker) {
		throw new ErrorResponse(message, errorCode || 500);
	}
};

// @desc Checks if directory exists if not creates it
// @param string directory to check
exports.checkDirectory = (dir, i = 0) => {
	const arr = dir.split('/');
	if (arr[i] === '..' || arr[i] === '.') {
		if (arr[i + 1]) return this.checkDirectory(dir, i + 1);
		return;
	}
	// convert array to directory string
	const newArray = arr.slice(0, i + 1);
	const subDir = newArray.join('/');

	if (!fs.existsSync(subDir)) {
		fs.mkdirSync(subDir);
	}
	if (arr[i + 1]) return this.checkDirectory(dir, i + 1);
	return;
};

// Moves files from one directory to another
// @param images object files to move
// @param pathes arr destDirectory to move files to
exports.mvFilesFromTmpToDest = (images, pathes) => {
	images.forEach(async (image, i) => {
		fs.renameSync(image.path, pathes[i]);
	});
};

// @desc Removes files from tmp directory
// @param array of pathes to remove
exports.deleteFiles = files => {
	files.forEach(file => {
		fs.unlinkSync(file.path);
	});
};

// @desc Checks to see if the file exists
// @param string of file path to check
// @returns boolean true or false
exports.checkFileExists = filePath => {
	return fs.existsSync(filePath);
};
