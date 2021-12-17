import { response, returnDataWithCount } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getPolicyList: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);
        
        console.log(`[INFO] Gathering policy list :: path = ${req.path}`);

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

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

            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        let totalCount;

        try {
            totalCount = await query(`SELECT COUNT(*) as count FROM policy p\
                                    LEFT JOIN security_category s\
                                    ON p.security_category_idx = s.idx \
                                    ORDER BY p.idx ASCC`);

            totalCount = totalCount[0]["count"];
        } catch {
            console.log(err);
            return response(res, 404);
        }

        const responseData = {
            count : totalCount,
            data : dbData
        }

        return response(res, 200, responseData);
    },

    getPolicyInfo: async (req: express.Request, res: express.Response) => {
        const policy_idx = Number(req.params.policy_idx ?? -1);

        console.log(`[INFO] Gathering policy info :: path = ${req.path}`);

        if (policy_idx === -1) return response(res, 400, 'Parameter Errors : idx must be number.');

        let dbData;

        try {
            dbData = await query(
                "SELECT p.idx as idx, main, sub, classify, NAME as name, description, IF(isfile = 1, true, false) as isfile, apply_content, release_content, p.argument as argument, p.security_category_idx as security_category_idx, command\
                            FROM policy p \
                            LEFT JOIN security_category s \
                            ON p.security_category_idx = s.idx \
                            WHERE p.idx = ?;",
                [policy_idx]
            );
        } catch (err) {
            console.log(err);

            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        dbData = [
            {
                ...dbData[0],
                argument : dbData.length !== 0 ? JSON.parse(dbData[0]["argument"]) : null
            }
        ]


        return response(res, 200, dbData);
    },

    getDeviceListByPolicy: async (req: express.Request, res: express.Response) => {
        const policy_idx = Number(req.params.policy_idx ?? -1);
        
        console.log(`[INFO] Gathering device list by policy :: path = ${req.path}, policy_idx = ${policy_idx}`);

        if (policy_idx === -1) return response(res, 400, 'Parameter Errors : idx must be number.');
        
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

            return response(res, 500, 'Internal Server Errors : Database Errors');
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

            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        returnObj['active'] = [...dbData];

        return response(res, 200, returnObj);
    },

    getCustomPolicyList: async (req: express.Request, res: express.Response) => {
        const filterList = [];

        const device_idx = Number(req.query.device_idx ?? -1);
        const policy_idx = Number(req.query.policy_idx ?? -1);
        const activate = req.query.activate;
        const custom_policy_idx = Number(req.query.idx ?? -1);
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);
        
        console.log(`[INFO] Gathering custom policy list :: path = ${req.path}, custom_policy_idx = ${custom_policy_idx}`);

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');
        
        if (custom_policy_idx !== -1) filterList.push(`pc.idx=${custom_policy_idx}`);
        else {
            if(device_idx !== -1) filterList.push(`pc.device_idx=${device_idx}`);
            if(policy_idx !== -1) filterList.push(`pc.policy_idx=${policy_idx}`);
            if(activate !== undefined) filterList.push(`pc.activate=${activate ? 1 : 0}`);
        }
        
        let dbData;
        const offset = limit + (page - 1);

        try {
            dbData = await query(`SELECT pc.idx as idx, sc.idx as security_category_idx, p.idx as policy_idx, sc.main as main, sc.sub as sub, p.classify as classify, p.name as name, d.name as target, device_idx, p.description as description, activate\
            FROM policy_custom as pc\
            JOIN policy as p ON p.idx = pc.policy_idx\
            JOIN security_category as sc ON sc.idx = pc.security_category_idx\
            JOIN device as d ON d.idx = pc.device_idx\
            ${filterList.length !== 0 ? "WHERE " + filterList.join(' AND ') : ""}\
            LIMIT ? OFFSET ?`, [limit, offset]);
        } catch (err) {
            console.log(err);
            console.log('사용자 정의 정책 설정값 목록 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }
        
        let totalCount;

        try {
            totalCount = await query(`SELECT COUNT(*) as count FROM policy_custom as pc\
                                    JOIN policy as p ON p.idx = pc.policy_idx\
                                    JOIN security_category as sc ON sc.idx = pc.security_category_idx\
                                    JOIN device as d ON d.idx = pc.device_idx\
                                    ${filterList.length !== 0 ? "WHERE " + filterList.join(' AND ') : ""}`);

            totalCount = totalCount[0]["count"];
        } catch (err) {
            console.log(err);
            return response(res, 404);
        }

        const responseData = {
            count : totalCount,
            data : dbData
        }

        return response(res, 200, responseData);
    },

    downloadPolicyFiles: async (req: express.Request, res: express.Response) => {},
};