const express = require('express'),
	dotenv = require('dotenv');

dotenv.config({ path: './configurations/config.env' });

const app = express();

app.get('/', (req, res) => {
	res.send('hello world');
});

//server listens on here
app.listen(process.env.PORT || 3000, process.env.IP || '127.0.0.1', () => {
	console.log(
		`YelpCamp App started on port: ${process.env.PORT || 3000} at IP: ${
			process.env.IP || '127.0.0.1'
		}`
	);
});
