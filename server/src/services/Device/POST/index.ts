import { genSerialNumber, getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';
import initAgent from '@/loaders/agentInit';

export default {
    addDevice: async (req: express.Request, res: express.Response) => {
        const { name, init_ip, model_name, category, network, environment, activate = null } = req.body;

        console.log(`[INFO] Adding device info :: path = ${req.path}`);

        if (activate === null) return response(res, 400, 'Parameter Errors : agent(aka activate) does not exist.');
        if (!name) return response(res, 400, 'Parameter Errors : name does not exist.');
        if (!init_ip) return response(res, 400, 'Parameter Errors : init_ip does not exist.');
        if (!model_name) return response(res, 400, 'Parameter Errors : model_name does not exist.');
        if (!category) return response(res, 400, 'Parameter Errors : category does not exist.');
        if (!network) return response(res, 400, 'Parameter Errors : network does not exist.');
        if (!environment) return response(res, 400, 'Parameter Errors : environment does not exist.');

        let dbData;

        let serial_number = '';

        while (true) {
            serial_number = genSerialNumber();
            dbData = await query('SELECT `idx` FROM `device` WHERE `serial_number` = ?;', [serial_number]);

            if (dbData.length === 0) break;
        }

        try {
            dbData = await query(
                'INSERT INTO `device` (`name`, `init_ip`, `model_name`, `serial_number`, `device_category_idx`, `network_category_idx`, `environment_idx`, `update_time`)\
            VALUES(?, ?, ?, ?,\
            (SELECT `idx` FROM `device_category` WHERE `name` = ? AND `agent` = 0),\
            (SELECT `idx` FROM `network_category` WHERE `name` = ?),\
            (SELECT `idx` FROM `environment` WHERE `name` = ?), ?); ',
                [name, init_ip, model_name, serial_number, category, network, environment, getToday(true)]
            );
        } catch (err) {
            console.log(err);
            console.log('데이터 삽입에 실패했습니다.');
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        // Socket 요청을 Agent측으로 보낸다.

        const sendData = {
            serial_number : serial_number,
            environment : environment
        }

        await initAgent(init_ip, "init", sendData);
        if (activate === true) await initAgent(init_ip, "start", sendData);
        if (activate === false) await initAgent(init_ip, "stop", sendData);

        return response(res, 200, { idx: dbData['insertId'] });
    },

    addCategory: async (req: express.Request, res: express.Response) => {
        const { name, model_name } = req.body;

        console.log(`[INFO] Adding device category info :: path = ${req.path}`);

        if (!name) return response(res, 400, 'Parameter Errors : name does not exist.');
        if (!model_name) return response(res, 400, 'Parameter Errors : model_name does not exist.');

        let dbData;

        try {
            dbData = await query('INSERT device_category(NAME) VALUE(?) ON DUPLICATE KEY UPDATE idx = idx', [name]);
        } catch (err) {
            console.log(err);
            console.log('데이터 삽입에 실패했습니다.');
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        return response(res, 200, { idx: dbData['insertId'] });
    },

    changeDeviceStatus: async (req: express.Request, res: express.Response) => {
        const device_idx = Number(req.params.device_idx ?? -1);
        const status = req.body.status;

        const newStatus = status;
        
        console.log(`[INFO] Changing device status :: path = ${req.path}`);

        if(device_idx === -1) return response(res, 400, 'Parameter Errors : device_idx must be number.');
        
        let dbData;

        try {
            dbData = await query('UPDATE device set live = ? WHERE idx=?', [newStatus, device_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Error : Database error');
        }

        let init_ip;

        try {
            init_ip = await query("SELECT init_ip FROM device WHERE idx = ?", [device_idx]);

            init_ip = init_ip[0]["init_ip"];
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Error : Database error');
        }
    
        const mode = newStatus ? "start" : "stop";

        await initAgent(init_ip, mode, {});

        return response(res, 200, { isLive: newStatus });
    },

    addEnvironment: async (req: express.Request, res: express.Response) => {},
};
