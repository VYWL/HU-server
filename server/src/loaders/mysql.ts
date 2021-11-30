import { List } from 'lodash';
import mysql from 'mysql2/promise';

import { DB_ID, DB_PW, DB_NAME, DB_HOST } from '../config';

var connection;

export const query = async (queryStr: String, paramArr?: Array<any>) => {
    let ret, _;

    if (paramArr) [ret, _] = await connection.query(queryStr, paramArr);
    else [ret, _] = await connection.query(queryStr);

    return ret;
};

export const mysqlLoader = async () => {
    try {
        connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_ID,
            password: DB_PW,
            database: DB_NAME,
            charset: 'utf8mb4',
        });
        console.log('MySQL connection success');
    } catch (err) {
        console.log(err);
    }
};
