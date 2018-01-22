'use strict';

const debug = require('debug')('gmetric');
const Promise = require('bluebird');
const _ = require('lodash');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;

// const {exec, spawn} = require('child_process');


/**
gmetric 3.6.0

The Ganglia Metric Client (gmetric) announces a metric
on the list of defined send channels defined in a configuration file

Usage: gmetric [OPTIONS]...

  -h, --help            Print help and exit
  -V, --version         Print version and exit
  -c, --conf=STRING     The configuration file to use for finding send channels
                           (default=`/etc/ganglia/gmond.conf')
  -n, --name=STRING     Name of the metric
  -v, --value=STRING    Value of the metric
  -t, --type=STRING     Either
                          string|int8|uint8|int16|uint16|int32|uint32|float|double
  -u, --units=STRING    Unit of measure for the value e.g. Kilobytes, Celcius
                          (default=`')
  -s, --slope=STRING    Either zero|positive|negative|both  (default=`both')
  -x, --tmax=INT        The maximum time in seconds between gmetric calls
                          (default=`60')
  -d, --dmax=INT        The lifetime in seconds of this metric  (default=`0')
  -g, --group=STRING    Group(s) of the metric (comma-separated)
  -C, --cluster=STRING  Cluster of the metric
  -D, --desc=STRING     Description of the metric
  -T, --title=STRING    Title of the metric
  -S, --spoof=STRING    IP address and name of host/device (colon separated) we
                          are spoofing  (default=`')
  -H, --heartbeat       spoof a heartbeat message (use with spoof option)

*/

const TYPES = {
  'double': 'double',
  'float': 'float',
  int8: 'int8',
  int16: 'int16',
  int32: 'int32',
  string: 'string',
  uint8: 'uint8',
  uint16: 'uint16',
  uint32: 'uint32',
};

const OPTIONS = {
  // name, type, unit, slope, tmax, dmax, group, cluster, desc, title, spoof, heartbeat,
};

const WRAP_OPTIONS = ['name', 'cluster', 'desc', 'title', 'spoof'];

const DEFAULT_OPTIONS = _.get(process, 'env.ganglia.gmetric', {});

class GMetric {

  constructor(options = {}) {
    this.metric = _.defaults(DEFAULT_OPTIONS, options);
  }

  send(metric) {
    return new Promise((resolve, reject) => {
      const opts = [];
      const m = _.extend({}, metric, this.metric);
      _.keys(m).forEach((key) => {
        if (WRAP_OPTIONS.includes(key)) {
	  opts.push(`--${key}='${m[key]}'`);
        } else {
          opts.push(`--${key}=${m[key]}`);
        }
      });
      const cmd = `gmetric ${opts.join(' ')}`;
      debug('cmd: ', cmd);

      const out = [];
      const proc = spawn('gmetric', opts);
      proc.stdout.on('data', (data) => {
        debug(`stdout: ${data}`);
        out.push(data);
      });

      proc.stderr.on('data', (data) => {
        debug(`stderr: ${data}`);
        out.push(data);
      });

      proc.on('close', (code) => {
        debug(`child process exited with code ${code}`);
        resolve(out.join('\n'));
      });

      proc.on('error', (err) => {
        debug(`child process errored with ${err}`);
        debug(err);
        reject(err);
      });
    });
  }

}

module.exports = GMetric;

