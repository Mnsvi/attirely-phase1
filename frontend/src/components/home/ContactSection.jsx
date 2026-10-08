import { useState } from "react";
import Antigravity from "../animations/Antigravity";
import "./ContactSection.css";

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "styling",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="contact-section" aria-label="Contact ATTIRELY Atelier">
      {/* Antigravity React Bits Physics Animation Layer */}
      <Antigravity
        count={280}
        magnetRadius={160}
        ringRadius={110}
        waveSpeed={0.5}
        waveAmplitude={28}
        particleSize={2.8}
        lerpSpeed={0.09}
        color="#8B3A3A"
        secondaryColor="var(--color-cream)"
        particleShape="capsule"
        fieldStrength={20}
      />

      <div className="contact-container">
        {/* Left Information Pane */}
        <div className="contact-info-pane">
          <span className="contact-kicker">PRIVATE CONCIERGE & ATELIER</span>
          <h2 className="contact-title">Connect With Our Fashion Atelier</h2>
          <p className="contact-desc">
            Whether you are seeking bespoke styling advice, lookbook curation, or tech partnerships — our editorial team is at your disposal.
          </p>

          <div className="atelier-locations">
            <div className="location-item">
              <span className="city-name">PARIS</span>
              <span className="city-addr">Rue du Faubourg Saint-Honoré</span>
            </div>
            <div className="location-item">
              <span className="city-name">NEW YORK</span>
              <span className="city-addr">Madison Avenue, Upper East Side</span>
            </div>
            <div className="location-item">
              <span className="city-name">MILAN</span>
              <span className="city-addr">Via Montenapoleone</span>
            </div>
          </div>

          <div className="contact-direct">
            <div className="direct-item">
              <span className="direct-label">Client Concierge:</span>
              <span className="direct-val">concierge@attirely.studio</span>
            </div>
            <div className="direct-item">
              <span className="direct-label">Styling Hours:</span>
              <span className="direct-val">Mon — Sat, 9:00 AM – 8:00 PM CET</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Form Pane */}
        <div className="contact-form-pane">
          {submitted ? (
            <div className="contact-success-card">
              <div className="success-icon">✓</div>
              <h3>Inquiry Received</h3>
              <p>
                Thank you, <strong>{formData.name}</strong>. An ATTIRELY editorial stylist will be in touch within 24 hours.
              </p>
              <button
                type="button"
                className="reset-form-btn"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", inquiryType: "styling", message: "" });
                }}
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3 className="form-heading">Initiate Consultation</h3>

              <div className="form-group">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="eleanor@atelier.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-type">Inquiry Focus</label>
                <select
                  id="contact-type"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                >
                  <option value="styling">Personal Styling & Curation</option>
                  <option value="vip">VIP Lookbook & Archive Access</option>
                  <option value="press">Press & Editorial Inquiries</option>
                  <option value="tech">Multimodal AI Engine Partnership</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Styling Brief or Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Describe your aesthetic requirements, upcoming occasion, or specific silhouettes..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="contact-submit-btn">
                <span>SUBMIT CONSULTATION REQUEST</span>
                <span>→</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
