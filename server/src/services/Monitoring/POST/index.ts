import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";
import express from 'express';

export default {
    gatherProcessList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        if (!device_idx) response(res, 400, 'Parameter Errors : device_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT `socket` FROM `device` WHERE `idx` = ?', [device_idx]);
        } catch (err) {
            console.log(err);
            console.log('디바이스에서 소켓 속성값을 불러오는데 실패했습니다.');
            response(res, 404);
        }

        if (dbData === 0) response(res, 400, `Agent(${device_idx}) is not live`);
        else if (dbData === -1) response(res, 404);
        else {
            response(res, 200, { agent: dbData });

            requestToAgent(device_idx, PROCESS_CODE.PROCESS, "");
        }
    },

    gatherFileDescriptorList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const process_idx = req.params.process_idx;

        if (!device_idx) response(res, 400, 'Parameter Errors : device_idx must be number.');
        if (!process_idx) response(res, 400, 'Parameter Errors : process_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT socket FROM device WHERE idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            console.log('디바이스에서 소켓 속성값을 불러오는데 실패했습니다.');
            response(res, 404);
        }

        const agent = dbData[0]['socket'];
        if (agent === 0) response(res, 400, `Device(${device_idx}) is not live.`);
        else if (agent === -1) response(res, 404);
        else {
            response(res, 200, { agent: dbData });

            requestToAgent(device_idx, PROCESS_CODE.FILEDESCRIPTOR, "");
        }
    },

    setMonitoringState: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const path = req.body.path;
        const process_name = req.body.process_name;
        const isActive = req.body.isActive;

        if (!device_idx) response(res, 400, 'Parameter Errors : device_idx must be number.');
        if (!path) response(res, 400, 'Parameter Errors : path does not exist.');
        if (!process_name) response(res, 400, 'Parameter Errors : process_name does not exist.');
        if (isActive === undefined) response(res, 400, 'Parameter Errors : isActive does not exist.');

        const stateValue = Boolean(isActive);

        let dbData;

        const reqData = {
            process_name : process_name,
            log_path: path,
            activate: isActive
        }

        const timestamp = getToday(true);

        requestToAgent(device_idx, PROCESS_CODE.MONITORING_REQUEST, JSON.stringify(reqData));

        try {
            dbData = await query(
                'INSERT INTO monitoring(process_name, log_path, activate, device_idx, update_time) \
            Values(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activate = ?, update_time = ?;',
                [process_name, path, stateValue, device_idx, timestamp, stateValue, timestamp]
            );
        } catch (err) {
            console.log(err);
            console.log('상태 속성값 업데이트에 실패했습니다.');
            response(res, 404);
        }

        if (dbData === -1) response(res, 500);

        response(res, 200, { idx: device_idx, nowState: isActive });
    },
};
