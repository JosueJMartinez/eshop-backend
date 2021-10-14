const redis = require('async-redis');

// Create client and provide host, port, and password to your Redis Client
const redisClient = redis.createClient({
	host: process.env.REDIS_HOSTNAME,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PW,
});

// Shows successful connection to Redis Client
redisClient.on('connect', () => {
	console.log(
		`Redis connected: ${process.env.REDIS_HOSTNAME.underline.bold}`.cyan
	);
});

// Shows unsuccessful connection to Redis Client
redisClient.on('error', error => {
	console.log('Redis not connected', error);
});

module.exports = redisClient;
