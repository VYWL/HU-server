import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Device from '@/services/Device';
import Module from '@/services/Module';
import Dashboard from '@/services/Dashboard';
import Policy from '@/services/Policy';
import Others from '@/services/Others';
import Monitoring from '@/services/Monitoring';
import Network from '@/services/Network';
import Inspection from '@/services/Inspection';
import { getToday } from '@/api';

export default async ({ app }: { app: express.Application }) => {
    const router = express.Router();

    // Proxy, CORS, BodyParser, etc...
    app.enable('trust proxy');

    app.use(cors());

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Device req
    app.get('/devices', Device.getAllDeviceList);
    app.get('/devices/:device_idx(\\d+)?', Device.getDeviceInfo);
    // TODO :: 합치기

    app.get('/devices/categories', Device.getAllDeviceCategories);
    app.get('/devices/categories/:category_idx(\\d+)?', Device.getDeviceCategoryInfo);
    // TODO :: 합치기

    app.get('/devices/environments', Device.getDeviceEnvList);
    app.get('/devices/environments/:environment_idx(\\d+)?', Device.getDeviceEnvInfo);
    // TODO :: 합치기

    app.get('/devices/count', Device.getDeviceCount);
    app.get('/devices/unregistered', Device.getUnregisteredDeviceList);
    app.get('/devices/logs', Device.getTotalLog);
    app.get('/devices/logs/count', Device.getTotalLogCount);
    app.get('/devices/:device_idx(\\d+)/modules', Device.getModuleListByDevice);
    app.get('/devices/:device_idx(\\d+)/statistics', Device.getStatisticsByDevice);

    app.get('/devices/:device_idx/logs', Device.getLogByDevice);
    app.get('/devices/:device_idx/logs/count', Device.getLogCountByDevice);
    app.get('/devices/:device_idx/logs/attack', Device.getStatisticsByThreat);

    app.get('/devices/:device_idx(\\d+)/policies', Device.getPolicyListByDevice);
    // app.get('/devices/:device_idx(\\d+)/policies/activate', Device.getActivePolicyListByDevice);
    // app.get('/devices/:device_idx(\\d+)/policies/inactivate', Device.getInactivePolicyListByDevice);
    app.get('/devices/:device_idx(\\d+)/policies/recommand', Device.getRecommandedPolicyListByDevice);

    // TODO :: checklist => inspection
    app.get('/devices/:device_idx(\\d+)/inspection/recommand', Device.getRecommandedInspectionByDevice);
    app.get('/devices/:device_idx(\\d+)/live', Device.getIsLiveByDevice);

    app.post('/devices', Device.addDevice);
    // TODO :: categories 에서 category
    app.post('/devices/categories', Device.addCategory);
    app.post('/devices/environments');

    app.put('/devices/:device_idx(\\d+)?', Device.editDeviceInfo);
    app.put('/devices/categories/:category_idx(\\d+)?', Device.editDeviceCategoryInfo);
    app.put('/devices/environments/:environment_idx(\\d+)?', Device.editDeviceEnvInfo);

    app.delete('/devices/:device_idx(\\d+)?', Device.deleteDeviceInfo);
    app.delete('/devices/categories/:category_idx(\\d+)?', Device.deleteDeviceCategoryInfo);
    app.delete('/devices/environments/:environment_idx(\\d+)?', Device.deleteDeviceEnvInfo);

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
    // app.get('/dashboard/logs/threat', Dashboard.getTotalLogCountByThreat);
    // app.get('/dashboard/logs/group', Dashboard.getTotalLogCountByGroup);
    // app.get('/dashboard/policies', Dashboard.getAppliedPolicy);

    // Environment req => TODO :: environments(복수형) 아님!!, 이거 Device에 이미 있음. /devices/environments
    // app.get('/environments/categories', Environment.getDeviceEnvInfo);

    // Policy req
    app.get('/policies', Policy.getPolicyList);
    app.get('/policies/custom', Policy.getCustomPolicyList);
    app.get('/policies/:policy_idx(\\d+)?', Policy.getPolicyInfo);
    app.get('/policies/:policy_idx(\\d+)/devices', Policy.getDeviceListByPolicy);
    app.get('/policies/:policy_idx(\\d+)/download', Policy.downloadPolicyFiles);

    app.post('/policies', Policy.addPolicy);
    app.post('/policies/custom', Policy.addCustomPolicy);
    app.post('/policies/:custom_idx(\\d+)/state', Policy.changePolicyState); 

    app.put('/policies/custom', Policy.editCustomPolicy);
    app.put('/policies/:policy_idx(\\d+)', Policy.editPolicy);

    app.delete('/policies/custom/:custom_policy_idx(\\d+)', Policy.deleteCustomPolicy);
    app.delete('/policies/:policy_idx(\\d+)', Policy.deletePolicy);

    // Security req
    app.get('/securities/categories', Others.getSecurityCategoryList);
    app.get('/securities/categories/:category_idx(\\d+)', Others.getSecurityCategoryInfo);

    app.post('/securities/categories', Others.addSecurityCategoryInfo);

    app.put('/securities/categories/:category_idx(\\d+)', Others.editSecurityCategoryInfo);

    app.delete('/securities/categories/:category_idx(\\d+)', Others.deleteSecurityCategoryInfo);

    // Monitoring req
    app.get('/monitoring', Monitoring.getMonitoringList);
    app.get('/monitoring/devices/', Monitoring.getMonitoringPossibleDeviceList);
    app.get('/monitoring/:monitoring_idx(\\d+)', Monitoring.getLogByMonitoringIdx);
    app.get('/monitoring/log', Monitoring.getTotalParsedLog);
    app.get('/monitoring/log/count', Monitoring.getTotalMonitoringLogCountByTime);
    app.get('/monitoring/statistics', Monitoring.getAllMonitoringStats);
    app.get('/monitoring/active', Monitoring.getMonitoringList);
    app.get(
        '/monitoring/:device_idx(\\d+)/process/:process_idx(\\d+)/filedescriptor',
        Monitoring.getFileDescriptorList
    );
    app.get('/monitoring/:device_idx(\\d+)/process', Monitoring.getProcessList);

    app.post('/monitoring', Monitoring.setMonitoringState);
    app.post(
        '/monitoring/:device_idx(\\d+)/process/:process_idx(\\d+)/filedescriptor',
        Monitoring.gatherFileDescriptorList
    );
    app.post('/monitoring/:device_idx(\\d+)/process', Monitoring.gatherProcessList);

    // Network req
    app.get('/networks/categories', Network.getNetworkCategoryList);
    app.get('/networks/categories/:category_idx(\\d+)', Network.getNetworkCategoryInfo);

    app.post('/networks/categories', Network.addNetworkCategoryInfo);

    app.put('/networks/categories/:category_idx(\\d+)', Network.editNetworkCategoryInfo);

    app.delete('/networks/categories/:category_idx(\\d+)', Network.deleteNetworkCategoryInfo);

    // Inspection req
    app.get('/inspection', Inspection.getInspectionList);
    app.get('/inspection/task', Inspection.getTaskInfoList);
    
    app.post('/inspection/', Inspection.addInspection);
    app.post('/inspection/task', Inspection.excuteTask);

    app.put('/inspection/:inspection_idx(\\d+)', Inspection.editInspection);

    app.delete('/inspection', Inspection.deleteInspection);

    // Download req

    app.get('/download/ubuntu', Others.getUbuntuBuildFile);
    app.get('/download/rasp', Others.getRaspBuildFile);

    app.use((req, res, next) => {
        console.log(`ERROR : 404 (${req.path})`)

        console.log(`[${getToday(true)}] `);
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    // ...More middlewares

    // Return the express app
    return app;
};
