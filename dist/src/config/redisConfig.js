"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
};
exports.default = redisConfig;
