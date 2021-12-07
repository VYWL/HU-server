import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    getNetworkCategoryList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query('SELECT idx, name FROM `network_category` ORDER BY `idx` ASC;');
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        // TODO 카테고리 모델 번호 기능 추가 필요, API 분할 필요한 듯 (동현)

        response(res, 200, dbData);
    },

    getNetworkCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = req.params.category_idx;

        if (!category_idx) response(res, 400, 'Parameter Errors : category_idx does not exist.');
        // TODO :: body 속성 검증

        let dbData;

        try {
            dbData = await query('SELECT idx, name FROM network_category WHERE idx = ?;', [category_idx]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        // TODO 카테고리 모델 번호 기능 추가 필요, API 분할 필요한 듯 (동현)

        response(res, 200, dbData);
    },
};
