'use strict';

const _ = require('lodash');
const mw = require('../../middleware');
const SPI = require('../../db/spi');
const utils = require('../../utils');

let spisController = {};

spisController.addSPI = (req, res) => {
  mw.canAccess(req, res, () => {
    let newSPI = new SPI(req.body);
    newSPI.save().then((spiDoc) => {
      let clientSpiDoc = _.omit(spiDoc, '__v');
      res.status(201).json({
        message: req.body.name + ' has been added',
        added: clientSpiDoc
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
    let spiId = req.params.spiId;

    if (spiId !== void 0 && !utils.isObjectId(spiId)) {
      return res.status(400).json({
        message: 'Invalid spiId'
      });
    }

    let findFilter = spiId ? { _id: spiId } : {};
    SPI.find(findFilter).then((spiDocs) => {
      if (spiDocs.length === 0) {
        return res.sendStatus(404);
      }
      let message = spiId ? 'data for ' + spiDocs[0].name : 'list of all SPIs';
      res.json({
        message: message,
        spis: spiDocs
      });
    });
  }, { accessType: 'readAPI' });
};

spisController.updateSPI = (req, res) => {
  mw.canAccess(req, res, () => {

    if (!utils.isObjectId(req.params.spiId)) {
      return res.status(400).json({
        message: 'Invalid spiId'
      });
    }

    SPI.findOne({ _id: req.params.spiId }).then((spiDoc) => {
      if (!spiDoc) {
        return res.sendStatus(404);
      }
      _.assign(spiDoc, req.body);
      spiDoc.save().then(() => {
        res.json({
          message: spiDoc.name + ' has been updated',
          updated: spiDoc
        });
      });
    });
  }, { accessType: 'writeAPI' });
};

spisController.deleteSPI = (req, res) => {
  mw.canAccess(req, res, () => {

    if (!utils.isObjectId(req.params.spiId)) {
      return res.status(400).json({
        message: 'Invalid spiId'
      });
    }

    SPI.findOneAndRemove({ _id: req.params.spiId }, { select: 'name' }).then((spiDoc) => {
      if (!spiDoc) {
        return res.sendStatus(404);
      }
      res.json({
        message: spiDoc.name + ' has been deleted'
      });
    });
  }, { accessType: 'writeAPI' });
};

module.exports = spisController;
