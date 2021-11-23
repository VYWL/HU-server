import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dummyClass from '@/services/dummyClass';
import Device from '@/services/Device'

export default async ({ app }: { app: express.Application }) => {

    // dummy req
    app.get('/status', dummyClass.dummyStatus);
    app.get('/test', dummyClass.dummyService);

    // Device req
    app.get('/devices', Device.getAllDeviceList);
    app.get('/devices/:device_idx', Device.getDeviceInfo);
    app.get('/devices/categories', Device.getAllDeviceCategories );
    app.get('/devices/categories/:category_idx', Device.getDeviceCategoryInfo );
    app.get('/devices/environments', Device.getDeviceEnvList );
    app.get('/devices/environments/:environment_idx', Device.getDeviceEnvInfo );
    app.get('/devices/count', Device.getDeviceCount );
    app.get('/devices/unregistered', Device.getUnregisteredDeviceList  );
    app.get('/devices/:device_idx/modules', Device.getModuleListByDevice  );
    app.get('/devices/logs', Device.getTotalLog  );
    app.get('/devices/:device_idx/logs', Device.getLogByDevice  );
    app.get('/devices/logs/count', Device.getTotalLogCount   );
    app.get('/devices/:device_idx/logs/count', Device.getLogCountByDevice  );
    app.get('/devices/:device_idx/policies', Device.getPolicyListByDevice  );
    app.get('/devices/:device_idx/policies/activate', Device.getActivePolicyListByDevice   );
    app.get('/devices/:device_idx/policies/inactivate', Device.getInactivePolicyListByDevice    );
    app.get('/devices/:device_idx/policies/recommand', Device.getRecommandedPolicyListByDevice   );
    app.get('/devices/:device_idx/checklists', Device.getRecommandedChecklistByDevice   );
    app.get('/devices/:device_idx/live',Device.getIsLiveByDevice);

    app.post('/devices', );
    app.post('/devices/categories', );
    app.post('/devices/environments', );

    app.put('/devices/:device_idx', Device.editDeviceInfo );
    app.put('/devices/categories/:category_idx', Device.editDeviceCategoryInfo );
    app.put('/devices/environments/:environment_idx', Device.editDeviceEnvInfo );

    app.delete('/devices/:device_idx', Device.deleteDeviceInfo );
    app.delete('/devices/categories/:category_idx', Device.deleteDeviceCategoryInfo );
    app.delete('/devices/environments/:environment_idx', Device.deleteDeviceEnvInfo );

    // Proxy, CORS, BodyParser, etc...
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
