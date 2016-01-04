var Q = require('q');

var request = (function() {
  if (typeof $ === 'function') {
    /* jquery */
    return function(config, callback) {
      $.ajax({
        method: config.post,
        url: config.url,
        data: config.formData,
        dataType: 'json'
      }).done(function(data) {
        callback(null, {
          statusCode: 200
        }, data);
      });
    };
  } else {
    /* nodejs */
    var impl = require('request');
    return function(config, callback) {
      return impl(config, callback);
    };
  }
}());

var OpenMoticsApi = function(username, password, hostname, verify_https, port) {

  /* init */
  var self = {
    auth: {
      username: username,
      password: password
    },
    hostname: hostname,
    verify_https: verify_https, // FIXME needs NODE_TLS_REJECT_UNAUTHORIZED=0 env var or browser configuration
    port: port || 443,
    token: null
  };

  var get_url = function(action) {
    return 'https://' + self.hostname + ':' + self.port + '/' + action;
  };

  var get_post_data = function(post_data) {
    var d = {};

    if (post_data) {
      d = JSON.parse(JSON.stringify(post_data));
    }

    /* Get the full post data dict, this method adds the token to the dict. */
    if (self.token) {
      d['token'] = self.token;
    }

    return d;
  };

  var fetch_url = function(action, post_data, get_params, json_decode) {
    var deferred = Q.defer();

    var url = get_url(action);
    post_data = get_post_data(post_data);

    var req = request({
      method: 'post',
      url: get_url(action),
      formData: post_data,
      json: true,
      qs: get_params
    }, function(err, res, body) {
      if (err || res.statusCode !== 200) {
        deferred.reject(res && res.statusCode);
      } else {
        deferred.resolve(body);
      }
    });

    return deferred.promise;
  };

  var login = function() {
    var deferred = Q.defer();
    self.token = null;

    fetch_url('login', self.auth).then(function(res) {
      var token = res['token'];
      self.token = token;
      deferred.resolve(token);
    });

    return deferred.promise;
  };

  /** Execute an action: this method also performs the login if required. */
  var exec_action = function(action, post_data, get_params, json_decode) {
    var deferred = Q.defer();
    var noRetry = false;

    var fetch = function() {
      /* Try to execute the action */
      fetch_url(action, post_data, get_params, json_decode).then(function(res) {
        deferred.resolve(res);
      }).catch(function(err) {
        if (!noRetry && err === 401) {
          noRetry = true;
          /* Get a new token and retry the action */
          self.login().then(fetch);
        } else {
          deferred.reject();
        }
      });
    };

    /* login before fetching url */
    if (!self.token) {
      self.login().then(fetch);
    } else {
      fetch();
    }

    return deferred.promise;
  };

  var get_version = function() {
    return exec_action('get_version')
  };

  var get_status = function() {
    return exec_action('get_status');
  };

  var get_output_status = function() {
    return exec_action('get_output_status');
  };

  var get_thermostat_status = function() {
    return exec_action('get_thermostat_status');
  };

  var get_sensor_brightness_status = function() {
    return exec_action('get_sensor_brightness_status');
  };

  var get_sensor_humidity_status = function() {
    return exec_action('get_sensor_humidity_status');
  };

  var get_sensor_temperature_status = function() {
    return exec_action('get_sensor_temperature_status');
  };

  /* export public functions */
  self.get_url = get_url;
  self.login = login;
  self.get_version = get_version;
  self.get_status = get_status;
  self.get_output_status = get_output_status;
  self.get_thermostat_status = get_thermostat_status;
  self.get_sensor_brightness_status = get_sensor_brightness_status;
  self.get_sensor_humidity_status = get_sensor_humidity_status;
  self.get_sensor_temperature_status = get_sensor_temperature_status;

  return self;
};

module.exports = {
  OpenMoticsApi: OpenMoticsApi
};
