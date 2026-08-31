import React, { useState } from 'react';
import { User, MapPin, Shield, CheckCircle, FileText, Heart, Lock, HelpCircle } from 'lucide-react';
import { t } from '../utils/translations';

export default function PersonalizedProfileCard({ assessmentResult, onProfileChange, selectedLanguage = 'en' }) {
  const [name, setName] = useState('Protected Citizen (Anonymized)');
  const [district, setDistrict] = useState('Designated Redressal District');
  const [category, setCategory] = useState('Atrocity Protection Beneficiary');
  const [policeStation, setPoliceStation] = useState('Special Police Unit (PCR)');
  const [isPlanOpen, setIsPlanOpen] = useState(true);

  const handleUpdate = (newName, newDist, newCat, newPs) => {
    setName(newName);
    setDistrict(newDist);
    setCategory(newCat);
    setPoliceStation(newPs);

    if (onProfileChange) {
      onProfileChange({
        victim_name: newName,
        district: newDist,
        category: newCat,
        police_station: newPs
      });
    }
  };

  const recommendations = assessmentResult?.recommendations || [];

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 glass-panel space-y-5 shadow-2xl animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-2xl text-primary">
            <Heart className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-text">
              Your Support Plan
            </h3>

            <p className="text-xs text-text-muted">
              {assessmentResult
                ? "Based on what you shared, these support options may be helpful for you."
                : "A clear, privacy-conscious breakdown of support options tailored to your district"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPlanOpen(!isPlanOpen)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-dark text-white shadow-md transition-all flex items-center space-x-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isPlanOpen ? 'Hide Details' : 'View Support Plan'}</span>
        </button>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

        {/* Field 1: Pseudonym */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            Complainant Pseudonym:
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => handleUpdate(e.target.value, district, category, policeStation)}
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary"
          />
        </div>

        {/* Field 2: District */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            District & State:
          </label>

          <input
            type="text"
            value={district}
            onChange={(e) => handleUpdate(name, e.target.value, category, policeStation)}
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary"
          />
        </div>

        {/* Field 3: Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            Vulnerability Category:
          </label>

          <select
            value={category}
            onChange={(e) => handleUpdate(name, district, e.target.value, policeStation)}
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-text focus:outline-none cursor-pointer"
          >
            <option value="SC Woman Victim">SC Woman Victim</option>
            <option value="ST Tribal Member">ST Tribal Member</option>
            <option value="Elderly SC Individual">Elderly SC Individual</option>
            <option value="SC/ST Minor Child">SC/ST Minor Child</option>
          </select>
        </div>

        {/* Field 4: Police Station */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            Jurisdiction Police Station:
          </label>

          <input
            type="text"
            value={policeStation}
            onChange={(e) => handleUpdate(name, district, category, e.target.value)}
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary"
          />
        </div>

      </div>

      {/* Human-Centered Support Plan Explainer */}
      {isPlanOpen && (
        <div className="bg-background p-5 rounded-2xl border border-border space-y-4 animate-fade-in">

          {/* Support Roadmap Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />

              <span className="text-xs font-semibold text-text">
                Personalized Support Roadmap — {name}
              </span>
            </div>

            <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/30 font-mono">
              Confidential & Protected
            </span>
          </div>

          {/* Dynamic Support Options from Backend Assessment */}
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-surface p-4 rounded-2xl border border-border space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary block">
                      {rec.vertical}
                    </span>

                    <span className="text-[9px] font-semibold text-text-muted bg-background px-2 py-0.5 rounded border border-border">
                      {rec.agency}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-text font-sans">
                    <p className="text-text font-medium">
                      <strong>What support is available:</strong>{' '}
                      {rec.action_item}
                    </p>

                    <p className="text-text-muted italic">
                      <strong>Why it may be relevant:</strong>{' '}
                      {rec.why}
                    </p>

                    <p className="text-primary text-[10px] pt-1 border-t border-border/60">
                      <strong>What could happen next:</strong>{' '}
                      A designated specialist from {rec.agency} may reach out
                      to coordinate this option safely.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (

            /* Gentle Default Support Pillars before narrative submission */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-text">

              <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
                <span className="text-xs font-semibold text-primary block">
                  1. Someone to Talk To
                </span>

                <p className="text-text-muted leading-relaxed text-[11px]">
                  Based on what you shared, speaking with a trained,
                  trauma-informed counsellor may be helpful in{' '}
                  <strong>{district}</strong>.
                </p>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
                <span className="text-xs font-semibold text-secondary block">
                  2. Legal Assistance Support
                </span>

                <p className="text-text-muted leading-relaxed text-[11px]">
                  Based on the situation you shared, legal assistance via the
                  District Legal Services Authority (DLSA) may be relevant.
                </p>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
                <span className="text-xs font-semibold text-risk-low block">
                  3. Safety Review & Protection
                </span>

                <p className="text-text-muted leading-relaxed text-[11px]">
                  Because potential threats were mentioned, a human
                  professional may need to review your safety situation under
                  SC/ST Protection guidelines.
                </p>
              </div>

            </div>
          )}

          {/* Privacy & Transparency Explainer */}
          <div className="p-4 bg-surface rounded-xl border border-border text-xs text-text space-y-2 font-sans">

            <div className="flex items-center space-x-1.5 text-primary font-semibold">
              <Lock className="w-3.5 h-3.5" />

              <span>
                What happens next & privacy safeguards:
              </span>
            </div>

            <ul className="list-disc list-inside text-[11px] text-text-muted space-y-1">
              <li>
                <strong>Who may contact you:</strong> Only verified helpline
                counsellors or local district welfare officers.
              </li>

              <li>
                <strong>What information is shared:</strong> Your narrative is
                shared securely with official support staff without public
                exposure.
              </li>

              <li>
                <strong>You stay in control:</strong> You can review or
                withdraw consent at any time from the top navigation bar.
              </li>
            </ul>

          </div>

        </div>
      )}

    </div>
  );
}