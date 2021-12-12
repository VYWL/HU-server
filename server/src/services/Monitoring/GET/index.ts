import { requestToAgent } from "@/services/Others/Socket";
import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    
    getMonitoringDeviceList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT device_idx from monitoring\
                                GROUP BY device_idx;")

            let deviceQuery = "";
            for(let i = 0; i < dbData.length; ++i) {
                const { device_idx } = dbData[i];
                
                if(i) deviceQuery += `OR idx = ${device_idx} `;
                else deviceQuery += `idx = ${device_idx} `;
            }

            dbData = await query(`SELECT * from device\
                                WHERE ${deviceQuery}`);
        } catch (err) {
            console.log(err);
            return response(res, 404);
        }

        return response(res, 200, dbData);
    },
    
    getMonitoringPossibleDeviceList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT * from device\
                                WHERE live = 1\
                                GROUP BY idx;")

            // let deviceQuery = "";
            // for(let i = 0; i < dbData.length; ++i) {
            //     const { idx : device_idx } = dbData[i];
                
            //     if(i) deviceQuery += `OR idx = ${device_idx} `;
            //     else deviceQuery += `idx = ${device_idx} `;
            // }

            // dbData = await query(`SELECT * from device\
            //                     WHERE ${deviceQuery}`);
        } catch (err) {
            console.log(err);
            return response(res, 404);
        }

        return response(res, 200, dbData);
    },

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
                `SELECT m.idx as idx, m.process_name as process_name, m.log_path as log_path, m.activate as activate, \
                m.update_time as update_time, m.log_regex as log_regex, d.idx as device_idx, d.name as name, d.model_name as mode_name, \
                d.serial_number as serial_number, d.environment_idx as environment_idx, d.device_category_idx as device_category_idx,\
                d.network_category_idx as network_category_idx FROM monitoring as m \
                JOIN device as d ON d.idx = m.device_idx\
                ${filterActive ? "WHERE activate = 1" : ""}\
                LIMIT ? OFFSET ?;`,
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

    getTotalParsedLog: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) return response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) return response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = Number(limit) * (Number(page) - 1);

        let dbData;

        try {
            dbData = await query('SELECT l.idx as idx, l.event_code as event_code, l.description as description, l.device_idx as device_idx, \
            l.module_idx as module_idx, l.create_time as create_time, l.environment as environment, l.status as status, \
            l.security_category_idx as security_category_idx, l.layer as layer, l.original_log as original_log, l.log_path as log_path, \
            m.log_regex as log_regex \
            FROM log as l \
            JOIN monitoring as m \
            ON l.device_idx = m.device_idx AND l.log_path = m.log_path \
            ORDER BY create_time DESC\
            LIMIT ? OFFSET ?;', [limit, offset]);
        } catch (err) {
            console.log(err);
            
            console.log('모니터링 관련 로그 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        dbData = dbData.map(e => {
            const reg = new RegExp(e["log_regex"] ?? /.*/g);
            const result = reg.exec(e["original_log"]);

            const returnRow = {
                ...e,
                parsedLog : result
            }

            return returnRow;
        })

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
    },
    
    getTotalMonitoringLogCountByTime: async (req: express.Request, res: express.Response) => {
        const start = req.query.start ?? '1970-01-01';
        const end = getToday();
        const unitTime = Number(req.query.time ?? 5);

        let dbData;

        try {
            dbData = await query(
                "SELECT a.date, CONCAT('[', GROUP_CONCAT('{' , '\"', a.status , '\"', ':' , a.avg_col, '}'),']') AS detail, SUM(a.avg_col) AS total\
                FROM(\
                    SELECT TIMESTAMPADD(MINUTE, FLOOR(TIMESTAMPDIFF(MINUTE, ?, create_time) / ?) * ?, ?)  AS date\
                    , Count(*) AS avg_col, status\
                    FROM log as l\
                    JOIN monitoring as m ON l.log_path = m.log_path AND l.device_idx = m.device_idx\
                    WHERE DATE(?) <= DATE(create_time) AND DATE(create_time) <= DATE(?) AND activate = 1\
                    GROUP BY date, STATUS\
                    ) a\
                GROUP BY a.date DESC",
                [start, unitTime, unitTime, start, start, end]
            );
        } catch (err) {
            console.log(err);
            console.log('해당 기간 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        dbData = dbData.map(e => {
            const { date, detail, total } = e;

            const newElem = {};
            newElem['date'] = date;
            newElem['total'] = total;

            const detailList = JSON.parse(detail).map(e => Object.entries(e));

            detailList.forEach(e => {
                const key = `${e[0][0]}`.toLowerCase();
                const value = e[0][1] ?? 0;

                newElem[key] = value;
                newElem[`${key}_rate`] = Math.round((value / total) * 1000) / 10;
            });

            return newElem;
        });

        return response(res, 200, dbData);
    },

    
    getAllMonitoringStats: async (req: express.Request, res: express.Response) => {
        const now = req.query.end ?? getToday();
        const past = req.query.start ?? '1970-01-01';
        const intervalMinute = req.query.time ?? 5;

        let returnData = [];

        let dbData;
        try {
            dbData = await query(
                            'SELECT status, Count(*) AS count\
                                FROM log as l\
                                JOIN monitoring as m ON l.log_path = m.log_path AND l.device_idx = m.device_idx\
                                WHERE TIMESTAMP(?) <= TIMESTAMP(create_time) AND TIMESTAMP(create_time) <= TIMESTAMPADD(MINUTE, ?, ?)\
                                GROUP BY status\
                                ORDER BY STATUS ASC;',
                [past, 0, now]
            );
        } catch (err) {
            console.log(err);
            console.log('해당 기간 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        returnData.push({
            description: 'total',
            data: [...dbData],
        });

        try {
            dbData = await query(
                            'SELECT status, Count(*) AS count\
                                FROM log as l\
                                JOIN monitoring as m ON l.log_path = m.log_path AND l.device_idx = m.device_idx\
                                WHERE TIMESTAMP(?) <= TIMESTAMP(create_time) AND TIMESTAMP(create_time) <= TIMESTAMPADD(MINUTE, ?, ?)\
                                GROUP BY status\
                                ORDER BY STATUS ASC;',
                [past, -intervalMinute, now]
            );
        } catch (err) {
            console.log(err);
            console.log('이전 기간 정보를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        returnData.push({
            description: 'prev',
            data: [...dbData],
        });

        try {
            dbData = await query(
                            'SELECT COUNT(*) AS type, SUM(attack) AS total_attack\
                                FROM(SELECT security_category_idx, COUNT(*) AS attack\
                                FROM log as l\
                                JOIN monitoring as m ON l.log_path = m.log_path AND l.device_idx = m.device_idx\
                                WHERE security_category_idx IS NOT NULL AND TIMESTAMP(?) <= TIMESTAMP(create_time)\
                                AND TIMESTAMP(create_time) <= TIMESTAMPADD(MINUTE, ?, ?)\
                                GROUP BY security_category_idx)a; ',
                [past, 0, now]
            );
        } catch (err) {
            console.log(err);
            console.log('위협 로그 통계를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        returnData.push({
            description: 'threat',
            data: [...dbData],
        });

        return response(res, 200, returnData);
    },
};
