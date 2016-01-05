var OpenMoticsApi = require('../openmotics.js');

var env = {
    username: process.env.OPENMOTICS_USERNAME,
    password: process.env.OPENMOTICS_PASSWORD,
    hostname: process.env.OPENMOTICS_HOSTNAME || 'localhost',
    port: process.env.OPENMOTICS_PORT || 443
};

module.exports = OpenMoticsApi(env.username, env.password, env.hostname, false, env.port);
