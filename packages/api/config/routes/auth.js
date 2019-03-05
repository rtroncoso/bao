const express = require('express');
const authCtrl = require('../../src/controllers/AuthController');

const router = express.Router();

router.route('/')
  .post(authCtrl.authenticate, authCtrl.generateJWT, authCtrl.returnJWT);

router.route('/refresh')
  .post(authCtrl.refreshJWT, authCtrl.generateJWT, authCtrl.returnJWT);

module.exports = router;
