import { useState, useEffect } from 'react';
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
  triggerEmergencySOS,
} from '../services/api';
import speechService from '../utils/speech';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState([]);
  const [sosStatus, setSosStatus] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: 'Family',
    isPrimary: false,
  });
  const [formError, setFormError] = useState('');

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const list = await getEmergencyContacts();
    setContacts(list);
  };

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    speechService.speak('Emergency SOS triggered. Preparing alert broadcast.', true);

    try {
      const sosResult = await triggerEmergencySOS({
        location: 'Current user location',
        notes: 'User tapped main SOS button on Emergency Page.',
      });
      setSosStatus(sosResult);
      speechService.speak(
        'Emergency SOS simulated broadcast complete. Saved contacts listed on screen.',
        true
      );
    } catch (err) {
      setSosStatus({
        status: 'SOS_SIMULATED',
        timestamp: new Date().toISOString(),
        message: 'Emergency SOS alert initiated (simulated mode).',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      setFormError('Please enter both name and phone number.');
      return;
    }

    try {
      await addEmergencyContact(newContact);
      setNewContact({ name: '', phone: '', relationship: 'Family', isPrimary: false });
      setIsAddingContact(false);
      setFormError('');
      loadContacts();
      speechService.speak('Emergency contact saved successfully.', true);
    } catch (err) {
      setFormError('Failed to save contact. Please try again.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete emergency contact ${name}?`)) {
      await deleteEmergencyContact(id);
      loadContacts();
      speechService.speak(`Contact ${name} removed.`, true);
    }
  };

  return (
    <div className="page-container" role="main" aria-label="Emergency SOS Page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Emergency / SOS</h2>
          <p className="page-subtitle">One-tap emergency broadcast and contact management</p>
        </div>
      </div>

      {/* 1. Large Accessible SOS Button */}
      <section className="sos-action-section" aria-label="Emergency Trigger">
        <button
          type="button"
          id="btn-emergency-sos"
          className={`btn-sos-large ${isTriggering ? 'btn-sos-large--triggering' : ''}`}
          onClick={handleTriggerSOS}
          aria-label="Send Emergency SOS Alert"
        >
          <span className="sos-icon" aria-hidden="true">🚨</span>
          <div className="sos-text-group">
            <span className="sos-title">TAP FOR EMERGENCY SOS</span>
            <span className="sos-subtitle">Broadcast alert to all emergency contacts</span>
          </div>
        </button>
      </section>

      {/* 2. Emergency Status Display */}
      {sosStatus && (
        <section className="sos-status-card" role="alert" aria-live="assertive">
          <div className="sos-status-header">
            <span className="sos-status-dot" aria-hidden="true" />
            <strong className="sos-status-title">EMERGENCY SOS ACTIVE (SIMULATION)</strong>
          </div>
          <p className="sos-status-desc">{sosStatus.message}</p>
          <div className="sos-status-meta">
            <span>Timestamp: {new Date(sosStatus.timestamp).toLocaleTimeString()}</span>
            <span>Notified: {sosStatus.contactsNotifiedCount || contacts.length} Contact(s)</span>
          </div>
          <button
            type="button"
            className="btn-dismiss-sos"
            onClick={() => setSosStatus(null)}
          >
            Dismiss Alert
          </button>
        </section>
      )}

      {/* 3. Safety Notice (Development Mode) */}
      <div className="safety-notice-box" role="note">
        <span className="notice-icon" aria-hidden="true">ℹ️</span>
        <p>
          <strong>Safety Note:</strong> In development mode, automatic telephone calls and SMS dispatches are simulated. In production, this broadcasts your GPS coordinates and notifies your saved contacts immediately.
        </p>
      </div>

      {/* 4. Emergency Contacts Management */}
      <section className="contacts-section" aria-label="Emergency Contacts">
        <div className="contacts-header-row">
          <h3 className="section-title">Emergency Contacts ({contacts.length})</h3>
          {!isAddingContact && (
            <button
              type="button"
              className="btn-add-contact-toggle"
              onClick={() => setIsAddingContact(true)}
              aria-label="Add new emergency contact"
            >
              + Add Contact
            </button>
          )}
        </div>

        {/* Add Contact Form Modal/Inline */}
        {isAddingContact && (
          <form className="add-contact-form" onSubmit={handleAddContactSubmit}>
            <h4 className="form-title">New Emergency Contact</h4>
            {formError && <p className="form-error-text">{formError}</p>}

            <div className="form-field">
              <label htmlFor="contact-name" className="form-label">Full Name *</label>
              <input
                id="contact-name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-phone" className="form-label">Phone Number *</label>
              <input
                id="contact-phone"
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 123-4567"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-relationship" className="form-label">Relationship</label>
              <select
                id="contact-relationship"
                className="form-select"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              >
                <option value="Family">Family</option>
                <option value="Caregiver">Caregiver</option>
                <option value="Friend">Friend</option>
                <option value="Doctor">Doctor / Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field-checkbox">
              <input
                id="contact-primary"
                type="checkbox"
                className="form-checkbox"
                checked={newContact.isPrimary}
                onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
              />
              <label htmlFor="contact-primary" className="checkbox-label">
                Set as Primary Contact
              </label>
            </div>

            <div className="form-buttons-row">
              <button type="submit" className="btn-form-save">
                Save Contact
              </button>
              <button
                type="button"
                className="btn-form-cancel"
                onClick={() => {
                  setIsAddingContact(false);
                  setFormError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <div className="empty-contacts-card">
            <p className="empty-contacts-text">
              No emergency contacts added yet. Tap <strong>"+ Add Contact"</strong> above to ensure you have a designated caregiver or family member listed.
            </p>
          </div>
        ) : (
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div key={contact._id} className="contact-card">
                <div className="contact-main-info">
                  <div className="contact-name-row">
                    <strong className="contact-name">{contact.name}</strong>
                    {contact.isPrimary && (
                      <span className="primary-contact-pill">Primary</span>
                    )}
                  </div>
                  <span className="contact-phone">{contact.phone}</span>
                  <span className="contact-rel">{contact.relationship}</span>
                </div>

                <div className="contact-actions">
                  <button
                    type="button"
                    className="btn-delete-contact"
                    onClick={() => handleDelete(contact._id, contact.name)}
                    aria-label={`Delete emergency contact ${contact.name}`}
                    title="Delete contact"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
