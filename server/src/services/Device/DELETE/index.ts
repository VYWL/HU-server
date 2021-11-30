import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    deleteDeviceInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = Number(req.params.device_idx ?? -1);

        if (device_idx === -1) response(res, 400, 'Parameter Errors : device_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM device WHERE idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            response(res, 404);
        }

        try {
            dbData = await query('DELETE FROM device where idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        response(res, 200, {});
    },
    deleteDeviceCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = Number(req.params.category_idx ?? -1);

        if (category_idx === -1) response(res, 400, 'Parameter Errors : category_idx must be number.');

        let dbData;

        try {
            dbData = await query('SELECT idx FROM device_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            response(res, 404);
        }

        try {
            dbData = await query('DELETE FROM device_category where idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database Errors');
        }

        response(res, 200, {});
    },
    deleteDeviceEnvInfo: async (req: express.Request, res: express.Response) => {},
};
