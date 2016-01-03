var assert = require('assert');
var OpenMoticsApi = require('../lib/index.js').OpenMoticsApi;

describe('OpenMoticsApi', function() {
  describe('#init', function () {
    it('initialize', function () {
      var api = OpenMoticsApi('foo', 'bar', 'localhost', false, 443);
      assert(api.auth.username === 'foo');
      assert(api.auth.password === 'bar');
    });
  });
});
