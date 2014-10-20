/**
 * Middleware that checks if the process is taking too long to respond to
 * requests. If so, it skips further requests until the server is able to
 * properly handle them.
 */
(function () {
  'use strict';

  var toobusy;

  // Getting `toobusy` to work on Windows can be tricky. Therefore,
  // we make it an optional dependency and fallback to a dummy middleware
  // if it is not installed, avoiding the hassle during development. As long
  // as you deploy to a linux server, you should have no problems with it.
  try {
    toobusy = require('toobusy');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn(
        '`toobusy` is not installed!',
        'Application running without high load protection.'
      );
    } else {
      throw(err);
    }
  }


  // If toobusy is not installed (or not loaded for whatever reason),
  // create a dummy module and expose a fake shutdown function.
  if (!toobusy) {
    exports = module.exports = function () {
      return function (req, res, next) {
        next();
      };
    };

    exports.shutdown = function () {};

    return;
  }


  /**
   * Keeps track of application/server's load and responds early with an
   * appropriate 503 status if it's too busy, skipping requests until the
   * server is able to properly handle them again. This should avoid server
   * crashes due to high traffic.
   *
   * @param {object} options Object containing middleware's configuration
   *  parameters.
   *
   * @param {string=} options.message Message to be displayed/returned when the
   *  server is too busy to process the request. If message is an object or an
   *  array, the response will be sent as JSON. Otherwise, the response will
   *  have its Content-Type set to 'text/html'.
   * @param {number=} options.maxLag Maximum time (in ms) the server can be
   *  behind before the process is considered to be overloaded.
   *  @see https://github.com/lloyd/node-toobusy#tunable-parameters
   *
   * @return {function(req, res, next)} Middleware that checks the server
   *  load and decides whether to process the request or skip it with an
   *  appropriate status.
   */
  exports = module.exports = function (handler, options) {
    if (
      // Make options really optional allowing to pass just the handler
      arguments.length === 1 &&
      typeof handler === 'object'
    ) {
      options = handler;
      handler = null;
    }

    options = options || {};

    if (options.maxLag !== undefined) {
      toobusy.maxLag(options.maxLag);
    }

    var message = options.message || 'Too busy!';

    return function (req, res, next) {
      if (toobusy()) {
        if (handler) {
          handler(req, res, next);
        }

        if (!res.headerSent) {
          res.status(503).send(message);
        }
      } else {
        next();
      }
    };
  };


  // Avoid the need to require the original toobusy module just to call the
  // shutdown method.
  exports.shutdown = function () {
    toobusy.shutdown();
  };

})();
