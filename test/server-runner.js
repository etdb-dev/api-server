'use strict';

const expect = require('chai').expect;
const db = require('../src/db');
require('../src/log')();

describe('Database models', () => {

  let connect = (done) => {
    db.connect().then(done);
  };

  before(connect);

  /*
    name: String,
    last_modified: Date,
    publisher: String,
    store_url: String,
    apis: [ api ]
   */
  describe('App', () => {

    const App = db.app;

    let testApp = new App({
      name: 'testApp',
      publisher: 'testPublisher',
      store_url: 'https://play.google.com/store/apps/details?id=com.nianticlabs.pokemongo'
    });

    it('should have a name', () => {
      expect(testApp).to.have.property('name');
      expect(testApp.name).to.equal('testApp');
    });
    it('should have a publisher', () => {
      expect(testApp).to.have.property('publisher');
      expect(testApp.publisher).to.equal('testPublisher');
    });
    it('should have an Appstore URL', () => {
      expect(testApp).to.have.property('store_url');
      expect(testApp.store_url).to.equal('https://play.google.com/store/apps/details?id=com.nianticlabs.pokemongo');
    });
  });

  /*
    last_modified: Date,
    endpointUrl: String,
    encrypted: Boolean,
    name: String,
    protocol: String,
    content_type: String,
    cert: {
      sha_value: String,
      cname: String,
      ca: String,
      alternative_names: String,
    },
    data: [{
      name: String,
      provided_information: String,
      sensibility: Number
    }]
  */
  describe('SPI', () => {

    const SPI = db.spi;

    let testSPI = new SPI({
      name: 'Gimme-Their-Data Inc.',
      endpoint_url: 'https://gimme.their.data.com/testApp',
      encrypted: true,
      protocol: 'HTTPS',
      content_type: 'application/json',
      cert: {
        sha_value: '9B 0C 57 46 24 81 81 97 1D 93 43 37 59 56 30 4E F9 D0 DD 13 FE 76 DC 4B EB 4E 98 27 60 2E 09 4C',
        cname: '*.their.data.com',
        ca: 'DigiCert SHA2 High Assurance Server CA',
        alternative_names: [ '*.your.data.com' ],
        validity: {
          not_after: new Date(),
          not_before: new Date()
        }
      },
      data: [{
        name: 'testAppUserInfo',
        provided_information: '{ user: { name: \'screwedOne\', email: \'screwed@mobileapp.com\' } }',
        sensibility: 3
      }, {
        name: 'testAppAdverts',
        provided_information: '{ adsShown: 17, adsClicked: 0 }',
        sensibility: 1
      }]
    });

    it('should have a name', () => {
      expect(testSPI).to.have.property('name', 'Gimme-Their-Data Inc.');
    });
    it('should have a endpoint_url', () => {
      expect(testSPI).to.have.property('endpoint_url', 'https://gimme.their.data.com/testApp');
    });
    it('should have a encrypted', () => {
      expect(testSPI).to.have.property('encrypted', true);
    });
    it('should have a protocol', () => {
      expect(testSPI).to.have.property('protocol', 'HTTPS');
    });
    it('should have a content_type', () => {
      expect(testSPI).to.have.property('content_type', 'application/json');
    });

    it('should have a cert', () => {
      expect(testSPI).to.have.property('cert');
      expect(testSPI.cert).to.be.an('object');
    });
    describe('cert', () => {
      it('should have a sha_value', () => {
        expect(testSPI.cert).to.have.property('sha_value',
          '9B 0C 57 46 24 81 81 97 1D 93 43 37 59 56 30 4E F9 D0 DD 13 FE 76 DC 4B EB 4E 98 27 60 2E 09 4C');
      });
      it('should have a cname', () => {
        expect(testSPI.cert).to.have.property('cname',
          '*.their.data.com');
      });
      it('should have a ca', () => {
        expect(testSPI.cert).to.have.property('ca',
          'DigiCert SHA2 High Assurance Server CA');
      });
      it('should have alternative_names', () => {
        expect(testSPI.cert).to.have.property('alternative_names');
        expect(testSPI.cert.alternative_names).to.be.an.instanceof(Array);
        expect(testSPI.cert.alternative_names).to.have.lengthOf(1);
        expect(testSPI.cert.alternative_names[0]).to.equal('*.your.data.com');
      });

      it('should have a validity', () => {
        expect(testSPI.cert).to.have.property('validity');
        expect(testSPI.cert.validity).to.be.an('object');
      });
      describe('validity', () => {
        it('should have a property not_after', () => {
          expect(testSPI.cert.validity).to.have.property('not_after');
          expect(testSPI.cert.validity.not_after).to.be.an.instanceof(Date);
        });
        it('should have a property not_before', () => {
          expect(testSPI.cert.validity).to.have.property('not_before');
          expect(testSPI.cert.validity.not_before).to.be.an.instanceof(Date);
        });
      });
    });

    it('should have data', () => {
      expect(testSPI).to.have.property('data');
      expect(testSPI.data).to.be.an.instanceof(Array);
      expect(testSPI.data).to.be.lengthOf(2);
      expect(testSPI.data[0]).to.be.an('object');
    });
    describe('data entry', () => {
      it('should have a name', () => {
        expect(testSPI.data[0]).to.have.property('name',
          'testAppUserInfo');
      });
      it('should have provided_information', () => {
        expect(testSPI.data[0]).to.have.property('provided_information',
          '{ user: { name: \'screwedOne\', email: \'screwed@mobileapp.com\' } }');
      });
      it('should have a sensibility', () => {
        expect(testSPI.data[0]).to.have.property('sensibility', 3);
      });
    });

    it('should update last_modified on save/update', (done) => {
      let firstSaveDate;
      testSPI.save()
      .then((firstSavedDoc) => {
        expect(firstSavedDoc).to.have.property('last_modified');
        firstSaveDate = firstSavedDoc.last_modified;
        SPI.findOne({ name: 'Gimme-Their-Data Inc.' })
        .then((doc) => {
          doc.save().then((updatedDoc) => {
            expect(updatedDoc.last_modified).to.not.eql(firstSaveDate);
            done();
          });
        });
      });
    });
  });
});
