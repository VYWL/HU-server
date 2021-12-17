import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getNetworkCategoryList: async (req: express.Request, res: express.Response) => {
        let dbData;

        console.log(`[INFO] Gathering network category list :: path = ${req.path}`);

        try {
            dbData = await query('SELECT idx, name FROM `network_category` ORDER BY `idx` ASC;');
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        response(res, 200, dbData);
    },

    getNetworkCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;
        
        console.log(`[INFO] Gathering network category info :: path = ${req.path}`);

        if (!category_idx) response(res, 400, 'Parameter Errors : category_idx does not exist.');

        let dbData;

        try {
            dbData = await query('SELECT idx, name FROM network_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        response(res, 200, dbData);
    },
};
