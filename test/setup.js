'use strict';

const env = process.env.NODE_ENV = 'test';
require('dotenv').config({silent: true, path: '.env.test'});
const path = require('path');
global.__root = path.resolve(__dirname + '/..');
global._ = require('lodash');
global.Promise = require('bluebird');

let chai = require('chai');
chai.use(require('chai-properties'));
chai.use(require('chai-string'));

// Load Chai assertions
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should();

// Load Sinon
const sinon = require('sinon');
global.sinon = sinon;

// Initialize Chai plugins
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.use(require('chai-subset'));

describe('Setup', () => {
  it('should initlalize test suite', function(done) {
    done();
  });
});
