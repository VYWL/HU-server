const express = require('express');
const loaders = require('./loaders');
const { PORT } = require('./config');

// for Debug
console.clear();

async function startServer() {
    const app = express();

    await loaders.default({ expressApp: app });

    app.listen(PORT, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Your server is ready !`);
    });
}

startServer();
