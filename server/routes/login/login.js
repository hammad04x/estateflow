const express = require('express');
const router = express.Router();
const login = require('../../controller/login/login');
const verifyToken = require('../../middleware/verifyToken');
const authorizeRole = require('../../middleware/authorizeRole');
const upload = require('../../middleware/fileHandler');

router.post('/login', login.login);
router.post('/refresh-token', verifyToken, login.refreshToken);
router.post('/update-activity', verifyToken, login.updateActivity);
router.post('/logout', verifyToken, login.logout);
router.get('/getuserbyid/:id', verifyToken, login.getUserById);
router.get('/getUsers/', verifyToken, login.getUsers);
router.post('/addUser', verifyToken, authorizeRole('admin'), upload.single("img"),  login.addUser);



module.exports = router;
