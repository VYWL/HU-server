import expressLoader from './express.ts';
import { mysqlLoader } from './mysql.ts';
import socketLoader from './socket.js';
import fileServerLoader from './fileServer.js';

export default async ({ expressApp }) => {
    await mysqlLoader();
    console.log('MySQL Intialized');
    await expressLoader({ app: expressApp });
    console.log('Express Intialized');
    await socketLoader().catch(console.log);
    console.log('Socket Connection Intialized');
    await fileServerLoader().catch(console.log);
    console.log('File server Connection Intialized');

    // ... more loaders can be here

    // ... Initialize agenda
    // ... or Redis, or whatever you want
};
