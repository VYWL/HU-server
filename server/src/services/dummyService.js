import dummyData from '../dummy/initTest.json';

export default (req, res) => {
    res.status(200);
    res.json(dummyData).end();
};
