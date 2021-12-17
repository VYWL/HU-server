import { getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';
import initAgent from '@/loaders/agentInit';

export default {
    editDeviceInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const { name, init_ip, model_name, serial_number, environment, network_info, os_info, service_list, connect_method, activate } = req.body;


        console.log(`[INFO] Editing device info :: path = ${req.path}`);


        if (!device_idx) return response(res, 400, 'Parameter Errors : device_idx does not exist.');
        if (name === undefined) return response(res, 400, 'Parameter Errors : name does not exist.');
        if (init_ip === undefined) return response(res, 400, 'Parameter Errors : init_ip does not exist.');
        if (model_name === undefined) return response(res, 400, 'Parameter Errors : model_name does not exist.');
        if (serial_number === undefined) return response(res, 400, 'Parameter Errors : serial_number does not exist.');
        if (environment === undefined) return response(res, 400, 'Parameter Errors : environment does not exist.');
        if (network_info === undefined) return response(res, 400, 'Parameter Errors : network_info does not exist.');
        if (os_info === undefined) return response(res, 400, 'Parameter Errors : os_info does not exist.');
        if (service_list === undefined) return response(res, 400, 'Parameter Errors : service_list does not exist.');
        if (connect_method === undefined) return response(res, 400, 'Parameter Errors : connect_method does not exist.');
        if (activate === undefined) return response(res, 400, 'Parameter Errors : activate does not exist.');

        let dbData;

        try {
            dbData = await query("SELECT idx from environment WHERE name = ?",[environment]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        const environment_idx = dbData[0]["idx"];

        try {
            dbData = await query(
                'UPDATE device set name = ? , init_ip = ?, model_name = ?, serial_number = ?, environment_idx = ?, network_info = ?, os_info = ?, service_list = ?, connect_method = ?, update_time = ?\
                where idx = ?;',
                [
                    name,
                    `${init_ip}`,
                    model_name,
                    serial_number,
                    environment_idx,
                    network_info,
                    os_info,
                    service_list,
                    `[${connect_method}]`,
                    getToday(true),
                    device_idx,
                ]
            );
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        const sendData = {};

        // Socket
        if(activate) await initAgent(init_ip, "start", sendData);
        else await initAgent(init_ip, "stop", sendData);


        return response(res, 200, { idx: device_idx });
    },

    editDeviceCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;
        const { name, model_name } = req.body;
        
        console.log(`[INFO] Editing device category info :: path = ${req.path}`);

        if (!category_idx) return response(res, 400, 'Parameter Errors : category_idx does not exist.');

        let dbData;

        try {
            dbData = await query('UPDATE device_category SET NAME=? WHERE idx=?', [name, category_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        return response(res, 200, { idx: category_idx });
    },

    editDeviceEnvInfo: async (req: express.Request, res: express.Response) => {},
};
