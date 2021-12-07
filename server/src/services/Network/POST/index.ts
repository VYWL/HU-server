import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';

export default {
    addNetworkCategoryInfo: async (req: express.Request, res: express.Response) => {
        const { name } = req.body;

        if (!name) response(res, 400, 'Parameter Errors : name does not exist.');

        let dbData;

        try {
            dbData = await query('INSERT INTO network_category(name) values(?);', [name]);
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }

        // TODO 카테고리 모델 번호 기능 추가 필요, API 분할 필요한 듯 (동현)

        response(res, 200, dbData);
    },
};
