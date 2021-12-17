import express from 'express';
import { response } from '@/api';
import { query } from '@/loaders/mysql';

export default {
    addSecurityCategoryInfo: async (req: express.Request, res: express.Response) => {
        const { main, sub } = req.body;
        
        console.log(`[INFO] Adding security category info :: path = ${req.path}`);

        if (!main || !sub) response(res, 400, 'Parameter Errors : name does not exist.');

        let dbData;

        try {
            dbData = await query('INSERT INTO security_category(main, sub) values(?, ?);', [main, sub]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        response(res, 200, dbData);
    },
};
