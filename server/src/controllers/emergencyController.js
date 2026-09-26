import UserSettings from '../models/UserSettings.js';
import { getDBStatus } from '../config/db.js';

// In-memory fallback emergency contacts
let inMemoryContacts = [
  {
    _id: 'default-contact-1',
    name: 'Primary Caregiver',
    phone: '+1 (555) 234-5678',
    relationship: 'Family',
    isPrimary: true,
  },
];

/**
 * Get all emergency contacts
 * GET /api/emergency/contacts
 */
export const getContacts = async (req, res) => {
  try {
    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      return res.status(200).json({
        success: true,
        source: 'memory',
        contacts: inMemoryContacts,
      });
    }

    let settings = await UserSettings.findOne({ userId: 'default_user' });
    if (!settings) {
      settings = await UserSettings.create({
        userId: 'default_user',
        emergencyContacts: inMemoryContacts,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      contacts: settings.emergencyContacts || [],
    });
  } catch (err) {
    console.error('[EmergencyController] Error fetching contacts:', err);
    return res.status(500).json({ error: 'Failed to fetch emergency contacts', details: err.message });
  }
};

/**
 * Add an emergency contact
 * POST /api/emergency/contacts
 */
export const addContact = async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const newContact = {
      name: name.trim(),
      phone: phone.trim(),
      relationship: (relationship || 'Family').trim(),
      isPrimary: !!isPrimary,
    };

    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      const contactObj = { ...newContact, _id: `mem-${Date.now()}` };
      inMemoryContacts.push(contactObj);
      return res.status(201).json({
        success: true,
        source: 'memory',
        message: 'Contact saved in memory',
        contact: contactObj,
      });
    }

    let settings = await UserSettings.findOne({ userId: 'default_user' });
    if (!settings) {
      settings = await UserSettings.create({ userId: 'default_user' });
    }

    // If marked primary, unset other primaries
    if (newContact.isPrimary) {
      settings.emergencyContacts.forEach((c) => {
        c.isPrimary = false;
      });
    }

    settings.emergencyContacts.push(newContact);
    await settings.save();

    const added = settings.emergencyContacts[settings.emergencyContacts.length - 1];

    return res.status(201).json({
      success: true,
      source: 'mongodb',
      message: 'Emergency contact added successfully',
      contact: added,
    });
  } catch (err) {
    console.error('[EmergencyController] Error adding contact:', err);
    return res.status(500).json({ error: 'Failed to add emergency contact', details: err.message });
  }
};

/**
 * Delete an emergency contact
 * DELETE /api/emergency/contacts/:id
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDBStatus() === 'connected';

    if (!isDbConnected) {
      inMemoryContacts = inMemoryContacts.filter((c) => c._id !== id);
      return res.status(200).json({
        success: true,
        source: 'memory',
        message: 'Contact deleted from memory',
      });
    }

    const settings = await UserSettings.findOne({ userId: 'default_user' });
    if (!settings) {
      return res.status(404).json({ error: 'User settings not found' });
    }

    settings.emergencyContacts = settings.emergencyContacts.filter(
      (c) => c._id.toString() !== id
    );
    await settings.save();

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      message: 'Emergency contact deleted successfully',
    });
  } catch (err) {
    console.error('[EmergencyController] Error deleting contact:', err);
    return res.status(500).json({ error: 'Failed to delete emergency contact', details: err.message });
  }
};

/**
 * Trigger Emergency / SOS Simulation
 * POST /api/emergency/trigger
 *
 * NOTE: As per requirements: "For development, DO NOT automatically call or message anyone.
 * Create the backend structure so emergency functionality can be integrated later."
 */
export const triggerEmergency = async (req, res) => {
  try {
    const { location, notes } = req.body || {};
    const isDbConnected = getDBStatus() === 'connected';

    let contacts = inMemoryContacts;
    if (isDbConnected) {
      const settings = await UserSettings.findOne({ userId: 'default_user' });
      if (settings && settings.emergencyContacts) {
        contacts = settings.emergencyContacts;
      }
    }

    const sosEvent = {
      status: 'SOS_SIMULATED',
      timestamp: new Date().toISOString(),
      contactsNotifiedCount: contacts.length,
      targetContacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
      details: {
        location: location || 'Live User Coordinates Placeholder',
        notes: notes || 'Emergency assistance requested via SightAssist app button.',
        dispatchLiveAlerts: false, // Development safety flag
      },
      message:
        contacts.length > 0
          ? `Emergency broadcast simulated for ${contacts.length} saved contact(s). In production, SMS and automated call alerts will be dispatched immediately.`
          : 'Emergency SOS activated. No contacts are configured in your profile yet. Please add emergency contacts in settings.',
    };

    console.log('[SightAssist Emergency] SOS Triggered (Simulated):', sosEvent);

    return res.status(200).json({
      success: true,
      sosEvent,
    });
  } catch (err) {
    console.error('[EmergencyController] Error triggering emergency:', err);
    return res.status(500).json({ error: 'Failed to trigger emergency', details: err.message });
  }
};
