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

        client.on('end', () => {
            console.log('Client disconnected');

            // 본인 ID와 timestamp가 같은 객체를 찾아서 삭제
            const removeSocketClientIdx = socketClientPool.findIndex(e => e.code === socketCode && e.createTime === createTime);
            socketClientPool.splice(removeSocketClientIdx, 1);

            // 쿼리를 날려서 특정 기기 정보 변경 => socketCode로 DB를 조회하는 API 필요
            editDeviceInfoBySocketCode(socketCode);
        });
    }).listen(HU_SOCKET_PORT, HU_SOCKET_HOST, () => {
        console.log(`Socket Server connected : ${HU_SOCKET_PORT}, ${HU_SOCKET_HOST}`);
    });
};
