Date.prototype.addDays = (date, days) => date.setDate(date.getDate() + days);

Date.prototype.getWeekNumber = date => {
	let d = new Date(date);
	d.setHours(0, 0, 0);
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7);
};

module.exports = Date;
