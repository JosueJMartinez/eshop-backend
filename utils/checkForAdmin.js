const ErrorResponse = require('./errorResponse');
const checkForAdmin = (role, method) => {
	if (role === 'admin') {
		throw new ErrorResponse(
			`Cannot ${method} a user with admin role do not have necessary permissions`,
			401
		);
	}
};

module.exports = checkForAdmin;
