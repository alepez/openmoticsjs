/* beautify ignore:start */
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OpenMoticsApi = factory();
  }
}(this, function () {
/* beautify ignore:end */

/******************************** openmotics *********************************/

return function (options) {

  var Q = options.q;
  var http = options.http;

  if (!http) {
    throw "http or alternative must be provided";
  }

  if (!Q) {
    throw "Q or alternative must be provided";
  }

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
    ssl: options.ssl !== false
  };

  var is_none = function (value) {
    return value !== null && value !== undefined;
  };

  var get_url = function (action) {
    return (self.ssl ? 'https://' : 'http://') + self.hostname + ':' + self.port + (options.prefix || '') + '/' + action;
  };

  var get_post_data = function (post_data) {
    var d = {};

    if (post_data) {
      /* make a deep copy */
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
      data: url_encode_data(post_data)
    }).then(function (res) {
      if (res.status !== 200) {
        deferred.reject(res && res.status);
      } else {
        deferred.resolve(res.data);
      }
    }).catch(function (res) {
      deferred.reject(res.status);
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
    }).catch(function (res) {
      deferred.reject(res);
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
          self.login().then(fetch).catch(function (err) {
            deferred.reject(err);
          });
        } else {
          deferred.reject(err);
        }
      });
    };

    /* login before fetching url */
    if (!self.token) {
      self.login().then(fetch).catch(function (err) {
        deferred.reject(err);
      });
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

  var set_output = function (id, on, dimmer, timer) {
    var post_data = {
      'id': id,
      'is_on': on
    };
    if (is_none(dimmer)) {
      post_data['dimmer'] = dimmer
    }
    if (is_none(timer)) {
      post_data['timer'] = timer
    }
    return exec_action('set_output', post_data)
  };

  var get_output_configurations = function () {
    return exec_action("get_output_configurations");
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
  self.set_output = set_output;
  // self.set_all_lights_off = set_all_lights_off;
  // self.set_all_lights_floor_off = set_all_lights_floor_off;
  // self.set_all_lights_floor_on = set_all_lights_floor_on;
  // self.set_current_setpoint = set_current_setpoint;
  // self.set_thermostat_mode = set_thermostat_mode;
  // self.do_group_action = do_group_action;
  // self.module_discover_start = module_discover_start;
  // self.module_discover_stop = module_discover_stop;
  // self.get_modules = get_modules;
  // self.flash_leds = flash_leds;
  // self.get_last_inputs = get_last_inputs;
  // self.get_pulse_counter_status = get_pulse_counter_status;
  // self.get_errors = get_errors;
  // self.master_clear_error_list = master_clear_error_list;
  // self.reset_master = reset_master;
  // self.get_power_modules = get_power_modules;
  // self.set_power_modules = set_power_modules;
  // self.get_realtime_power = get_realtime_power;
  // self.get_total_energy = get_total_energy;
  // self.set_power_voltage = set_power_voltage;
  // self.start_power_address_mode = start_power_address_mode;
  // self.stop_power_address_mode = stop_power_address_mode;
  // self.in_power_address_mode = in_power_address_mode;
  // self.set_timezone = set_timezone;
  // self.get_timezone = get_timezone;
  // self.do_url_action = do_url_action;
  // self.schedule_action = schedule_action;
  // self.list_scheduled_actions = list_scheduled_actions;
  // self.remove_scheduled_action = remove_scheduled_action;
  // self.set_output_delayed = set_output_delayed;
  // self.set_all_lights_off_delayed = set_all_lights_off_delayed;
  // self.set_all_lights_floor_off_delayed = set_all_lights_floor_off_delayed;
  // self.set_all_lights_floor_on_delayed = set_all_lights_floor_on_delayed;
  // self.set_current_setpoint_delayed = set_current_setpoint_delayed;
  // self.set_mode_delayed = set_mode_delayed;
  // self.do_group_action_delayed = do_group_action_delayed;
  // self.get_output_configuration = get_output_configuration;
  self.get_output_configurations = get_output_configurations;
  // self.set_output_configuration = set_output_configuration;
  // self.set_output_configurations = set_output_configurations;
  // self.get_input_configuration = get_input_configuration;
  // self.get_input_configurations = get_input_configurations;
  // self.set_input_configuration = set_input_configuration;
  // self.set_input_configurations = set_input_configurations;
  // self.get_thermostat_configuration = get_thermostat_configuration;
  // self.get_thermostat_configurations = get_thermostat_configurations;
  // self.set_thermostat_configuration = set_thermostat_configuration;
  // self.set_thermostat_configurations = set_thermostat_configurations;
  // self.get_sensor_configuration = get_sensor_configuration;
  // self.get_sensor_configurations = get_sensor_configurations;
  // self.set_sensor_configuration = set_sensor_configuration;
  // self.set_sensor_configurations = set_sensor_configurations;
  // self.get_pump_group_configuration = get_pump_group_configuration;
  // self.get_pump_group_configurations = get_pump_group_configurations;
  // self.set_pump_group_configuration = set_pump_group_configuration;
  // self.set_pump_group_configurations = set_pump_group_configurations;
  // self.get_group_action_configuration = get_group_action_configuration;
  // self.get_group_action_configurations = get_group_action_configurations;
  // self.set_group_action_configuration = set_group_action_configuration;
  // self.set_group_action_configurations = set_group_action_configurations;
  // self.get_scheduled_action_configuration = get_scheduled_action_configuration;
  // self.get_scheduled_action_configurations = get_scheduled_action_configurations;
  // self.set_scheduled_action_configuration = set_scheduled_action_configuration;
  // self.set_scheduled_action_configurations = set_scheduled_action_configurations;
  // self.get_pulse_counter_configuration = get_pulse_counter_configuration;
  // self.get_pulse_counter_configurations = get_pulse_counter_configurations;
  // self.set_pulse_counter_configuration = set_pulse_counter_configuration;
  // self.set_pulse_counter_configurations = set_pulse_counter_configurations;
  // self.get_startup_action_configuration = get_startup_action_configuration;
  // self.set_startup_action_configuration = set_startup_action_configuration;
  // self.get_dimmer_configuration = get_dimmer_configuration;
  // self.set_dimmer_configuration = set_dimmer_configuration;
  // self.get_global_thermostat_configuration = get_global_thermostat_configuration;
  // self.set_global_thermostat_configuration = set_global_thermostat_configuration;

  return self;
};

/*****************************************************************************/
/* beautify ignore:start */
}));
/* beautify ignore:end */
