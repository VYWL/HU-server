import express from 'express';
import { query } from '@/loaders/mysql';
import { parseList, defaultResponse, getToday, response, makeMsg } from '@/api';
import { requestToAgent, socketClientPool } from "@/services/Others/Socket";
import { PROCESS_CODE } from '@/config';
import getZipFile from '@/data/_sender.js';

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

        const formatted_config = JSON.stringify(inspection_config);

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
        const taskList = req.body.apply_list ?? null;

        if(taskList === null) return response(res, 400, 'Parameter Errors : apply_list does not exist.');

        // ticket 처리(5개씩 나누기)

        const ticketList = parseList(taskList, 5);
        
        const task_info = [];
        
        // 첫 순서만 수행중 표기하고 나머지는 PENDING

        for(let i = 0; i < ticketList.length; ++i) {
            const taskName = `점검 ${ticketList[i].map(e => e.idx ?? 0).join(', ')}번 TASK GROUP`;

            const process_info = ticketList[i].map((e, i) => {
                const { idx = 0, name = "inspection", related_file = "file" } = e;

                return {
                    inspection_idx : idx,
                    level_name : name,
                    status : i === 0 ? "IN PROGRESS" : "PENDING",
                    related_file : related_file,
                    timestamp: "",
                    detail: [],
                }
            })

            const ticket = {
                name : taskName,
                timestamp: getToday(true),
                total_level : ticketList[i].length,
                now_level : 1,
                status: "IN PROGRESS",
                process_info: JSON.stringify(process_info)
            }

            task_info.push(ticket);
        }
        
        // DB에 로그 관련 정보 저장

        let dbData;

        const created_ticket_list = [];

        for(let i = 0; i < task_info.length; ++i) {
            const { name, timestamp, status, total_level, now_level, process_info } = task_info[i];

            try {
                dbData = await query("INSERT inspection_log(name, timestamp, status, total_level, now_level, process_info) VALUE(?,?,?,?,?,?)\
                                    ON DUPLICATE KEY UPDATE name = ?, timestamp = ?, status = ?, total_level = ?, now_level = ?, process_info = ?",
                                    [ name, timestamp, status, total_level, now_level, process_info,
                                    name, timestamp, status, total_level, now_level, process_info]);
            } catch (err) {
                console.log(err);
                console.log('데이터 삽입에 실패했습니다.');
                return response(res, 500, 'Internal Server Errors : Database Error');
            }

            task_info[i].idx = dbData['insertId'];

            created_ticket_list.push(dbData['insertId']);
        }

        // 첫 순서 진행 =>에이전트에게 파일 압축한 뒤에, 파일명 보내기

        for(let i = 0; i < task_info.length; ++i) {
            const { idx, process_info } = task_info[i];

            const init_process = JSON.parse(process_info)[0];

            // agent 에게 data 전송. 이때 ALL이면 현 등록된 모두에게 (지금은 모두가 ALL이어서 다 열어두었음.)

            const nowSendFile = init_process["related_file"];
            const nowLevel = 1;
            const nowTicketIdx = idx;

            for(let e of socketClientPool) {
                const { ref } = e;

                // 압축 및 응답
                const gzFileName = await getZipFile([nowSendFile], nowLevel);
                
                const sendData = {
                    ticket_idx : nowTicketIdx,
                    level : nowLevel,
                    filename : gzFileName
                }

                console.log(`[INFO] Send ${gzFileName} to ${ref.device_idx}`);
                await requestToAgent(ref.device_idx, PROCESS_CODE.INSPECTION_REQUEST, sendData);
            }  
        }

        // 웹에게 response
        return response(res, 200, task_info);
    },
};