import { getToday, makeMsg } from '@/api';
import { query } from '@/loaders/mysql';
import { PROCESS_CODE } from '@/config';
import { exec } from 'child_process';
import fs from 'fs';



let socketClientPool = [];
const findDevice = device_idx => socketClientPool.find(e => Number(e['ref'].device_idx) === Number(device_idx));

const insertProcessList = async (socket_info, data) => {
    const processList = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;
    const timestamp = getToday(true);

    if (device_idx === -1) return;
    let dbData;

    for (let i = 0; i < processList['metainfo'].length; ++i) {
        const nowProcess = processList['metainfo'][i];

        try {
            dbData = await query(
                "Insert into process(pid, ppid, name, state, command, start_time, update_time, device_idx) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\
            ON DUPLICATE KEY UPDATE update_time = ?;",
                [
                    nowProcess.pid,
                    nowProcess.ppid,
                    nowProcess.name,
                    nowProcess.state,
                    nowProcess.cmdline,
                    nowProcess.start_time,
                    timestamp,
                    device_idx,
                    timestamp
                ]
            );
        } catch (err) {
            console.log(err);
            console.log({msg: "FAILED", data : dbData});
        }
    }
};
const insertFileDescriptorList = async (socket_info, data) => {
    const fdList = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;
    const timestamp = getToday(true);

    if (device_idx === -1) return;

    let dbData;

    for (let i = 0; i < fdList['metainfo'].length; ++i) {
        const nowFD = fdList['metainfo'][i];

        try {
            dbData = await query(
                'Insert into file_descriptor(pid, name, path, device_idx, update_time) values (?, ?, ?, ?, ?)\
                ON DUPLICATE KEY UPDATE update_time = ?;',
                [nowFD.pid, nowFD.fd_name, nowFD.real_path, device_idx, timestamp, timestamp]
            );
        } catch (err) {
            console.log(err);
            console.log({msg: "FAILED", data : dbData});
        }
    }
};
const insertMonitoringResult = async (socket_info, data) => {
    const monitorResult = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;
    const timestamp = getToday(true);

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query(
            'INSERT INTO monitoring (process_name, log_path, activate, device_idx, update_time) VALUES(?, ?, ?, ?, ?) \
            ON DUPLICATE KEY UPDATE activate = ?, update_time = ?;',
            [
                monitorResult.processName,
                monitorResult.log_path,
                monitorResult.activate,
                device_idx,
                timestamp,
                monitorResult.activate,
                timestamp,
            ]
        );
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
    }
};

const insertMonitoringLog = async (socket_info, data) => {
    const monitorInfo = JSON.parse(data);
    const log_data = monitorInfo['metainfo']['log_data'];
    const log_path = log_data["log_path"];
    const change_data = log_data["change_data"];


    const device_idx = socket_info['ref'].device_idx;
    const timestamp = getToday(true);

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query(
            'INSERT INTO log(event_code, description, device_idx, original_log, create_time, environment, status, layer, log_path)\
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
            [
                'E-Monitoring',
                '모니터링 로그 데이터 입니다.',
                device_idx,
                change_data,
                timestamp,
                'Agent',
                'INFO_TEST',
                'Device',
                log_path
            ]
        );
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
        return;
    }

    console.log({msg: "success", data : dbData});
};
const updateDeviceInfo = async (socket_info, data) => {
    const info = JSON.parse(data);

    const osInfo = JSON.stringify(info['metainfo']['os_info']);
    const networkInfo = JSON.stringify(info['metainfo']['network_info']);
    const serviceList = JSON.stringify(info['metainfo']['service_list']);
    const isLive = info['metainfo']['live'] ?? true;
    const connect_method = JSON.stringify(info['metainfo']['connect_method']);
    const serialNumber = info['serial_number'];
    const update_time = getToday(true);

    const socketCode = socket_info['ref'].id;

    let dbData;

    try {
        dbData = await query(
            'UPDATE `device`\
		SET `network_info` = ?, `os_info` = ?, `service_list` = ?, `connect_method` = ?, `live` = ?, `socket` = ?, `update_time` = ?\
		WHERE `serial_number` = ?',
            [networkInfo, osInfo, serviceList, connect_method, isLive, socketCode, update_time, serialNumber]
        );

        dbData = await query("SELECT idx from device WHERE serial_number = ? AND update_time = ?;",[serialNumber, update_time]);

        socket_info["ref"].device_idx = dbData[0]["idx"];
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
    }

    console.log(`Socket Info Updated :: device_idx = ${socket_info["ref"].device_idx}`);

};

const updateDeviceStatus = async (socket_info, data) => {
    const info = JSON.parse(data);

    const socketCode = socket_info['ref'].id;
    const timestamp = getToday(true);

    let dbData;

    try {
        dbData = await query('UPDATE device SET update_time=?, socket=0, live=0 WHERE socket=?;', [
            timestamp,
            socketCode,
        ]);
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
    }
};

const updateModuleInfo = async (socket_info, data) => {};
const insertPolicyResult = async (socket_info, data) => {};
const insertInspectionResult = async (socket_info, data) => {
    console.log("Successfully Received!");
};

// REQUEST

const requestToAgent = (device_idx, p_code, bodyData) => {
    // Exception
    console.log(`Request To Agent(${device_idx}) :: code = ${p_code}`);
    if(device_idx === -1) return;

    // find device
    const targetDevice = findDevice(device_idx);
    if(!targetDevice) return;

    console.log("Sending To Agent a message")

    const socketRef = targetDevice['ref'];

    // config data
    const body = { protocol: p_code, data: bodyData };
    const s_data = JSON.stringify(body);
    const s_msg = makeMsg(s_data);

    // send Data
    socketRef.write(s_msg);

    console.log("Successfully sent!");
};

const handleResponse = async (socket_info, data) => {
    const info = JSON.parse(data);

    const device_idx = socket_info['ref'].device_idx;
    const req_protocol = info["request_protocol"];

    if(req_protocol === PROCESS_CODE.MONITORING_REQUEST) {
        const process_name = info["request_info"]["process_name"];
        const log_path = info["request_info"]["log_path"];
        const nowState = info["result"];

        try {
            const dbData = await query("UPDATE monitoring SET activate = ? WHERE process_name = ? AND log_path = ? AND device_idx = ?", 
                [nowState, process_name, log_path, device_idx]);
        } catch (err) {
            console.log(err);
            console.log("DB update failed");
        }
    }
}

const processCodeList = [
    { protocol: PROCESS_CODE.PROCESS, cbFunc: insertProcessList },
    { protocol: PROCESS_CODE.FILEDESCRIPTOR, cbFunc: insertFileDescriptorList },
    // { protocol: PROCESS_CODE.MONITORING_LOG, cbFunc: insertMonitoringResult },
    { protocol: PROCESS_CODE.MONITORING_LOG, cbFunc: insertMonitoringLog },
    { protocol: PROCESS_CODE.DEVICE, cbFunc: updateDeviceInfo },
    // { protocol: 14, cbFunc: updateDeviceStatus },
    { protocol: PROCESS_CODE.MODULE, cbFunc: updateModuleInfo },
    // { protocol: 12, cbFunc: insertPolicyResult },
    { protocol: PROCESS_CODE.INSPECTION_RESULT, cbFunc: insertInspectionResult },
    { protocol: PROCESS_CODE.RESPONSE, cbFunc : handleResponse}
];


const editDeviceInfoBySocketCode = async (socketCode = '') => {
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
        console.log({msg: "FAILED", data : dbData});
    }
};

module.exports = {
    requestToAgent,
    processCodeList,
    socketClientPool,
    editDeviceInfoBySocketCode
}