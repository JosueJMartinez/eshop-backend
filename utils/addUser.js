const addUser = (str, userId) => {
	if (str.length < 3) str = str.replace('}', ` "user": "${userId}"}`);
	else str = str.replace('}', `, "user": "${userId}"}`);
	return str;
};

module.exports = addUser;
