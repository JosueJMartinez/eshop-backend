const express = require('express'),
	dotenv = require('dotenv'),
	morgan = require('morgan'),
	colors = require('colors');

// Custom error handler for errors
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: './configurations/config.env' });

// DB Connection
const connectDB = require('./configurations/db');

const { API_URL, NODE_ENV, PORT, IP } = { ...process.env };

// call and connect to db connection
connectDB();

// Routes
const products = require('./routes/products');

const app = express();

// Middleware
//================================================
//set body parser
app.use(express.json());

//================================================
// send logs if in development mode
if (NODE_ENV === 'dev') app.use(morgan('dev'));

// ===============================================
// Routes
// ===============================================
app.use(`${API_URL}/products`, products);

// middleware error handling
app.use(errorHandler);

//server listens on here
app.listen(PORT || 3000, IP || '127.0.0.1', () => {
	console.log(
		`E-commerce App started on port: ${(PORT || '3000').blue} at IP: ${
			(IP || '127.0.0.1').blue
		}`.magenta
	);
});
