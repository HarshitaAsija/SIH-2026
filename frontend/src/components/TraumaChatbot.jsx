import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Send, Volume2, Shield, HeartHandshake, MapPin,
  CheckCircle2, Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';
import AasraCompanion from './AasraCompanion';
import { SAMPLE_PRESETS } from '../utils/samplePresets';
import { audioEngine } from '../utils/audioSynthesizer';
import { t } from '../utils/translations';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

function buildContextTags(text) {
  text = text || '';
  const tags = [];
  if (/pati|mara|maar|beat|hit|husband/i.test(text))  tags.push('physical violence');
  if (/police|FIR|thana|complaint/i.test(text))       tags.push('police interaction');
  if (/jaan se maar|kill|death threat/i.test(text))   tags.push('death threats');
  if (/caste|dalit|untouchable/i.test(text))          tags.push('caste discrimination');
  if (/rape|sexual|assault/i.test(text))              tags.push('sexual violence');
  return tags;
}

function AasraBubble({ children, variant = 'normal' }) {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark border border-primary/40 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
        M
      </div>
      <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed shadow-sm space-y-1 ${
        variant === 'critical'
          ? 'bg-risk-critical-bg border border-risk-critical/40 text-risk-critical'
          : 'bg-surface border border-border text-text'
      }`}>
        <p className="font-semibold text-primary-dark">Mitra (AASRA Companion):</p>
        {children}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark border border-primary/40 flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0 animate-pulse">
        M
      </div>
      <div className="bg-surface border border-border p-3.5 rounded-2xl text-xs text-text-muted flex items-center space-x-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span>Mitra is listening...</span>
      </div>
    </div>
  );
}

function UserBubble({ text, name }) {
  return (
    <div className="flex items-start justify-end space-x-3 animate-fade-in">
      <div className="bg-primary border border-primary p-4 rounded-2xl max-w-md text-xs text-white leading-relaxed shadow-md">
        {name && (
          <p className="text-[10px] text-white/80 font-semibold uppercase tracking-wider mb-1">
            {name}
          </p>
        )}
        {text}
      </div>
    </div>
  );
}

function OptionChips({ options, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 pl-12 animate-fade-in">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-surface border-primary/40 text-primary-dark hover:bg-primary hover:text-white hover:border-primary hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ContextMemoryBanner({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex items-start space-x-2 p-3 bg-primary/10 border border-primary/25 rounded-xl text-xs text-primary-dark animate-fade-in">
      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <span>
        AASRA Context Memory: <strong>{tags.join(', ')}</strong>. You do not need to repeat these details.
      </span>
    </div>
  );
}

export default function TraumaChatbot({
  onAssess,
  assessmentResult,
  assessmentError,
  isAnalyzing,
  selectedLanguage,
  isSilentMode,
  emotionalState
}) {
  isSilentMode = isSilentMode || false;
  emotionalState = emotionalState || null;

  const [inputText, setInputText]             = useState('');
  const [isRecording, setIsRecording]         = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeProsody, setActiveProsody]     = useState(null);
  const [victimName, setVictimName]           = useState('Protected Complainant (Anon.)');
  const [victimLocation, setVictimLocation]   = useState('');

  // ── Conversation state
  const [phase, setPhase]                     = useState('idle'); // idle | conversing | assessing
  const [chatMessages, setChatMessages]       = useState([]);
  const [conversationState, setConversationState] = useState({});
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [contextTags, setContextTags]         = useState([]);
  const [isBotThinking, setIsBotThinking]     = useState(false);

  const chatThreadRef = useRef(null);

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [chatMessages, isBotThinking]);

  const addMessage = (msg) =>
    setChatMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);

  const callNextQuestion = async (message, state) => {
    setIsBotThinking(true);
    try {
      const res = await fetch(API_BASE + '/conversation/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language_code: selectedLanguage,
          conversation_state: state
        })
      });
      if (!res.ok) throw new Error('Backend error');
      return await res.json();
    } catch (e) {
      return null;
    } finally {
      setIsBotThinking(false);
    }
  };

  const callAnswer = async (questionId, answer, state) => {
    setIsBotThinking(true);
    try {
      const res = await fetch(API_BASE + '/conversation/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer,
          message: '',
          language_code: selectedLanguage,
          conversation_state: state
        })
      });
      if (!res.ok) throw new Error('Backend error');
      return await res.json();
    } catch (e) {
      return null;
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleConversationResult = (data, originalText) => {
    if (!data) {
      addMessage({ role: 'aasra', text: "I am having trouble connecting. Please try again or click 'See Support Options Now'." });
      return;
    }
    const convo = data.conversation;
    const newState = data.conversation_state || conversationState;
    setConversationState(newState);

    if (convo.should_continue && convo.action === 'ask_question') {
      setPendingQuestion({ id: convo.question_id, text: convo.next_question, options: convo.options || [] });
      addMessage({ role: 'aasra', text: convo.next_question, options: convo.options || [] });
    } else if (!convo.should_continue && convo.action === 'priority_human_intervention') {
      setPendingQuestion(null);
      addMessage({
        role: 'aasra',
        text: "I hear you. What you are sharing sounds very serious. Connecting you with immediate human support now. Please stay on the line.",
        variant: 'critical'
      });
      triggerAssessment(originalText, newState);
    } else {
      setPendingQuestion(null);
      triggerAssessment(originalText, newState);
    }
  };

  const triggerAssessment = (text, state) => {
    setPhase('assessing');
    const collected = (state && state.collected_information) ? state.collected_information : {};
    onAssess({
      channel: 'Trauma Chatbot Intake',
      language_code: selectedLanguage,
      complaint_text: text || inputText || '',
      prosody_override: activeProsody,
      context_factors: {
        is_woman_or_child: true,
        is_repeat_harassment: collected.repeat_harassment === 'Yes' || true,
        police_fir_refused: collected.police_fir_refused === 'Yes' || true,
        perpetrator_in_power: true,
        perpetrator_nearby: collected.perpetrator_nearby === 'Yes',
        immediate_safety: collected.immediate_safety === 'Yes',
        support_needed: collected.support_needed,
        victim_mood: emotionalState || 'Immediate Threat'
      }
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    audioEngine.stopAudio();
    setPhase('conversing');
    setContextTags(buildContextTags(text));
    addMessage({ role: 'user', text, name: victimName });
    setInputText('');
    const data = await callNextQuestion(text, {});
    handleConversationResult(data, text);
  };

  const handleOptionSelect = async (option) => {
    if (!pendingQuestion) return;
    const qId = pendingQuestion.id;
    addMessage({ role: 'user', text: option });
    setPendingQuestion(null);
    if (qId === 'police_approached' && option === 'Yes')
      setContextTags(prev => Array.from(new Set([...prev, 'police interaction'])));
    if (qId === 'police_fir_refused' && option === 'Yes')
      setContextTags(prev => Array.from(new Set([...prev, 'FIR refused'])));
    if (qId === 'repeat_harassment' && option === 'Yes')
      setContextTags(prev => Array.from(new Set([...prev, 'repeated incidents'])));
    const data = await callAnswer(qId, option, conversationState);
    const firstUserMsg = chatMessages.find(m => m.role === 'user');
    handleConversationResult(data, firstUserMsg ? firstUserMsg.text : inputText);
  };

  const handleSkipToAssessment = () => {
    setPendingQuestion(null);
    addMessage({ role: 'user', text: '[Requested immediate support options]', name: victimName });
    addMessage({ role: 'aasra', text: 'Of course. Let me pull up the support options for you right away.' });
    const firstUserMsg = chatMessages.find(m => m.role === 'user');
    triggerAssessment(firstUserMsg ? firstUserMsg.text : inputText, conversationState);
  };

  const handleScenarioSelect = async (preset) => {
    setActiveProsody(preset.prosody);
    setVictimName(preset.name);
    setVictimLocation('');
    setContextTags(buildContextTags(preset.complaint_text));
    if (!isSilentMode) audioEngine.speakPrompt(preset.complaint_text, selectedLanguage, 0.95, 1.0);
    setChatMessages([]);
    setConversationState({});
    setPendingQuestion(null);
    setPhase('conversing');
    setInputText('');
    addMessage({ role: 'user', text: preset.complaint_text, name: preset.name });
    const data = await callNextQuestion(preset.complaint_text, {});
    handleConversationResult(data, preset.complaint_text);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(1);
      if (!isSilentMode) audioEngine.speakPrompt('recording', selectedLanguage, 1.0, 1.0);
      const interval = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 12) { clearInterval(interval); setIsRecording(false); return 12; }
          return prev + 1;
        });
      }, 1000);
    } else {
      audioEngine.stopAudio();
      setIsRecording(false);
    }
  };

  const speakGreeting = () => {
    if (!isSilentMode) audioEngine.speakPrompt('welcome', selectedLanguage, 1.0, 1.0);
  };

  const companionState = isAnalyzing ? 'thinking'
    : isRecording ? 'listening'
    : (assessmentResult && (assessmentResult.silent_escalation ||
       (assessmentResult.svi_analysis && assessmentResult.svi_analysis.risk_category === 'CRITICAL')))
       ? 'safety_support'
    : 'idle';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Left: Chat Intake */}
      <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 glass-panel flex flex-col space-y-4 shadow-2xl">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-primary/10 border border-primary/30 rounded-2xl">
              <AasraCompanion state={companionState} size="sm" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-text">{victimName}</span>
                {victimLocation && (
                  <span className="text-[10px] text-primary-dark bg-primary/10 border-primary/30 px-2 py-0.5 rounded font-mono">
                    <MapPin className="w-2.5 h-2.5 inline mr-1" />{victimLocation}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">AASRA Support Session &middot; Confidential</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isSilentMode && (
              <button type="button" onClick={speakGreeting}
                className="px-2.5 py-1.5 bg-background hover:bg-surface border border-border rounded-xl text-xs font-medium text-primary-dark flex items-center space-x-1 shadow-sm">
                <Volume2 className="w-3.5 h-3.5" /><span>Listen</span>
              </button>
            )}
            <div className="flex items-center space-x-1 text-xs font-medium text-risk-low bg-risk-low-bg border-risk-low/40 px-3 py-1.5 rounded-xl">
              <Shield className="w-3.5 h-3.5" /><span>Session Safe</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div ref={chatThreadRef} className="flex-1 space-y-4 overflow-y-auto pr-2 scroll-smooth" style={{ maxHeight: '360px' }}>

          <AasraBubble>
            <p>Welcome. I am Mitra — your confidential AASRA support companion. You are in a safe, protected space. Take all the time you need. Share your experience below, or select a scenario to begin.</p>
          </AasraBubble>

          <ContextMemoryBanner tags={contextTags} />

          {chatMessages.map((msg) => {
            if (msg.role === 'user') {
              return <UserBubble key={msg.id} text={msg.text} name={msg.name} />;
            }
            return (
              <div key={msg.id} className="space-y-2">
                <AasraBubble variant={msg.variant}>
                  <p className={msg.variant === 'critical' ? 'text-risk-critical font-medium' : ''}>{msg.text}</p>
                </AasraBubble>
                {msg.options && msg.options.length > 0 && (
                  <OptionChips
                    options={msg.options}
                    onSelect={handleOptionSelect}
                    disabled={
                      !pendingQuestion ||
                      pendingQuestion.text !== msg.text ||
                      isBotThinking ||
                      isAnalyzing
                    }
                  />
                )}
              </div>
            );
          })}

          {isBotThinking && <ThinkingBubble />}

          {assessmentError && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-risk-critical-bg border border-risk-critical/40 flex items-center justify-center text-risk-critical text-xs font-bold shadow-md flex-shrink-0">!</div>
              <div className="bg-risk-critical-bg border border-risk-critical/40 p-4 rounded-2xl max-w-md text-xs text-risk-critical leading-relaxed shadow-md">
                <p className="font-bold">Connection Notice:</p>
                <p>{assessmentError}</p>
              </div>
            </div>
          )}

          {assessmentResult && !isAnalyzing && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary-dark text-xs font-bold shadow-md flex-shrink-0">AA</div>
              <div className="bg-background border border-primary/40 p-4 rounded-2xl max-w-md text-xs text-text leading-relaxed space-y-2 shadow-lg">
                <p className="font-semibold text-primary-dark flex items-center space-x-1.5">
                  <HeartHandshake className="w-4 h-4 text-primary" />
                  <span>AASRA Companion Response:</span>
                </p>
                <p className="text-text font-medium text-xs leading-relaxed">
                  Thank you for telling me. Your safety matters. You do not have to go through this alone.
                  Let us look at what support options may be helpful right now.
                </p>
                <div className="pt-2 border-t border-border text-[11px] text-primary-dark font-sans flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-risk-low" /><span>Support Plan Activated</span>
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Case: {assessmentResult.case_id}</span>
                </div>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center justify-between p-4 bg-background border border-primary/40 rounded-2xl shadow-sm animate-pulse">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-primary animate-bounce" />
                <div>
                  <span className="text-xs font-bold text-primary-dark block">Listening and Capturing Voice Biomarkers...</span>
                  <span className="text-[10px] text-text-muted font-mono">F0 Pitch &middot; Jitter &middot; Shimmer &middot; Pauses</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 h-8">
                {[60,90,40,100,70,85,30,95,50,75,40,80].map((h, idx) => (
                  <span key={idx} className="w-1.5 bg-primary rounded-full animate-wave-bar"
                    style={{ animationDelay: (idx * 0.1) + 's' }} />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-primary-dark bg-primary/10 px-2.5 py-1 rounded-lg">{recordingSeconds}s</span>
            </div>
          )}
        </div>

        {/* See Support Options Now */}
        {phase === 'conversing' && !isAnalyzing && !assessmentResult && (
          <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/30 rounded-2xl text-xs">
            <span className="text-text-muted">Ready to see your support options without more questions?</span>
            <button type="button" onClick={handleSkipToAssessment}
              disabled={isBotThinking || isAnalyzing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white font-semibold text-xs hover:bg-secondary/80 transition-all disabled:opacity-40 shadow-sm">
              <ArrowRight className="w-3.5 h-3.5" /><span>See Support Options Now</span>
            </button>
          </div>
        )}

        {/* Scenario Presets (idle only) */}
        {phase === 'idle' && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-primary-dark">
              <span className="font-bold">{t('scenarios_title', selectedLanguage)}</span>
              <span className="text-secondary font-bold text-[11px]">{t('scenarios_click', selectedLanguage)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {SAMPLE_PRESETS.map((scenario) => (
                <button key={scenario.id} type="button"
                  onClick={() => handleScenarioSelect(scenario)}
                  className={'text-left p-3.5 rounded-2xl transition-all group shadow-sm border ' + (
                    scenario.is_critical_preset
                      ? 'bg-[#E8C1CA]/30 hover:bg-[#E8C1CA]/50 border-[#C7748B]/60 hover:border-[#C7748B]'
                      : 'bg-surface hover:bg-[#F0ECE1] border-border hover:border-primary'
                  )}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-dark group-hover:text-primary">{scenario.name}</span>
                    <span className={'text-[9px] font-bold px-2 py-0.5 rounded border ' + (
                      scenario.is_critical_preset
                        ? 'bg-[#E8C1CA] text-[#72243E] border-[#C7748B]'
                        : 'bg-background text-primary-dark border-border'
                    )}>{scenario.category}</span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-1 mt-1 font-sans">{scenario.complaint_text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border">
          <div className="relative flex items-center">
            <textarea rows={2} value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={phase === 'idle'
                ? 'Share what you are experiencing in your own words...'
                : 'Type a follow-up or additional details...'}
              className="w-full bg-background border border-border rounded-2xl p-3.5 pr-28 text-xs text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="absolute right-3 flex items-center space-x-2">
              <button type="button" onClick={toggleRecording}
                className={'p-2.5 rounded-xl transition-all ' + (isRecording
                  ? 'bg-risk-critical text-white animate-pulse shadow-md'
                  : 'bg-surface hover:bg-background text-primary')}>
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button type="submit"
                disabled={isAnalyzing || isBotThinking || !inputText.trim()}
                className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-40 shadow-md transition-all">
                {isAnalyzing || isBotThinking
                  ? <Sparkles className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted font-sans">
            <span>You can take your time &middot; Confidential Support</span>
            {activeProsody && <span className="text-primary-dark font-medium">&#10003; Audio Narrative Loaded</span>}
          </div>
        </form>

      </div>

      {/* Right Column */}
      <div className="lg:col-span-5 space-y-4">

        {/* AASRA Commitments */}
        <div className="bg-surface border border-border rounded-3xl p-5 glass-panel space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-primary-dark font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /><span>AASRA Support Commitments</span>
          </div>
          <div className="space-y-3 text-xs text-text font-sans">
            <div className="p-3 bg-background rounded-2xl border border-border space-y-1">
              <span className="text-primary-dark font-semibold block">1. You Are in Control</span>
              <p className="text-primary-dark text-[11px]">Share as much or as little as you feel comfortable. You can pause or stop at any point.</p>
            </div>
            <div className="p-3 bg-background rounded-2xl border border-border space-y-1">
              <span className="text-secondary font-semibold block">2. No Repetition Required</span>
              <p className="text-text text-[11px]">AASRA remembers details shared within your active session.</p>
            </div>
            <div className="p-3 bg-background rounded-2xl border border-border space-y-1">
              <span className="text-risk-low font-semibold block">3. Complete Confidentiality</span>
              <p className="text-text text-[11px]">Your identity remains anonymized. Support options are tailored to your safety requirements.</p>
            </div>
          </div>
        </div>

        {/* Session Context Panel (during conversation) */}
        {phase === 'conversing' &&
         conversationState &&
         conversationState.collected_information &&
         Object.keys(conversationState.collected_information).length > 0 && (
          <div className="bg-surface border border-border rounded-3xl p-5 glass-panel space-y-3 shadow-xl animate-fade-in">
            <div className="flex items-center space-x-2 text-primary-dark font-semibold text-xs uppercase tracking-wider">
              <ChevronRight className="w-4 h-4" /><span>Session Context Gathered</span>
            </div>
            <div className="space-y-2">
              {Object.entries(conversationState.collected_information).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border text-xs">
                  <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-primary-dark">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* National Helplines */}
        <div className="bg-surface border border-border rounded-3xl p-5 glass-panel space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary-dark font-semibold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" /><span>National Support Lines</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary-dark border border-primary/30 px-2 py-0.5 rounded">24x7 Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-background p-3 rounded-2xl border border-border">
              <span className="text-[10px] text-text-muted block font-medium">Toll-Free Helpline</span>
              <span className="text-xl font-mono font-bold text-text">14566</span>
            </div>
            <div className="bg-background p-3 rounded-2xl border border-border">
              <span className="text-[10px] text-text-muted block font-medium">Emergency SOS</span>
              <span className="text-xl font-mono font-bold text-risk-critical">112</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
