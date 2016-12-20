'use strict';

const mongoose = require('mongoose');

const spiSchema = mongoose.Schema({
  name: { type: String },
  last_modified: { type: Date },
  endpoint_url: { type: String, required: true },
  encrypted: { type: Boolean, default: false },
  protocol: { type: String },
  content_type: { type: String },
  cert: {
    sha_value: { type: String },
    cname: { type: String },
    ca: { type: String },
    alternative_names: [ { type: String } ],
    validity: {
      not_after: { type: Date },
      not_before: { type: Date }
    }
  },
  data: [{
    name: { type: String },
    provided_information: { type: String },
    sensibility: { type: Number }
  }]
});

const setLastModified = function(next) {
  this.last_modified = new Date();
  next();
};

spiSchema.pre('save', setLastModified);
spiSchema.pre('update', setLastModified);

const model = mongoose.model('SPI', spiSchema);
module.exports = model;
