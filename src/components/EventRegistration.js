import React, { useState } from 'react';

const EventRegistration = ({ eventId }) => {
    const [userId, setUserId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call backend API to register user for event
    };

    return (
        <div>
            <h2>Register for Event</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default EventRegistration;
