toobusy-middleware
==================

[![NPM version](https://badge.fury.io/js/toobusy-middleware.svg)](http://badge.fury.io/js/toobusy-middleware)
[![Build Status](https://travis-ci.org/mkretschek/toobusy-middleware.svg)](https://travis-ci.org/mkretschek/toobusy-middleware)
[![Coverage Status](https://coveralls.io/repos/mkretschek/toobusy-middleware/badge.png)](https://coveralls.io/r/mkretschek/toobusy-middleware)
[![Code Climate](https://codeclimate.com/github/mkretschek/toobusy-middleware.png)](https://codeclimate.com/github/mkretschek/toobusy-middleware)
[![Dependency Status](https://gemnasium.com/mkretschek/toobusy-middleware.svg)](https://gemnasium.com/mkretschek/toobusy-middleware)

Middleware for [express][] applications that checks if the process is taking
too long to respond to requests. If so, it skips further requests until the
server is able to properly handle them again, protecting the app from crashing
during high load peaks.

---

This is just a wrapper for [Lloyd Hilaiel][lloyd]'s [toobusy][] module, which is, in fact, the
responsible for all the load-handling logic.


Usage
-----

```
npm install --save toobusy-middleware
```

**NOTE:** There may be some issues getting `toobusy` to work in Windows environments. If
that's your case and you just want to get it working for **development**, you can
make `toobusy` an `optionalDependency` in the `package.json` and the middleware
will act as a `noop`.

In your application:

```js
var express = require('express');
var toobusy = require('toobusy-middleware');

var app = express();

app
  // Put toobusy as high as possible in your middleware stack
  .use(toobusy())
  .use(otherMiddlewares());


var server = app.listen(3000);

process.on('SIGINT', function () {
  server.close();
  // `toobusy`'s shutdown method is exposed by the middleware
  toobusy.shutdown();
  process.exit();
});
```


Parameters
----------

The middleware accepts two parameters:

* `handler` (optional): A function that will be called before sending any
  headers, allowing you to customize how the request is handled. Use this
  to call external services (bring more nodes up, notify someone, etc) or to
  override the default response sent to the user.

* `options` (optional): Middleware's settings:

    * `maxLag`: Maximum time (in ms) the server can be behind before the
      process is considered to be overloaded. See [`toobusy`'s tunable parameters]
      [maxlag] for more info.

    * `message`: Message to be displayed/returned when the server is too busy to
      process the request. If it's an object or an array, the response will be
      sent as JSON. Otherwise, it's sent as `'text/html'`.
      
    * `status`: HTTP status code to send when the server is too busy. Defaults
      to status code `503` (Service Unavailable).


Examples
--------

Uses default behavior.

```js
app.use(toobusy());
```


Simple customization:

```js
app.use(toobusy({
  maxLag : 100,
  message : 'Woah! Too busy here! Try again later.',
  status : 500
});
```


Sending a JSON response instead of HTML:

```js
app.use(toobusy({
  message : {
    message : 'Too busy!',
    solution : 'Try again later...'
  }
});
```

Taking action during high load:

```js
// Sends the default response after taking the required action
app.use(toobusy(function () {
  addEmergencyNodes();
  notifySomeone();
}));
```

Overriding the default response:

```js
app.use(toobusy(function (req, res, next) {
  res.status(503).sendFile('error/toobusy.html');
}));
```

Using both handler and options:

```js
function notifySomeone() {
  doSomething();
}

app.use(toobusy(notifySomeone, {
  maxLag : 75
}));
```

License
-------

This project is licensed under the MIT license. See the `LICENSE` file for
more details.


[express]: http://expressjs.com/
[lloyd]: https://github.com/lloyd
[maxlag]: https://github.com/lloyd/node-toobusy#tunable-parameters
[toobusy]: https://github.com/lloyd/node-toobusy
