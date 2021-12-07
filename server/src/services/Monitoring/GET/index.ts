import { requestToAgent } from "@/services/Others/Socket";
import { response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getMonitoringList: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        const filterActive = String(req.path).match("active") ? true : false;

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;

        try {
            dbData = await query(
                `SELECT * FROM monitoring ${filterActive ? "WHERE activate = 1" : ""} LIMIT ? OFFSET ?;`,
                [limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('모니터링 목록 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        return response(res, 200, dbData);
    },

    getProcessList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (!device_idx) return response(res, 400, 'Parameter Errors : idx must be number.');
        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;

        try {
            dbData = await query(
                "SELECT * FROM process WHERE device_idx = ? LIMIT ? OFFSET ?;",
                [device_idx, limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('프로세스 목록 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }
        
        // Process 
        requestToAgent(device_idx, PROCESS_CODE.PROCESS, "");
        
        return response(res, 200, dbData);
    },

    getFileDescriptorList: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const process_idx = req.params.process_idx;

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (!device_idx) return response(res, 400, 'Parameter Errors : device_idx must be number.');
        if (!process_idx) return response(res, 400, 'Parameter Errors : process_idx must be number.');
        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

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
            return response(res, 404);
        }

        // Request To Agent
        requestToAgent(device_idx, PROCESS_CODE.FILEDESCRIPTOR, "");
        
        return response(res, 200, dbData);
    },

    getLogList: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;

        try {
            dbData = await query(
                `SELECT * FROM log LIMIT ? OFFSET ?;`,
                [limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('로그 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        return response(res, 200, dbData);
    },

    getLogByMonitoringIdx: async (req: express.Request, res: express.Response) => {
        const monitoring_idx = Number(req.params.monitoring_idx ?? -1);
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (monitoring_idx === -1) return response(res, 400, 'Parameter Errors : monitoring_idx must be number.');
        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;
        
        try {
            dbData = await query(
                `SELECT device_idx, log_path FROM monitoring WHERE idx = ?;`,
                [monitoring_idx]
            );
        } catch (err) {
            console.log(err);
            console.log('모니터링 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        if(dbData.length === 0) return response(res, 404);

        const device_idx = Number(dbData[0]["device_idx"]);
        const log_path = String(dbData[0]["log_path"]);

        try {
            dbData = await query(
                `SELECT * FROM log \
                WHERE device_idx = ? AND log_path=?\
                ORDER BY create_time DESC\
                LIMIT ? OFFSET ?;`,
                [device_idx, log_path, limit, offset]
            );
        } catch (err) {
            console.log(err);
            console.log('로그 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        return response(res, 200, dbData);
    }
};
