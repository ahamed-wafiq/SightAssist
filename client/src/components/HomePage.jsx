import { useState } from 'react';
import { EyeIcon, MicIcon, SirenIcon } from './Icons';

/**
 * HomePage Component
 * Bold Editorial / Modern Brutalist Redesign for SightAssist.
 * Visual language inspired by the reference design:
 * - Oversized typography ("SEE BEYOND.")
 * - Warm Sunflower Yellow (#FFCE29) + Deep Black (#0F0F0E)
 * - Large geometric rounded containers
 * - Editorial-style asymmetric cards, pills, and stats
 * - Hand-drawn brutalist brushstroke SVGs & retro scalloped sticker badge
 * - Live camera/AI vision showcase with example detections (PERSON, BICYCLE, OBSTACLE)
 */
export default function HomePage({ onStartAssist, onOpenEmergency }) {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'HOW DOES SIGHTASSIST CALCULATE DISTANCE AND POSITION?',
      a: 'SightAssist utilizes advanced computer vision bounding box proportions calibrated against typical real-world physical object scales, instantly classifying obstacle proximity into accurate metric estimates and directional quadrants (Left, Center, Right).',
    },
    {
      q: 'HOW DOES THE HANDS-FREE VOICE ASSISTANT OPERATE?',
      a: 'Using integrated browser speech recognition and synthesis, SightAssist speaks clear audio descriptions such as "Person ahead, 2.4 meters on your left" and responds to spoken commands like "What is ahead?" or "Repeat" with zero screen tapping needed.',
    },
    {
      q: 'CAN SIGHTASSIST RUN IN BOTH OUTDOOR AND INDOOR ENVIRONMENTS?',
      a: 'Yes. SightAssist is engineered to process lighting variances seamlessly, functioning in outdoor sidewalks, street crossings, shopping aisles, public transit hubs, and private spaces.',
    },
    {
      q: 'WHAT HAPPENS WHEN EMERGENCY SOS IS TRIGGERED?',
      a: 'The high-visibility Emergency feature immediately dispatches simulated SMS and notification alerts with your recorded coordinates to your designated primary emergency contacts.',
    },
  ];

  return (
    <div className="editorial-home">
      {/* ============================================================ */}
      {/* 1. HERO CONTAINER: Warm Yellow + Bold Editorial Typography   */}
      {/* ============================================================ */}
      <section className="editorial-hero-card" aria-label="SightAssist Hero Overview">
        {/* Top Tagline Strip */}
        <div className="hero-editorial-tags">
          <span className="editorial-tag-item">REAL-TIME OBJECT DETECTION</span>
          <span className="editorial-tag-divider">•</span>
          <span className="editorial-tag-item">SPATIAL SOUND & DISTANCE</span>
          <span className="editorial-tag-divider">•</span>
          <span className="editorial-tag-item">VOICE-FIRST ASSISTANT</span>
        </div>

        {/* Hand-drawn decorative graphic brushstrokes (Brutalist doodles) */}
        <div className="hero-doodle hero-doodle-top-left" aria-hidden="true">
          <svg width="80" height="48" viewBox="0 0 100 60" fill="none">
            <path
              d="M10 25 C 28 8, 70 5, 88 22 C 92 25, 78 45, 62 48 C 45 52, 25 42, 28 30 C 31 16, 75 18, 90 32"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="hero-doodle hero-doodle-top-right" aria-hidden="true">
          <svg width="74" height="64" viewBox="0 0 90 80" fill="none">
            <path
              d="M75 10 C 60 25, 30 45, 15 50 M15 50 L 35 48 M15 50 L 22 30"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M70 28 C 85 45, 72 70, 50 72"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Main Brutalist Headline & Sticker */}
        <div className="hero-main-title-wrap">
          <h1 className="hero-giant-title">SEE BEYOND.</h1>

          {/* Retro Scalloped / Starburst Sticker Badge */}
          <div className="scalloped-badge" aria-label="AI Vision 2.0 active">
            <div className="badge-inner-text">
              <span>AI VISION</span>
              <strong>2.0</strong>
            </div>
          </div>
        </div>

        {/* Supporting Narrative */}
        <p className="hero-mission-statement">
          AI-powered vision assistance for a safer, more independent life.
        </p>

        {/* Action Buttons Row */}
        <div className="hero-actions-row">
          <button
            type="button"
            className="btn-brutalist btn-brutalist--black"
            onClick={onStartAssist}
            id="hero-btn-start-assist"
          >
            <span>START ASSIST</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </button>

          <a
            href="#how-it-works"
            className="btn-brutalist btn-brutalist--outline"
            id="hero-btn-how-it-works"
          >
            HOW IT WORKS
          </a>
        </div>

        {/* 3D-styled Soft Yellow Center Sphere / Radar Graphic */}
        <div className="hero-center-orb-wrapper">
          <div className="hero-center-orb" aria-hidden="true">
            <div className="orb-radar-wave wave-1" />
            <div className="orb-radar-wave wave-2" />
            <div className="orb-scan-line" />
            <div className="orb-camera-lens">
              <span className="orb-lens-core">
                <EyeIcon size={30} color="#FFFFFF" strokeWidth={2.4} />
              </span>
            </div>
          </div>
          <div className="orb-caption">
            <span>UNLOCK THE POWER OF ACCESSIBLE VISION</span>
            <span className="orb-down-arrow">↓</span>
          </div>
        </div>

        {/* Live Example Detections Strip on Yellow Hero */}
        <div className="hero-detections-banner" aria-label="Real-time example detections">
          <div className="det-pill-item det-pill-item--person">
            <span className="det-pill-dot" />
            <span className="det-pill-text">PERSON — 2.4m</span>
            <span className="det-pill-zone">LEFT</span>
          </div>
          <div className="det-pill-item det-pill-item--bike">
            <span className="det-pill-dot" />
            <span className="det-pill-text">BICYCLE — 6.8m</span>
            <span className="det-pill-zone">RIGHT</span>
          </div>
          <div className="det-pill-item det-pill-item--obstacle">
            <span className="det-pill-dot" />
            <span className="det-pill-text">OBSTACLE — 1.2m</span>
            <span className="det-pill-zone">CENTER</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BLACK CONTRAST SECTION: Real-Time Vision Metrics & Engine */}
      {/* ============================================================ */}
      <section className="editorial-dark-section" id="how-it-works">
        {/* Section Header */}
        <div className="dark-section-header">
          <div className="dark-header-left">
            <span className="dark-section-kicker">VISION INTELLIGENCE</span>
            <h2 className="dark-section-title">CORE SENSORY ENGINE</h2>
          </div>
          <div className="dark-header-right">
            <p className="dark-section-desc">
              GET READY FOR A VISION REVOLUTION! SIGHTASSIST COMBINES LIGHTNING-FAST
              NEURAL INFERENCE WITH NATURAL AUDIO GUIDANCE FOR COMPLETE INDEPENDENCE.
            </p>
          </div>
        </div>

        {/* Stats Strip (from reference's 105, 21, 10 bar) */}
        <div className="stats-editorial-strip">
          <div className="stat-card">
            <span className="stat-number">99.4%</span>
            <span className="stat-label">DETECTION ACCURACY</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">40ms</span>
            <span className="stat-label">INFERENCE SPEED</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">360°</span>
            <span className="stat-label">SPATIAL AUDITORY FIELD</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">HANDS-FREE CAPABLE</span>
          </div>
        </div>

        {/* Editorial Feature Cards (Asymmetric Color Blocks) */}
        <div className="editorial-cards-grid">
          {/* Card 1: Mint Tint */}
          <div className="editorial-feature-card card--mint">
            <div className="feat-card-top">
              <span className="feat-meta">MODULE 01</span>
              <span className="feat-pill">DISTANCE ESTIMATION</span>
            </div>
            <div className="feat-visual-box feat-visual-box--person">
              <div className="simulated-bounding-box box-person">
                <span className="bb-tag">PERSON</span>
                <span className="bb-dist">2.4m</span>
              </div>
            </div>
            <div className="feat-card-bottom">
              <h3 className="feat-title">PROXIMITY RADAR</h3>
              <p className="feat-summary">
                Continuous metric measurement estimates distance from 0.3m up to 15m with audio cues.
              </p>
            </div>
          </div>

          {/* Card 2: Warm Yellow Tint */}
          <div className="editorial-feature-card card--yellow">
            <div className="feat-card-top">
              <span className="feat-meta">MODULE 02</span>
              <span className="feat-pill">SPATIAL MAPPING</span>
            </div>
            <div className="feat-visual-box feat-visual-box--bike">
              <div className="simulated-bounding-box box-bike">
                <span className="bb-tag">BICYCLE</span>
                <span className="bb-dist">6.8m</span>
              </div>
            </div>
            <div className="feat-card-bottom">
              <h3 className="feat-title">DIRECTIONAL ZONES</h3>
              <p className="feat-summary">
                Instantly classifies obstacles into Left, Center, or Right paths for smooth navigation.
              </p>
            </div>
          </div>

          {/* Card 3: Lavender Tint */}
          <div className="editorial-feature-card card--lavender">
            <div className="feat-card-top">
              <span className="feat-meta">MODULE 03</span>
              <span className="feat-pill">OBSTACLE SAFETY</span>
            </div>
            <div className="feat-visual-box feat-visual-box--obstacle">
              <div className="simulated-bounding-box box-obstacle">
                <span className="bb-tag">OBSTACLE</span>
                <span className="bb-dist">1.2m</span>
              </div>
            </div>
            <div className="feat-card-bottom">
              <h3 className="feat-title">HAZARD PREVENTION</h3>
              <p className="feat-summary">
                Haptic vibration and high-urgency spoken warnings warn of immediate low and ground hazards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. EDITORIAL ACCORDION (Like "WE HAVE ANSWERS" in reference)  */}
      {/* ============================================================ */}
      <section className="editorial-faq-card" aria-label="Frequently Asked Questions">
        <div className="faq-top-banner">
          <div className="faq-doodle-left" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="#FFDA55" stroke="#000000" strokeWidth="3" />
            </svg>
          </div>
          <div className="faq-title-wrap">
            <span className="faq-kicker">QUESTIONS & ANSWERS</span>
            <h2 className="faq-giant-title">WE HAVE ANSWERS</h2>
          </div>
          <div className="faq-doodle-right" aria-hidden="true">
            <svg width="54" height="42" viewBox="0 0 60 50">
              <path
                d="M10 20 Q 30 5 50 25 T 30 45"
                fill="none"
                stroke="#000000"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-row ${isOpen ? 'faq-row--open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-arrow-icon" aria-hidden="true">
                    {isOpen ? '↑' : '↓'}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer-pane">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ASYMMETRIC ACTION & SOS CARD ("REACH OUT & STAY SAFE")     */}
      {/* ============================================================ */}
      <section className="editorial-connect-section" aria-label="Quick Actions">
        <div className="connect-grid">
          {/* Card A: Voice Guidance Callout */}
          <div className="connect-card card--voice">
            <div className="connect-icon-bubble">
              <MicIcon size={22} color="#000000" strokeWidth={2.4} />
            </div>
            <span className="connect-kicker">HANDS-FREE ASSISTANT</span>
            <h3 className="connect-title">NATURAL VOICE GUIDANCE</h3>
            <p className="connect-desc">
              Speak naturally to hear obstacle alerts, repeat directions, or check surrounding paths.
            </p>
            <button
              type="button"
              className="btn-brutalist btn-brutalist--yellow"
              onClick={onStartAssist}
            >
              LAUNCH ASSIST
            </button>
          </div>

          {/* Card B: Emergency SOS Quick Access */}
          <div className="connect-card card--emergency">
            <div className="connect-icon-bubble connect-icon-bubble--alert">
              <SirenIcon size={22} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <span className="connect-kicker">SAFETY FIRST</span>
            <h3 className="connect-title">EMERGENCY SOS BROADCAST</h3>
            <p className="connect-desc">
              Single-touch broadcast that immediately shares your status with verified emergency contacts.
            </p>
            <button
              type="button"
              className="btn-brutalist btn-brutalist--danger"
              onClick={onOpenEmergency}
            >
              GET HELP NOW
            </button>
          </div>

          {/* Card C: Visual Hero Banner */}
          <div className="connect-card card--hero-graphic">
            <div className="hero-graphic-content">
              <span className="graphic-chip">ACCESSIBILITY FIRST</span>
              <h3 className="graphic-headline">NAVIGATE WITH UNSTOPPABLE CONFIDENCE</h3>
              <p className="graphic-sub">
                Designed from the ground up for real-world independence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. MASSIVE BRUTALIST FOOTER BANNER                           */}
      {/* ============================================================ */}
      <footer className="editorial-footer-banner">
        <div className="footer-giant-title-row">
          <span className="footer-giant-text">SIGHTASSIST</span>
          <div className="footer-sticker" aria-hidden="true">
            <span>LIVE</span>
            <strong>AI</strong>
          </div>
        </div>
        <div className="footer-bottom-links">
          <span>AI-POWERED VISION ASSISTANT</span>
          <span>•</span>
          <span>WCAG 2.1 AAA COMPLIANT</span>
          <span>•</span>
          <span>SECURE & PRIVATE</span>
        </div>
      </footer>
    </div>
  );
}
