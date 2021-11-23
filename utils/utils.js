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
