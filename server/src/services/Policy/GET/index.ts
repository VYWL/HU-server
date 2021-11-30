import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getPolicyList: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = limit * (page - 1);
        let dbData;

        try {
            dbData = await query(
                'SELECT p.idx as idx, s.main as main, s.sub as sub, p.classify as classify, p.name as name, p.description as description\
                FROM policy p\
                LEFT JOIN security_category s\
                ON p.security_category_idx = s.idx \
                ORDER BY p.idx ASC \
                LIMIT ? OFFSET ?;',
                [limit, offset]
            );
        } catch (err) {
            console.log(err);

            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        response(res, 200, dbData);
    },
    getPolicyInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        if (!device_idx) response(res, 400, 'Parameter Errors : idx must be number.');

        let dbData;

        try {
            dbData = await query(
                "SELECT p.idx as idx, main, sub, classify, NAME as name, description, IF(isfile = 1, true, false) as isfile, apply_content, release_content, JSON_EXTRACT(argument, '$') as argument, command\
                            FROM policy p \
                            LEFT JOIN security_category s \
                            ON p.security_category_idx = s.idx \
                            WHERE p.idx = ?;",
                [device_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        response(res, 200, dbData);
    },

    getDeviceListByPolicy: async (req: express.Request, res: express.Response) => {
        const policy_idx = req.params.policy_idx;

        if (!policy_idx) response(res, 400, 'Parameter Errors : idx must be number.');

        let dbData;
        const returnObj = { recommand: [], active: [] };

        try {
            dbData = await query(
                'SELECT d.idx as idx, d.name as name,  d.model_name as model_name, d.serial_number as serial_number\
                            FROM device d\
                            JOIN device_recommand dr\
                            ON d.device_category_idx = dr.device_category_idx\
                            WHERE dr.security_category_idx IN(SELECT p.security_category_idx FROM policy p WHERE p.idx = ?)',
                [policy_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        returnObj['recommand'] = [...dbData];

        try {
            dbData = await query(
                'SELECT d.idx as idx, d.name as name, d.model_name as model_name, d.serial_number as serial_number\
                            FROM device d\
                            JOIN device_policy dp \
                            ON dp.device_idx = d.idx\
                            WHERE dp.policy_idx = ? AND dp.activate = 1',
                [policy_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        returnObj['active'] = [...dbData];

        response(res, 200, returnObj);
    },
    downloadPolicyFiles: async (req: express.Request, res: express.Response) => {},
};
