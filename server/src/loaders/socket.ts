import { makeMsg } from '@/api';
import { HU_SOCKET_HOST, HU_SOCKET_PORT } from '@/config';
import net from 'net';

export default async () => {
    const client = net.connect({ port: HU_SOCKET_PORT, host: HU_SOCKET_HOST }, () => {
        console.log('Client Connected.');
    });

    // write Message
    (() => {
        const dummyData = {
            protocol: 104,
            data: { test: 'test' },
        };

        client.write(makeMsg(JSON.stringify(dummyData)));
    })();

    // Others
    client.on('data', function (data) {
        console.log(data.toString());
        client.end();
    });
    client.on('end', function () {
        console.log('Client disconnected');
    });

    client.on('error', function (err) {
        console.log('Socket Error: ', JSON.stringify(err));
    });

    client.on('timeout', function () {
        console.log('Socket Timed out');
    });
};
