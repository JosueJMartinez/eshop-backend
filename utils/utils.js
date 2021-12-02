const ErrorResponse = require('./errorResponse');
const fs = require('fs');

// exports.checkFor = (checker, message, errorCode) => {
// 	if (checker) {
// 		throw new ErrorResponse(message, errorCode || 500);
// 	}
// };

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

// @desc Moves files from one directory to another
// @param images object files to move
// @param pathes arr destDirectory to move files to
exports.mvFilesFromTmpToDest = (files, pathes) => {
	if (typeof files[0] === 'object' && files[0] !== null)
		files.forEach(async (file, i) => {
			fs.renameSync(file.path, pathes[i]);
		});
	else if (typeof files[0] === 'string' && files[0] !== null)
		files.forEach(async (file, i) => {
			fs.renameSync(file, pathes[i]);
		});
};

// @desc Removes files from tmp directory
// @param array of pathes to remove
exports.deleteFiles = files => {
	if (typeof files[0] === 'object' && files[0] !== null)
		files.forEach(file => {
			fs.unlinkSync(file.path);
		});
	else if (typeof files[0] === 'string' && files[0] !== null)
		files.forEach(async (file, i) => {
			fs.unlinkSync(file);
		});
};

// @desc Checks to see if the file exists
// @param string of file path to check
// @returns boolean true or false
exports.checkFileExists = filePath => {
	return fs.existsSync(filePath);
};

// @desc Removes Image/Images from Object
// @param object to remove image/images from
exports.removeImagesFromObj = obj => {
	if (obj.image) delete obj.image;
	if (obj.images) delete obj.images;
};

// @desc Remove Folder if Empty
// @param string path to remove
exports.removeFolderIfEmpty = path => {
	const files = fs.readdirSync(path);
	if (!files.length) fs.rmSync(path, { recursive: true });
};
