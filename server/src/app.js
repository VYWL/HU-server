const mysql = require('mysql2/promise');

const dbConnect = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'db',
            user: 'root',
            password: 'root',
            database: 'hurryup_sedr',
        });

        console.log('MySQL connection success');
    } catch (err) {
        console.log(err);
    }
};

dbConnect();
