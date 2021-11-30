const envFound = require('dotenv').config();

if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
    // About service
    PORT: Number(process.env.HU_SERVICE_PORT),

    // About API URL

    // About DB
    DB_ID: process.env.HU_DATABASE_ID,
    DB_PW: process.env.HU_DATABASE_PW,
    DB_NAME: process.env.HU_DATABASE_NAME,
    DB_HOST: process.env.HU_DATABASE_HOST,
    HU_SOCKET_PORT: Number(process.env.HU_SOCKET_PORT),
    HU_SOCKET_HOST: process.env.HU_SOCKET_HOST,
};