/**
 * Copyright (c) 2018, Visual Fire Development  All Rights Reserved
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */

const CustomModule = require('../CustomModule.js');
const { MongoClient } = require('mongodb');
const { mongo } = require('../Private/Tokens.js');
const _ = require('lodash');

class DefaultServer {
  constructor(gid) {
    this.gid = gid;
    this.settings = {
      notifications: true,
      prefix: 'default'
    };
    this.events = {
      join: {
        message: {
          enabled: false,
          channel: 0,
          message: ''
        },
        role: {
          enabled: false,
          channel: 0,
          roleId: ''
        },
        botRole: {
          enabled: false,
          channel: 0,
          roleId: ''
        }
      },
      leave: {
        message: {
          enabled: false,
          channel: '',
          message: ''
        }
      }
    };
  }
}

class MongoDB extends CustomModule {
  constructor() {
    super('mongodb', {
      name: 'MongoDB'
    });
    this.collections = {};
    this.db = null;
    this.unavailable = new Error('Mongo Database Unavailable');
  }
  build() {
    return `mongodb://${
      mongo.username}:${
      mongo.password}@${
      mongo.host}:${
      mongo.port}/${
      mongo.database}`;
  }
  async connect() {
    this.log('Connecting...');
    this.mdbc = await MongoClient.connect(this.build(), { useNewUrlParser: true });
    this.log('Connected.');
    this.log('Selecting database...');
    this.db = this.mdbc.db(mongo.database);
    this.log(`Database ${mongo.database} selected.`);

    this.db.on('close', me => { this.error('Connection Closed.', me || ''); });
    this.db.on('error', me => { this.error('Internal Error', me || ''); });
    this.db.on('reconnect', me => { this.error('Reconnected.', me || ''); });
    this.db.on('timeout', me => { this.error('Timed Out', me || ''); });

    return this.db;
  }
  // Utilities
  get guilds() {
    return this.fetchCollection('guilds');
  }
  get donations() {
    return this.fetchCollection('donations');
  }
  fetchCollection(name) {
    if (!this.db) throw this.unavailable;
    if (!this.collections[name] || Date.now() - this.collections[name].age >= 900000) {
      this.collections[name] = {
        col: this.db.collection(name),
        age: Date.now()
      };
    }
    return this.collections[name].col;
  }
  getKeysDeep(obj, arr = []) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        arr = this.getKeysDeep(obj[key], arr);
      }
    });
    return arr.concat(Object.keys(obj));
  }
  // Guild Management
  async verifyDataIntegrity(gid, dataIn, noReplace = false) {
    const dataOut = _.merge(new DefaultServer(gid), dataIn);
    if (!_.isEqual(this.getKeysDeep(dataOut), this.getKeysDeep(dataIn))) {
      this.debug('Data Update');
      if (!noReplace) await this.guilds.replaceOne({ gid }, dataOut);
      return Object(dataOut);
    } else {
      this.debug('No Data Update');
      return dataIn;
    }
  }
  async createGuild(gid, isMissing = false) {
    if (!this.db) throw this.unavailable;
    // Check If Guild Exists
    const guild = this.client.guilds.get(gid);
    if (!guild) throw new Error('Guild Not Found');
    if (!this.guilds) throw new Error('Guilds Collection Missing');
    // Check For Existing Data
    let data = new DefaultServer(gid);
    let prevData = await this.guilds.findOne({ gid });
    if (!prevData) {
      prevData = await this.servers.findOne({ gid });
      if (prevData) data = prevData;
    } else {
      return prevData;
    }
    // Create New Data
    await this.guilds.insertOne(data);
    console.log(`I've ${(isMissing ? 'added missing guild' : 'joined')} ` +
      `${guild.name} (${guild.id}) owned by ${guild.owner.user.username} (${guild.owner.id}).`);
    return data;
  }
  async fetchGuild(gid) {
    if (!this.db) throw this.unavailable;
    let data = await this.guilds.findOne({ gid });
    if (!data) data = await this.createGuild(gid, true);
    delete data._id;
    data = await this.verifyDataIntegrity(gid, data);
    return data;
  }
}

module.exports = MongoDB;