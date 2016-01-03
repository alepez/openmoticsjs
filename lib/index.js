var request = require('request');
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

  var get_url = function(action) {
    return 'https://' + self.hostname + ':' + self.port + '/' + action;
  };

  var login = function() {
    
  };


  /* export public functions */
  self.get_url = get_url;

  return self;
};

module.exports = {
  OpenMoticsApi: OpenMoticsApi
};
