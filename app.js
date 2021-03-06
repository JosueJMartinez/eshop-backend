const express = require('express'),
	dotenv = require('dotenv'),
	morgan = require('morgan'),
	colors = require('colors'),
	cookieParser = require('cookie-parser'),
	cors = require('cors');

// Custom error handler for errors
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: './configurations/config.env' });

// DB Connection
const connectDB = require('./configurations/db');

const { API_URL, NODE_ENV, PORT, IP } = { ...process.env };

// call and connect to db connection
connectDB();

// Routes plugins
const products = require('./routes/products'),
	categories = require('./routes/categories'),
	orders = require('./routes/orders'),
	users = require('./routes/admin/users'),
	auth = require('./routes/auth'),
	adminOrders = require('./routes/admin/orders');
const app = express();

// Middleware
//================================================
//set body parser
app.use(express.json());

//================================================
// send logs if in development mode
if (NODE_ENV === 'dev') app.use(morgan('dev'));

// Cookieparser middleware
app.use(cookieParser());

// Enable CORS
app.use(cors());

// ===============================================
// Routes
// ===============================================
app.use(`${API_URL}/products`, products);
app.use(`${API_URL}/categories`, categories);
app.use(`${API_URL}/orders`, orders);
app.use(`${API_URL}/admin/users`, users);
app.use(`${API_URL}/admin/orders`, adminOrders);
app.use(`${API_URL}/auth`, auth);
app.use((req, res) => {
	res.status(404).json({ success: false, data: 'page does not exist' });
});

// middleware error handling
app.use(errorHandler);

//server listens on here
app.listen(PORT || 3000, IP || '127.0.0.1', () => {
	console.log(
		`E-commerce App started on port: ${(PORT || '3000').blue.bold.underline} ${'at IP:'.magenta} ${
			(IP || '127.0.0.1').blue.bold.underline
		}`.magenta
	);
});
