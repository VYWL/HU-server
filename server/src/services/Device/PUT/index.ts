import { getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    editDeviceInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const { name, model_name, serial_number, environment, network_info, os_info, service_list, connect_method } =
            req.body;

        if (!device_idx) return response(res, 400, 'Parameter Errors : device_idx does not exist.');
        // TODO :: body 속성별로 파라미터값이 없다는 오류

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
                'UPDATE device set name = ? , model_name = ?, serial_number = ?, environment_idx = ?, network_info = ?, os_info = ?, service_list = ?, connect_method = ?, update_time = ?\
                where idx = ?;',
                [
                    name,
                    model_name,
                    serial_number,
                    environment_idx,
                    network_info,
                    os_info,
                    service_list,
                    `[${connect_method}]`, // TODO :: 배열은 예외처리
                    getToday(true),
                    device_idx,
                ]
            );
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        return response(res, 200, { idx: device_idx });
    },

    editDeviceCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;
        const { name, model_name } = req.body;

        if (!category_idx) return response(res, 400, 'Parameter Errors : category_idx does not exist.');
        // TODO :: body 속성 검증

        let dbData;

        try {
            dbData = await query('UPDATE device_category SET NAME=? WHERE idx=?', [name, category_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        // TODO 카테고리 모델 번호 기능 추가 필요, API 분할 필요한 듯 (동현)

        return response(res, 200, { idx: category_idx });
    },

    editDeviceEnvInfo: async (req: express.Request, res: express.Response) => {},
};
