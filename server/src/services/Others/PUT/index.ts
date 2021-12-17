import express from 'express';
import { response } from '@/api';
import { query } from '@/loaders/mysql';


export default {
    editSecurityCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;
        const { main, sub } = req.body;
        
        console.log(`[INFO] Editing security category info :: path = ${req.path}`);

        if (!category_idx) response(res, 400, 'Parameter Errors : category_idx does not exist.');
        if (!main) response(res, 400, 'Parameter Errors : main does not exist.');
        if (!sub) response(res, 400, 'Parameter Errors : sub does not exist.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM security_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        if (dbData.length === 0) response(res, 404);

        try {
            dbData = await query('UPDATE security_category set main = ?, sub = ? where idx = ?;', [main, sub, category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        response(res, 200, dbData);
    },
};
