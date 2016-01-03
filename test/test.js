var assert = require('assert');
var OpenMoticsApi = require('../lib/index.js').OpenMoticsApi;

describe('OpenMoticsApi', function() {

  /* to test a real OpenMotics gateway, we must provide these variables: */
  var env = {
    username: process.env.OPENMOTICS_USERNAME,
    password: process.env.OPENMOTICS_PASSWORD,
    hostname: process.env.OPENMOTICS_HOSTNAME || 'localhost',
    port: process.env.OPENMOTICS_PORT || 443
  };

  describe('init()', function() {
    it('initialize', function() {
      var api = OpenMoticsApi(env.username, env.password, env.hostname, false, env.port);
      assert.equal(api.auth.username, env.username);
      assert.equal(api.auth.password, env.password);
    });
  });

  describe('get_url()', function() {
    it('should return a valid url', function() {
      var api = OpenMoticsApi(env.username, env.password, env.hostname, false, env.port);
      assert.equal(api.get_url('action'), 'https://' + env.hostname + ':443/action');
    });
  });

  describe('login()', function() {
    it('should get a token', function(done) {
      var api = OpenMoticsApi(env.username, env.password, env.hostname, false, env.port);

      api.login().then(function() {
        assert.equal(typeof api.token, 'string');
        assert.equal(api.token.length, 32);
        done();
      }).catch(done);
    });
  })
});
