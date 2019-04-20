const request = require('supertest-as-promised');
const assert = require('chai').assert;
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const app = require('../config/express');
const { stop } = require('../index');

const User = require('../src/models/User');
const Graphic = require('../src/models/asset/Graphic');
const Object = require('../src/models/object/Object');
const { sequelize } = require('../config/sequelize');

describe('Objects', () => {

  let token = '';
  let graphic = null;

  after(stop);
  before(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      username: 'Darth Vader',
      password: '1234',
    });
    await Object.create({
      name: 'Espada Larga'
    });
    await Object.create({
      name: 'Espada Larga +1'
    });
    graphic = await Graphic.create();
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
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Espada Lazurt',
          graphic_id: graphic.id
        })
        .expect(201)
        .then((res) => {
          assert.equal(res.body.name, 'Espada Lazurt');
          done();
        });
    })
  });

  describe('GET /objects/:objectId', () => {
    it('It should retrieve the object with id 1', (done) => {
      request(app)
        .get('/objects/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          assert.equal(res.body.name, 'Espada Larga');
          done();
        });
    });
  });

  describe('PUT /objects/:objectId', () => {
    it('It should update object "Espada Larga +2" to "Espada Larga +1"', (done) => {
      request(app)
        .put('/objects/2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Espada Larga +1',
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
