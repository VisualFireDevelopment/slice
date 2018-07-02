/**
 * Copyright (c) 2018, Visual Fire Development  All Rights Reserved
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */

const { AkairoHandler } = require('discord-akairo');
const CustomModule = require('./CustomModule.js');

class CustomHandler extends AkairoHandler {
  constructor(client, options = {}) {
    super(client, {
      directory: options.directory,
      classToHandle: CustomModule
    });
  }
}

module.exports = CustomHandler;