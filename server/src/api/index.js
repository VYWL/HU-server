export const defaultResponse = {
    message :"SUCCESS",
    errors: []
}

export const response = (res, code, dbData = {}) => {

    switch(code) {
        case 200 :
            res.status(200);
            res.json({
                ...defaultResponse,
                outputs : dbData
            }).end();
            break;
        case 404 :
        default:
            res.status(404);
            res.json({
                ...defaultResponse,
                message :"FAILED",
                errors:"올바르지 않은 요청입니다."
            }).end();
            break;
    }

}

export const getToday = () => {
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

    return date.getFullYear() + '-' + month + '-' + day; // + ' ' + hour + ':' + minute + ':' + second;
}