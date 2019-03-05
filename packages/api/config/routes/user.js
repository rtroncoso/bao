const express = require('express');
const jwt = require('express-jwt');
const config = require('../env');
const userCtrl = require('../../src/controllers/UserController');

const router = express.Router();
const secret = config.jwt.jwtSecret;
const authed = jwt({ secret });

router.route('/')
  .get(authed, userCtrl.list)
  .post(userCtrl.create);

router.route('/:userId')
  .get(authed, userCtrl.get)
  .put(authed, userCtrl.update)
  .delete(authed, userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
