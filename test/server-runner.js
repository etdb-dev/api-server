'use strict';

const expect = require('chai').expect;
const App = require('../src/db/app');

describe('Database models', () => {
  /*
    name: String,
    last_modified: Date,
    publisher: String,
    store_url: String,
    apis: [ api ]
   */
  describe('App', () => {

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
});
