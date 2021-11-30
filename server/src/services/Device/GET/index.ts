import express from 'express';
import { query } from '@/loaders/mysql';
import { defaultResponse, getToday, response } from '@/api';

export default {
    getAllDeviceList: async (req, res: express.Response) => {
        // 모든 장비 리스트를 가져온다
        // 페이지가 구분되어있는듯 하다. param에 있음.

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = limit * (page - 1);
        let dbData;

        try {
            dbData = await query(
                'SELECT `device`.`idx`, `device`.`name`, `device`.`model_name`, `device`.`serial_number` as serial_number,\
                `environment`.`name` as environment, `device_category`.`name` as category, `network_category`.`name` as network,\
                IF(`device`.`live` = 1, TRUE, FALSE) as live, `device`.`update_time` as update_time\
                FROM device\
                                LEFT JOIN device_category ON device_category.idx = device.device_category_idx\
                                LEFT JOIN network_category ON network_category.idx = device.network_category_idx\
                                LEFT JOIN environment ON environment.idx = device.environment_idx\
                                ORDER BY device.idx ASC\
                                LIMIT ? OFFSET ? ',
                [limit, offset]
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        dbData = dbData.map(e => {
            const { live } = e;

            const isLive = Number(live) === 1;

            return { ...e, live: isLive };
        });

        response(res, 200, dbData);
    },

    getDeviceInfo: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', `device`.`idx`, 'name', `device`.`name` ,'model_name', `device`.`model_name`, 'serial_number', `device`.`serial_number`,\
            'environment', `environment`.`name`, 'category', `device_category`.`name`, 'network', `network_category`.`name`,\
            'live', IF(`device`.`live` = 1, TRUE, FALSE), 'update_time', `device`.`update_time`,\
            'network_info', JSON_EXTRACT(`device`.`network_info`, '$.network_info'), 'os_info', JSON_EXTRACT(`device`.`os_info`, '$'), 'service_list', JSON_EXTRACT(`device`.`service_list`, '$.service_info'), 'connect_method', JSON_EXTRACT(`device`.`connect_method`, '$')\
            FROM `device`\
            LEFT JOIN `device_category` ON `device_category`.`idx` = `device`.`device_category_idx`\
            LEFT JOIN `network_category` ON `network_category`.`idx` = `device`.`network_category_idx`\
            LEFT JOIN `environment` ON `environment`.`idx` = `device`.`environment_idx`\
            WHERE `device`.`idx` = ?",
                [device_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },

    getAllDeviceCategories: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'name', name\
                                FROM `device_category` \
                                WHERE `agent` = 0 \
                                ORDER BY `idx` ASC"
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },
    getDeviceCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = Number(req.params.category_idx);

        let dbData = [];

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'name', name\
                                FROM `device_category` \
                                WHERE `agent` = 0 AND idx = ?\
                                LIMIT 1;",
                [category_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },
    getDeviceEnvList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'name', name\
                                FROM `environment` \
                                ORDER BY `idx` ASC;"
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },
    getDeviceEnvInfo: async (req: express.Request, res: express.Response) => {
        const environment_idx = Number(req.params.environment_idx);

        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', idx, 'name', name\
                                FROM `environment` \
                                WHERE `idx`=?;",
                [environment_idx]
            );
        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },

    getDeviceCount: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query('SELECT COUNT(*) as device_count FROM device');
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },

    getUnregisteredDeviceList: async (req: express.Request, res: express.Response) => {
        const page = req.query.page;
        const limit = req.query.limit;
        // TODO :: 검증

        let dbData;

        try {
            dbData = await query(
                "SELECT 'idx', `device`.`idx`, 'name', `device`.`name` ,'model_name', `device`.`model_name`, 'serial_number', `device`.`serial_number`,\
            'environment', `environment`.`name`, 'category', `device_category`.`name`, 'network', `network_category`.`name`,\
            'live', IF(`device`.`live` = 1, TRUE, FALSE), 'update_time', `device`.`update_time`\
            FROM `device`\
            LEFT JOIN `device_category` ON `device_category`.`idx` = `device`.`device_category_idx`\
            LEFT JOIN `network_category` ON `network_category`.`idx` = `device`.`network_category_idx`\
            LEFT JOIN `environment` ON `environment`.`idx` = `device`.`environment_idx`\
            WHERE `device`.`live` = 0\
            ORDER BY `device`.`idx` ASC LIMIT %d OFFSET %d;"
            );

            // TODO :: 그냥 Device 관련 조회 쿼리 전부 통일해야함.
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internel Server Error : Database error');
        }
    },

    getStatisticsByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const start = req.query.start ?? '1970-01-01';
        const unitTime = Number(req.query.time ?? 5);

        response(res, 404);
        // TODO :: Dashboard API 변형
    },

    getModuleListByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        // TODO :: IF문 작성

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = limit * (page - 1);

        let dbData;

        try {
            dbData = await query(
                'SELECT m.idx as idx, mc.name as category, m.model_number as model_number, m.serial_number as serial_number, m.mac as mac, m.update_time as update_time, nc.name as network_category)\
            FROM module m\
            JOIN module_category mc\
            ON m.module_category_idx = mc.idx\
            JOIN network_category nc\
            ON m.network_category_idx = nc.idx\
            WHERE device_idx = ?\
            ORDER BY m.idx ASC LIMIT ? OFFSET ?;',
                [device_idx, limit, offset]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },

    getTotalLog: async (req: express.Request, res: express.Response) => {
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        const offset = limit * (page - 1);

        let dbData;

        try {
            dbData = await query(
                "SELECT l.event_code as event_code, description, l.environment as environment, l.STATUS as status, sc.main as main, sc.sub as sub, JSON_EXTRACT(original_log, '$') as original_log, l.layer as layer, l.create_time as create_time\
            FROM log l\
            LEFT OUTER JOIN security_category sc\
            ON sc.idx = l.security_category_idx\
            ORDER BY l.idx ASC LIMIT ? OFFSET ?;",
                [limit, offset]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getLogByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');
        if (!device_idx) response(res, 400, 'Parameter Errors : idx must be number.');

        const offset = limit * (page - 1);

        let dbData;

        try {
            dbData = await query(
                "SELECT l.event_code as event_code, description, l.environment as environment, l.STATUS as status, sc.main as main, sc.sub as sub, JSON_EXTRACT(original_log, '$') as original_log, l.layer as layer, l.create_time as create_time\
            FROM log l\
            LEFT OUTER JOIN security_category sc\
            ON sc.idx = l.security_category_idx\
            WHERE device_idx = ?\
            ORDER BY l.idx ASC LIMIT ? OFFSET ?;",
                [device_idx, limit, offset]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getTotalLogCount: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query('SELECT COUNT(*) as total_log_count FROM log l');
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getLogCountByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        // TODO :: IF문 작성

        let dbData;

        try {
            dbData = await query('SELECT COUNT(*) as log_count FROM log l WHERE device_idx = ?;', [device_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getPolicyListByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;
        const status = req.query.status;

        let isActive;

        switch (status) {
            case 'active':
                isActive = true;
                break;
            default:
                isActive = false;
                break;
        }

        // TODO :: IF문 작성

        let dbData;

        try {
            dbData = await query(
                `SELECT p.idx as idx, sc.main as main, sc.sub as sub, p.classify as classify, p.name as name, p.description as description\
            FROM device_policy dp\
            JOIN policy p\
            ON dp.policy_idx = p.idx\
            JOIN security_category sc\
            ON sc.idx = p.security_category_idx\
            WHERE dp.device_idx = ? ${status ? `AND dp.activate =  ${isActive ? 1 : 0}` : ''}`,
                [device_idx]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },

    // TODO :: active 관련해서 병합했음.
    // getActivePolicyListByDevice: async (req: express.Request, res: express.Response) => {},
    // getInactivePolicyListByDevice: async (req: express.Request, res: express.Response) => {},

    getRecommandedPolicyListByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        // TODO :: IF문 작성

        let dbData;

        try {
            dbData = await query(
                'SELECT  p.idx as idx, sc.main as main, sc.sub as sub, p.classify as classify, p.name as name, p.description as description\
            FROM device_recommand dr\
            JOIN device d\
            ON d.device_category_idx = dr.device_category_idx\
            JOIN policy p\
            ON p.idx = dr.security_category_idx\
            JOIN security_category sc\
            ON p.security_category_idx = sc.idx\
            WHERE d.idx = ?',
                [device_idx]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getRecommandedInspectionByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        const page = Number(req.query.page ?? -1);
        const limit = Number(req.query.limit ?? -1);

        if (page === -1) response(res, 400, 'Parameter Errors : page must be number.');
        if (limit === -1) response(res, 400, 'Parameter Errors : limit must be 2 digits number');

        // TODO :: IF문 작성

        const offset = limit + (page - 1);
        let dbData;

        try {
            dbData = await query(
                'SELECT  p.idx as idx, sc.main as main, sc.sub as sub, p.classify as classify, p.name as name, p.description as description\
            FROM device_recommand dr\
            JOIN device d\
            ON d.device_category_idx = dr.device_category_idx\
            JOIN inspection_step p\
            ON p.idx = dr.security_category_idx\
            JOIN security_category sc\
            ON p.security_category_idx = sc.idx\
            WHERE d.idx = ?',
                [device_idx]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, dbData);
    },
    getIsLiveByDevice: async (req: express.Request, res: express.Response) => {
        const device_idx = req.params.device_idx;

        // TODO :: IF문 작성

        let dbData;

        try {
            dbData = await query('SELECT IF(live=1, TRUE,FALSE) as isLive FROM device WHERE idx=?', [device_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Error : Database error');
        }

        response(res, 200, { isLive: dbData[0]['isLive'] === 1 });
    },
};
