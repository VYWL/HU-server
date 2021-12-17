import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";
import express from 'express';

export default {
    editMonitoring: async (req: express.Request, res: express.Response) => {
        const monitoring_idx = Number(req.params.monitoring_idx ?? -1);

        const { device_idx, path, process_name, isActive, regex } = req.body;

        console.log(`[INFO] Editing monitoring state :: path = ${req.path}`);

        if (monitoring_idx !== -1) return response(res, 400, 'Parameter Errors : monitoring_idx does not exist.');
        if (device_idx === undefined) return response(res, 400, 'Parameter Errors : device_idx does not exist.');
        if (path === undefined) return response(res, 400, 'Parameter Errors : path does not exist.');
        if (process_name === undefined) return response(res, 400, 'Parameter Errors : process_name does not exist.');
        if (isActive === undefined) return response(res, 400, 'Parameter Errors : isActive does not exist.');
        if (regex === undefined) return response(res, 400, 'Parameter Errors : regex does not exist.');

        const stateValue = Boolean(isActive);

        let dbData;

        const timestamp = getToday(true);

        try {
            dbData = await query(
                'UPDATE device set process_name = ? , log_path = ?, activate = ?, device_idx = ?, update_time = ?, log_regex = ?\
                where idx = ?;',
                [
                    process_name,
                    path,
                    stateValue,
                    device_idx,
                    timestamp,
                    regex,
                    monitoring_idx
                ]
            );
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        return response(res, 200, { idx: monitoring_idx });
    }
};
