/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  ClipboardCheck,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  getInitialDojoState,
  createEmptyState,
  saveDojoState,
  recordSingleAnswer,
  recordCompletedTestSession,
  computeSenseiLevel,
  getSenseiLevelMeta,
  DojoUserState,
  TestHistoryRecord,
} from './utils/storage';
import { QuestionCategory } from './data/questionBank';
import { SequentialRowDrillView } from './components/SequentialRowDrillView';
import { SenseiStudyView } from './components/SenseiStudyView';
import { SimulatorCBTView } from './components/SimulatorCBTView';
import { DashboardAnalyticsView } from './components/DashboardAnalyticsView';
import { PWAInstallButton, OfflineStatusBanner } from './components/PWAElements';

type ActiveTabId = 'drill' | 'study' | 'simulator' | 'dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabId>('drill');
  const [userState, setUserState] = useState<DojoUserState>(() => getInitialDojoState());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [retryMistakeIds, setRetryMistakeIds] = useState<string[] | null>(null);

  // Focus UI states (hides chrome during active CBT test or when user enables Focus Mode in Drill)
  const [drillFocusMode, setDrillFocusMode] = useState<boolean>(false);
  const [cbtActiveFocus, setCbtActiveFocus] = useState<boolean>(false);

  const isGlobalFocusUI =
    (activeTab === 'drill' && drillFocusMode) ||
    (activeTab === 'simulator' && cbtActiveFocus);

  const levelMeta = getSenseiLevelMeta(userState.currentSenseiLevel);
  const mistakeCount = Object.keys(userState.mistakeBank).length;

  const handleRecordAnswer = (params: {
    questionId: string;
    stimulus: string;
    romaji: string;
    category: QuestionCategory;
    isCorrect: boolean;
    responseTimeMs: number;
    explanation: string;
  }) => {
    setUserState((prev) => recordSingleAnswer(prev, params));
  };

  const handleRecordSessionComplete = (record: TestHistoryRecord) => {
    setUserState((prev) => recordCompletedTestSession(prev, record));
  };

  const handleSelectLevelOverride = (level: number | null) => {
    setUserState((prev) => {
      const next: DojoUserState = {
        ...prev,
        manualLevelOverride: level,
      };
      next.currentSenseiLevel = computeSenseiLevel(next);
      saveDojoState(next);
      return next;
    });
  };

  const handleStartMistakeDrill = (mistakeIds: string[]) => {
    setRetryMistakeIds(mistakeIds);
    setActiveTab('simulator');
  };

  const handleResetAllData = () => {
    const empty = createEmptyState();
    saveDojoState(empty);
    setUserState(empty);
  };

  const navItems: Array<{
    id: ActiveTabId;
    label: string;
    shortLabel: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      id: 'drill',
      label: 'Deret Kana Pro',
      shortLabel: 'Deret Kana',
      desc: 'Urutan A-I-U-E-O & Mix',
      icon: Layers,
    },
    {
      id: 'study',
      label: 'Modul Sensei & MNN',
      shortLabel: 'Modul Sensei',
      desc: 'Sokuon, Chouon & Kalimat',
      icon: BookOpen,
    },
    {
      id: 'simulator',
      label: 'Simulator CBT JLPT',
      shortLabel: 'Ujian CBT',
      desc: '50/100 Soal & Skor Live',
      icon: ClipboardCheck,
    },
    {
      id: 'dashboard',
      label: 'Dasbor & Kelemahan',
      shortLabel: 'Dasbor',
      desc: `Progres & Mistake (${mistakeCount})`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[#FBF9F5] text-[#2C2825]">
      {/* Top Bar Contract: Hidden automatically when Focus UI is active so user needs zero scrolling */}
      {!isGlobalFocusUI && (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#FBF9F5]/95 border-b border-[#E2DCD0]">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-[#2C2825] hover:bg-[#F4EFE6] cursor-pointer"
              aria-label="Buka navigasi"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('drill');
              }}
              className="text-sm sm:text-base font-bold tracking-tight text-[#2C2825] whitespace-nowrap shrink-0"
            >
              Nihongo Dojo あ
            </a>
          </div>

          {/* Zone 2: 4 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#5C554E]">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'text-[#1E3A2F] font-semibold underline decoration-2 underline-offset-8'
                    : 'hover:text-[#2C2825]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="px-3 py-1.5 text-xs font-semibold text-[#FBF9F5] bg-[#1E3A2F] hover:bg-[#152A22] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mulai Tes CBT
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex">
        {/* Desktop Persistent Sidebar (Hidden in Focus UI) */}
        {!isGlobalFocusUI && (
          <aside
            className={`hidden lg:flex flex-col justify-between bg-[#F4EFE6] border-r border-[#E2DCD0] shrink-0 transition-transform duration-150 ${
              sidebarCollapsed ? 'w-16' : 'w-60'
            }`}
          >
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between px-2 pt-1">
                {!sidebarCollapsed && (
                  <span className="text-xs font-semibold text-[#5C554E]">
                    Menu Pembelajaran
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((c) => !c)}
                  className="p-1.5 rounded-md text-[#5C554E] hover:text-[#2C2825] hover:bg-[#EAE3D5] cursor-pointer"
                  title={sidebarCollapsed ? 'Perluas Sidebar' : 'Ringkas Sidebar'}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                          : 'text-[#2C2825] hover:bg-[#EAE3D5]/70'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{item.label}</div>
                          <div
                            className={`text-[11px] truncate ${
                              isActive ? 'text-[#E2DCD0]' : 'text-[#5C554E]'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="p-3.5 border-t border-[#E2DCD0] space-y-2.5">
                <div className="p-2.5 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1E3A2F]">{levelMeta.badge}</span>
                    <span className="font-mono-num text-[#5C554E]">{userState.totalXp} XP</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#2C2825] leading-snug">
                    {userState.currentSenseiLevel >= 4
                      ? 'Mode Mahir: Romaji Sembunyi'
                      : 'Mode Pemula: Romaji Aktif'}
                  </div>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() =>
                          handleSelectLevelOverride(
                            userState.manualLevelOverride === lv ? null : lv
                          )
                        }
                        title={`Klik untuk menguji tampilan Level ${lv}`}
                        className={`flex-1 py-1 rounded text-[10px] font-mono-num font-semibold border cursor-pointer ${
                          userState.currentSenseiLevel === lv
                            ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                            : 'bg-[#F4EFE6] text-[#5C554E] border-[#D5CBB8]'
                        }`}
                      >
                        L{lv}
                      </button>
                    ))}
                  </div>
                </div>

                <PWAInstallButton />
              </div>
            )}
          </aside>
        )}

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-68 max-w-[82vw] bg-[#FBF9F5] border-r border-[#E2DCD0] p-4 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E2DCD0]">
                  <span className="text-sm font-bold text-[#2C2825]">Nihongo Dojo あ</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-md text-[#5C554E] hover:text-[#2C2825]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                            : 'text-[#2C2825] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div
                            className={`text-[11px] ${
                              isActive ? 'text-[#E2DCD0]' : 'text-[#5C554E]'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[#E2DCD0]">
                <div className="p-2.5 rounded-lg bg-[#F4EFE6] border border-[#E2DCD0] space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Status: {levelMeta.badge}</span>
                    <span className="font-mono-num">{userState.totalXp} XP</span>
                  </div>
                  <div className="flex gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => handleSelectLevelOverride(lv)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono-num font-semibold border ${
                          userState.currentSenseiLevel === lv
                            ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                            : 'bg-[#FFFFFF] text-[#2C2825] border-[#D5CBB8]'
                        }`}
                      >
                        Lv.{lv}
                      </button>
                    ))}
                  </div>
                </div>
                <PWAInstallButton />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main
          className={`flex-1 min-w-0 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full ${
            isGlobalFocusUI
              ? 'py-2.5 sm:py-4 pb-4'
              : 'py-3 sm:py-5 pb-16 lg:pb-8'
          }`}
        >
          {activeTab === 'drill' && (
            <SequentialRowDrillView
              userState={userState}
              isFocusMode={drillFocusMode}
              onToggleFocusMode={setDrillFocusMode}
              onRecordAnswer={handleRecordAnswer}
            />
          )}

          {activeTab === 'study' && <SenseiStudyView userState={userState} />}

          {activeTab === 'simulator' && (
            <SimulatorCBTView
              userState={userState}
              initialMistakeIds={retryMistakeIds}
              onClearInitialMistakes={() => setRetryMistakeIds(null)}
              onActiveTestFocusChange={setCbtActiveFocus}
              onRecordAnswer={handleRecordAnswer}
              onRecordSessionComplete={handleRecordSessionComplete}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardAnalyticsView
              userState={userState}
              onSelectLevelOverride={handleSelectLevelOverride}
              onStartMistakeDrill={handleStartMistakeDrill}
              onNavigateTab={setActiveTab}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Mobile 1-Tap Bottom Bar (Hidden automatically during Focus UI / Active Test so user doesn't scroll) */}
      {!isGlobalFocusUI && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-13 bg-[#FBF9F5]/95 border-t border-[#E2DCD0] grid grid-cols-4 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#1E3A2F] font-semibold' : 'text-[#5C554E]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-full">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      )}

      <OfflineStatusBanner />
    </div>
  );
}
