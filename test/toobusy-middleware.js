(function () {
  'use strict';

  var expect = require('chai').expect;
  var sinon = require('sinon');
  var barney = require('barney');


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

    before(function () {
      barney.enable();
    });

    after(function () {
      barney.disable();
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


      before(function () {
        toobusyMock = sinon.stub();
        toobusyMock.maxLag = sinon.stub();
        toobusyMock.shutdown = sinon.stub();
        toobusyMock.returns(false);
      });

      before(function () {
        barney.hook(function (request) {
          if (request === 'toobusy') {
            return toobusyMock;
          }
        });
      });

      before(function () {
        toobusyMiddleware = require('../');
      });

      after(function () {
        barney.clear();
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


      before(function () {
        barney.hook(function (request) {
          if (request === 'toobusy') {
            barney.moduleNotFound();
          }
        });
      });


      before(function () {
        require.cache[require.resolve('../')];
        toobusyMiddleware = require('../');
      });

      after(function () {
        barney.clear();
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
        barney.hook(function (request) {
          if (request === 'toobusy') {
            throw(new Error('Unexpected error'));
          }
        });

        function requireToobusyMiddleware() {
          require('../');
        }

        expect(requireToobusyMiddleware).to.throw('Unexpected error');

        barney.clear();
      });

  }); // toobusy-middleware

})();
