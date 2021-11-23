import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dummyClass from '@/services/dummyClass';
import Device from '@/services/Device';
import Module from '@/services/Module';
import Dashboard from '@/services/Dashboard';
import Policy from '@/services/Policy';
import Others from '@/services/Others';

export default async ({ app }: { app: express.Application }) => {
    // dummy req
    app.get('/status', dummyClass.dummyStatus);
    app.get('/test', dummyClass.dummyService);

    // Device req
    app.get('/devices', Device.getAllDeviceList);
    app.get('/devices/:device_idx', Device.getDeviceInfo);
    app.get('/devices/categories', Device.getAllDeviceCategories);
    app.get('/devices/categories/:category_idx', Device.getDeviceCategoryInfo);
    app.get('/devices/environments', Device.getDeviceEnvList);
    app.get('/devices/environments/:environment_idx', Device.getDeviceEnvInfo);
    app.get('/devices/count', Device.getDeviceCount);
    app.get('/devices/unregistered', Device.getUnregisteredDeviceList);
    app.get('/devices/:device_idx/modules', Device.getModuleListByDevice);
    app.get('/devices/logs', Device.getTotalLog);
    app.get('/devices/:device_idx/logs', Device.getLogByDevice);
    app.get('/devices/logs/count', Device.getTotalLogCount);
    app.get('/devices/:device_idx/logs/count', Device.getLogCountByDevice);
    app.get('/devices/:device_idx/policies', Device.getPolicyListByDevice);
    app.get('/devices/:device_idx/policies/activate', Device.getActivePolicyListByDevice);
    app.get('/devices/:device_idx/policies/inactivate', Device.getInactivePolicyListByDevice);
    app.get('/devices/:device_idx/policies/recommand', Device.getRecommandedPolicyListByDevice);
    app.get('/devices/:device_idx/checklists', Device.getRecommandedChecklistByDevice);
    app.get('/devices/:device_idx/live', Device.getIsLiveByDevice);

    app.post('/devices');
    app.post('/devices/categories');
    app.post('/devices/environments');

    app.put('/devices/:device_idx', Device.editDeviceInfo);
    app.put('/devices/categories/:category_idx', Device.editDeviceCategoryInfo);
    app.put('/devices/environments/:environment_idx', Device.editDeviceEnvInfo);

    app.delete('/devices/:device_idx', Device.deleteDeviceInfo);
    app.delete('/devices/categories/:category_idx', Device.deleteDeviceCategoryInfo);
    app.delete('/devices/environments/:environment_idx', Device.deleteDeviceEnvInfo);

    // Module req
    app.get('/modules', Module.getAllModule);
    app.get('/modules/:module_idx', Module.getModuleInfo);
    app.get('/modules/categories', Module.getAllModuleCategories);
    app.get('/modules/categories/:category_idx', Module.getModuleCategoryInfo);
    app.get('/modules/count', Module.getTotalModuleCount);
    app.get('/modules/unregistered', Module.getTotalUnregisteredModuleList);
    // app.get('/modules/logs', ); => 명단에 없음
    app.get('/modules/logs/count', Module.getTotalLogCount);
    app.get('/modules/:module_idx/logs/count', Module.getLogCountByModule);

    app.post('/modules', Module.addModule);
    app.post('/modules/categories', Module.addModuleCategory);

    app.put('/modules/:module_idx', Module.editModuleInfo);
    app.put('/modules/categories/:category_idx', Module.editModuleCategoryInfo);

    app.delete('/modules/:module_idx', Module.deleteModule);
    app.delete('/modules/categories/:category_idx', Module.deleteModuleCategoryInfo);

    // Dashboard req
    app.get('/dashboard/statistics', Dashboard.getAllStats);
    app.get('/dashboard/logs', Dashboard.getTotalLogCountByTime);
    app.get('/dashboard/logs/threat', Dashboard.getTotalLogCountByThreat);
    app.get('/dashboard/logs/group', Dashboard.getTotalLogCountByGroup);
    app.get('/dashboard/policies', Dashboard.getAppliedPolicy);

    // Policy req
    app.get('/policies', Policy.getPolicyList);
    app.get('/policies/:policy_idx', Policy.getPolicyInfo);
    app.get('/policies/:policy_idx/devices', Policy.getDeviceListByPolicy);
    app.get('/policies/:policy_idx/download', Policy.downloadPolicyFiles);

    app.post('/policies', Policy.addPolicy);
    app.post('/policies/:policy_idx/state', Policy.changePolicyState);

    app.put('/policies/:policy_idx', Policy.editPolicy);

    app.delete('/policies/:policy_idx', Policy.deletePolicy);

    // Security req
    app.get('/securities/categories', Others.getSecurityCategoryList);
    app.get('/securities/categories/:category_idx', Others.getSecurityCategoryInfo);

    app.post('/securities/categories', Others.addSecurityCategoryInfo);

    app.put('/securities/categories/:category_idx', Others.editSecurityCategoryInfo);

    app.delete('/securities/categories/:category_idx', Others.deleteSecurityCategoryInfo);

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
