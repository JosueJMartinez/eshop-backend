const dotenv = require('dotenv'),
	redis = require('async-redis'), // ES6 +
	{ exec } = require('child_process'); // to start the redis database in development
/*// for windows user import {execFile} from 'child_process';        
// for ES5 users
const redis = require('redis')*/
// if in development mode use Redis file attached
// start redis as a child process

// if (process.env.NODE_ENV === 'dev') {
// 	const puts = (error, stdout) => {
// 		console.log(error);
// 		console.log(stdout);
// 	};
// 	exec('redis/src/redis-server redis/redis.conf', puts);
// }
/* for window implementation
console.log(exec);
execFile('redis/redis-server.exe', (error, stdout) => {
	if (error) {
		throw error;
	}
	console.log(stdout);
});

*/
dotenv.config({
	path: `${process.env.INIT_CWD}/configurations/config.env`,
});
const redisClient = redis.createClient({
	host: process.env.REDIS_HOSTNAME,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PW,
});
// process.env.REDIS_URL is the redis url config variable name on heroku.
// if local use redis.createClient()
redisClient.on('connect', () => {
	console.log('Redis client connected'.cyan.bold.underline);
});
redisClient.on('error', error => {
	console.log('Redis not connected', error);
});

module.exports = redisClient;
