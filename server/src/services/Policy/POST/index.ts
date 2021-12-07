import express from 'express';
import { getToday, response } from '@/api';
import { PROCESS_CODE } from '@/config';
import { query } from '@/loaders/mysql';
import { requestToAgent } from "@/services/Others/Socket";


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
    changePolicyState: async (req: express.Request, res: express.Response) => {},
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
        const stateValue = Boolean(activate);
    
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

        return response(res, 200, dbData);
    },
};

/*
CREATE TABLE IF NOT EXISTS `policy` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'policy idx',


  `classify` text DEFAULT NULL COMMENT '대응 정책 소분류',
  `name` text DEFAULT NULL COMMENT '대응 정책 이름',
  `description` text DEFAULT NULL COMMENT '대응 정책 설명',
  `isfile` BOOLEAN DEFAULT NULL COMMENT '대응 정책 파일 인지 판단하는 컬럼',
  `apply_content` text DEFAULT NULL COMMENT '대응 정책을 적용시킨 파일이나 스크립트 등',
  `release_content` text DEFAULT NULL COMMENT '대응 정책을 적용시킨 파일이나 스크립트 등',
  `argument` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '대응 정책을 실행하는데 필요한 인자값 (사용자 정의 반영)' CHECK (json_valid(`argument`)),
  `command` text DEFAULT NULL COMMENT '대응 정책을 실행시키는 명령어',

  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT 'security_category_idx',

  PRIMARY KEY (`idx`),
  KEY `policy_category` (`security_category_idx`),
  CONSTRAINT `policy_category` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=239 DEFAULT CHARSET=utf8mb4 COMMENT='정책 정보를 관리하는 테이블';


*/