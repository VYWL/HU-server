import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getProcessList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (!device_idx) response(res, 400, 'Parameter Errors : idx must be number.');
        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'pid', pid, 'ppid', ppid, 'state', state, 'command', command, 'start_time', start_time, 'update_time', update_time\
            FROM process WHERE device_idx = ?\
            ORDER BY idx ASC \
            LIMIT ? OFFSET ?",
                [device_idx, limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('프로세스 목록 정보를 불러오는데에 실패했습니다.');
            response(res, 404);
        }

        response(res, 200, dbData);
    },

    getFileDescriptorList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const process_idx = req.params.process_idx;

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (!device_idx) response(res, 400, 'Parameter Errors : device_idx must be number.');
        if (!process_idx) response(res, 400, 'Parameter Errors : process_idx must be number.');
        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = limit * (page - 1);

        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'pid', pid,  'name', name, 'path', path\
            FROM file_descriptor WHERE device_idx = ? AND pid = ?\
            ORDER BY idx ASC \
            LIMIT ? OFFSET ?;",
                [device_idx, process_idx, limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('파일 디스크립터 목록을 불러오는데 실패했습니다.');
            response(res, 404);
        }

        response(res, 200, dbData);
    },
};
