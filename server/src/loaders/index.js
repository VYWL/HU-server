import expressLoader from './express.ts';
import mysqlLoader from './mysql.ts';

export default async ({ expressApp }) => {
    // await mysqlLoader();
    // console.log('MySQL Intialized');
    await expressLoader({ app: expressApp });
    console.log('Express Intialized');

    // ... more loaders can be here

    // ... Initialize agenda
    // ... or Redis, or whatever you want
};