import express from 'express';

export default {
    getAllModule: async (req: express.Request, res: express.Response) => {},
    getModuleInfo: async (req: express.Request, res: express.Response) => {},
    getAllModuleCategories: async (req: express.Request, res: express.Response) => {},
    getModuleCategoryInfo: async (req: express.Request, res: express.Response) => {},
    getTotalModuleCount: async (req: express.Request, res: express.Response) => {},
    getTotalUnregisteredModuleList: async (req: express.Request, res: express.Response) => {},
    getTotalLogCount: async (req: express.Request, res: express.Response) => {},
    getLogCountByModule: async (req: express.Request, res: express.Response) => {},
};
