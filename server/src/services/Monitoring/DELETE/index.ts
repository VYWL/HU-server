import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";
import express from 'express';
import initAgent from '@/loaders/agentInit';


export default {
    deleteMonitoring: async (req: express.Request, res: express.Response) => {
        const monitoring_idx = Number(req.params.monitoring_idx ?? -1);

        console.log(`[INFO] Removing Monitoring info :: path = ${req.path}`);

        if (monitoring_idx === -1) return response(res, 400, 'Parameter Errors : monitoring_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT device_idx, process_name, log_path FROM monitoring WHERE idx = ?;', [monitoring_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            return response(res, 404);
        }

        const device_idx = dbData[0]["device_idx"];
        const process_name = dbData[0]["process_name"];
        const log_path = dbData[0]["log_path"];

        const reqData = {
            process_name : process_name,
            log_path: log_path,
            activate: false
        }

        requestToAgent(device_idx, PROCESS_CODE.MONITORING_REQUEST, JSON.stringify(reqData));

        try {
            dbData = await query('DELETE FROM monitoring where idx = ?;', [monitoring_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, {idx: monitoring_idx});
    }
};
