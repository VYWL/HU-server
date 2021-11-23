import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dummyService from '@/services/dummyService';

export default async ({ app }: { app: express.Application }) => {
    app.get('/status', (req, res) => {
        res.status(200).end();
    });

    app.get('/test', dummyService);

    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    app.enable('trust proxy');

    app.use(cors());

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    // ...More middlewares

    // Return the express app
    return app;
};
