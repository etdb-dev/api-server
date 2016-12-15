'use strict';

const mongoose = require('mongoose');

const spiSchema = mongoose.Schema({
  last_modified: { type: Date, required: true, default: new Date() },
  endpoint_url: { type: String, required: true },
  encrypted: { type: Boolean, default: false },
  name: { type: String },
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

const model = mongoose.model('SPI', spiSchema);
module.exports = model;
