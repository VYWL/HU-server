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

const regex = /(BOBSTART).*(BOBEND)/g;
export const resolveMSG = msg => msg.toString().match(regex)[0].replace('BOBSTART', '').replace('BOBEND', '');
