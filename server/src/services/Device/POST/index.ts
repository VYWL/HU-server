import { genSerialNumber, getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    addDevice: async (req: express.Request, res: express.Response) => {
        const { name, init_ip, model_name, category, network, environment } = req.body;

        if (!name) return response(res, 400, 'Parameter Errors : name does not exist.');
        if (!init_ip) return response(res, 400, 'Parameter Errors : init_ip does not exist.');
        if (!model_name) return response(res, 400, 'Parameter Errors : model_name does not exist.');
        if (!category) return response(res, 400, 'Parameter Errors : category does not exist.');
        if (!network) return response(res, 400, 'Parameter Errors : network does not exist.');
        if (!environment) return response(res, 400, 'Parameter Errors : environment does not exist.');

        let dbData;

        try {
            dbData = await query(
                'INSERT INTO `device_category` (`name`, `agent`) values (?, 0) \
                        ON DUPLICATE KEY UPDATE `idx`=`idx`;',
                [category]
            );

            dbData = await query(
                'INSERT INTO `network_category` (`name`) values (?) \
                ON DUPLICATE KEY UPDATE `idx`=`idx`;',
                [network]
            );

            dbData = await query(
                'INSERT INTO `environment` (`name`) values (?) \
                ON DUPLICATE KEY UPDATE `idx`=`idx`;',
                [environment]
            );
        } catch (err) {
            console.log(err);
            console.log('데이터 삽입에 실패했습니다.');
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

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

        // TODO :: 에이전트 연결

        return response(res, 200, { idx: dbData['insertId'] });
    },

    addCategory: async (req: express.Request, res: express.Response) => {
        const { name, model_name } = req.body;

        // TODO :: body 유효성

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

    addEnvironment: async (req: express.Request, res: express.Response) => {},
};
