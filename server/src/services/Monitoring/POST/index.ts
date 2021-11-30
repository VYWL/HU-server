import { getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
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
        if (dbData === -1) response(res, 404);

        response(res, 200, { agent: dbData });

        // TODO :: 여기서 socket 요청 날려야한다
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
        console.log({ agent, dbData });

        if (agent === 0) response(res, 400, `Device(${device_idx}) is not live.`);
        else if (agent === -1) response(res, 404);
        else {
            response(res, 200, { agent: dbData });

            // TODO :: 여기서 socket 요청
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

        const stateValue = Boolean(isActive) ? 1 : 0;

        let dbData;

        try {
            dbData = await query('SELECT socket FROM device WHERE idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            console.log('디바이스에서 소켓 속성값을 불러오는데 실패했습니다.');
            response(res, 404);
        }

        if (dbData === 0) response(res, 400, `Device(${device_idx}) does not exist.`);
        if (dbData === -1) response(res, 404);

        // TODO :: 여기서 socket 요청 날려야한다

        try {
            dbData = await query(
                'INSERT INTO monitoring(process_name, log_path, activate, device_idx, update_time) \
            Values(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activate = ?, update_time = ?;',
                [process_name, path, stateValue, device_idx, getToday(true), stateValue, getToday(true)]
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
