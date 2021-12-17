import express from 'express';
import { response } from '@/api';
import { query } from '@/loaders/mysql';

export default {
    deleteSecurityCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = Number(req.params.category_idx ?? -1);
        
        console.log(`[INFO] Removing security category info :: path = ${req.path}`);

        if (category_idx === -1) response(res, 400, 'Parameter Errors : category_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM security_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            response(res, 404);
        }

        try {
            dbData = await query('DELETE FROM security_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        response(res, 200, {});
    },
};
