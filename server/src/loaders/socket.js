import { resolveMSG, isComplete, filterQuery } from '@/api';
import { HU_SOCKET_HOST, HU_SOCKET_PORT } from '@/config';
import net from 'net';
import { processCodeList, editDeviceInfoBySocketCode } from '@/services/Others/Socket';
import shortid from 'shortid';

export default async () => {
    net.createServer(client => {
        console.log('ready :: ' + client.remotePort);
        let { socketClientPool } = require('@/services/Others/Socket');

        let totalData = "";
        const socketCode = shortid.generate();
        const createTime = new Date().toISOString();
        
        client.id = socketCode;
        client.createTime = createTime;
        client.device_idx = -1;

        const socketData = {
            code: socketCode,
            ref: client.ref(),
            timestamp: createTime,
        };

        socketClientPool.push(socketData);

        client.on('data', data => {
            const recvData = data.toString();

            totalData += recvData;
            if (!isComplete(totalData)) return;

            const queryList = resolveMSG(totalData);

            queryList.forEach(query => {
                const recvJSON = JSON.parse(query);
                const { protocol, data: jsonData } = recvJSON;

                const process = processCodeList.find(e => e.protocol === protocol);

                if (!process) console.log('[ERROR] No Exact Process!');
                else process['cbFunc'](socketData, jsonData);
            })

            totalData = filterQuery(totalData);
        });

        client.on('error', err => {
            console.log(err);

            const removeSocketClientIdx = socketClientPool.findIndex(e => e.code === socketCode && e.createTime === createTime);
            socketClientPool.splice(removeSocketClientIdx, 1);
            
            editDeviceInfoBySocketCode(socketCode);

            console.log("ERROR :: client shut down");
        })

        client.on('end', () => {
            console.log(`Client disconnected :: port = ${client.remotePort}, device_idx = ${client.device_idx}`);

            // ?????? ID??? timestamp??? ?????? ????????? ????????? ??????
            const removeSocketClientIdx = socketClientPool.findIndex(e => e.code === socketCode && e.createTime === createTime);
            socketClientPool.splice(removeSocketClientIdx, 1);

            // ????????? ????????? ?????? ?????? ?????? ?????? => socketCode??? DB??? ???????????? API ??????
            editDeviceInfoBySocketCode(socketCode);
        });
    }).listen(HU_SOCKET_PORT, HU_SOCKET_HOST, () => {
        console.log(`Socket Server connected : ${HU_SOCKET_PORT}, ${HU_SOCKET_HOST}`);
    });
};
