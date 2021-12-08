import express from 'express';
import { query } from '@/loaders/mysql';
import { parseList, defaultResponse, getToday, response, makeMsg } from '@/api';
import { requestToAgent } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';

export default {
    addInspection: async (req: express.Request, res: express.Response) => {
        const { 
            policy_idx = -1,
            security_category_idx = -1,
            target = "ALL",
            inspection_config = {},
            related_file = ""
        } = req.body;

        if (policy_idx === -1) return response(res, 400, 'Parameter Errors : policy_idx does not exist.');
        if (security_category_idx === -1) return response(res, 400, 'Parameter Errors : security_category_idx does not exist.');

        const formatted_config = JSON.parse(inspection_config);

        let dbData;

        try {
            dbData = await query('INSERT inspection(policy_idx, security_category_idx, target, inspection_config, related_file) VALUE(?, ?, ?, ?, ?)\
                                ON DUPLICATE KEY UPDATE policy_idx = ?, security_category_idx = ?, target = ?, inspection_config = ?, related_file = ?', 
                                [policy_idx, security_category_idx, target, formatted_config, related_file,
                                 policy_idx, security_category_idx, target, formatted_config, related_file]);
        } catch (err) {
            console.log(err);
            console.log('데이터 삽입에 실패했습니다.');
            return response(res, 500, 'Internal Server Errors : Database Error');
        }

        return response(res, 200, dbData);
    },

    excuteTask: async (req: express.Request, res: express.Response) => {
        // const taskList = req.body.task_queue ?? null;

        // if(taskList === null) return response(res, 400, 'Parameter Errors : taskList does not exist.');

        // // DB에 ticket 처리(5개씩 나누기)

        // const ticketList = parseList(taskList, 5);
        
        // const task_info = [];
        
        // for(let i = 0; i < ticketList.length; ++i) {
        //     const ticket = {
        //         name : "",
        //         timestamp: getToday(true),
        //         total_level
        //     }


        //     task_info.push(ticket);
        // }

        


        

        // 첫 순서 진행 => 파일 압축해서 보내기

        // 에이전트에게 파일명 보내기

        // 웹에게 response
    },
};