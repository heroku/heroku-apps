'use strict';

function unwrap(str) {
  return str.replace('\n ▸   ', '');
}

module.exports = unwrap;
