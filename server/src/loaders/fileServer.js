import net from 'net';
import fs from 'fs';
import { FILESERVER_PORT, FILESERVER_HOST } from '@/config';

let FILEPATH = '';

export default async () => { 
    net.createServer(function (socket) {
        socket.on('data', data => {
            const filename = data.toString();

            // TODO :: 자동 옵션 추가 기능. => 함수화
            FILEPATH = getPath(filename);

            try {
                fs.statSync(FILEPATH);
              } catch (error) {
                  //파일이 없다면 에러 발생
                  if (error.code === "ENOENT") {
                      FILEPATH = ""
                  }
              }

            const isFileExistBuf = findFile(FILEPATH);
            socket.write(isFileExistBuf);

            if (FILEPATH) fs.createReadStream(FILEPATH).pipe(socket);

            console.log(`[${FILEPATH ? 'INFO' : 'ERROR'}] ${filename} ${FILEPATH ? '이 전송됨.' : '를(을) 찾을 수 없음.'}`);
        });

        socket.on('error', err => {
            console.log(err);
        })
    }).listen(FILESERVER_PORT, FILESERVER_HOST, () => {
        console.log('File Uploading Server Initialized');
    });
}

const findFile = path => {
    const buf = Buffer.alloc(4);

    const validCode = path ? '01' : '00';

    const isValid = Buffer.from(validCode, 'hex');

    isValid.copy(buf, buf.length - isValid.length);

    return buf;
};

const getPath = filename => `${__dirname}/../data/${filename}`;