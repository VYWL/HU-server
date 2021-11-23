import express from 'express';

export default class dummyClass {
    constructor() {}

    async dummyStatus(req: express.Request, res: express.Response): Promise<void> {
        // something
    }

    public async dummyService(req: express.Request, res: express.Response): Promise<void> {
        // something
    }
}
