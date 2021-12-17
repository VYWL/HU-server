import express from 'express';
import { query } from '@/loaders/mysql';
import { defaultResponse, getToday, response, returnDataWithCount } from '@/api';
import { requestToAgent } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';

export default {
    getInspectionList: async (req: express.Request, res: express.Response) => {

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);
        
        console.log(`[INFO] Gathering inspection info list :: path = ${req.path}`);

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        
        const offset = limit * (page - 1);
        
        let dbData;

        try {
            dbData = await query("SELECT * FROM inspection\
                                LIMIT ? OFFSET ?;", [limit, offset]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        const returnData = [];
        console.log(`[INFO] Inspection Data Found :: count = ${dbData.length}`);

        for(let i = 0; i < dbData.length; ++i) {
            const { policy_idx, security_category_idx } = dbData[i];

            let policy_data, security_category_data;

            try {
                policy_data = await query("SELECT classify, name FROM policy WHERE idx = ?", [policy_idx]);
                security_category_data = await query("SELECT main, sub FROM security_category WHERE idx = ?", [security_category_idx]);
            } catch (err) {
                console.log(err);
                return response(res, 500, 'Internal Server Errors : Database Error');
            }

            returnData.push({
                ...dbData[i],
                ...policy_data[0],
                ...security_category_data[0],
                inspection_config : JSON.parse(dbData[i]["inspection_config"])
            })
        }

        let totalCount;

        try {
            totalCount = await query(`SELECT COUNT(*) as count FROM inspection`);

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

    getTaskInfoList: async (req: express.Request, res: express.Response) => {
        let dbData;

        console.log(`[INFO] Gathering task info list :: path = ${req.path}`);

        try {
            dbData = await query("SELECT * FROM inspection_log");
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        dbData = dbData.map(e => {
            const returnObj = {
                ...e,
                process_info : JSON.parse(e["process_info"])
            }

            return returnObj;
        })

        const ret = {
            task_info : dbData,
            timestamp : getToday(true)
        }

        return response(res, 200, ret);
    },
};