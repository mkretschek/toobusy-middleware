(function () {
  'use strict';

  var Module = require('module');
  var expect = require('chai').expect;
  var sinon = require('sinon');


  function unloadToobusyMiddleware() {
    delete require.cache[require.resolve('../')];
    delete require.cache.toobusy;
  }


  describe('toobusy-middleware', function () {
    var req;
    var res;
    var next;

    before(function () {
      res = {
        send : sinon.stub()
      };
    });


    before(function () {
      req = {};
    });


    before(function () {
      next = sinon.spy();
    });


    afterEach(function () {
      res.send.reset();
    });


    afterEach(function () {
      next.reset();
    });


    describe('with toobusy', function () {
      var toobusyMock;
      var toobusyMiddleware;


      before(unloadToobusyMiddleware);

      before(function () {
        toobusyMock = sinon.stub();
        toobusyMock.maxLag = sinon.stub();
        toobusyMock.shutdown = sinon.stub();
        toobusyMock.returns(false);
      });

      before(function () {
        var load = Module._load;

        sinon
          .stub(Module, '_load', function (request, parent, isMain) {
            if (request === 'toobusy') {
              return toobusyMock;
            }

            return load.call(Module, request, parent, isMain);
          });
      });

      after(function () {
        Module._load.restore();
      });

      before(function () {
        toobusyMiddleware = require('../');
      });

      afterEach(function () {
        toobusyMock.reset();
        toobusyMock.maxLag.reset();
        toobusyMock.shutdown.reset();
      });


      it('exposes a function', function () {
        expect(toobusyMiddleware).to.be.a('function');
      });


      it('returns a middleware', function () {
        var middleware = toobusyMiddleware();
        expect(middleware).to.be.a('function');

        // Accepts a req, res and next params
        expect(middleware).to.have.length(3);
      });


      describe('middleware', function () {
        var middleware;

        before(function () {
          middleware = toobusyMiddleware();
        });


        it('sends a response with status 503 (Service Unavailable) if too busy',
          function () {
            toobusyMock.returns(true);
            middleware(req, res, next);
            expect(res.send).to.have.been.calledWith(503);
          });


        it('does not call the next() callback if too busy', function () {
          toobusyMock.returns(true);
          middleware(req, res, next);
          expect(next).not.to.have.been.called;
        });


        it('sends the message set in the options if too busy', function () {
          var opts = {
            message : 'Test message'
          };

          var middleware = toobusyMiddleware(opts);

          middleware(req, res, next);
          expect(res.send).to.have.been.calledWith(503, opts.message);
        });


        it('sets toobusy\'s maximum lag option if set in the options',
          function () {
            var opts = {
              maxLag : 100
            };

            toobusyMiddleware(opts);
            expect(toobusyMock.maxLag).to.have.been.calledWith(opts.maxLag);
          });


        it('calls the `next()` callback if not too busy', function () {
          toobusyMock.returns(false);

          middleware(req, res, next);
          expect(next).to.have.been.called;
        });

      }); // with toobusy middleware


      describe('.shutdown()', function () {
        it('is accessible', function () {
          expect(toobusyMiddleware.shutdown).to.be.defined;
        });


        it('is a function', function () {
          expect(toobusyMiddleware.shutdown).to.be.a('function');
        });


        it('calls the toobusy\'s shutdown function', function () {
          toobusyMiddleware.shutdown();
          expect(toobusyMock.shutdown).to.have.been.called;
        });
      }); // with toobusy .shutdown()
    }); // with toobusy


    describe('without toobusy', function () {
      var toobusyMiddleware;


      before(unloadToobusyMiddleware);


      before(function () {
        var load = Module._load;

        sinon
          .stub(Module, '_load', function (request, parent, isMain) {
            var err;

            if (request === 'toobusy') {
              err = new Error();
              err.code = 'MODULE_NOT_FOUND';
              throw(err);
            }

            return load.call(Module, request, parent, isMain);
          });
      });


      before(function () {
        toobusyMiddleware = require('../');
      });


      after(function () {
        Module._load.restore();
      });


      it('exposes a function', function () {
        expect(toobusyMiddleware).to.be.a('function');
      });


      it('returns a middleware', function () {
        var middleware = toobusyMiddleware();
        expect(middleware).to.be.a('function');
        // Accepts a req, res and next params
        expect(middleware).to.have.length(3);
      });


      describe('middleware', function () {
        var middleware;

        before(function () {
          middleware = toobusyMiddleware();
        });


        it('does not throw any errors', function () {
          function callMiddleware() {
            middleware(req, res, next);
          }

          expect(callMiddleware).not.to.throw;
        });


        it('calls the `next()` callback', function () {
          middleware(req, res, next);
          expect(next).to.have.been.called;
        });
      }); // without toobusy middleware


      describe('.shutdown()', function () {
        it('is accessible', function () {
          expect(toobusyMiddleware.shutdown).to.be.defined;
        });


        it('is a function', function () {
          expect(toobusyMiddleware.shutdown).to.be.a('function');
        });


        it('does not throw any errors', function () {
          function shutdown() {
            toobusyMiddleware.shutdown();
          }

          expect(shutdown).not.to.throw;
        });
      }); // without toobusy .shutdown()

    }); // without toobusy



    it('re-throws unexpected errors when the module is require()\'d',
      function () {
        unloadToobusyMiddleware();

        var load = Module._load;

        sinon
          .stub(Module, '_load', function (request, parent, isMain) {
            var err;

            if (request === 'toobusy') {
              err = new Error('Unexpected error');
              throw(err);
            }

            return load.call(Module, request, parent, isMain);
          });


        function requireToobusyMiddleware() {
          require('../');
        }

        expect(requireToobusyMiddleware).to.throw('Unexpected error');

        Module._load.restore();
      });

  }); // toobusy-middleware

})();
