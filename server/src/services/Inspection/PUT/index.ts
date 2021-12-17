import express from 'express';
import { query } from '@/loaders/mysql';
import { defaultResponse, getToday, response } from '@/api';
import { requestToAgent } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';

export default {
    editInspection: async (req: express.Request, res: express.Response) => {
        const { 
            policy_idx,
            security_category_idx,
            target = "ALL",
            inspection_config = {},
            related_file = ""
        } = req.body;

        const inspection_idx = req.params.inspection_idx ?? -1;

        console.log(`[INFO] Editing inspection info :: path = ${req.path}`);

        if (inspection_idx === -1) return response(res, 400, 'Parameter Errors : inspection_idx does not exist.');

        let dbData;

        try {
            dbData = await query(
                'UPDATE inspection set policy_idx = ? , security_category_idx = ?, target = ?, inspection_config = ?, related_file = ?\
                where idx = ?;',
                [
                    policy_idx,
                    security_category_idx.
                    target,
                    inspection_config,
                    related_file,
                    inspection_idx
                ]
            );
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database error');
        }

        return response(res, 200, { idx: inspection_idx });
        
    },
};