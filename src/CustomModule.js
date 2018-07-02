/**
 * Copyright (c) 2018, Visual Fire Development  All Rights Reserved
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */

const { AkairoModule } = require('discord-akairo');

class CustomModule extends AkairoModule {
  constructor(id, options = {}) {
    super(id, options);
    this.name = options.name || 'Unknown';
  }
  log() {
    return console.log.apply(console.log, [`[${this.name}]`].concat(...arguments));
  }
  debug() {
    return console.debug.apply(console.log, [`[${this.name}]`].concat(...arguments));
  }
  error() {
    return console.error.apply(console.error, [`[${this.name}]`].concat(...arguments));
  }
}

module.exports = CustomModule;