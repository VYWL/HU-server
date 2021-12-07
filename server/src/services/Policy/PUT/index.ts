import express from 'express';
import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";

export default {
    editPolicy: async (req: express.Request, res : express.Response) => {
        const { 
            main, 
            sub, 
            classify, 
            name, 
            description, 
            isfile, 
            apply_content, 
            release_content, 
            argument : rawArgument, 
            command
        } = req.body;

        let dbData;
        const policy_idx = Number(req.params.policy_idx ?? -1);

        // get Security Category Idx

        try {
            dbData = await query(
                'SELECT idx FROM security_category WHERE main = ? AND sub = ?\
                LIMIT 1',
                [main, sub]
            );
        } catch (err) {
            console.log(err);
            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        if(dbData.length === 0) {
            return response(res, 500, "일치하는 대분류-중분류 쌍이 없습니다.");
        }

        const argument = JSON.stringify(rawArgument);
        const security_category_idx = dbData[0]["idx"];

        try {
            dbData = await query(
                'UPDATE policy SET classify = ?, name = ?, description=?, isfile=?, apply_content=?, release_content=?, argument=?, command=?, security_category_idx=? \
                WHERE idx = ?',
                [ classify, name, description, isfile, apply_content, release_content, argument, command, security_category_idx, policy_idx ]
            );
        } catch (err) {
            console.log(err);

            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, dbData);
    },

    editCustomPolicy: async (req: express.Request, res: express.Response) => {
        const custom_policy_idx = Number(req.body.custom_policy_idx ?? -1);
        const rawData = req.body.data;

        if (custom_policy_idx === -1) return response(res, 400, 'Parameter Errors : custom_policy_idx must be number.');
        if (rawData === undefined) return response(res, 400, 'Parameter Errors : configData does not exist.');
        
        const configData = JSON.stringify(rawData);
    
        let dbData;
    
        try {
            dbData = await query(
                'UPDATE policy_custom SET config = ? WHERE idx = ?',
                [configData, custom_policy_idx]
            );
        } catch (err) {
            console.log(err);
            console.log('사용자 정의 정책 설정값 업데이트에 실패했습니다.');
            return response(res, 404);
        }
    
        // TODO :: 정책 실행 관련 함수 호출

        return response(res, 200, dbData);
    },
}

