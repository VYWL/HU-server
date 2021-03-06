import { getToday, makeMsg } from '@/api';
import { query } from '@/loaders/mysql';
import { PROCESS_CODE } from '@/config';
import { exec } from 'child_process';
import fs from 'fs';
import getZipFile from '@/data/_sender.js';

let socketClientPool = [];
const findDevice = device_idx => socketClientPool.find(e => Number(e['ref'].device_idx) === Number(device_idx));

const insertProcessList = async (socket_info, data) => {
    const processList = JSON.parse(data);
    const device_idx = socket_info['ref'].device_idx;
    const timestamp = getToday(true);

    console.log(`[INFO] Inserting process list :: device_idx = ${device_idx}, length = ${processList['metainfo'].length}`);

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query('DELETE FROM process WHERE device_idx = ?;', [device_idx]);
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
        return;
    }

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

    console.log(`[INFO] Inserting file descriptor list :: device_idx = ${device_idx}, length = ${fdList['metainfo'].length}`);

    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query('DELETE FROM file_descriptor WHERE device_idx = ?;', [device_idx]);
    } catch (err) {
        console.log(err);
        console.log({msg: "FAILED", data : dbData});
        return;
    }

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

    console.log(`[INFO] Inserting monitoring result :: device_idx = ${device_idx}, length = ${monitorResult}`);

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

    // console.log(`[INFO] Inserting monitoring log :: device_idx = ${device_idx}`);


    if (device_idx === -1) return;

    let dbData;

    try {
        dbData = await query(
            'INSERT INTO log(event_code, description, device_idx, original_log, create_time, environment, status, layer, log_path)\
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
            [
                'E-Monitoring',
                '???????????? ?????? ????????? ?????????.',
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

    // console.log({msg: "success", data : dbData});

    // console.log(`[INFO] Monitoring data successfully inserted :: device_idx = ${device_idx}, log_path = ${log_path}, insertId = ${dbData["insertId"]}`)
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

    // console.log(`[DEBUG]`)
    // console.log({networkInfo, osInfo, serviceList, connect_method, isLive, socketCode, update_time, serialNumber})    
    // console.log(`[DEBUG]`)

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

    console.log(`[INFO] Updating device info :: device_idx = ${socket_info["ref"].device_idx}, serviceList = ${serviceList.length}`);


    console.log(`Socket Info Updated :: port = ${socket_info["ref"].remotePort}, device_idx = ${socket_info["ref"].device_idx}`);

};

const updateDeviceStatus = async (socket_info, data) => {
    const info = JSON.parse(data);

    const socketCode = socket_info['ref'].id;
    const timestamp = getToday(true);

    console.log(`[INFO] Updating device status :: device_idx = ${socket_info['ref'].device_idx}, socketCode = ${socketCode}`);

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

const sendInspectionRequest = async (data) => {};
const updateModuleInfo = async (socket_info, data) => {};
const insertPolicyResult = async (socket_info, data) => {};
const updateInspectionResult = async (socket_info, data) => {
    const info = JSON.parse(data);

    console.log(`[INFO] RESPONSE ARRIVED :: device_idx = ${socket_info["ref"].device_idx}, location = INSPECTION_RESULT`);

    const levelStatus = info["result"];
    const timestamp = info["detail"]["timestamp"];
    const ticket_idx = info["request_info"]["ticket_idx"] ?? -1;

    if(ticket_idx === -1) return;

    // ?????? ?????? ??????
    let ticketData;

    try {
        ticketData = (await query('SELECT * from inspection_log WHERE idx = ?;', [ticket_idx]))[0];
    } catch (errr) {
        console.log(err);
        console.log("Ticket ????????? ??????????????? ??????????????????.");
        return;
    }

    const { name, total_level, now_level, process_info } = ticketData;

    console.log(`[INFO] NOW QUERY :: level_status = ${levelStatus}, timestamp = ${timestamp}`);

    if(!levelStatus) {
        const nowIdx = Number(now_level) - 1;
        const totalLevel = Number(total_level);
        
        // ?????? ???????????? ?????? ?????? ?????? FAIL
        let processInfo = JSON.parse(process_info);

        processInfo[nowIdx]["status"] = "FAIL";
        processInfo[nowIdx]["detail"] = info["detail"]["detail"];
        processInfo[nowIdx]["timestamp"] = timestamp;
        

        for(let i = nowIdx + 1; i < totalLevel; ++i ) {
            processInfo[i]["status"] = "FAIL";
            processInfo[i]["timestamp"] = timestamp;
        }

        // UPDATE data ??????

        const newProcessInfo = JSON.stringify(processInfo);

        const newTicketData = {
            name : name,
            timestamp : timestamp,
            status: "FIN",
            total_level : totalLevel,
            now_level : totalLevel,
            process_info : newProcessInfo
        }

        console.log(`[INFO] NEW DATA :: ${newProcessInfo}`);

        // UPDATE ??????

        let dbData;

        try {
            dbData = (await query('UPDATE inspection_log SET \
                                name = ?, \
                                timestamp = ?, \
                                status = ?, \
                                total_level = ?, \
                                now_level = ?, \
                                process_info = ? \
                                WHERE idx = ?;', 
                                [
                                    name,
                                    timestamp,
                                    "FIN",
                                    totalLevel,
                                    totalLevel,
                                    `${newProcessInfo}`,
                                    ticket_idx
                                ]));
        } catch (errr) {
            console.log(err);
            console.log("Ticket ????????? ????????????????????? ??????????????????.");
            return;
        }
    }

    else {
        // ?????? ?????? ok ??????
        const nowIdx = Number(now_level) - 1;
        let processInfo = JSON.parse(process_info);

        processInfo[nowIdx]["status"] = "FIN";
        processInfo[nowIdx]["detail"] = info["detail"]["detail"];
        processInfo[nowIdx]["timestamp"] = timestamp;

        // ?????? ????????? ????????????, ???????????? ?????? status FIN ??????

        let status = "IN PROGRESS"
        let newLevel = nowIdx + 2;

        if(total_level === now_level) {
            status = "FIN";
            newLevel = total_level;
        }

        const now_process = processInfo[nowIdx + 1];

        // UPDATE data ??????

        const newProcessInfo = JSON.stringify(processInfo);

        const newTicketData = {
            name : name,
            timestamp : timestamp,
            status: status,
            total_level : total_level,
            now_level : newLevel,
            process_info : newProcessInfo
        }

        console.log(`[INFO] NEW DATA :: total_level = ${newTicketData.total_level}, now_level : ${newTicketData.now_level}`);
        console.log(`${newProcessInfo}`)

        // DB ????????????

        let dbData;

        try {
            dbData = (await query('UPDATE inspection_log SET\
                                    name = ?, \
                                    timestamp = ?, \
                                    status = ?, \
                                    total_level = ?, \
                                    now_level = ?, \
                                    process_info = ? \
                                WHERE idx = ?;', 
                                [
                                    name,
                                    timestamp,
                                    status,
                                    total_level,
                                    newLevel,
                                    `${newProcessInfo}`,
                                    ticket_idx
                                ]));
        } catch (err) {
            console.log(err);
            console.log("Ticket ????????? ????????????????????? ??????????????????.");
            return;
        }
        // FIN?????? ??????, ???????????? ?????? ??????

        if(status === "FIN") return;

        // agent ?????? data ??????. ?????? ALL?????? ??? ????????? ???????????? (????????? ????????? ALL????????? ??? ???????????????.)
    
        const nextSendFile = now_process["related_file"];
    
        const { ref } = socket_info;
    
        // ?????? ??? ??????
        const gzFileName = await getZipFile([nextSendFile], newLevel);
        
        const sendData = {
            ticket_idx : ticket_idx,
            level : newLevel,
            filename : gzFileName
        }

        console.log(`[INFO] Send ${gzFileName} to ${ref.device_idx}`);
        requestToAgent(ref.device_idx, PROCESS_CODE.INSPECTION_REQUEST, sendData);
    }
};

// REQUEST

const requestToAgent = (device_idx, p_code, bodyData) => {
    // Exception
    console.log(`[INFO] Request To Agent(${device_idx}) :: code = ${p_code}`);
    if(device_idx === -1) return;

    // find device
    const targetDevice = findDevice(device_idx);
    if(!targetDevice) return;

    const socketRef = targetDevice['ref'];
    
    // config data
    const body = { protocol: p_code, data: bodyData };
    const s_data = JSON.stringify(body);
    const s_msg = makeMsg(s_data);
    
    console.log(`[INFO] Sending To Agent a message :: device_idx = ${device_idx}, msgLength : ${s_msg.length}`);

    // send Data
    socketRef.write(s_msg);

    console.log("[INFO] Successfully sent!");
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

    else if(req_protocol === PROCESS_CODE.INSPECTION_REQUEST) {
        updateInspectionResult(socket_info, data);
    }
}

const setAgentManagerEnvInfo = async (socket_info, data) => {
    const isSuccess = data === "Success";

    if(isSuccess) console.log(`[INFO] Successfully set HurryupAM env file :: device_idx = ${socket_info["ref"].device_idx}`);
    else console.log(`[ERROR] Failed to set HurryupAM env file :: device_idx = ${socket_info["ref"].device_idx}`);
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
    // { protocol: PROCESS_CODE.INSPECTION_REQUEST, cbFunc: sendInspectionRequest },
    // { protocol: PROCESS_CODE.INSPECTION_RESULT, cbFunc: updateInspectionResult },
    { protocol: PROCESS_CODE.RESPONSE, cbFunc : handleResponse },
    { protocol: PROCESS_CODE.SET_INIT_ENV, cbFunc : setAgentManagerEnvInfo }
];


const editDeviceInfoBySocketCode = async (socketCode = '') => {
    
    console.log(`[INFO] Editing device info by socket code :: socketCode = ${socketCode}`);

    if (!socketCode) return;

    let dbData;

    // DB ????????? ?????? ?????? ????????????
    // 1. socketCode ??????(blank)
    // 2. live ?????? ??????

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