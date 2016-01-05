;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OpenMoticsApi = factory();
  }
}(this, function () {

/******************************** openmotics *********************************/

return function (options) {

  if (!options.http) {
    throw "http or alternative must be provided";
  }

  var http = options.http;

  if (!options.q) {
    throw "Q or alternative must be provided";
  }

  var Q = options.q;

  /* init */
  var self = {
    auth: {
      username: options.username,
      password: options.password
    },
    hostname: options.hostname,
    verify_https: options.verify_https, // FIXME needs NODE_TLS_REJECT_UNAUTHORIZED=0 env var or browser configuration
    port: options.port || 443,
    token: null,
    https: options.https !== false
  };

  var get_url = function (action) {
    return (self.https ? 'https://' : 'http://') + self.hostname + ':' + self.port + '/' + action;
  };

  var get_post_data = function (post_data) {
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

  var url_encode_data = function (data) {
    var result = [];
    for (key in data) {
      if (data.hasOwnProperty(key)) {
        result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
    }
    return result.join("&");
  }

  var fetch_url = function (action, post_data, get_params, json_decode) {
    var deferred = Q.defer();

    var url = get_url(action);
    post_data = get_post_data(post_data);

    http({
      method: 'POST',
      url: get_url(action),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: encode_data(post_data)
    }).then(function (res) {
      if (res.status !== 200) {
        deferred.reject(res && res.status);
      } else {
        deferred.resolve(res.data);
      }
    }).catch(function () {
      deferred.reject();
    });

    return deferred.promise;
  };

  var login = function () {
    var deferred = Q.defer();
    self.token = null;

    fetch_url('login', self.auth).then(function (res) {
      var token = res['token'];
      self.token = token;
      deferred.resolve(token);
    }).catch(function () {
      deferred.reject();
    })

    return deferred.promise;
  };

  /** Execute an action: this method also performs the login if required. */
  var exec_action = function (action, post_data, get_params, json_decode) {
    var deferred = Q.defer();
    var noRetry = false;

    var fetch = function () {
      /* Try to execute the action */
      fetch_url(action, post_data, get_params, json_decode).then(function (res) {
        deferred.resolve(res);
      }).catch(function (err) {
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

  var get_version = function () {
    return exec_action('get_version')
  };

  var get_status = function () {
    return exec_action('get_status');
  };

  var get_output_status = function () {
    return exec_action('get_output_status');
  };

  var get_thermostat_status = function () {
    return exec_action('get_thermostat_status');
  };

  var get_sensor_brightness_status = function () {
    return exec_action('get_sensor_brightness_status');
  };

  var get_sensor_humidity_status = function () {
    return exec_action('get_sensor_humidity_status');
  };

  var get_sensor_temperature_status = function () {
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

/*****************************************************************************/
}));
