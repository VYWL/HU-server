import { response } from '@/api';
import { query } from '@/loaders/mysql';
import express from 'express';
import fs from 'fs';

export default {
    getSecurityCategoryList: async (req: express.Request, res: express.Response) => {
        let dbData;

        try {
            dbData = await query("SELECT * FROM security_category");
        }
        catch (err) {
            console.log(err);
            response(res, 500, "Internal server error : Database error");
        }

        response(res, 200, dbData);

    },
    getSecurityCategoryInfo: async (req: express.Request, res: express.Response) => {
        const category_idx = Number(req.params.category_idx ?? -1);

        if (category_idx === -1) response(res, 400, 'Parameter Errors : idx must be number.');
        
        let dbData;

        try {
            dbData = await query("SELECT * FROM security_category\
                                WHERE idx=?;",[category_idx]);
        }
        catch (err) {
            console.log(err);
            response(res, 500, "Internal server error : Database error");
        }

        response(res, 200, dbData);
    },

    getUbuntuBuildFile: async (req: express.Request, res: express.Response) => {
        const buildFile = `${__dirname}/../../../data/Build/ubuntu/HurryUp_Agent`

        res.download(buildFile);
        return;
    },

    getRaspBuildFile: async (req: express.Request, res: express.Response) => {
        const buildFile = `${__dirname}/../../../data/Build/rasp/HurryUp_Agent`

        res.download(buildFile);
        return;
    },
};
