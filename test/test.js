var assert = require('assert');
var OpenMoticsApi = require('../openmotics.js');

describe('OpenMoticsApi', function () {
  /* to test a real OpenMotics gateway, we must provide these variables: */
  var env = {
    username: process.env.OPENMOTICS_USERNAME,
    password: process.env.OPENMOTICS_PASSWORD,
    hostname: process.env.OPENMOTICS_HOSTNAME || 'localhost',
    port: process.env.OPENMOTICS_PORT || 443
  };

  var q = require('q');

  var http = function (options) {
    var deferred = q.defer();
    var request = require('request');
    request({
      method: options.method,
      url: options.url,
      data: options.data,
      headers: options.headers
    }, function(err, res, body) {
      if (err) {
        deferred.reject();
      } else {
        deferred.resolve(body);
      }
    });
    return deferred.promise;
  };

  var api = OpenMoticsApi({
    username: env.username,
    password: env.password,
    hostname: env.hostname,
    port: 8000,
    ssl: false,
    http: http,
    q: q
  });

  var handleError = function (done) {
    throw new Error("Error!");
  }

  describe('init()', function () {
    it('should initialize correctly', function () {
      assert.equal(api.auth.username, env.username);
      assert.equal(api.auth.password, env.password);
    });
  });

  describe('get_url()', function () {
    it('should return a valid url', function () {
      assert.equal(api.get_url('action'), 'http://' + env.hostname + ':8000/action');
    });
  });

  describe('login()', function () {
    it('should get a token', function (done) {
      api.login().then(function () {
        assert.equal(typeof api.token, 'string');
        assert.equal(api.token.length, 32);
        done();
      }).catch(done);
    });
  });

  describe('get_version()', function () {
    it('should get version', function (done) {
      api.get_version().then(function (res) {
        assert.equal(res['success'], true);
        var version = res['version'];
        var versionArr = version.split('.');
        /*  semantic version has major.minor.patch */
        assert.equal(versionArr.length, 3);
        /* this should work with major version 1 */
        assert.equal(versionArr[0], 1);
        done();
      }).catch(done);
    });
  });

  describe('get_status()', function () {
    it('should get status', function (done) {
      api.get_status().then(function (res) {
        assert.equal(res['success'], true);
        done();
      }).catch(done);
    });
  });

});
