class ErrorResponse extends Error {
	constructor(message, statusCode, value) {
		super(message);
		this.statusCode = statusCode;
		if (value) this.value = value;
	}
}

module.exports = ErrorResponse;
