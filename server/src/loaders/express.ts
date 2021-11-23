import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

export default async ({ app }: { app: express.Application }) => {
    app.get('/status', (req, res) => {
        // TODO :: log 남기는 로직 등록
        console.log('송신완료');

        // TODO :: 명세에 상태코드와 함께 적어두기
        res.status(200);

        // TODO :: 명세에 상태코드와 함께 적어두기
        res.json({
            msg: 'hihi',
        }).end();
    });
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
