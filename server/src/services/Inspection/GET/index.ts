import express from 'express';
import { query } from '@/loaders/mysql';
import { defaultResponse, getToday, response } from '@/api';
import { requestToAgent } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';

export default {
    getInspectionList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT * FROM inspection");
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        const returnData = [];

        for(let i = 0; i < dbData[i]; ++i) {
            const { policy_idx, security_category_idx } = dbData[i];

            let policy_data, security_category_data;

            try {
                policy_data = await query("SELECT classify FROM policy WHERE idx = ?", [policy_idx]);
                security_category_data = await query("SELECT main, sub FROM security_category WHERE idx = ?", [security_category_idx]);
            } catch (err) {
                console.log(err);
                return response(res, 500, 'Internal Server Errors : Database Error');
            }

            returnData.push({
                ...dbData[i],
                ...policy_data,
                ...security_category_data,
                inspection_config : JSON.parse(dbData[i]["inspection_config"])
            })
        }

        return response(res, 200, returnData);
    },

    getTaskInfoList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT * FROM inspection_log\
                                WHERE status is NOT 'FIN'");
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

        return response(res, 200, dbData);
    },
};