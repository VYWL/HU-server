import { getToday, response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getAllStats: async (req: express.Request, res: express.Response) => {
        const now = req.query.end ?? getToday();
        const past = req.query.start ?? '1970-01-01';
        const intervalMinute = 5;

        let returnData = [];

        let dbData;
        try {
            dbData = await query(
                'SELECT status, Count(*) AS count\
                                FROM log\
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
                                FROM log\
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
                                    FROM log\
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

        try {
            dbData = await query(
                'SELECT COUNT(*) AS type, SUM(a.count) AS devices\
                                FROM(SELECT COUNT(*) AS count, device_category_idx FROM device\
                                    GROUP BY device_category_idx) a'
            );
        } catch (err) {
            console.log(err);
            console.log('장비 카테고리 수, 장비 수 통계를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        returnData.push({
            description: 'device',
            data: [...dbData],
        });

        try {
            dbData = await query(
                'SELECT COUNT(*) AS type, SUM(a.count) AS devices\
                                FROM(SELECT COUNT(*) AS count, module_category_idx  FROM module\
                                    GROUP BY module_category_idx) a'
            );
        } catch (err) {
            console.log(err);
            console.log('모듈 카테고리 수, 모듈 수 통계를 불러오는데에 실패했습니다.');
            return response(res, 404);
        }

        returnData.push({
            description: 'module',
            data: [...dbData],
        });

        return response(res, 200, returnData);
    },

    getTotalLogCountByTime: async (req: express.Request, res: express.Response) => {
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
                FROM log\
                WHERE DATE(?) <= DATE(create_time) AND DATE(create_time) <= DATE(?)\
                GROUP BY date, STATUS\
            ) a\
            GROUP BY a.date",
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
                const value = e[0][1];

                newElem[key] = value;
                newElem[`${key}_rate`] = Math.round((value / total) * 1000) / 10;
            });

            return newElem;
        });

        return response(res, 200, dbData);
    },
    getTotalLogCountByThreat: async (req: express.Request, res: express.Response) => {},
    getTotalLogCountByGroup: async (req: express.Request, res: express.Response) => {},
    getAppliedPolicy: async (req: express.Request, res: express.Response) => {},
};
