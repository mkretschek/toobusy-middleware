toobusy-middleware
==================

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


Options
-------

The middleware accepts the following options:

* `maxLag`: Maximum time (in ms) the server can be behind before the
  process is considered to be overloaded. See [`toobusy`'s tunable parameters]
  [maxlag] for more info.

* `message`: Message to be displayed/returned when the server is too busy to
  process the request. If it's an object or an array, the response will be
  sent as JSON. Otherwise, it's sent as 'text/html'.

```js
app.use(toobusy({
  maxLag : 100,
  message : 'Woah! Too busy here! Try again later.'
});

// This sends a JSON response
app.use(toobusy({
  message : {
    message : 'Too busy!',
    solution : 'Try again later...'
  }
});
```


License
-------

Since the heavy work here was done by [Lloyd Hilaiel][lloyd], I'm keeping the
same license he chose for the original [toobusy][]: [WTFPL][]


[express]: http://expressjs.com/
[lloyd]: https://github.com/lloyd
[maxlag]: https://github.com/lloyd/node-toobusy#tunable-parameters
[toobusy]: https://github.com/lloyd/node-toobusy
[WTFPL]: http://wtfpl.org/
