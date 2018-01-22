'use strict';

const GMetric = require('../gmetric');

describe('GMetric', () => {

  it('needs tests written', () => assert(false));

  describe('Instantiation', () => {
    let gm;
    before(() => gm = new GMetric());

    it('should return an instance of GMetric class', () => {
      expect(gm).to.be.instanceOf(GMetric);
    });
  });

  describe('Send', () => {
    let gm;
let min = 0;
let max = 100;
    let metric = {
      name: 'test_metric',
      value: Math.floor(Math.random() * (max - min + 1)) + min,// 1 - 100,
      group: 'test',
      cluster: 'COOLKIDS',
      type: 'int8',
      title: 'title',
      desc: 'description',
    };
    before(() => gm = new GMetric());

    it('should send the metric', (done) => {
      expect(gm.send(metric)).to.eventually.equal(true).notify(done);
    });

  });

});

