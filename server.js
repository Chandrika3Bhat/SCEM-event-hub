// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations');

// Middleware
app.use(express.json());  // Parse JSON bodies
app.use(cors());  // Enable CORS for frontend access

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/registrations', registrationsRouter);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
