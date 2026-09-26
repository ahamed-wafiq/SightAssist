import express from 'express';
import {
  getContacts,
  addContact,
  deleteContact,
  triggerEmergency,
} from '../controllers/emergencyController.js';

const router = express.Router();

// GET /api/emergency/contacts - List saved emergency contacts
router.get('/contacts', getContacts);

// POST /api/emergency/contacts - Add a new emergency contact
router.post('/contacts', addContact);

// DELETE /api/emergency/contacts/:id - Remove an emergency contact
router.delete('/contacts/:id', deleteContact);

// POST /api/emergency/trigger - Trigger simulated emergency SOS
router.post('/trigger', triggerEmergency);

export default router;
