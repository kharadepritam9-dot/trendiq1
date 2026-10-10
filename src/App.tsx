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
import { ScreenState, TrendSignal, Opportunity, GeneratedContent, ContentAngle } from './types';
import { getDemoProfile } from './lib/instagram/demoAdapter';
import { analyzeCreatorProfile } from './lib/analysis/creatorAnalysis';
import { generateRankedOpportunities } from './lib/opportunities/rankedPipeline';
import fallbackTrendsData from '../trends.json';

const defaultProfile = getDemoProfile();
const defaultAnalysis = analyzeCreatorProfile(defaultProfile);
const defaultTrends = (fallbackTrendsData.trends as unknown as TrendSignal[]) || [];
const initialRankedOpps = generateRankedOpportunities(defaultProfile, defaultAnalysis, defaultTrends);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('landing');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [trends, setTrends] = useState<TrendSignal[]>(defaultTrends);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialRankedOpps);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [sessionVersions, setSessionVersions] = useState<Record<string, GeneratedContent[]>>({});
  const [isCustomIdeaModalOpen, setIsCustomIdeaModalOpen] = useState(false);

  // Fetch local Google Trends snapshot data & ranked opportunities on mount
  useEffect(() => {
    async function loadTrends() {
      try {
        const res = await fetch('/api/trends');
        if (res.ok) {
          const data = await res.json();
          if (data && data.trends) {
            setTrends(data.trends);
          }
        }
      } catch (err) {
        console.warn('Could not fetch from /api/trends, checking local trends directly...', err);
        try {
          const localModule = await import('../trends.json');
          if (localModule && localModule.default && localModule.default.trends) {
            setTrends(localModule.default.trends as TrendSignal[]);
          }
        } catch (e) {
          console.error('Failed to import local trends.json:', e);
        }
      }

      // Fetch dynamically ranked opportunities
      try {
        const oppRes = await fetch('/api/opportunities');
        if (oppRes.ok) {
          const oppData = await oppRes.json();
          if (oppData && oppData.opportunities && oppData.opportunities.length > 0) {
            setOpportunities(oppData.opportunities);
          }
        }
      } catch (oppErr) {
        console.warn('Could not fetch from /api/opportunities, using fallback sample opportunities', oppErr);
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

  // Generate or regenerate content via Gemini backend
  const handleGenerateContent = async (
    opp: Opportunity,
    angle: ContentAngle,
    previousVersions: GeneratedContent[]
  ): Promise<{ success: boolean; content?: GeneratedContent; error?: string; message?: string }> => {
    try {
      const payload = {
        opportunityId: opp.id,
        title: opp.title,
        category: opp.matchedCategory,
        targetAudience: 'Desk workers and busy professionals looking for fat loss and mobility',
        selectedAngle: angle,
        previousVersions: previousVersions.map((v) => ({
          hook: {
            primary: v.hook.primary,
            visualHook: v.hook.visualHook,
            textOverlay: v.hook.textOverlay,
          },
          angle: v.angle,
          caption: v.caption,
          version: v.version,
        })),
      };

      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.content) {
        return {
          success: false,
          error: data.error || 'GENERATION_FAILED',
          message: data.message || `Failed to generate content (HTTP ${res.status}).`,
        };
      }

      const newContent: GeneratedContent = {
        ...data.content,
        angle,
        version: data.version || previousVersions.length + 1,
        isAiGenerated: true,
      };

      // Record in current client session history
      setSessionVersions((prev) => {
        const existing = prev[opp.id] || [];
        return {
          ...prev,
          [opp.id]: [...existing, newContent],
        };
      });

      // Update opportunity list while strictly preserving opportunityScore
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opp.id
            ? {
                ...o,
                generatedContent: newContent,
                selectedAngle: angle,
                contentVersions: [...(o.contentVersions || []), newContent],
              }
            : o
        )
      );

      // Keep selectedOpportunity in sync
      setSelectedOpportunity((prev) =>
        prev && prev.id === opp.id
          ? {
              ...prev,
              generatedContent: newContent,
              selectedAngle: angle,
              contentVersions: [...(prev.contentVersions || []), newContent],
            }
          : prev
      );

      return {
        success: true,
        content: newContent,
      };
    } catch (err: unknown) {
      console.error('Failed to generate with backend:', err);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to generation service. Please check your network and try again.',
      };
    }
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
        opportunityCount={opportunities.length}
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
            trends={trends}
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
          onGenerateContent={handleGenerateContent}
          sessionVersions={sessionVersions[selectedOpportunity.id] || []}
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
