const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUsers } = require('../controllers/usersController');

router.get('/get-users', protect, getUsers);

module.exports = router;
