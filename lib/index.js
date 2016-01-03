var request = require('request');
var Q = require('q');
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

  var get_post_data = function(post_data) {
    /* Get the full post data dict, this method adds the token to the dict. */
    var d = JSON.parse(JSON.stringify(post_data));
    if (self.token) {
      d['token'] = self.token;
    }
    return d;
  };

  var fetch_url = function(action, post_data, get_params, json_decode) {
    var deferred = Q.defer();

    var url = get_url(action);
    post_data = get_post_data(post_data);

    var req = request.post({
      url: get_url(action),
      formData: post_data,
      json: true
    }, function(err, res, body) {
      if (err) {
        deferred.reject(res);
      } else {
        deferred.resolve(body);
      }
    });

    return deferred.promise;
  };

  var login = function() {
    var deferred = Q.defer();

    fetch_url('login', self.auth).then(function(res) {
      var token = res['token'];
      self.token = token
      deferred.resolve(token);
    });

    return deferred.promise;
  };


  /* export public functions */
  self.get_url = get_url;
  self.login = login;

  return self;
};

module.exports = {
  OpenMoticsApi: OpenMoticsApi
};
