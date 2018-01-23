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

const optMap = {
  name: 'n',
  value: 'v',
  type: 't',
  units: 'u',
  slope: 's',
  tmax: 'x',
  dmax: 'd',
  group: 'g',
  cluster: 'C',
  desc: 'D',
  title: 'T',
  spoof: 'S',
  heartbeat: 'H',
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
        if (key === 'name') {
	  opts.push(`--${key}='${m[key]}'`);
          // opts.push(`-${optMap[key]} '${m[key]}'`);
        } else if (WRAP_OPTIONS.includes(key)) {
	  // opts.push(`--${key} '${m[key]}'`);
          opts.push(`-${optMap[key]} '${m[key]}'`);
        } else {
          // opts.push(`--${key} ${m[key]}`);
          opts.push(`-${optMap[key]}${m[key]}`);
        }
      });
      const cmd = `gmetric ${opts.join(' ')}`;
      debug('cmd: ', cmd);

      const proc = spawn('gmetric', opts);

      // append stdout to an array...
      const out = [];
      proc.stdout.on('data', (data) => {
        debug(`stdout: ${data}`);
        out.push(data);
      });

      // append stdout to a different array...
      const err = [];
      proc.stderr.on('data', (data) => {
        debug(`stderr: ${data}`);
        err.push(data);
      });

      // when process is done, resolve with {code, stdout, stderr}
      proc.on('close', (code) => {
        debug(`child process exited with code ${code}`);
        resolve({code, stdout: out.join('\n'), stderr: err.join('\n')});
      });

      // when an error is encountered, reject the promise.
      proc.on('error', (err) => {
        debug('child process errored:');
        debug(err);
        reject(err);
      });
    });
  }

}

module.exports = GMetric;

