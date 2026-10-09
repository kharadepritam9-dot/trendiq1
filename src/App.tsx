/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AnalyzePage } from './components/AnalyzePage';
import { AnalysisLoading } from './components/AnalysisLoading';
import { Dashboard } from './components/Dashboard';
import { TrendSignals } from './components/TrendSignals';
import { ContentOpportunities } from './components/ContentOpportunities';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { CustomIdeaModal } from './components/CustomIdeaModal';
import { demoAccount, sampleOpportunities } from './data/mockData';
import { ScreenState, TrendSignal, Opportunity, GeneratedContent } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('landing');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [trends, setTrends] = useState<TrendSignal[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sampleOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isCustomIdeaModalOpen, setIsCustomIdeaModalOpen] = useState(false);

  // Fetch local Google Trends snapshot data on mount
  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await fetch('/api/trends');
        if (res.ok) {
          const data = await res.json();
          if (data && data.trends) {
            setTrends(data.trends);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch from /api/trends, checking local trends directly...', err);
      }

      // Direct fallback if API not ready during early boot
      try {
        const localModule = await import('../trends.json');
        if (localModule && localModule.default && localModule.default.trends) {
          setTrends(localModule.default.trends as TrendSignal[]);
        }
      } catch (e) {
        console.error('Failed to import local trends.json:', e);
      }
    }

    loadTrends();
  }, []);

  // Handle start analysis flow
  const handleStartAnalysis = () => {
    setCurrentScreen('loading');
  };

  const handleLoadingComplete = () => {
    setHasAnalyzed(true);
    setCurrentScreen('dashboard');
  };

  // Handle opportunity selection
  const handleSelectOpportunity = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
  };

  // Handle jumping to opportunity from a trend card
  const handleSelectOpportunityByTrend = (trendId: string) => {
    const matched = opportunities.find((o) => o.trendId === trendId);
    if (matched) {
      setSelectedOpportunity(matched);
    } else {
      setCurrentScreen('opportunities');
    }
  };

  // Regenerate content via Gemini backend
  const handleRegenerateWithGemini = async (opp: Opportunity): Promise<GeneratedContent | null> => {
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: opp.title,
          category: opp.matchedCategory,
          trendTopic: opp.title,
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        return data.content as GeneratedContent;
      }
    } catch (err) {
      console.error('Failed to generate with Gemini backend:', err);
    }

    // Default enhanced variation fallback
    return {
      ...opp.generatedContent,
      hook: {
        ...opp.generatedContent.hook,
        primary: `Here is the #1 mistake you are making with ${opp.title.split(':')[0]} at your desk.`,
        textOverlay: `WATCH THIS BEFORE POSTING 🛑`,
      },
    };
  };

  // Add new evaluated custom opportunity
  const handleAddCustomOpportunity = (newOpp: Opportunity) => {
    setOpportunities((prev) => [newOpp, ...prev]);
    setSelectedOpportunity(newOpp);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        hasAnalyzed={hasAnalyzed}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentScreen === 'landing' && (
          <LandingPage
            onStart={() => setCurrentScreen('analyze')}
          />
        )}

        {currentScreen === 'analyze' && (
          <AnalyzePage
            account={demoAccount}
            onBack={() => setCurrentScreen('landing')}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {currentScreen === 'loading' && (
          <AnalysisLoading
            onComplete={handleLoadingComplete}
          />
        )}

        {currentScreen === 'dashboard' && (
          <Dashboard
            account={demoAccount}
            onViewTrends={() => setCurrentScreen('trends')}
            onViewOpportunities={() => setCurrentScreen('opportunities')}
          />
        )}

        {currentScreen === 'trends' && (
          <TrendSignals
            trends={trends}
            opportunities={opportunities}
            onSelectOpportunityByTrend={handleSelectOpportunityByTrend}
            onOpenCustomIdeaModal={() => setIsCustomIdeaModalOpen(true)}
          />
        )}

        {currentScreen === 'opportunities' && (
          <ContentOpportunities
            opportunities={opportunities}
            onSelectOpportunity={handleSelectOpportunity}
            onOpenCustomIdeaModal={() => setIsCustomIdeaModalOpen(true)}
          />
        )}
      </div>

      {/* Opportunity Detail Modal (Why This Idea? + Generate Content) */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onRegenerateWithGemini={handleRegenerateWithGemini}
        />
      )}

      {/* Custom Idea / Trend Evaluator Modal */}
      <CustomIdeaModal
        isOpen={isCustomIdeaModalOpen}
        onClose={() => setIsCustomIdeaModalOpen(false)}
        onAddOpportunity={handleAddCustomOpportunity}
      />
    </div>
  );
}
