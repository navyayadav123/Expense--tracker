// redisClient.js
const redis = require('redis');

const redisClient = redis.createClient({

  url: 'redis://localhost:6379', // or use your Redis Cloud URL
});

// redisClient.connect().catch(console.error);

redisClient.on('connect', () => {
  console.log(' Connected to Redis');
});

redisClient.on('error', (err) => {
  console.log(' Redis error: ', err);
});

(async () => {
  try {
    await redisClient.connect(); // important!
  } catch (err) {
    console.error(' Redis connection error:', err);
  }
})();
module.exports = redisClient;
