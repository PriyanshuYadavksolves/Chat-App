const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user_controller.js');
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/verify/:token', UserController.verify);
router.post('/forgot-password', UserController.forgotPassword);
router.patch('/reset-password/:token', UserController.resetPassword);
router.delete('/delete/:id',UserController.delete)
module.exports = router;