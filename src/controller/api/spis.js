'use strict';

const _ = require('lodash');
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
    let spiName = req.params.name;
    let findFilter = spiName ? { name: spiName } : {};
    SPI.find(findFilter).then((spiDocs) => {
      if (spiDocs.length === 0) {
        return res.sendStatus(404);
      }
      let message = spiName ? 'data for ' + spiName : 'list of all SPIs';
      res.json({
        message: message,
        spis: spiDocs
      });
    });
  }, { accessType: 'readAPI' });
};

spisController.updateSPI = (req, res) => {
  mw.canAccess(req, res, () => {
    SPI.findOne({ name: req.params.name }).then((spiDoc) => {
      if (!spiDoc) {
        return res.sendStatus(404);
      }
      _.assign(spiDoc, req.body);
      spiDoc.save().then(() => {
        res.json({
          message: req.params.name + ' has been updated',
          updated: spiDoc
        });
      });
    });
  }, { accessType: 'writeAPI' });
};

spisController.deleteSPI = (req, res) => {
  mw.canAccess(req, res, () => {
    SPI.remove({ name: req.params.name }).then((cmdRes) => {
      if (cmdRes.result.n === 0) {
        return res.sendStatus(404);
      }
      res.json({
        message: req.params.name + ' has been deleted'
      });
    });
  }, { accessType: 'writeAPI' });
};

module.exports = spisController;
