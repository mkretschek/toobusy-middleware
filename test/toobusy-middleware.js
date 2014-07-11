(function () {
  'use strict';

  var expect = require('chai').expect;
  var sinon = require('sinon');

  describe('toobusy-middleware', function () {
    describe('with toobusy', function () {
      it('exposes a function');
      it('returns a middleware');


      describe('middleware', function () {
        it('sends a response with status 503 (Service Unavailable) if too busy');
        it('sends the message set in the options if too busy');
        it('sets toobusy\'s maximum lag option if set in the options');
        it('calls the `next()` callback if not too busy');
      }); // with toobusy middleware


      describe('.shutdown()', function () {
        it('is accessible')
        it('is a function');
        it('calls the toobusy\'s shutdown function');
      }); // with toobusy .shutdown()
    }); // with toobusy


    describe('without toobusy', function () {
      it('exposes a function');
      it('returns a middleware');


      describe('middleware', function () {
        it('calls the `next()` callback');
        it('does not throw any errors');
      }); // without toobusy middleware


      describe('.shutdown()', function () {
        it('is accessible');
        it('is a function');
        it('does not throw any errors');
      }); // without toobusy .shutdown()
    }); // without toobusy
  });

})();
