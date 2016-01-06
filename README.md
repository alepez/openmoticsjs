# OpenMotics JS

OpenMotics SDK for communication with the OpenMotics Gateway.

JavaScript port of the [OpenMotics SDK](https://github.com/openmotics/sdk).

## Usage

It works with [Node.js](https://github.com/nodejs/node) and in browsers.

See `test/test.js` for example in node.

### Angular.js

Supports `$q` promises and `$http` service, so you can do this:

```
  var gateway = window.OpenMoticsApi({
    username: 'foo',              // Needed
    password: 'bar',              // Needed
    hostname: 'openmotics.local', // Default: localhost
    port: '443',                  // Default: 443
    https: true,                  // Default: true
    q: $q,                        // Needed
    http: $http,                  // Needed
  });
```

### Proxy

If you are using a proxy to avoid *CORS* and https requests, you can disable
ssl and add a prefix:

```
  var gateway = window.OpenMoticsApi({
    ...
    port: '8000',
    https: false,
    prefix: '/api'
  });
```

