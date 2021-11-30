import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getSecurityCategoryList: (req: express.Request, res: express.Response) => {},
    getSecurityCategoryInfo: (req: express.Request, res: express.Response) => {},

    // getNetworkCategoryList: async (req: express.Request, res: express.Response) => {
    //     let dbData;

    //     try {
    //         dbData = await query(
    //             "SELECT 'idx', idx, 'name', name \
    //         FROM `network_category` \
    //         ORDER BY `idx` ASC;"
    //         );
    //     } catch (err) {
    //         console.log(err);
    //         console.log('네트워크 카테고리를 불러올 수 없습니다.');
    //         response(res, 500, 'Internal Server Errors : Database Errors');
    //     }

    //     response(res, 200, dbData);
    // },
};
