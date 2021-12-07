import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    editNetworkCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;
        const { name } = req.body;

        if (!category_idx) response(res, 400, 'Parameter Errors : category_idx does not exist.');
        if (!name) response(res, 400, 'Parameter Errors : name does not exist.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM network_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        if (dbData.length === 0) response(res, 404);

        try {
            dbData = await query('UPDATE network_category set name = ? where idx = ?;', [name, category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        response(res, 200, dbData);
    },
};
