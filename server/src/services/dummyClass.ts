import express from 'express';
const dummyData = require('../dummy/initTest.json');

export default {
    dummyStatus: (req: express.Request, res: express.Response) => {
        res.status(200).end();
    },

    dummyService: (req: express.Request, res: express.Response) => {
        res.status(200);
        res.json(dummyData).end();
    },
};
