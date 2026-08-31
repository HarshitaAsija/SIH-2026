import React from 'react';
import { ShieldCheck, Activity, FileText, Lock, Globe, Scale, EyeOff } from 'lucide-react';
import { t } from '../utils/translations';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedLanguage, 
  setSelectedLanguage, 
  consentGranted, 
  onOpenConsent,
  isStealthMode,
  setIsStealthMode
}) {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          
          {/* Brand & Emblem Header */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark border border-primary/40 shadow-md flex items-center justify-center flex-shrink-0 text-white">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-primary-dark font-sans leading-none">
                  AASRA
                </span>
                <span className="text-[10px] font-bold tracking-widest text-primary-dark bg-primary/10 border border-primary/30 px-2 py-0.5 rounded font-mono">
                  {t('helpline_tag', selectedLanguage)}
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-medium mt-0.5">
                {t('helpline_subtitle', selectedLanguage)} &middot; {t('app_title', selectedLanguage)}
              </p>
            </div>
          </div>

          {/* 3 Experience Modes Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-background p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'intake'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('tab_intake', selectedLanguage)}</span>
            </button>

            <button
              onClick={() => setActiveTab('counsellor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                activeTab === 'counsellor'
                  ? 'bg-surface text-primary-dark border border-primary/40 shadow-md font-bold'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('tab_counsellor', selectedLanguage)}</span>
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping absolute top-2 right-2"></span>
            </button>

            <button
              onClick={() => setActiveTab('fairness')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'fairness'
                  ? 'bg-surface text-primary-dark border border-primary/40 shadow-md font-bold'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('tab_fairness', selectedLanguage)}</span>
            </button>
          </nav>

          {/* Right Controls: Quick Exit, Language Selector & Consent Status */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            
            {/* Quick Exit Stealth Toggle */}
            <button
              onClick={() => setIsStealthMode(!isStealthMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isStealthMode
                  ? 'bg-risk-moderate-bg border-risk-moderate/40 text-risk-moderate font-mono'
                  : 'bg-surface hover:bg-background border-border text-text-muted'
              }`}
              title="Quick Exit / Hide Screen"
            >
              <EyeOff className="w-3.5 h-3.5 text-risk-moderate" />
              <span className="hidden sm:inline">
                {isStealthMode ? t('stealth_exit', selectedLanguage) : t('stealth_hide', selectedLanguage)}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center bg-surface border border-border rounded-xl px-2.5 py-1.5">
              <Globe className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-text focus:outline-none cursor-pointer"
              >
                <option value="auto" className="bg-surface text-text">Auto-Detect Indic</option>
                <option value="en" className="bg-surface text-text">English</option>
                <option value="hi" className="bg-surface text-text">Hindi (हिंदी)</option>
                <option value="hi-EN" className="bg-surface text-text">Hinglish (Code-Mixed)</option>
                <option value="mr" className="bg-surface text-text">Marathi (मराठी)</option>
                <option value="ta" className="bg-surface text-text">Tamil (தமிழ்)</option>
                <option value="bn" className="bg-surface text-text">Bengali (বাংলা)</option>
                <option value="te" className="bg-surface text-text">Telugu (తెలుగు)</option>
              </select>
            </div>

            {/* Consent Active Badge */}
            <button
              onClick={onOpenConsent}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                consentGranted
                  ? 'bg-risk-low-bg border-risk-low/40 text-risk-low hover:bg-risk-low-bg'
                  : 'bg-risk-moderate-bg border-risk-moderate/40 text-risk-moderate hover:bg-risk-moderate-bg'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {consentGranted ? t('consent_active', selectedLanguage) : t('consent_review', selectedLanguage)}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}


