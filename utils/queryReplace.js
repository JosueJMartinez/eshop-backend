const queryStrReplaceWith$ = (str, regex) => {
	return str.replace(regex, match => `$${match}`);
};

module.exports = queryStrReplaceWith$;
