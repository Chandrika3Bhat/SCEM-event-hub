import React, { useState, useEffect } from 'react';
import './EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null); // Initially set to null, indicating no logged-in user
  const [email, setEmail] = useState(""); // To store email, in case of registration
  const [message, setMessage] = useState(""); // To show registration success or failure message
  const [loading, setLoading] = useState(true); // Loading state
  const [registeredEvents, setRegisteredEvents] = useState([]); // Track user's registered events
  const [feedbackEventId, setFeedbackEventId] = useState(null); // Track the event for which feedback is being given
  const [feedback, setFeedback] = useState(""); // Store the feedback

  // Fetching events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);  // Set loading to true while fetching events
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
        setLoading(false);  // Set loading to false after events are fetched
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage('Failed to load events.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch user's registration status and set user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {  // Replace with your API that checks logged-in user
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // You may need to add authorization headers (e.g., token) based on your backend setup
          },
        });
        const data = await response.json();
        if (data.user) {
          setUserId(data.user.id);  // Set user ID if logged in
        } else {
          setMessage('Please log in to register for events.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage('Failed to verify user authentication.');
      }
    };

    fetchUser();
  }, []);

  // Fetch user's registered events
  useEffect(() => {
    if (userId) {
      const fetchRegisteredEvents = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/registrations?userId=${userId}`);
          const data = await response.json();
          setRegisteredEvents(data.map(event => event.event_id));  // Store registered event IDs
        } catch (error) {
          console.error('Error fetching registered events:', error);
        }
      };

      fetchRegisteredEvents();
    }
  }, [userId]);

  const handleRegister = async (eventId) => {
    if (userId) {
      setMessage('You are already logged in and registered for events.');
      return;
    }

    // Check if the email exists in the database
    const emailExists = await checkEmailExistence(email);
    if (emailExists) {
      setMessage('Email is already registered. Please log in to register for events.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, email }),  // Use email for registration
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Successfully registered for the event!');
      } else {
        setMessage(data.message || 'Failed to register!');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('An error occurred while registering.');
    }
  };

  const checkEmailExistence = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/check-email?email=${email}`);
      const data = await response.json();
      return data.exists;  // Return true if email exists, false otherwise
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const handleFeedbackSubmit = async (eventId) => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, feedback }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Thank you for your feedback!');
      } else {
        setMessage(data.message || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error('Error during feedback submission:', error);
      setMessage('An error occurred while submitting feedback.');
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="event-list-container">
      <h2>Events</h2>
      {message && <div className="message">{message}</div>}

      <div className="event-card-container">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <h3>{event.name}</h3>
            <p>{event.description}</p>
            <div className="event-details">
              <p>Date: {event.date}</p>
              <p>Time: {event.time}</p>
              <p>Venue: {event.venue}</p>
            </div>
            <button onClick={() => handleRegister(event.id)} className="register-btn">
              Register
            </button>
            {registeredEvents.includes(event.id) && (
              <button 
                onClick={() => setFeedbackEventId(event.id)} 
                className="feedback-btn"
              >
                Give Feedback
              </button>
            )}
            {feedbackEventId === event.id && (
              <div className="feedback-form">
                <textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)} 
                  placeholder="Your feedback..." 
                />
                <button onClick={() => handleFeedbackSubmit(event.id)}>Submit Feedback</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;
