//
const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		});

		console.log(
			`MongoDB Connected: ${conn.connection.host.underline.bold}`.cyan
		);
	} catch (err) {
		console.log(`Error trying to connect to database`.red.bold, err);
	}
};

module.exports = connectDB;
