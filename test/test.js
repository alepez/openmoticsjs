var assert = require('assert');
var OpenMoticsApi = require('../lib/index.js').OpenMoticsApi;

describe('OpenMoticsApi', function() {

  describe('#init', function() {
    it('initialize', function() {
      var api = OpenMoticsApi('foo', 'bar', 'localhost', false, 443);
      assert(api.auth.username === 'foo');
      assert(api.auth.password === 'bar');
    });
  });

  describe('get_url', function() {
    it('should return a valid url', function() {
      var api = OpenMoticsApi('foo', 'bar', 'localhost', false, 443);
      assert(api.get_url('action') === 'https://localhost:443/action');
    });
  });

  // describe('#login()', function() {
  //   it('should get a token', function() {
  //     var api = OpenMoticsApi('foo', 'bar', 'localhost', false, 443);
  //     api.login().then(function() {
  //       assert(api.login);
  //     })
  //   });
  // })
});
