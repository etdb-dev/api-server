#!/usr/bin/env node
'use strict';

const Promise = require('bluebird');
const prompt = require('prompt');
prompt.message = '';
prompt.start();

const colors = require('colors');

const utils = require('./src/utils');
const config = require('./src/config');
const db = require('./src/db');
const User = require('./src/db/user');

require('./src/log')('install');

let promptSchemata = {
  config: {
    properties: {
      uid: {
        name: 'uid',
        description: colors.yellow('User who\'s privileges the server should run with'),
        default: config.get('uid') || 'etdb'
      },
      gid: {
        name: 'gid',
        description: colors.yellow('Usergroup who\'s privileges the server should run with'),
        default: config.get('gid') || 'etdb'
      },
      'db:host': {
        name: 'dbHost',
        description: colors.yellow('MongoDB host'),
        default: config.get('db:host') || '127.0.0.1'
      },
      'db:port': {
        name: 'dbPort',
        description: colors.yellow('MongoDB port'),
        default: config.get('db:port') || 27017
      },
      'db:db': {
        name: 'dbDb',
        description: colors.yellow('MongoDB database name'),
        default: config.get('db:db') || 'etdb'
      },
      'server:host': {
        name: 'serverHost',
        description: colors.yellow('Host IP or -address the server should be accessible at'),
        default: config.get('server:host') || '127.0.0.1'
      },
      'server:port': {
        name: 'serverPort',
        description: colors.yellow('Port the server should be listening at'),
        default: config.get('server:port') || 3000
      }
    }
  },
  secret: {
    properties: {
      secret: {
        name: 'secret',
        description: colors.yellow('Secret for password and token encryption (blank creates one)'),
        default: config.get('secret') || ''
      }
    }
  },
  adminUser: {
    properties: {
      username: {
        name: 'username',
        description: colors.yellow('Username'),
        message: 'Oh, come on! Empty username? What am I supposed to do with that?!',
        required: true
      },
      password: {
        name: 'password',
        description: colors.yellow('Password'),
        message: 'Empty password? Like, really? You sure, you should be an admin?',
        required: true,
        hidden: true,
        replace: '*'
      }
    }
  }
};

let setupConfig = () => {
  logInfo('Creating/Updating config.json:');
  return new Promise((resolve, reject) => {
    prompt.get(promptSchemata.config, (err, answers) => {
      if (err) return reject(err);
      for (let key in answers) {
        config.set(key, answers[key]);
      }
      resolve();
    });
  });
};

let setupSecret = () => {
  return new Promise((resolve, reject) => {
    prompt.get(promptSchemata.secret, (err, answers) => {
      if (err) return reject(err);
      config.set('secret', answers.secret === '' ? utils.generateUUID() : answers.secret);
      resolve();
    });
  });
};

let saveConfig = () => {
  return new Promise((resolve, reject) => {
    config.save((err) => {
      if (err) return reject(err);
      logSuccess('Config saved.');
      return resolve();
    });
  });
};

let setupAdminUser = () => {
  logInfo('Adding admin account:');
  return new Promise((resolve, reject) => {
    prompt.get(promptSchemata.adminUser, (err, answers) => {
      if(err) return reject(err);

      User.findOne({ 'username': answers.username }).then((candidate) => {
        if (candidate) return reject(`Refusing to overwrite present user ${candidate.username}`);

        let admin = new User({
          username: answers.username,
          password: answers.password,
          access: {
            isAdmin: true,
            writeAPI: true,
            readAPI: true,
            manageUsers: true
          }
        });

        admin.save().then(() => {
          logSuccess(`Admin account with username '${answers.username}' has been created.`);
          resolve();
        }).catch(reject);

      });
    });
  });
};

setupConfig()
.then(setupSecret)
.then(saveConfig)
.then(db.connect)
.then(() => {
  logWarn('Removing test account \'bobby\'');
  User.remove({ username: 'bobby' }, () => {});
})
.then(setupAdminUser)
.then(() => {
  logSuccess('All done.');
  logInfo(`Point your browser to http://${config.get('server:host')}:${config.get('server:port')}/help to get started!`);
  logInfo('... after you started the server (`npm start`), of course.');
})
.catch((err) => {
  logError('Awww, great; something went wrong here...');
  logError(err);
}).finally(() => process.exit(0));
