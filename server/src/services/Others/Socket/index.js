// 참고용 Opcode
// enum OPCODE {
//     PROCESS_LIST,
//     FD_LIST,
//     MONITORING_ACTIVATE,
//     MONITORING_INACTIVATE,
//     DEVICE,
//     MODULE,
//     POLICY_ACTIVATE,
//     POLICY_INACTIVATE,
//     INSPECTION_ACTIVATE,
//     MONITORING_RESULT,
//     MONITORING_LOG,
//     POLICY_RESULT,
//     INSPECTION_RESULT,
//     DEVICE_DEAD,
//     COLLECT_INFO_INTERVAL,
//     COLLECT_DEVICE_INFO,
//     CHANGE_INTERVAL
// };

import { getToday } from '@/api';
import { query } from '@/loaders/mysql';

const insertProcessList = async (socket_info, data) => {
    const processList = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;

    if (device_idx === -1) return;

    let dbData;

    for (let i = 0; i < processList['metaInfo'].length; ++i) {
        const nowProcess = processList['metaInfo'][i];

        try {
            dbData = await query(
                "Insert into process(pid, ppid, name, state, command, start_time, update_time, device_idx) \
            values (?, ?, ?, ?', ?, ?, ?, ?);",
                [
                    nowProcess.pid,
                    nowProcess.ppid,
                    nowProcess.name,
                    nowProcess.state,
                    nowProcess.cmdline,
                    nowProcess.startTime,
                    getToday(true),
                    device_idx,
                ]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }
    }
};
const insertFileDescriptorList = async (socket_info, data) => {
    const fdList = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;

    if (device_idx === -1) return;

    let dbData;

    for (let i = 0; i < fdList['metaInfo'].length; ++i) {
        const nowFD = fdList['metaInfo'][i];

        try {
            dbData = await query(
                'Insert into file_descriptor(pid, name, path, device_idx, update_time) values (?, ?, ?, ?, ?);',
                [nowFD.pid, nowFD.fdName, nowFD.realPath, device_idx, getToday(true)]
            );
        } catch (err) {
            console.log(err);
            response(res, 500, 'Internal Server Errors : Database error');
        }
    }
};
const insertMonitoringResult = async (socket_info, data) => {
    const monitorResult = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query(
            'INSERT INTO monitoring (process_name, log_path, activate, device_idx, update_time) VALUES(?, ?, ?, ?, ?) \
            ON DUPLICATE KEY UPDATE activate = ?, update_time = ?;',
            [
                monitorResult.processName,
                monitorResult.logPath,
                monitorResult.result,
                device_idx,
                getToday(true),
                monitorResult.result,
                getToday(true),
            ]
        );
    } catch (err) {
        console.log(err);
        response(res, 500, 'Internal Server Errors : Database error');
    }
};

const insertMonitoringLog = async (socket_info, data) => {
    const monitorInfo = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query(
            'INSERT INTO log(event_code, description, device_idx, original_log, create_time, environment, status, layer)\
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
            [
                'E-Monitoring',
                '모니터링 로그 데이터 입니다.',
                device_idx,
                data,
                getToday(true),
                'Agent',
                'INFO',
                'Device',
            ]
        );
    } catch (err) {
        console.log(err);
        response(res, 500, 'Internal Server Errors : Database error');
    }
};
const updateDeviceInfo = async (socket_info, data) => {
    const info = JSON.parse(data);

    const osInfo = info['metaInfo']['osInfo'];
    const networkInfo = info['metaInfo']['networkInfo'];
    const serviceList = info['metaInfo']['serviceList'];
    const connect_method = info['metaInfo']['connectMethod'];
    const serialNumber = info['serialNumber'];

    const socketCode = socket_info['ref'].id;

    let dbData;

    try {
        dbData = await query(
            'UPDATE `device`\
		SET `network_info` = ?, `os_info` = ?, `service_list` = ?, `connect_method` = ?, `live` = 1, `socket` = ?, `update_time` = ?\
		WHERE `serial_number` = ?',
            [networkInfo, osInfo, serviceList, connect_method, socketCode, getToday(true), serialNumber]
        );
    } catch (err) {
        console.log(err);
        response(res, 500, 'Internal Server Errors : Database error');
    }
};
const updateDeviceStatus = async (socket_info, data) => {
    const info = JSON.parse(data);

    const socketCode = socket_info['ref'].id;

    let dbData;

    try {
        dbData = await query('UPDATE device SET update_time=?, socket=0, live=0 WHERE socket=?;', [
            getToday(true),
            socketCode,
        ]);
    } catch (err) {
        console.log(err);
        response(res, 500, 'Internal Server Errors : Database error');
    }
};
// const updateModuleInfo = async (socket_info, data) => {};
// const insertPolicyResult = async (socket_info, data) => {};
// const insertInspectionResult = async (socket_info, data) => {};

export const processCodeList = [
    { Opcode: 0, cbFunc: insertProcessList },
    { Opcode: 1, cbFunc: insertFileDescriptorList },
    { Opcode: 10, cbFunc: insertMonitoringResult },
    { Opcode: 11, cbFunc: insertMonitoringLog },
    { Opcode: 5, cbFunc: updateDeviceInfo },
    { Opcode: 14, cbFunc: updateDeviceStatus },
    // { Opcode: 6, cbFunc: updateModuleInfo },
    // { Opcode: 12, cbFunc: insertPolicyResult },
    // { Opcode: 13, cbFunc: insertInspectionResult },
];

export const editDeviceInfoBySocketCode = (socketCode = '') => {
    if (!socketCode) return;

    let dbData;

    // DB 데이터 조회 해서 바꿔야함
    // 1. socketCode 삭제(blank)
    // 2. live 상태 변경

    try {
        dbData = await query('UPDATE device SET update_time=?, socket=0, live=0 WHERE socket=?;', [
            getToday(true),
            socketCode,
        ]);
    } catch (err) {
        console.log(err);
        response(res, 500, 'Internal Server Errors : Database error');
    }
};
