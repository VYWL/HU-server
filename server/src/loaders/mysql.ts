import mysql from 'mysql2/promise';

import { DB_ID, DB_PW, DB_NAME, DB_HOST } from '../config';

export default async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_ID,
            password: DB_PW,
            database: DB_NAME,
        });
	
        console.log('MySQL connection success');
    } catch (err) {
        console.log(err);
    }
    console.log({DB_ID, DB_PW, DB_NAME, DB_HOST});
};
