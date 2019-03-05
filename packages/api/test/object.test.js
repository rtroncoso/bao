const request = require('supertest-as-promised');
const assert = require('chai').assert;
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const app = require('../config/express');
const User = require('../src/models/User');

describe('User', () => {

  let token = '';

  before(async () => {
    await User.sync({ force: true });
    await User.create({
      objectname: 'Darth Vader',
      password: '1234',
    });
    await User.create({
      objectname: 'Alf',
      password: '1234',
    });
    token = await jwt.sign({ id: 1 }, config.jwt.jwtSecret, { expiresIn: config.jwt.jwtDuration });
  });

  describe('GET /objects', () => {
    it('It should GET all the objects', (done) => {
      request(app)
        .get('/objects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          assert.typeOf(res.body, 'array');
          assert.equal(res.body.length, 2);
          done();
        });
    });
  });

  describe('POST /objects', () => {
    it('It should create a new object', (done) => {
      request(app)
        .post('/objects')
        .send({
          name: 'Homer J. Simpson',
          password: '1234',
        })
        .expect(201)
        .then((res) => {
          assert.equal(res.body.name, 'Homer J. Simpson');
          done();
        });
    })
  });

  describe('GET /objects/:objectId', () => {
    it('It should retrieve the object with id 1', (done) => {
      request(app)
        .get('/objects/3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          assert.equal(res.body.name, 'Homer J. Simpson');
          done();
        });
    });
  });

  describe('PUT /objects/:objectId', () => {
    it('It should update object "Darth Vader" to "Obi Wan"', (done) => {
      request(app)
        .put('/objects/2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Homer J. Simpson',
        })
        .expect(201, done());
    });
  });

  describe('DELETE /objects/:objectId', () => {
    it('It should delete object with id 3', (done) => {
      request(app)
        .delete('/objects/3')
        .set('Authorization', `Bearer ${token}`)
        .expect(204, done());
    });
  });

});
