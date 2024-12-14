// routes/events.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all events
router.get('/', (req, res) => {
  db.query('SELECT * FROM events', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new event
router.post('/add', (req, res) => {
  const { name, description, date, time, venue, type, organizerId } = req.body;

  console.log("Received data:", req.body); // Log the received data to ensure it's being passed correctly

  // Insert event data into the database
  db.query(
    'INSERT INTO events (name, description, date, time, venue, type, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, date, time, venue, type, organizerId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err.message); // Log database errors
        return res.status(500).json({ error: err.message });
      }
      console.log("Event added:", results); // Log the result of the query
      res.json({ success: true, message: 'Event added successfully' });
    }
  );
});

module.exports = router;
