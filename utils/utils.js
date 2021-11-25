const ErrorResponse = require('./errorResponse');
const fs = require('fs');

exports.checkFor = (checker, message, errorCode) => {
	if (checker) {
		throw new ErrorResponse(message, errorCode || 500);
	}
};

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
// @param object files to move
// @param object destDirectory to move files to
exports.mvFilesFromTmpToDest = (images, pathes) => {
	images.forEach(async (image, i) => {
		fs.rename(image.path, pathes[i], err => {
			if (err) throw new ErrorResponse(`Unable to move image to new location`, 500);
		});
	});
};

exports.deleteFiles = files => {
	files.forEach(file => {
		fs.unlinkSync(file.path);
	});
};
