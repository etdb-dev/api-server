'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');

const setPassword = function(next) {
  let self = this;

  if (!this.isModified('password')) {
    logDebug('password not modified');
    next();
  }
  hashPassword(this.password).then((hash) => {
    self.password = hash;
    logDebug('Hashed password: ' + hash);
    next();
  });
};

const hashPassword = (password) => {
  return Promise.try(() => {
    return bcrypt.genSaltSync(10);
  }).then((salt) => {
    return bcrypt.hashSync(password, salt);
  });
};

const handleDuplicate = (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    logError(`user (${doc.username}) already exists`);
    next(err);
  } else {
    logSuccess(doc.username + ' has been saved/updated');
    next();
  }
};

const userSchema = mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  access: {
    isAdmin: { type: Boolean, default: false },
    manageUsers: { type: Boolean, default: false },
    readAPI: { type: Boolean, default: true },
    writeAPI: { type: Boolean, default: false }
  }
});

userSchema.methods.validatePassword = function(password) {
  let self = this;
  return Promise.try(() => {
    return bcrypt.compareSync(password, self.password);
  }).then((isValid) => {
    if (isValid) {
      logSuccess('Passwords match');
    } else {
      throw new Error('Passwords mismatch!');
    }
  });
};

userSchema.methods.getTokenData = function() {
  return {
    username: this.username,
    access: this.access
  };
};

userSchema.pre('save', setPassword);
userSchema.pre('update', setPassword);

userSchema.post('save', handleDuplicate);
userSchema.post('update', handleDuplicate);

const model = mongoose.model('User', userSchema);
module.exports = model;
