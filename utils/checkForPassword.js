const ErrorResponse = require('./errorResponse');
const checkForPassword = password => {
	if (password) {
		throw new ErrorResponse(
			'Cannot update since old password was not validated',
			422
		);
	}
};

module.exports = checkForPassword;
