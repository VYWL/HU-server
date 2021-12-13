import express from 'express';
import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent, socketClientPool } from "@/services/Others/Socket";
import fs from 'fs';
import { exec } from 'child_process';
import getZipFile from '@/data/_sender.js';

export default {
    addPolicy: async (req: express.Request, res: express.Response) => {
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
                'INSERT INTO `policy` (`classify`, `name`,`description`,`isfile`,`apply_content`,`release_content`,`argument`,`command`, `security_category_idx`) \
                values (?, ?, ?, ?, ?, ?, ?, ?, ?) \
                ON DUPLICATE KEY UPDATE `classify`= ?, name = ?, description=?, isfile=?, apply_content=?, release_content=?, argument=?, command=?, security_category_idx=?;',
                [ classify, name, description, isfile, apply_content, release_content, argument, command, security_category_idx,
                classify, name, description, isfile, apply_content, release_content, argument, command, security_category_idx ]
            );
        } catch (err) {
            console.log(err);

            return response(res, 500, 'Internal Server Errors : Database Errors');
        }

        return response(res, 200, dbData);
    },

    changePolicyState: async (req: express.Request, res: express.Response) => {
        const custom_idx = Number(req.params.custom_idx ?? -1);

        if (custom_idx === -1) return response(res, 400, 'Parameter Errors : custom_idx must be number.');

        let dbData;
    
        try {
            dbData = await query("SELECT activate FROM policy_custom\
                                WHERE idx = ?", [custom_idx]);
        } catch (err) {
            console.log(err);
            console.log('사용자 정의 정책 조회에 실패했습니다.');
            return response(res, 404);
        }

        const isActive = dbData[0]["activate"] === 1 ? true : false;

        const newState = !isActive ? 1 : 0;
    
        try {
            dbData = await query("UPDATE policy_custom SET activate = ? WHERE idx = ?", [newState, custom_idx]);
        } catch (err) {
            console.log(err);
            console.log('사용자 정의 정책 상태 수정에 실패했습니다.');
            return response(res, 404);
        }

        return response(res, 200, dbData);
    },

    addCustomPolicy: async (req: express.Request, res: express.Response) => {
        const device_idx = Number(req.body.device_idx ?? -1);
        const policy_idx = Number(req.body.policy_idx ?? -1);
        const security_category_idx = Number(req.body.security_category_idx ?? -1);
        const activate = req.body.activate;
        const rawData = req.body.data;

        if (device_idx === -1) return response(res, 400, 'Parameter Errors : device_idx must be number.');
        if (policy_idx === -1) return response(res, 400, 'Parameter Errors : policy_idx must be number.');
        if (security_category_idx === -1) return response(res, 400, 'Parameter Errors : security_category_idx must be number.');
        if (activate === undefined) return response(res, 400, 'Parameter Errors : isActive does not exist.');
        if (rawData === undefined) return response(res, 400, 'Parameter Errors : configData does not exist.');
        
        const configData = JSON.stringify(rawData)
        const stateValue = false;
    
        let dbData;
    
        try {
            dbData = await query(
                'INSERT INTO policy_custom(device_idx, policy_idx, security_category_idx, activate, config) \
            Values(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activate = ?, config = ?;',
                [device_idx, policy_idx, security_category_idx, activate, configData, stateValue, configData]
            );
        } catch (err) {
            console.log(err);
            console.log('사용자 정의 정책 등록에 실패했습니다.');
            return response(res, 404);
        }
    
        // TODO :: 정책 실행 관련 함수 호출
        if(policy_idx === 196) {
            // iptables 룰을 config 대로 구성하는 함수 호출.
            const config = rawData.map(e => {
                const { Chain : c, Protocol: p, Source_IP : s_ip, Destination_IP : d_ip, Source_Port : s_p, Destination_Port : d_p, Jump : j  } = e;

                const argument = [];

                const isValid = val => val !== "*";

                if(c) argument.push(`-A ${c}`);
                if(p) argument.push(`-p ${p}`);
                if(isValid(s_ip)) argument.push(`--source ${s_ip}`);
                if(isValid(d_ip)) argument.push(`--destination ${d_ip}`);
                if(isValid(s_p)) argument.push(`--sport ${s_p}`);
                if(isValid(d_p)) argument.push(`--dport ${d_p}`);
                if(j) argument.push(`--jump ${j}`);

                return argument.join(' ');
            })

            let statement = "";

            statement += `*filter\n`;
            statement += `:INPUT ACCEPT [0:0]\n`;
            statement += `:FORWARD ACCEPT [0:0]\n`;
            statement += `:OUTPUT ACCEPT [0:0]\n\n`;

            config.forEach(e => statement += checkStr(e) + '\n');
            statement += `\n`;

            statement += `COMMIT`;

            // iptables.rules 에 저장.

            const timestamp = (new Date).toISOString().replace(/ /g, '').replace(/[:-]/g, '_').replace('.','');

            const loc = `${__dirname}/../../../data`;
            
            // ZIP
            
            // 해당 파일 두개 압축 후에 데이터를 담아서 Agent에게 요청

            await exec(`mkdir ${loc}/iptables_${timestamp}`, async (err, out) => {
                if(err) console.log(`[ERROR] iptables.rules 생성오류!`)
        
                await fs.writeFile(`${loc}/iptables_${timestamp}/iptables.rules`, statement, async err => {
                    await exec(`cp ${loc}/U-18.sh ${loc}/iptables_${timestamp}/U-18.sh`, async (err, out) => {
                        if(err) console.log(`[ERROR] U-18 파일 이동중에 오류발생!`);
    
    
                        const nowSendFile = ["iptables.rules", "U-18.sh"]
    
                        const gzFileName = await getZipFile([...nowSendFile], 0, `${loc}/iptables_${timestamp}`);
                            
                        for(let e of socketClientPool) {
                            const { ref } = e;
    
                            const sendData = {
                                ticket_idx : dbData['insertId'],
                                filename : gzFileName
                            }
                
                            console.log(`[INFO] Send ${gzFileName} to ${ref.device_idx}`);
                            await requestToAgent(ref.device_idx, PROCESS_CODE.POLICY_REQUEST, sendData);
                
                        }
                    })
                });
            });
            
        } else {
            // 명령어 조합을 담은 파일을 구성 (config)

            // 데이터를 조합해서 Agent에게 실행하게끔 하는 로직
        }

        return response(res, 200, dbData);
    },
};
const checkStr = str => str.replace(/(\|\|) | (&&)/g, "");