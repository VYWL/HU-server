import express from "express";
import {query} from '@/loaders/mysql';
import { defaultResponse, response } from "@/api";

export default {
    getAllDeviceList : async (req , res : express.Response) => {
        // 모든 장비 리스트를 가져온다
        // 페이지가 구분되어있는듯 하다. param에 있음.
        // 

        const limit = Number(req.query.limit);
        const page = Number(req.query.page);
        
        const offset = limit * (page - 1);
        let dbData;

        try {
            dbData = await query("SELECT * FROM device\
                                LEFT JOIN device_category ON device_category.idx = device.device_category_idx\
                                LEFT JOIN network_category ON network_category.idx = device.network_category_idx\
                                LEFT JOIN environment ON environment.idx = device.environment_idx\
                                ORDER BY device.idx ASC\
                                LIMIT ? OFFSET ? ",  [limit, offset]);
        } catch (err) {
            console.log(err);

            res.status(404);
            res.json({
                ...defaultResponse,
                message :"FAILED",
                errors:"올바르지 않은 요청입니다."
            }).end();
        }

        res.status(200);
        res.json({
            ...defaultResponse,
            outputs : dbData
        }).end();

    },

    getDeviceInfo  : async (req: express.Request, res : express.Response) => {
        const device_idx = req.params.device_idx;

        let dbData;

        try {
            dbData = await query("SELECT 'idx', `device`.`idx`, 'name', `device`.`name` ,'model_name', `device`.`model_name`, 'serial_number', `device`.`serial_number`,\
            'environment', `environment`.`name`, 'category', `device_category`.`name`, 'network', `network_category`.`name`,\
            'live', IF(`device`.`live` = 1, TRUE, FALSE), 'update_time', `device`.`update_time`,\
            'network_info', JSON_EXTRACT(`device`.`network_info`, '$.network_info'), 'os_info', JSON_EXTRACT(`device`.`os_info`, '$'), 'service_list', JSON_EXTRACT(`device`.`service_list`, '$.service_info'), 'connect_method', JSON_EXTRACT(`device`.`connect_method`, '$')\
            FROM `device`\
            LEFT JOIN `device_category` ON `device_category`.`idx` = `device`.`device_category_idx`\
            LEFT JOIN `network_category` ON `network_category`.`idx` = `device`.`network_category_idx`\
            LEFT JOIN `environment` ON `environment`.`idx` = `device`.`environment_idx`\
            WHERE `device`.`idx` = ?", [device_idx])

        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },

    getAllDeviceCategories  : async (req: express.Request, res : express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT 'idx', idx, 'name', name\
                                FROM `device_category` \
                                WHERE `agent` = 0 \
                                ORDER BY `idx` ASC");

        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },
    getDeviceCategoryInfo  : async (req: express.Request, res : express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT 'idx', idx, 'name', name\
                                FROM `device_category` \
                                WHERE `agent` = 0 \
                                ORDER BY `idx` ASC");

        } catch (err) {
            console.log(err);

            response(res, 404);
        }

        response(res, 200, dbData);
    },
    getDeviceEnvList   : (req: express.Request, res : express.Response) => {

    },
    getDeviceEnvInfo   : (req: express.Request, res : express.Response) => {

    },
    getDeviceCount   : (req: express.Request, res : express.Response) => {

    },
    getUnregisteredDeviceList   : (req: express.Request, res : express.Response) => {

    },
    getModuleListByDevice    : (req: express.Request, res : express.Response) => {

    },
    getTotalLog    : (req: express.Request, res : express.Response) => {

    },
    getLogByDevice    : (req: express.Request, res : express.Response) => {

    },
    getTotalLogCount     : (req: express.Request, res : express.Response) => {

    },
    getLogCountByDevice    : (req: express.Request, res : express.Response) => {

    },
    getPolicyListByDevice    : (req: express.Request, res : express.Response) => {

    },
    getActivePolicyListByDevice    : (req: express.Request, res : express.Response) => {

    },
    
    getInactivePolicyListByDevice     : (req: express.Request, res : express.Response) => {

    },
    
    getRecommandedPolicyListByDevice     : (req: express.Request, res : express.Response) => {

    },
    
    getRecommandedChecklistByDevice     : (req: express.Request, res : express.Response) => {

    },   
    getIsLiveByDevice : (req: express.Request, res : express.Response) => {

    },   
}