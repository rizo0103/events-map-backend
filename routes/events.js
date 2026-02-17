const express = require('express');
const router = express.Router();
const { createEventType, getEventTypes, createEvent, getEvents, deleteEvent } = require('../controllers/eventsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add-event-type', protect, createEventType);
router.get('/get-event-types', protect, getEventTypes);
router.post('/create-event', protect, createEvent);
router.get('/get-events', protect, getEvents);
router.delete('/delete-event/:uid', protect, deleteEvent);

module.exports = router;