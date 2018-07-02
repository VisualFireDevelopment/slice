/**
 * Copyright (c) 2018, Visual Fire Development  All Rights Reserved
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */

const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const CustomHandler = require('./CustomHandler.js');
const path = require('path');
const { token } = require('./Private/Tokens.js');

class Client extends AkairoClient {
  constructor() {
    super({
      ownerId: ['112732946774962176', '187771864435785728']
    }, {
      disableEveryone: true
    });
    this.defaultPrefix = 'sa$';
    this.debug = false;
    this.commandHandler = new CommandHandler(this, {
      directory: path.join(__dirname, 'Commands'),
      allowMention: true,
      prefix: async function(m) {
        if (!this.client.mongo) return this.client.defaultPrefix;
        try {
          if (!m.guild) return this.client.defaultPrefix;
          const data = await this.client.mongo.fetchGuild(m.guild.id);
          m.data = data;
          if (data.settings.prefix == 'default') return this.client.defaultPrefix;
          else return data.settings.defaultPrefix;
        } catch (e) {
          console.debug('Prefix Fetch', e);
          return this.client.defaultPrefix;
        }
      }
    });
    this.listenerHandler = new ListenerHandler(this, {
      directory: path.join(__dirname, 'Listeners')
    });
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      process
    });
    this.customHandler = new CustomHandler(this, {
      directory: path.join(__dirname, 'Modules')

    });
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
    this.customHandler.loadAll();
    this.errors = {
      nodb: m => { m.channel.send('I was unable to fetch the database right now. Please try again later.'); }
    };
  }
  get mongo() {
    return this.customHandler.modules.get('mongodb');
  }
  log() {
    return console.log.apply(console.log, [`[Client]`].concat(...arguments));
  }
  debug() {
    return console.debug.apply(console.log, [`[Client]`].concat(...arguments));
  }
  error() {
    return console.error.apply(console.error, [`[Client]`].concat(...arguments));
  }
}

const client = new Client();

console.log_orig = console.log;
console.error_orig = console.error;
console.log = function() { return console.log_orig.apply(console.log, [`[Shard ${client.options.shardId}]`].concat(...arguments)); };
console.debug = function() { if (client.debug) return console.log.apply(console.log, [`[Debug]`].concat(...arguments)); };
console.error = function() { return console.error_orig.apply(console.error, [`[Shard ${client.options.shardId}]`].concat(...arguments)); };

client.log('Logging in...');
client.login(token);
client.mongo.connect().catch(console.error);