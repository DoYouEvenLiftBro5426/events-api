// server.js
// Programmer: Kian Pouraslani
// Student ID: 300371278
// URI variable declared on line 10

import express from 'express';
import mongoose from 'mongoose';

// URI declared here — line 10 (as required by submission comments)
const URI = process.env.URI || 'mongodb+srv://salankapar_db_user:REwTRzp33qKkQpEi@cluster0.uf44mpa.mongodb.net/EventDBS?appName=Cluster0';

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// ── MONGOOSE SCHEMA & MODEL ──────────────────────────────────────────────
// Schema defines the shape of documents in the events collection
const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  organizer:   { type: String, required: true },
  capacity:    { type: Number, required: true, min: 1 },
  ticketPrice: { type: Number, required: true, min: 0 }
});

// Model name 'Event' — Mongoose automatically creates 'events' collection
const Event = mongoose.model('Event', eventSchema);

// ── CONNECT TO MONGODB ───────────────────────────────────────────────────
mongoose.connect(URI)
  .then(() => console.log('Connected to MongoDB — EventDBS'))
  .catch(err => console.error('MongoDB connection error:', err));

// ── ROUTES ───────────────────────────────────────────────────────────────

// GET /api/events — Retrieve ALL events (2 marks)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// GET /api/events/:id — Retrieve a SINGLE event by ID (2 marks)
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    // If no event found with that ID, return 404
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// POST /api/events/add — Create a NEW event (2 marks)
app.post('/api/events/add', async (req, res) => {
  try {
    // Create a new Event instance from the request body
    const newEvent = new Event({
      title:       req.body.title,
      organizer:   req.body.organizer,
      capacity:    req.body.capacity,
      ticketPrice: req.body.ticketPrice
    });

    // Save to database
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/events/update/:id — Update an EXISTING event by ID (2 marks)
app.put('/api/events/update/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,        // which document to update
      req.body,             // the new data
      { new: true,          // return the updated document, not the old one
        runValidators: true } // run schema validators on the update
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/events/delete/:id — Delete an event by ID (2 marks)
app.delete('/api/events/delete/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ── START SERVER ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});