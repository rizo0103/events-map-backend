const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUsers, deleteUser, editUser } = require('../controllers/usersController');

router.get('/get-users', protect, getUsers);
router.delete('/delete-user/:uid', protect, deleteUser);
router.put('/update-user/:uid', protect, editUser);

module.exports = router;
