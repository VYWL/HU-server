import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    deleteDeviceInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = Number(req.params.device_idx ?? -1);
        
        console.log(`[INFO] Removing Device Info :: path = ${req.path}`);

        if (device_idx === -1) return response(res, 400, 'Parameter Errors : device_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM device WHERE idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            return response(res, 404);
        }

        try {

            // 외래키 이슈 => log, inspection_log, module 삭제해야함.

            dbData = await query('DELETE FROM device WHERE idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, {});
    },

    deleteDeviceCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = Number(req.params.category_idx ?? -1);

        console.log(`[INFO] Removing Device Category Info :: path = ${req.path}`);

        if (category_idx === -1) return response(res, 400, 'Parameter Errors : category_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM device_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            return response(res, 404);
        }

        try {
            dbData = await query('DELETE FROM device_category where idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, {});
    },
    deleteDeviceEnvInfo: async (req: express.Request, res: express.Response) => {},
};
