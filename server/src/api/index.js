export const defaultResponse = {
    message: 'SUCCESS',
    errors: [],
};

export const response = (res, code, dbData = {}) => {
    switch (code) {
        case 500:
            res.status(500);
            res.json({
                ...defaultResponse,
                message: 'FAILED',
                errors: dbData ?? 'Internal Server Error',
            }).end();
            break;
        case 400:
            res.status(400);
            res.json({
                ...defaultResponse,
                message: 'FAILED',
                errors: dbData,
            }).end();
            break;
        case 200:
            res.status(200);
            res.json({
                ...defaultResponse,
                outputs: dbData,
            }).end();
            break;
        case 404:
        default:
            res.status(404);
            res.json({
                ...defaultResponse,
                message: 'FAILED',
                errors: '올바르지 않은 요청입니다.',
            }).end();
            break;
    }

    return 0;
};

export const getToday = (more = false) => {
    const date = new Date();

    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + (more ? ' ' + hour + ':' + minute + ':' + second : '');
};

export const makeMsg = str => 'BOBSTART' + str + 'BOBEND';

export const range = len => {
    let ar = [];
    for (let i = 0; i < len; ++i) {
        ar.push(i);
    }
    return ar;
};

export const genSerialNumber = () => {
    let serialNumber = '';

    for (let i = 0; i < 5; i++) {
        const randNum = Number(Math.round(Math.random() * 100));
        serialNumber += String.fromCharCode(97 + (randNum % 26));
    }

    serialNumber += '-';

    for (let i = 0; i < 10; i++) {
        const randNum = Number(Math.round(Math.random() * 100));
        serialNumber += `${randNum % 10}`;
    }

    return serialNumber;
};

const queryRegex = /(?<=BOBSTART)(.|\r|\t|\n)+?(?=BOBEND)/g;
const totalRegex = /(BOBSTART)(.|\r|\t|\n)*(BOBEND)/g
export const resolveMSG = msg => msg.toString().match(queryRegex);

export const filterQuery = msg => msg.replace(totalRegex, "");

export const isComplete = msg => (msg.toString().match(queryRegex) ? true : false);

export const parseList = (arr = [], n = 1) => {
    const len = arr.length;

    const cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
    const returnList = [];

    for (let i = 0; i < cnt; ++i) {
        returnList.push(arr.splice(0, n));
    }

    return returnList;
};


export const returnDataWithCount = dataList => {
    if(dataList === undefined) return { count : 0, data : [] };

    const count = dataList.length;
    
    return { count, data : dataList }
}