import request from 'request';

const http = function (options) {
  const deferred = Promise.defer();

  request({
    method: options.method,
    url: options.url,
    data: options.data,
    headers: options.headers
  }, (err, res, body) => {
    if (err) {
      deferred.reject();
    } else {
      deferred.resolve(body);
    }
  });

  return deferred.promise;
};

export default function (options) {
  const o = Object.assign({
    hostname: 'localhost',
    password: 'admin',
    port: 443,
    secure: false,
    ssl: true,
    username: 'admin',
    prefix: '',
  }, options);

  let token;

  const getUrl = function (action) {
    return (o.ssl ? 'https://' : 'http://') + o.hostname + ':' + o.port + o.prefix + '/' + action;
  };

  const urlEncodeData = function (data) {
    const result = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
    }
    return result.join("&");
  };

  const fetchUrl = function (action, data) {
    const deferred = Promise.defer();

    /* Add authorization token */
    data['token'] = token;

    http({
      method: 'POST',
      url: getUrl(action),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: urlEncodeData(data)
    }).then((res) => {
      if (res.status !== 200) {
        deferred.reject(res && res.status);
      } else {
        deferred.resolve(res.data);
      }
    }).catch((res) => {
      deferred.reject(res.status);
    });

    return deferred.promise;
  };

  const login = function () {
    const deferred = Promise.defer();
    o.token = null;

    fetchUrl('login', o.auth).then((res) => {
      token = res['token'];
      deferred.resolve(token);
    }).catch(function (res) {
      deferred.reject(res);
    });

    return deferred.promise;
  };

  /** Execute an action: this method also performs the login if required. */
  const execAction = function (action, data, params, jsonDecode) {
    const deferred = Q.defer();
    let noRetry = false;

    const fetch = function () {
      /* Try to execute the action */
      fetchUrl(action, data, params, jsonDecode).then((res) => {
        deferred.resolve(res);
      }).catch((err) => {
        if (!noRetry && err === 401) {
          noRetry = true;
          /* Get a new token and retry the action */
          login().then(fetch).catch((err) => {
            deferred.reject(err);
          });
        } else {
          deferred.reject(err);
        }
      });
    };

    /* login before fetching url */
    if (!token) {
      login().then(fetch).catch((err) => {
        deferred.reject(err);
      });
    } else {
      fetch();
    }

    return deferred.promise;
  };

  const getVersion = function () {
    return execAction('get_version');
  };

  const getStatus = function () {
    return execAction('get_status');
  };

  const getOutputStatus = function () {
    return execAction('get_output_status');
  };

  const getThermostatStatus = function () {
    return execAction('get_thermostat_status');
  };

  const getSensorBrightnessStatus = function () {
    return execAction('get_sensor_brightness_status');
  };

  const getSensorHumidityStatus = function () {
    return execAction('get_sensor_humidity_status');
  };

  const getSensorTemperatureStatus = function () {
    return execAction('get_sensor_temperature_status');
  };

  const setOutput = function (id, on, dimmer, timer) {
    const data = {
      'id': id,
      'is_on': on,
      'dimmer': dimmer,
      'timer': timer
    };
    return execAction('set_output', data);
  };

  const getOutputConfigurations = function () {
    return execAction("get_output_configurations");
  };

  return {
    getVersion
    getStatus,
    getOutputStatus,
    getThermostatStatus,
    getSensorBrightnessStatus,
    getSensorHumidityStatus,
    getSensorTemperatureStatus,
    setOutput,
    getOutputConfigurations,
  };
}
