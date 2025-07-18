const redisClient = require('./redisClient');

(async () => {
  await redisClient.set('testkey', 'testvalue', { EX: 10 });
  const value = await redisClient.get('testkey');
  console.log('Test value:', value);
  process.exit();
})();