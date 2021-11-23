import express from 'express';

export default {
    getSecurityCategoryList    : (req: express.Request, res : express.Response) => {
        res.status(200);
        res.json({
            "msg":"hi"
        }).end();
    },
    getSecurityCategoryInfo      : (req: express.Request, res : express.Response) => {

    }
}