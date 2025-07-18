// utils/cache.js
const redisClient = require('../redisClient'); // Adjust the path if needed

// Fetch data from Redis cache
async function getCache(key) {
  try {
    const data = await redisClient.get(key);
    console.log(' Raw Redis data:', data);

    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis GET error:', err);
    return null;
  }
}

// Save data into Redis cache
async function setCache(key, value, ttl = 3600) {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    console.error(' Redis SET error:', err);
  }
}

// Delete cache
async function deleteCache(key) {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error(' Redis DEL error:', err);
  }
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
