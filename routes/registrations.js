const express = require('express');
const router = express.Router();
const db = require('../db');  // Your database connection

// Register for an event
router.post('/', (req, res) => {
  const { eventId, userId } = req.body;

  // Check if eventId and userId are provided
  if (!eventId || !userId) {
    return res.status(400).json({ error: 'Event ID and User ID are required.' });
  }

  // Validate that eventId and userId are valid numbers (or adjust based on your schema)
  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid Event ID or User ID.' });
  }

  // Check if the user is already registered for this event
  db.query(
    'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
    [eventId, userId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);  // Added logging
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      // If the user is already registered for this event
      if (results.length > 0) {
        return res.status(400).json({ message: 'You are already registered for this event.' });
      }

      // User is not registered for this event, proceed to insert
      db.query(
        'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
        [eventId, userId],
        (err, results) => {
          if (err) {
            console.error('Error during registration:', err);  // Added logging
            return res.status(500).json({ error: 'Error during registration: ' + err.message });
          }

          // Ensure that the insertion was successful
          if (results.affectedRows > 0) {
            res.json({ success: true, message: 'User registered for the event successfully!' });
          } else {
            console.log('Insertion failed:', results);  // Added logging for failed insertion
            res.status(500).json({ error: 'Failed to register user for the event.' });
          }
        }
      );
    }
  );
});

// Fetch all registered users for a specific event
router.get('/event/:eventId/registrations', (req, res) => {
  const { eventId } = req.params;

  // Log for debugging
  console.log('Fetching registered users for event ID:', eventId);

  // Query to fetch event details along with registered users
  const query = `
    SELECT users.id, users.name, users.email, events.name AS event_name
    FROM registrations
    JOIN users ON registrations.user_id = users.id
    JOIN events ON registrations.event_id = events.id
    WHERE events.id = ?
  `;

  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error('Database error:', err);  // Added logging
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users registered for this event.' });
    }

    // Send only the necessary details
    res.json(results);  // Return the list of users along with event details
  });
});

module.exports = router;
