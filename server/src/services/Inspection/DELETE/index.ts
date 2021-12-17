import express from 'express';
import { query } from '@/loaders/mysql';
import { defaultResponse, getToday, response } from '@/api';
import { requestToAgent } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';

export default {
    deleteInspection: async (req: express.Request, res: express.Response) => {
        const inspection_idx = Number(req.query.inspection_idx ?? -1);
        
        console.log(`[INFO] Removing inspection info :: path = ${req.path}`);

        if(inspection_idx === -1) return response(res, 400, 'Parameter Errors : inspection_idx does not exist.');
                
        let dbData;

        try {
            dbData = await query('SELECT idx FROM inspection WHERE idx = ?;', [inspection_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if (dbData.length === 0) {
            return response(res, 404);
        }

        try {
            dbData = await query('DELETE FROM inspection WHERE idx = ?;', [inspection_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, {removedIdx : inspection_idx});

    },
};