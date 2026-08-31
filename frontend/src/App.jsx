import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConsentModal from './components/ConsentModal';
import IntakePortal from './components/IntakePortal';
import SVIDashboard from './components/SVIDashboard';
import RecommendationCards from './components/RecommendationCards';
import CounsellorDashboard from './components/CounsellorDashboard';
import FairnessAudit from './components/FairnessAudit';
import VoiceModulatorPanel from './components/VoiceModulatorPanel';
import { SAMPLE_PRESETS } from './utils/samplePresets';

import { Cloud, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import VoiceRecorder from './components/VoiceRecorder';


export default function App() {
  const [activeTab, setActiveTab] = useState('intake'); // 'intake' | 'counsellor' | 'fairness'
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [consentGranted, setConsentGranted] = useState(true);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessmentError, setAssessmentError] = useState(null);
  const [casesList, setCasesList] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [priorityNotification, setPriorityNotification] = useState(null);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/v1/cases');
      if (res.ok) {
        const data = await res.json();
        if (data.cases) {
          setCasesList(data.cases);
          return data.cases;
        }
      }
    } catch (err) {
      console.log('Using local cases cache:', err);
    }
  };

  // Force scroll to top on mount / refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Load initial cases
  useEffect(() => {
    fetchCases();
  }, []);

  const handleRunAssessment = async (intakePayload) => {
    setIsAnalyzing(true);
    setAssessmentError(null);
    try {
      const response = await fetch('/api/v1/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakePayload)
      });
      if (!response.ok) {
        throw new Error(`API Assessment Failed (Status: ${response.status})`);
      }
      const data = await response.json();
      setAssessmentResult(data);
      
      const updatedCase = {
        case_id: data.case_id,
        victim_name: "Protected Complainant (Anon.)",
        channel: intakePayload.channel,
        district: "Intake Control Room",
        svi_score: data.svi_analysis.svi_score,
        risk_category: data.svi_analysis.risk_category,
        complaint_text: intakePayload.complaint_text,
        historical_svi: [40.0, 55.0, data.svi_analysis.svi_score],
        svi_analysis: data.svi_analysis,
        nlp_analysis: data.nlp_analysis,
        speech_analysis: data.speech_analysis,
        recommendations: data.recommendations
      };
      
      // Update local case state immediately and sync with backend
      setCasesList(prev => [updatedCase, ...prev.filter(c => c.case_id !== data.case_id)]);
      setActiveCase(updatedCase);

      if (data.silent_escalation || data.svi_analysis?.risk_category === 'CRITICAL') {
        setPriorityNotification({
          case_id: updatedCase.case_id,
          svi_score: updatedCase.svi_score,
          risk_category: 'CRITICAL',
          indicators: data.nlp_analysis?.trauma_flags?.length > 0
            ? data.nlp_analysis.trauma_flags
            : ["Repeated Intimidation", "Severe Fear Signals", "Family Safety Concern"],
          recommended: "Immediate human review & 1-on-1 trauma counselling",
          caseObj: updatedCase
        });
      }

    } catch (err) {
      console.error('Backend assessment connection error:', err);
      setAssessmentError("I'm having trouble connecting to the support system right now. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  if (isStealthMode) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 p-8 font-sans space-y-6">
        <div className="flex items-center justify-between border-b border-slate-300 pb-4">
          <div className="flex items-center space-x-2">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">National Weather & Agriculture Information Service</h1>
          </div>
          <button 
            onClick={() => setIsStealthMode(false)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Exit Public View
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-700">Today's Temperature</h2>
            <p className="text-3xl font-bold text-blue-600">32°C Sunny</p>
            <p className="text-xs text-slate-500">Humidity 45% • Wind 12 km/h</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-700">Monsoon Advisory</h2>
            <p className="text-sm text-slate-600">Normal rainfall expected across northern plains.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-700">Public Portal</h2>
            <p className="text-xs text-slate-500">Access agricultural services.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-sans selection:bg-primary selection:text-white">
      
      {/* Header with Global Language Selection */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        consentGranted={consentGranted}
        onOpenConsent={() => setIsConsentOpen(true)}
        isStealthMode={isStealthMode}
        setIsStealthMode={setIsStealthMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'intake' && (
          <div className="space-y-8">
            <IntakePortal
              onAssess={handleRunAssessment}
              assessmentResult={assessmentResult}
              assessmentError={assessmentError}
              isAnalyzing={isAnalyzing}
              selectedLanguage={selectedLanguage}
            />

            <VoiceRecorder />
            

            {assessmentResult && (
              <div className="space-y-8 border-t border-border pt-8">
                <SVIDashboard result={assessmentResult} selectedLanguage={selectedLanguage} />
                <RecommendationCards recommendations={assessmentResult.recommendations} selectedLanguage={selectedLanguage} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'counsellor' && (
          <CounsellorDashboard
            cases={casesList}
            activeCase={activeCase}
            onSelectCase={(c) => setActiveCase(c)}
            onRefreshCases={fetchCases}
            selectedLanguage={selectedLanguage}
          />
        )}

        {activeTab === 'fairness' && (
          <div className="space-y-8 animate-fade-in">
            <FairnessAudit selectedLanguage={selectedLanguage} />
            <VoiceModulatorPanel selectedLanguage={selectedLanguage} />
            {assessmentResult && (
              <SVIDashboard result={assessmentResult} selectedLanguage={selectedLanguage} />
            )}
          </div>
        )}

      </main>

      {/* Floating Global Priority Event Toast for Officers */}
      {priorityNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-risk-critical-bg border-2 border-risk-critical rounded-3xl p-5 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-risk-critical rounded-2xl text-white shadow-md">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-risk-critical font-mono tracking-widest block">
                  PRIORITY REVIEW REQUIRED
                </span>
                <h4 className="text-xs font-extrabold text-risk-critical">
                  Protected Case: {priorityNotification.case_id}
                </h4>
                <p className="text-[11px] text-risk-critical/90">
                  Critical SVI Score: <strong className="text-risk-critical">{priorityNotification.svi_score}</strong>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setPriorityNotification(null)}
              className="text-risk-critical/80 hover:text-risk-critical p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-risk-critical font-sans">
            Detected: <strong>{priorityNotification.indicators.join(' • ')}</strong>
          </div>

          <div className="pt-2 border-t border-risk-critical/30 flex items-center justify-between">
            <span className="text-[10px] text-risk-critical/80 italic font-sans">Human review required</span>
            <button
              onClick={() => {
                setActiveTab('counsellor');
                setActiveCase(priorityNotification.caseObj);
                setPriorityNotification(null);
              }}
              className="px-3.5 py-1.5 bg-risk-critical hover:opacity-90 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Review Case →</span>
            </button>
          </div>
        </div>
      )}


      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        onAcceptConsent={() => setConsentGranted(true)}
        consentGranted={consentGranted}
      />

    </div>
  );
}

