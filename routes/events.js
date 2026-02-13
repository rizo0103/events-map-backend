const express = require('express');
const router = express.Router();
const { createEventType } = require('../controllers/eventsController');

router.post('/add-event-type', createEventType);

module.exports = router;