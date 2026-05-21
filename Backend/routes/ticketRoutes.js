const express = require('express');
const router = express.Router();
const { getAllTickets } = require('../controllers/ticketController');

// GET endpoint to load initial live ticket board
router.get('/', getAllTickets);

module.exports = router;