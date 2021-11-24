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