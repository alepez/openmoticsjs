var OpenMoticsApi = function(username, password, hostname, verify_https, port) {

  /* init */
  var self = {
    auth: {
      username: username,
      password: password
    },
    hostname: hostname,
    verify_https: verify_https,
    port: port,
    token: null
  };

  return self;
};

module.exports = {
  OpenMoticsApi: OpenMoticsApi
};
