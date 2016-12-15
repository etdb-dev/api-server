'use strict';

const mw = require('../../middleware');
const SPI = require('../../db/spi');

let spisController = {};

spisController.addSPI = (req, res) => {
  mw.canAccess(req, res, () => {
    let newSPI = new SPI(req.body);
    newSPI.save().then((doc) => {
      res.status(201).json({
        message: req.body.name + ' has been added',
        added: doc
      });
    }).catch((err) => {
      res.status(400).json({
        message: 'Malformed request body',
        err: err
      });
    });
  }, { accessType: 'writeAPI' });
};

spisController.listSPIs = (req, res) => {
  mw.canAccess(req, res, () => {
    SPI.find().then((docs) => {
      res.json({
        message: 'list of all SPIs',
        spis: docs
      });
    });
  }, { accessType: 'readAPI' });
};

module.exports = spisController;
