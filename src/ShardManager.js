/**
 * Copyright (c) 2018, Visual Fire Development  All Rights Reserved
 * Copyrights licensed under the GNU General Public License v3.0.
 * See the accompanying LICENSE file for terms.
 */

const { ShardingManager } = require('discord.js');
const { token } = require('./Data/Tokens.js');
const sm = new ShardingManager('./Client.js', { token });
sm.spawn();