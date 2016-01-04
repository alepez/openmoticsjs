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

module.exports = request;
