'use strict';

let fs   = require('mz/fs');
let path = require('path');
let co   = require('co');

let minutesAgo = minutes => {
  let d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d;
};

function mkdirp (dir) {
  let mkdirp = require('mkdirp');
  return new Promise((ok, err) => {
    mkdirp(dir, e => e ? err(e) : ok());
  });
}

module.exports.get = (f, fetch) => {
  let save = () => {
    return co(function* () { return yield fetch(); })
    .then(results => {
      return mkdirp(path.dirname(f))
      .then(() => fs.writeFile(f, JSON.stringify(results, null, 2)))
      .then(() => results);
    });
  };

  return fs.stat(f).then(stat => {
    if (stat && minutesAgo(20) < stat.mtime) {
      return fs.readFile(f).then(d => JSON.parse(d));
    } else {
      return save();
    }
  }).catch(() => save());
};
