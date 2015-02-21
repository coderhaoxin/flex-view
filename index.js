#!/usr/bin/env iojs

'use strict';

const cp = require('child_process'),
  path = require('path'),
  fs = require('fs');

let params = process.argv.slice(2),
  dir = params[0],
  debug = false,
  ignores = [],
  files = [];

if (!dir) {
  console.error('null path');
  process.exit(1);
}
params.splice(0, 1);

if (params.indexOf('--debug') >= 0) {
  debug = true;
  log('the params is:');
  log(params);
  params.splice(params.indexOf('--debug'), 1);
}

if (params.indexOf('--ignore') >= 0) {
  ignores = params[params.indexOf('--ignore') + 1].split(',');
  log('the ignores is:');
  log(ignores);
  params.splice(params.indexOf('--ignore'), 2);
} else {
  // default
  ignores = ['node_modules', 'coverage'];
}

dir = path.resolve(process.cwd(), dir);
read(dir, ignores);

log('the files is:');
log(files);

// run cmd
log('params pass to js-beautify is:');
log(params);
let result = cp.spawnSync('js-beautify', params.concat(files));
if (result.status) {
  console.error(result.stderr.toString());
} else {
  console.info(result.stdout.toString());
}

/**
 * utils
 */

function read(dir, ignores, file) {
  file = file || '';
  dir = path.join(dir, file);

  if (file.startsWith('.') || ignored(file, dir)) return;

  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .forEach(function(name) {
        read(dir, ignores, name);
      });
  } else {
    if (path.extname(dir) === '.js' || path.extname(dir) === '.json') {
      files.push(dir);
    }
  }
}

function ignored(filename, dir) {
  for (let i of ignores) {
    if (filename === i) return true;
    // such as: test/fixture/image
    if (path.join(dir, filename).includes(i)) return true;
  }
}

function log() {
  if (debug) {
    console.log('\n');
    console.log.apply(null, arguments);
  }
}
