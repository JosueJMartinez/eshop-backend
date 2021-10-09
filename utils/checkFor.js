const ErrorResponse = require('./errorResponse');
const checkFor = (checker, message, errorCode) => {
	if (checker) {
		throw new ErrorResponse(message, errorCode);
	}
};

module.exports = checkFor;
