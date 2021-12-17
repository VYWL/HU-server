import express from 'express';
import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";

export default {
    deletePolicy: async (req: express.Request, res : express.Response) => {
        const policy_idx = Number(req.params.policy_idx ?? -1);
        
        console.log(`[INFO] Removing policy info :: path = ${req.path}, policy_idx = ${policy_idx}`);
        
        if (policy_idx === -1) return response(res, 400, 'Parameter Errors : policy_idx must be number.');
       
        let dbData;
    
        try {
            dbData = await query('SELECT idx FROM policy WHERE idx = ?;', [policy_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }
    
        if (dbData.length === 0) {
            return response(res, 404);
        }
    
        try {
            dbData = await query('DELETE FROM policy where idx = ?;', [policy_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }
    
        return response(res, 200, {msg:"SUCCESS", removeIdx : policy_idx});
    },

    deleteCustomPolicy: async (req: express.Request, res : express.Response) => {
        const custom_policy_idx = Number(req.params.custom_policy_idx ?? -1);
        
        console.log(`[INFO] Removing custom policy info :: path = ${req.path}, custom_policy_idx = ${custom_policy_idx}`);

        if (custom_policy_idx === -1) return response(res, 400, 'Parameter Errors : custom_policy_idx must be number.');
       
        let dbData;
    
        try {
            dbData = await query('SELECT idx FROM policy_custom WHERE idx = ?;', [custom_policy_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }
    
        if (dbData.length === 0) {
            return response(res, 404);
        }
    
        try {
            dbData = await query('DELETE FROM policy_custom where idx = ?;', [custom_policy_idx]);
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }
    
        return response(res, 200, {msg:"SUCCESS", removeIdx : custom_policy_idx});
    },
}    