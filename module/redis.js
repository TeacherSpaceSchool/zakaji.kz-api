const Redis = require('ioredis');
let redis;
module.exports.startClientRedis = ()=>{
    redis = new Redis();
}

module.exports.getClientRedis = () => redis