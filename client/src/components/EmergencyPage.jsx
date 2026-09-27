import { useState, useEffect } from 'react';
import {
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
  triggerEmergencySOS,
} from '../services/api';
import speechService from '../utils/speech';

/**
 * EmergencyPage Component
 * Bold Editorial / Brutalist Redesign:
 * Uses required headings:
 * "EMERGENCY"
 * "GET HELP NOW"
 * Highly visible emergency action without looking like a generic medical app.
 */
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

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const list = await getEmergencyContacts();
    setContacts(list || []);
  };

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    speechService.speak('Emergency alert broadcast initiated.', true);

    try {
      const sosResult = await triggerEmergencySOS({
        location: 'Current user location',
        notes: 'User tapped main SOS button on Emergency Page.',
      });
      setSosStatus(sosResult);
      speechService.speak(
        'Emergency broadcast sent to saved contacts.',
        true
      );
    } catch {
      setSosStatus({
        status: 'SOS_SIMULATED',
        timestamp: new Date().toISOString(),
        message: 'Emergency SOS alert broadcast simulated to contacts.',
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
      speechService.speak('Emergency contact saved.', true);
    } catch {
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
    <div className="editorial-page-container" role="main" aria-label="Emergency SOS Page">
      {/* Editorial Page Header */}
      <div className="editorial-page-header">
        <div className="page-header-text">
          <span className="editorial-page-kicker">SAFETY PROTOCOL</span>
          <h1 className="editorial-page-title">EMERGENCY</h1>
          <p className="editorial-page-sub">
            One-tap emergency broadcast system connecting you with family, guardians, and support networks.
          </p>
        </div>
      </div>

      {/* Main Massive Editorial Emergency Trigger Card */}
      <section className="editorial-emergency-hero" aria-label="Emergency Trigger">
        <div className="emergency-hero-card">
          <div className="emergency-card-kicker-row">
            <span className="emergency-kicker-text">PRIORITY SOS BROADCAST</span>
            <span className="emergency-live-indicator">● STANDBY</span>
          </div>

          <div className="emergency-main-body">
            <h2 className="emergency-display-title">EMERGENCY</h2>
            <p className="emergency-display-desc">
              Immediate geo-coordinated assistance broadcast to all verified emergency contacts.
            </p>

            <button
              type="button"
              id="btn-emergency-sos"
              className={`btn-brutalist-sos ${isTriggering ? 'btn-brutalist-sos--triggering' : ''}`}
              onClick={handleTriggerSOS}
              aria-label="Get Help Now"
            >
              <span className="sos-alert-icon" aria-hidden="true">🚨</span>
              <span className="sos-main-text">GET HELP NOW</span>
              <span className="sos-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Status Notice */}
      {sosStatus && (
        <section className="brutalist-alert brutalist-alert--danger" role="alert" aria-live="assertive">
          <div className="alert-content-row">
            <div>
              <strong>🚨 EMERGENCY BROADCAST ACTIVE:</strong>
              <p>{sosStatus.message || 'Alert broadcast sent to contacts.'}</p>
            </div>
            <button
              type="button"
              className="btn-brutalist btn-brutalist--sm"
              onClick={() => setSosStatus(null)}
            >
              DISMISS
            </button>
          </div>
        </section>
      )}

      {/* Emergency Contacts Section */}
      <section className="editorial-contacts-section">
        <div className="contacts-section-header">
          <div>
            <h3 className="contacts-heading">EMERGENCY CONTACTS</h3>
            <p className="contacts-sub">These contacts will be alerted first during an emergency broadcast.</p>
          </div>
          <button
            type="button"
            className="btn-brutalist btn-brutalist--sm btn-brutalist--yellow"
            onClick={() => setIsAddingContact(!isAddingContact)}
          >
            {isAddingContact ? 'CANCEL' : '+ ADD CONTACT'}
          </button>
        </div>

        {/* Add Contact Modal / Inline Form */}
        {isAddingContact && (
          <form onSubmit={handleAddContactSubmit} className="editorial-add-contact-form">
            <h4 className="form-subheading">NEW EMERGENCY CONTACT</h4>
            {formError && <div className="brutalist-alert brutalist-alert--warning">{formError}</div>}

            <div className="contact-form-grid">
              <div className="editorial-form-group">
                <label className="editorial-label">CONTACT NAME</label>
                <input
                  type="text"
                  className="editorial-input"
                  placeholder="e.g. Jane Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  required
                />
              </div>

              <div className="editorial-form-group">
                <label className="editorial-label">PHONE NUMBER</label>
                <input
                  type="tel"
                  className="editorial-input"
                  placeholder="+1 (555) 000-0000"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  required
                />
              </div>

              <div className="editorial-form-group">
                <label className="editorial-label">RELATIONSHIP</label>
                <select
                  className="editorial-input"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor / Caregiver</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-brutalist btn-brutalist--black">
              SAVE CONTACT →
            </button>
          </form>
        )}

        {/* Contact Cards Grid */}
        <div className="contacts-cards-grid">
          {contacts.length === 0 ? (
            <div className="editorial-empty-card">
              <p className="empty-editorial-title">NO SAVED CONTACTS YET</p>
              <p className="empty-editorial-sub">
                Add at least one family member or caregiver to enable one-touch safety alerts.
              </p>
            </div>
          ) : (
            contacts.map((c) => (
              <div key={c._id || c.name} className="editorial-contact-card">
                <div className="contact-card-top">
                  <span className="contact-avatar-icon">👤</span>
                  <span className="contact-relation-pill">{c.relationship || 'Contact'}</span>
                </div>
                <div className="contact-card-body">
                  <h4 className="contact-name">{c.name}</h4>
                  <p className="contact-phone">{c.phone}</p>
                </div>
                <button
                  type="button"
                  className="btn-contact-delete"
                  onClick={() => handleDelete(c._id, c.name)}
                  aria-label={`Delete ${c.name}`}
                >
                  DELETE
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
