import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Flag,
  Volume2,
  Check,
  X,
  RotateCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';
import {
  TestSessionConfig,
  PreparedTestQuestion,
  generateTestSessionQuestions,
  QuestionCategory,
} from '../data/questionBank';
import { checkEssayAnswer } from '../utils/shuffle';
import { speakJapanese, playFeedbackTone } from '../utils/audio';
import {
  DojoUserState,
  calculateGrade,
  TestHistoryRecord,
} from '../utils/storage';

interface SimulatorCBTViewProps {
  userState: DojoUserState;
  initialMistakeIds?: string[] | null;
  onClearInitialMistakes?: () => void;
  onActiveTestFocusChange?: (isActiveTest: boolean) => void;
  onRecordAnswer: (params: {
    questionId: string;
    stimulus: string;
    romaji: string;
    category: QuestionCategory;
    isCorrect: boolean;
    responseTimeMs: number;
    explanation: string;
  }) => void;
  onRecordSessionComplete: (record: TestHistoryRecord) => void;
}

interface QuestionResponseRecord {
  questionId: string;
  userAnswerText: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export const SimulatorCBTView: React.FC<SimulatorCBTViewProps> = ({
  userState,
  initialMistakeIds,
  onClearInitialMistakes,
  onActiveTestFocusChange,
  onRecordAnswer,
  onRecordSessionComplete,
}) => {
  const [config, setConfig] = useState<TestSessionConfig>({
    questionCount: 50,
    selectedLevel: 5,
    answerMode: 'hybrid',
    timerMode: 'normal',
    romajiAssistMode: 'adaptive',
  });

  const [phase, setPhase] = useState<'setup' | 'active' | 'results'>('setup');
  const [questions, setQuestions] = useState<PreparedTestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponseRecord>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [essayDraft, setEssayDraft] = useState<string>('');
  const [showMobileNavGrid, setShowMobileNavGrid] = useState<boolean>(false);

  const [sessionElapsedSec, setSessionElapsedSec] = useState<number>(0);
  const [strictRemainingSec, setStrictRemainingSec] = useState<number>(15);
  const questionStartMsRef = useRef<number>(Date.now());
  const essayInputRef = useRef<HTMLInputElement | null>(null);

  // Sync Focus UI with parent App when test is active
  useEffect(() => {
    if (onActiveTestFocusChange) {
      onActiveTestFocusChange(phase === 'active');
    }
    return () => {
      if (onActiveTestFocusChange) {
        onActiveTestFocusChange(false);
      }
    };
  }, [phase]);

  const shouldHideRomaji = (questionLevel: number): boolean => {
    if (config.romajiAssistMode === 'always_hide') return true;
    if (config.romajiAssistMode === 'always_show') return false;
    return userState.currentSenseiLevel >= 4 || config.selectedLevel >= 4 || questionLevel >= 4;
  };

  useEffect(() => {
    if (initialMistakeIds && initialMistakeIds.length > 0) {
      startSession({
        ...config,
        customPoolIds: initialMistakeIds,
      });
      if (onClearInitialMistakes) {
        onClearInitialMistakes();
      }
    }
  }, [initialMistakeIds]);

  const startSession = (customConfig?: TestSessionConfig) => {
    const activeCfg = customConfig || config;
    const prepared = generateTestSessionQuestions(activeCfg);
    setQuestions(prepared);
    setCurrentIdx(0);
    setResponses({});
    setFlaggedIds(new Set());
    setEssayDraft('');
    setSessionElapsedSec(0);
    setStrictRemainingSec(15);
    setShowMobileNavGrid(false);
    questionStartMsRef.current = Date.now();
    setPhase('active');
  };

  const currentQuestion = questions[currentIdx];
  const currentResponse = currentQuestion ? responses[currentQuestion.id] : undefined;

  useEffect(() => {
    questionStartMsRef.current = Date.now();
    setStrictRemainingSec(15);
    if (currentQuestion && !responses[currentQuestion.id]) {
      setEssayDraft('');
      if (currentQuestion.assignedMode === 'essay') {
        setTimeout(() => essayInputRef.current?.focus(), 40);
      }
    } else if (currentQuestion && responses[currentQuestion.id]) {
      setEssayDraft(responses[currentQuestion.id].userAnswerText);
    }
  }, [currentIdx, phase]);

  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setSessionElapsedSec((s) => s + 1);

      if (config.timerMode === 'strict_15s' && currentQuestion && !responses[currentQuestion.id]) {
        setStrictRemainingSec((rem) => {
          if (rem <= 1) {
            submitQuestionAnswer('[Waktu Habis > 15d]', undefined, true);
            return 15;
          }
          return rem - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, config.timerMode, currentIdx, currentQuestion, responses]);

  const submitQuestionAnswer = (
    userAnswerText: string,
    selectedOptionId?: string,
    isTimeout: boolean = false
  ) => {
    if (!currentQuestion || responses[currentQuestion.id]) return;

    const elapsedMs = Math.max(200, Date.now() - questionStartMsRef.current);
    let isCorrect = false;

    if (!isTimeout) {
      if (currentQuestion.assignedMode === 'multiple_choice') {
        isCorrect = selectedOptionId === currentQuestion.correctOptionId;
      } else {
        isCorrect = checkEssayAnswer(userAnswerText, currentQuestion.acceptedEssayAnswers);
      }
    }

    playFeedbackTone(isCorrect ? 'correct' : 'wrong');

    const correctOpt = currentQuestion.options.find(
      (o) => o.id === currentQuestion.correctOptionId
    );

    onRecordAnswer({
      questionId: currentQuestion.id,
      stimulus: currentQuestion.stimulusJapanese,
      romaji: correctOpt ? correctOpt.text : currentQuestion.acceptedEssayAnswers[0],
      category: currentQuestion.category,
      isCorrect,
      responseTimeMs: elapsedMs,
      explanation: currentQuestion.explanation,
    });

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswerText,
        selectedOptionId,
        isCorrect,
        timeSpentMs: elapsedMs,
      },
    }));
  };

  const toggleFlagCurrent = () => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleFinishTest = () => {
    const totalQ = questions.length;
    if (totalQ === 0) return;

    let correctCount = 0;
    let totalTimeMs = 0;
    const catBreakdown: Record<QuestionCategory, { correct: number; total: number }> = {
      hiragana: { correct: 0, total: 0 },
      katakana: { correct: 0, total: 0 },
      modifikasi: { correct: 0, total: 0 },
      kalimat: { correct: 0, total: 0 },
    };

    for (const q of questions) {
      const resp = responses[q.id];
      catBreakdown[q.category].total += 1;
      if (resp) {
        totalTimeMs += resp.timeSpentMs;
        if (resp.isCorrect) {
          correctCount += 1;
          catBreakdown[q.category].correct += 1;
        }
      }
    }

    const scorePercent = Math.round((correctCount / totalQ) * 100);
    const { grade } = calculateGrade(scorePercent);
    const avgTimeSec = Number(
      (totalTimeMs / Math.max(1, Object.keys(responses).length) / 1000).toFixed(1)
    );

    const levelNames: Record<number, string> = {
      1: 'Level 1 (Hiragana)',
      2: 'Level 2 (Katakana)',
      3: 'Level 3 (Modifikasi)',
      4: 'Level 4 (Kalimat MNN)',
      5: 'Level 5 (Campuran Total)',
    };

    const modeNames: Record<string, string> = {
      multiple_choice: 'Pilihan Ganda',
      essay: 'Esai Mandiri',
      hybrid: 'Hybrid 50:50',
    };

    onRecordSessionComplete({
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      levelLabel: levelNames[config.selectedLevel] || 'Custom',
      modeLabel: modeNames[config.answerMode],
      totalQuestions: totalQ,
      correctCount,
      scorePercent,
      grade,
      avgTimeSec,
      categoryBreakdown: catBreakdown,
    });

    triggerHaptic('milestone');
    setPhase('results');
  };

  const answeredCount = Object.keys(responses).length;
  const liveCorrectCount = Object.values(responses).filter((r) => r.isCorrect).length;
  const liveScorePoints =
    questions.length > 0 ? Math.round((liveCorrectCount / questions.length) * 100) : 0;
  const liveAccuracyPercent =
    answeredCount > 0 ? Math.round((liveCorrectCount / answeredCount) * 100) : 100;
  const liveAvgTimeSec =
    answeredCount > 0
      ? (
          Object.values(responses).reduce((acc, r) => acc + r.timeSpentMs, 0) /
          answeredCount /
          1000
        ).toFixed(1)
      : '0.0';
  const liveGradeInfo = calculateGrade(liveAccuracyPercent);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ============================================================================
  // PHASE 1: COMPACT TEST CONFIGURATION SETUP (MENU B)
  // ============================================================================
  if (phase === 'setup') {
    const mistakeCount = Object.keys(userState.mistakeBank).length;

    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="pb-3 border-b border-[#E2DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#5C554E]">
              <span>Menu B · Konfigurasi CBT</span>
              <span aria-hidden="true">·</span>
              <span>Mode Fokus Otomatis Saat Ujian</span>
            </div>
            <h1 className="text-base sm:text-xl font-semibold text-[#2C2825] tracking-tight">
              Simulator Ujian CBT JLPT N5 / JFT-Basic
            </h1>
          </div>

          {mistakeCount > 0 && (
            <button
              type="button"
              onClick={() =>
                startSession({
                  ...config,
                  customPoolIds: Object.keys(userState.mistakeBank),
                })
              }
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Uji Ulang Kesalahan ({mistakeCount})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-6 space-y-4">
            {/* 1. Pilih Level */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#2C2825]">
                1. Pilih Level & Fokus Materi Ujian
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    {
                      level: 1,
                      title: 'Level 1 — Hiragana Dasar & Kosakata',
                      desc: '46 huruf Gojuuon & kosakata dasar (Bantuan Romaji aktif).',
                    },
                    {
                      level: 2,
                      title: 'Level 2 — Katakana Dasar & Gairaigo',
                      desc: '46 Katakana & kata serapan kerja (アルバイト, エンジニア).',
                    },
                    {
                      level: 3,
                      title: 'Level 3 — Modifikasi (Sokuon っ, Chouon ー, Youon ゃ)',
                      desc: 'Fokus pembeda ketukan pendek vs panjang (byouin vs biyouin).',
                    },
                    {
                      level: 4,
                      title: 'Level 4 — Kalimat & Partikel MNN Bab 1–5 (Tanpa Romaji)',
                      desc: 'Terjemahan kalimat, partikel は/の/を/で/へ & Dokkai mikro.',
                    },
                    {
                      level: 5,
                      title: 'Level 5 — Campuran Total (Simulasi JLPT/JFT Asli)',
                      desc: '20% Hira · 20% Kata · 30% Modifikasi · 30% Kalimat (Tanpa Romaji).',
                    },
                  ] as const
                ).map((item) => {
                  const active = config.selectedLevel === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          selectedLevel: item.level,
                          customPoolIds: undefined,
                        }))
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#F4EFE6] border-[#1E3A2F]'
                          : 'bg-[#FBF9F5] border-[#E2DCD0] hover:bg-[#F4EFE6]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[#2C2825]">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono-num px-1.5 py-0.5 rounded shrink-0 ${
                            active
                              ? 'bg-[#1E3A2F] text-[#FBF9F5]'
                              : 'bg-[#EAE3D5] text-[#5C554E]'
                          }`}
                        >
                          LV {item.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5C554E] mt-0.5 line-clamp-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Kuota, Mode Jawaban & Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2DCD0]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2C2825]">
                  2. Jumlah Soal
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([15, 50, 100] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          questionCount: cnt,
                          customPoolIds: undefined,
                        }))
                      }
                      className={`py-2 px-2 rounded-lg border text-center font-mono-num text-xs font-semibold cursor-pointer ${
                        config.questionCount === cnt
                          ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                          : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8]'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2C2825]">
                  3. Format Jawaban
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'multiple_choice', label: 'PG' },
                      { id: 'essay', label: 'Esai' },
                      { id: 'hybrid', label: 'Hybrid' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, answerMode: m.id }))}
                      className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold cursor-pointer ${
                        config.answerMode === m.id
                          ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                          : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2C2825]">
                  4. Mode Timer
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, timerMode: 'normal' }))}
                    className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold cursor-pointer ${
                      config.timerMode === 'normal'
                        ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                        : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8]'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, timerMode: 'strict_15s' }))}
                    className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold cursor-pointer ${
                      config.timerMode === 'strict_15s'
                        ? 'bg-[#1E3A2F] text-[#FBF9F5] border-[#1E3A2F]'
                        : 'bg-[#FBF9F5] text-[#2C2825] border-[#D5CBB8]'
                    }`}
                  >
                    15d / Soal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Adaptive Romaji & Start CTA */}
          <div className="lg:col-span-4 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#2C2825]">
                Pengaturan Bantuan Alfabet (Romaji)
              </div>
              <div className="space-y-1.5">
                {(
                  [
                    {
                      id: 'adaptive',
                      label: 'Adaptif Sesuai Level',
                      note: 'Tampil di Level 1–3, otomatis sembunyi di Level 4–5.',
                    },
                    {
                      id: 'always_show',
                      label: 'Selalu Tampilkan Romaji',
                      note: 'Bantuan baca kata tampil di semua soal.',
                    },
                    {
                      id: 'always_hide',
                      label: 'Sembunyikan Semua Romaji',
                      note: 'Murni Hiragana/Katakana & Bahasa Indonesia.',
                    },
                  ] as const
                ).map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, romajiAssistMode: rm.id }))}
                    className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      config.romajiAssistMode === rm.id
                        ? 'bg-[#FFFFFF] border-[#1E3A2F]'
                        : 'bg-[#FBF9F5]/60 border-[#E2DCD0]'
                    }`}
                  >
                    <div className="text-xs font-medium text-[#2C2825]">{rm.label}</div>
                    <div className="text-[11px] text-[#5C554E]">{rm.note}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => startSession()}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Ujian (Focus UI)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PHASE 2: ZERO-SCROLL FOCUS UI FOR ACTIVE CBT EXAM (MENU C)
  // ============================================================================
  if (phase === 'active' && currentQuestion) {
    const hideRomaji = shouldHideRomaji(currentQuestion.level);

    return (
      <div className="space-y-2.5 sm:space-y-4">
        {/* Single-Row Ultra-Compact Focus Header Bar */}
        <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: Question Counter & Live Score */}
          <div className="flex items-center gap-2 sm:gap-3.5 text-[11px] sm:text-xs font-mono-num min-w-0">
            <button
              type="button"
              onClick={() => setShowMobileNavGrid(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F4EFE6] border border-[#D5CBB8] font-semibold text-[#2C2825] cursor-pointer"
              title="Buka Daftar Nomor Soal"
            >
              <LayoutGrid className="w-3 h-3 text-[#1E3A2F]" />
              <span>
                {currentIdx + 1}/{questions.length}
              </span>
            </button>

            <span className="text-[#1E3A2F] font-semibold truncate">
              Skor: {liveScorePoints} ({liveAccuracyPercent}% · {liveGradeInfo.grade})
            </span>

            <span className="hidden sm:inline text-[#5C554E]">
              Rata-rata: {liveAvgTimeSec}d
            </span>
          </div>

          {/* Right: Timer & Submit Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#F4EFE6] border border-[#E2DCD0] font-mono-num text-[11px] text-[#2C2825]">
              <Clock className="w-3 h-3 text-[#1E3A2F]" />
              {config.timerMode === 'strict_15s' ? (
                <span className={strictRemainingSec <= 5 ? 'text-[#8C2D19] font-bold' : ''}>
                  {strictRemainingSec}d
                </span>
              ) : (
                <span>{formatTimer(sessionElapsedSec)}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFinishTest}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Active Question Stage (Designed to fit 100% on mobile viewport without vertical scroll) */}
          <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-3.5 sm:p-6 space-y-3 sm:space-y-4">
            {/* Compact Question Sub-bar */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2DCD0] text-[11px] text-[#5C554E]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-[#2C2825] uppercase">
                  {currentQuestion.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {currentQuestion.assignedMode === 'multiple_choice' ? 'PG' : 'Esai'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{hideRomaji ? 'Tanpa Romaji' : 'Romaji On'}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      romajiAssistMode: hideRomaji ? 'always_show' : 'always_hide',
                    }))
                  }
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E2DCD0] text-[11px] text-[#5C554E] hover:text-[#2C2825] cursor-pointer"
                >
                  {hideRomaji ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Romaji</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFlagCurrent}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium cursor-pointer ${
                    flaggedIds.has(currentQuestion.id)
                      ? 'bg-[#FDF4E7] border-[#D9822B] text-[#8F4F0B]'
                      : 'bg-[#FBF9F5] border-[#E2DCD0] text-[#5C554E]'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>Ragu</span>
                </button>
              </div>
            </div>

            {/* Prompt & Compact Stimulus Box */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-[#5C554E] font-medium leading-snug">
                {currentQuestion.promptInstruction}
              </p>

              <div className="p-3 sm:p-4 rounded-xl bg-[#FBF9F5] border border-[#E2DCD0] flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div
                    className={`font-jp font-bold text-[#2C2825] leading-snug ${
                      currentQuestion.subType === 'kana_recognition'
                        ? 'text-4xl sm:text-5xl'
                        : 'text-lg sm:text-2xl'
                    }`}
                  >
                    {currentQuestion.stimulusJapanese}
                  </div>

                  {!hideRomaji &&
                    currentQuestion.stimulusRomaji &&
                    currentQuestion.subType !== 'kana_recognition' &&
                    currentQuestion.subType !== 'vocab_reading' && (
                      <div className="font-mono-num text-[11px] text-[#1E3A2F]">
                        Baca: {currentQuestion.stimulusRomaji}
                      </div>
                    )}
                </div>

                {currentQuestion.audioText && (
                  <button
                    type="button"
                    onClick={() => speakJapanese(currentQuestion.audioText!, 0.85)}
                    className="p-2.5 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] shrink-0 cursor-pointer"
                    title="Putar Audio Jepang"
                  >
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {/* Compact Inline Word-by-Word Helper (Level Awal) */}
              {!hideRomaji && currentQuestion.wordBreakdown && !currentResponse && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {currentQuestion.wordBreakdown.map((wb, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#F4EFE6] border border-[#E2DCD0] text-[10px] sm:text-[11px]"
                    >
                      <strong className="font-jp text-[#2C2825]">{wb.kana}</strong>{' '}
                      <span className="font-mono-num text-[#1E3A2F]">({wb.romaji})</span>:{' '}
                      <span className="text-[#5C554E]">{wb.meaning}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Input Options (Compact Thumb-Friendly Rows) */}
            {currentQuestion.assignedMode === 'multiple_choice' ? (
              <div
                className={`grid gap-2 ${
                  currentQuestion.subType === 'kana_recognition'
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                {currentQuestion.shuffledOptions.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = currentResponse?.selectedOptionId === opt.id;
                  const isCorrectOpt = opt.id === currentQuestion.correctOptionId;

                  let cardClass =
                    'bg-[#FBF9F5] hover:bg-[#F4EFE6] border-[#D5CBB8] text-[#2C2825]';
                  if (currentResponse) {
                    if (isCorrectOpt) {
                      cardClass = 'bg-[#EBF3EE] border-[#1E3A2F] text-[#1E3A2F]';
                    } else if (isSelected && !isCorrectOpt) {
                      cardClass = 'bg-[#FBECE9] border-[#8C2D19] text-[#7A2312]';
                    } else {
                      cardClass = 'bg-[#FBF9F5] border-[#E2DCD0] text-[#857D74] opacity-70';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!currentResponse}
                      onClick={() => submitQuestionAnswer(opt.text, opt.id)}
                      className={`min-h-[44px] w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border text-left transition-colors flex flex-col justify-center cursor-pointer ${cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-[#EAE3D5] text-[#2C2825] font-mono-num text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {letter}
                          </span>
                          <span className="font-jp text-sm sm:text-base font-medium leading-snug">
                            {opt.text}
                          </span>
                        </div>
                        {currentResponse && isCorrectOpt && (
                          <Check className="w-4 h-4 text-[#1E3A2F] shrink-0" />
                        )}
                        {currentResponse && isSelected && !isCorrectOpt && (
                          <X className="w-4 h-4 text-[#8C2D19] shrink-0" />
                        )}
                      </div>

                      {!hideRomaji && opt.romajiHelper && (
                        <div className="pl-7 font-mono-num text-[10px] sm:text-[11px] text-[#5C554E]">
                          {opt.romajiHelper}
                        </div>
                      )}

                      {currentResponse && opt.diagnosticReason && (
                        <div className="pl-7 text-[11px] font-medium mt-0.5 opacity-95">
                          {opt.diagnosticReason}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!currentResponse && essayDraft.trim()) {
                    submitQuestionAnswer(essayDraft.trim());
                  } else if (currentResponse && currentIdx < questions.length - 1) {
                    setCurrentIdx((i) => i + 1);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  ref={essayInputRef}
                  type="text"
                  disabled={!!currentResponse}
                  value={essayDraft}
                  onChange={(e) => setEssayDraft(e.target.value)}
                  placeholder={currentQuestion.essayPlaceholder}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 px-3.5 py-2.5 text-sm sm:text-base font-mono-num bg-[#FBF9F5] border border-[#C9C0B1] focus:border-[#1E3A2F] focus:outline-none rounded-lg text-[#2C2825]"
                />
                {!currentResponse && (
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Jawab
                  </button>
                )}
              </form>
            )}

            {/* Compact Instant Diagnostic & Grammar Box */}
            {currentResponse && (
              <div
                className={`p-3 rounded-lg border space-y-1.5 text-xs ${
                  currentResponse.isCorrect
                    ? 'bg-[#EBF3EE] border-[#B8D4C4] text-[#1E3A2F]'
                    : 'bg-[#FBECE9] border-[#E6B8AF] text-[#7A2312]'
                }`}
              >
                <div className="font-semibold">
                  {currentResponse.isCorrect
                    ? `Benar! (${(currentResponse.timeSpentMs / 1000).toFixed(1)}d)`
                    : `Kurang Tepat — Kunci: ${
                        currentQuestion.options.find(
                          (o) => o.id === currentQuestion.correctOptionId
                        )?.text || currentQuestion.acceptedEssayAnswers[0]
                      }`}
                </div>
                <p className="text-[11px] sm:text-xs text-[#2C2825] leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                {currentQuestion.grammarStructure && (
                  <div className="p-2 rounded bg-[#FFFFFF]/90 border border-[#E2DCD0] text-[11px] text-[#2C2825]">
                    <strong className="text-[#1E3A2F]">Gramatika: </strong>
                    {currentQuestion.grammarStructure}
                  </div>
                )}
              </div>
            )}

            {/* Compact Prev / Next Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2DCD0]">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="min-h-[40px] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D5CBB8] text-xs font-medium text-[#2C2825] disabled:opacity-40 hover:bg-[#F4EFE6] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                  className="min-h-[40px] flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#1E3A2F] text-[#FBF9F5] text-xs font-semibold hover:bg-[#152A22] cursor-pointer"
                >
                  <span>Soal Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishTest}
                  className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#1E3A2F] text-[#FBF9F5] text-xs font-semibold hover:bg-[#152A22] cursor-pointer"
                >
                  Lihat Hasil Evaluasi
                </button>
              )}
            </div>
          </div>

          {/* Right Zone (Desktop Only): Question Grid Navigator */}
          <div className="hidden lg:block lg:col-span-4 bg-[#F4EFE6] border border-[#E2DCD0] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#2C2825]">Navigasi Nomor Soal</h2>
              <span className="text-[11px] font-mono-num text-[#5C554E]">
                {answeredCount}/{questions.length} Terjawab
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const resp = responses[q.id];
                const isFlagged = flaggedIds.has(q.id);
                const isCurrent = idx === currentIdx;

                let cellStyle = 'bg-[#FBF9F5] text-[#5C554E] border-[#D5CBB8]';
                if (resp) {
                  cellStyle = resp.isCorrect
                    ? 'bg-[#EBF3EE] text-[#1E3A2F] border-[#1E3A2F] font-semibold'
                    : 'bg-[#FBECE9] text-[#8C2D19] border-[#8C2D19] font-semibold';
                }
                if (isFlagged) {
                  cellStyle = 'bg-[#FDF4E7] text-[#8F4F0B] border-[#D9822B] font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-8 rounded border font-mono-num text-xs transition-colors cursor-pointer ${cellStyle} ${
                      isCurrent ? 'ring-2 ring-[#2C2825]' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Question Grid Bottom Sheet */}
        {showMobileNavGrid && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/40">
            <div className="w-full max-h-[75dvh] bg-[#FBF9F5] rounded-t-2xl border-t border-[#E2DCD0] p-4 flex flex-col space-y-3">
              <div className="w-10 h-1 bg-[#C9C0B1] rounded-full mx-auto" />
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
                <span className="text-xs font-semibold text-[#2C2825]">
                  Pilih Nomor Soal ({answeredCount}/{questions.length} Terjawab)
                </span>
                <button
                  type="button"
                  onClick={() => setShowMobileNavGrid(false)}
                  className="px-3 py-1 rounded bg-[#1E3A2F] text-[#FBF9F5] text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 overflow-y-auto py-1">
                {questions.map((q, idx) => {
                  const resp = responses[q.id];
                  const isFlagged = flaggedIds.has(q.id);
                  const isCurrent = idx === currentIdx;

                  let cellStyle = 'bg-[#FFFFFF] text-[#5C554E] border-[#D5CBB8]';
                  if (resp) {
                    cellStyle = resp.isCorrect
                      ? 'bg-[#EBF3EE] text-[#1E3A2F] border-[#1E3A2F] font-semibold'
                      : 'bg-[#FBECE9] text-[#8C2D19] border-[#8C2D19] font-semibold';
                  }
                  if (isFlagged) {
                    cellStyle = 'bg-[#FDF4E7] text-[#8F4F0B] border-[#D9822B] font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowMobileNavGrid(false);
                      }}
                      className={`h-9 rounded border font-mono-num text-xs ${cellStyle} ${
                        isCurrent ? 'ring-2 ring-[#2C2825]' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // PHASE 3: INSTANT RESULTS, ANALYTICS & SENSEI EVALUATION
  // ============================================================================
  const totalQ = questions.length;
  const correctTotal = questions.filter((q) => responses[q.id]?.isCorrect).length;
  const scorePercent = totalQ > 0 ? Math.round((correctTotal / totalQ) * 100) : 0;
  const gradeInfo = calculateGrade(scorePercent);
  const wrongQuestions = questions.filter((q) => !responses[q.id]?.isCorrect);

  const categoryStats = (['hiragana', 'katakana', 'modifikasi', 'kalimat'] as const).map(
    (cat) => {
      const catQs = questions.filter((q) => q.category === cat);
      const catCorrect = catQs.filter((q) => responses[q.id]?.isCorrect).length;
      const pct = catQs.length > 0 ? Math.round((catCorrect / catQs.length) * 100) : null;
      return {
        cat,
        label:
          cat === 'hiragana'
            ? 'Hiragana Dasar'
            : cat === 'katakana'
            ? 'Katakana Dasar'
            : cat === 'modifikasi'
            ? 'Modifikasi Bunyi'
            : 'Kalimat & Kosakata',
        correct: catCorrect,
        total: catQs.length,
        pct,
      };
    }
  );

  const buildSenseiEvaluation = (): string => {
    const lowCats = categoryStats.filter((c) => c.pct !== null && c.pct < 75);
    const slowSpeed = Number(liveAvgTimeSec) > 5.0;

    if (lowCats.length > 0) {
      const names = lowCats.map((c) => `${c.label} (${c.pct}%)`).join(', ');
      return `Perhatian Sensei: Skor Anda pada ${names} masih di bawah 75%. Tekan tombol "Retry Mistakes Only" untuk mengulang soal yang salah hingga 100% dikuasai.`;
    }
    if (slowSpeed) {
      return `Evaluasi Kecepatan: Akurasi ${scorePercent}%, namun rata-rata jawab (${liveAvgTimeSec}d/soal) di atas 5 detik. Latih kembali di Mode Esai dengan target < 3 detik.`;
    }
    return `Evaluasi Sensei: Kerja bagus! Akurasi ${scorePercent}% (Grade ${gradeInfo.grade}) dengan kecepatan ${liveAvgTimeSec}d/soal menunjukkan penguasaan materi yang matang.`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-[#FFFFFF] border border-[#E2DCD0] rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD0]">
          <div className="space-y-1">
            <div className="text-[11px] text-[#5C554E]">
              Hasil Evaluasi Instan Simulator JLPT / JFT-Basic
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2825]">
              Skor Akhir: <span className="font-mono-num">{scorePercent}%</span> · Grade {gradeInfo.grade}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#1E3A2F]">{gradeInfo.statusText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {wrongQuestions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  startSession({
                    ...config,
                    customPoolIds: wrongQuestions.map((q) => q.id),
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8C2D19] hover:bg-[#722312] text-[#FBF9F5] text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Mistakes ({wrongQuestions.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-3.5 py-2 rounded-lg bg-[#1E3A2F] hover:bg-[#152A22] text-[#FBF9F5] text-xs font-semibold cursor-pointer"
            >
              Ujian Baru
            </button>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {categoryStats.map((cs) => (
            <div
              key={cs.cat}
              className="p-3 rounded-lg bg-[#FBF9F5] border border-[#E2DCD0] space-y-1.5"
            >
              <div className="text-[11px] text-[#5C554E] font-medium truncate">{cs.label}</div>
              <div className="flex items-baseline justify-between font-mono-num">
                <span className="text-base sm:text-lg font-bold text-[#2C2825]">
                  {cs.pct !== null ? `${cs.pct}%` : '—'}
                </span>
                <span className="text-[11px] text-[#857D74]">
                  {cs.correct}/{cs.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#EAE3D5] rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    (cs.pct ?? 100) >= 85
                      ? 'bg-[#1E3A2F]'
                      : (cs.pct ?? 100) >= 75
                      ? 'bg-[#D9822B]'
                      : 'bg-[#8C2D19]'
                  }`}
                  style={{ width: `${cs.pct ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sensei Evaluation Box */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#F4EFE6] border border-[#C9C0B1] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#2C2825]">
            <span>Evaluasi Sensei</span>
            <span className="font-mono-num">Kecepatan: {liveAvgTimeSec}d/soal</span>
          </div>
          <p className="text-xs text-[#2C2825] leading-relaxed">{buildSenseiEvaluation()}</p>
        </div>

        {/* Review List (Mobile Cards + Desktop Table) */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-[#2C2825]">
            Review Jawaban & Penjelasan Gramatika ({questions.length} Soal)
          </h2>

          {/* Mobile Compact Review Cards (md:hidden) — Zero Horizontal Clipping */}
          <div className="md:hidden divide-y divide-[#E2DCD0] border border-[#E2DCD0] rounded-xl bg-[#FBF9F5] overflow-hidden">
            {questions.map((q, idx) => {
              const resp = responses[q.id];
              const isRight = resp?.isCorrect ?? false;
              const correctKey =
                q.options.find((o) => o.id === q.correctOptionId)?.text ||
                q.acceptedEssayAnswers[0];

              return (
                <div key={q.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-num text-[11px] font-semibold text-[#5C554E]">
                      Soal #{idx + 1} · {q.category.toUpperCase()}
                    </span>
                    {q.audioText && (
                      <button
                        type="button"
                        onClick={() => speakJapanese(q.audioText!, 0.85)}
                        className="p-1.5 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="font-jp text-sm font-bold text-[#2C2825] leading-relaxed break-words">
                    {q.stimulusJapanese}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[#5C554E]">Anda:</span>
                      {resp ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono-num font-semibold ${
                            isRight ? 'text-[#1E3A2F]' : 'text-[#8C2D19]'
                          }`}
                        >
                          {isRight ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{resp.userAnswerText}</span>
                        </span>
                      ) : (
                        <span className="text-[#8C2D19] inline-flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Kosong</span>
                        </span>
                      )}
                    </div>

                    {!isRight && (
                      <div className="flex items-center gap-1">
                        <span className="text-[#5C554E]">Kunci:</span>
                        <span className="font-jp font-semibold text-[#1E3A2F]">
                          {correctKey}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-[#5C554E] leading-relaxed">
                    {q.explanation}
                    {q.grammarStructure && (
                      <div className="text-[#2C2825] font-medium mt-1">
                        {q.grammarStructure}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Review Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto border border-[#E2DCD0] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4EFE6] text-[#5C554E] border-b border-[#E2DCD0]">
                  <th className="py-2.5 px-3 font-semibold">No</th>
                  <th className="py-2.5 px-3 font-semibold w-1/4">Soal</th>
                  <th className="py-2.5 px-3 font-semibold">Jawaban</th>
                  <th className="py-2.5 px-3 font-semibold">Kunci</th>
                  <th className="py-2.5 px-3 font-semibold">Penjelasan</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD0] bg-[#FFFFFF]">
                {questions.map((q, idx) => {
                  const resp = responses[q.id];
                  const isRight = resp?.isCorrect ?? false;
                  const correctKey =
                    q.options.find((o) => o.id === q.correctOptionId)?.text ||
                    q.acceptedEssayAnswers[0];

                  return (
                    <tr key={q.id} className="hover:bg-[#FBF9F5]">
                      <td className="py-2.5 px-3 font-mono-num text-[#857D74]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-jp text-sm font-bold text-[#2C2825] max-w-xs leading-relaxed">
                        {q.stimulusJapanese}
                      </td>
                      <td className="py-2.5 px-3 font-mono-num">
                        {resp ? (
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isRight ? 'text-[#1E3A2F]' : 'text-[#8C2D19]'
                            }`}
                          >
                            {isRight ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            <span>{resp.userAnswerText}</span>
                          </span>
                        ) : (
                          <span className="text-[#8C2D19] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Kosong</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-jp font-semibold text-[#1E3A2F]">
                        {correctKey}
                      </td>
                      <td className="py-2.5 px-3 text-[#5C554E] max-w-md leading-relaxed">
                        <div>{q.explanation}</div>
                        {q.grammarStructure && (
                          <div className="text-[#2C2825] font-medium mt-0.5">
                            {q.grammarStructure}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {q.audioText && (
                          <button
                            type="button"
                            onClick={() => speakJapanese(q.audioText!, 0.85)}
                            className="p-1.5 rounded bg-[#F4EFE6] hover:bg-[#EAE3D5] text-[#2C2825] border border-[#D5CBB8] cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
