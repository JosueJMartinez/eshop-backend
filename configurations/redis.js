const redis = require('async-redis'); // ES6 +

const redisClient = redis.createClient({
	host: process.env.REDIS_HOSTNAME,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PW,
});
// process.env.REDIS_URL is the redis url config variable name on heroku.
// if local use redis.createClient()
redisClient.on('connect', () => {
	console.log(
		`Redis connected: ${process.env.REDIS_HOSTNAME}`.cyan.bold.underline
	);
});
redisClient.on('error', error => {
	console.log('Redis not connected', error);
});

module.exports = redisClient;
