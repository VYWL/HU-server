const envFound = require('dotenv').config();

if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
    // About service
    PORT: Number(process.env.HU_SERVICE_PORT),

    // About DB
    DB_ID: process.env.HU_DATABASE_ID,
    DB_PW: process.env.HU_DATABASE_PW,
    DB_NAME: process.env.HU_DATABASE_NAME,
    DB_HOST: process.env.HU_DATABASE_HOST,
    HU_SOCKET_PORT: Number(process.env.HU_SOCKET_PORT),
    HU_SOCKET_HOST: process.env.HU_SOCKET_HOST,
    FILESERVER_PORT: Number(process.env.HU_FILESERVER_PORT), 
    FILESERVER_HOST: process.env.HU_FILESERVER_HOST, 

    // About Protocol code
    PROCESS_CODE: {
        DEVICE: 0,
        MODULE: 1,
        PROCESS: 2,
        FILEDESCRIPTOR: 3,
        MONITORING_LOG: 4,
        INSPECTION_RESULT: 5,

        // REQUEST
        MONITORING_REQUEST: 6,
        POLICY_REQUEST: 7,
        INSPECTION_REQUEST: 8,
        CHANGE_INTERVAL_REQUEST: 9,
        RESPONSE: 10,
    },
    
};