const express = require('express');
const jwt = require('express-jwt');
const config = require('../env');
const objectCtrl = require('../../src/controllers/ObjectController');

const router = express.Router();
const secret = config.jwt.jwtSecret;
const authed = jwt({ secret });

router.route('/')
  .get(authed, objectCtrl.list)
  .post(authed, objectCtrl.create);

router.route('/:objectId')
  .get(authed, objectCtrl.get)
  .put(authed, objectCtrl.update)
  .delete(authed, objectCtrl.remove);

/** Load object when API with objectId route parameter is hit */
router.param('objectId', objectCtrl.load);

module.exports = router;
